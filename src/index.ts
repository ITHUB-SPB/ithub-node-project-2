import * as cli from "./cli.js";
import * as storage from './storage/index.js'
import * as types from './types.js'
import * as exceptions from './exceptions.js'
import load from "./loader/index.js";
import savePdf from "./renderer/index.js";

let isRunning = true;

function shouldRunNow(settings: types.Settings): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}` as types.Time;

  const dayMatches = settings.schedule.daysOfWeek.includes(currentDay as types.DayOfWeek);
  const timeMatches = settings.schedule.time.includes(currentTime);

  return dayMatches && timeMatches;
}

async function processNews(settings: types.Settings): Promise<void> {
  try {
    console.log('\n=== Начало обработки новостей ===');
    const news = await load(settings.rubrics);
    await savePdf(news);
    console.log('=== Обработка завершена успешно ===\n');
  } catch (error) {
    console.error('Ошибка при обработке новостей:', error);
  }
}

export default async function run() {
  let settings: types.Settings | null = null;

  try {
    settings = await storage.loadSettings();
    if (await cli.userWantsToEdit(settings)) {
      throw new exceptions.SettingsOutdatedError()
    }
  } catch (error) {
    if (error instanceof exceptions.FileNotFoundError || error instanceof exceptions.SettingsOutdatedError) {
      settings = await cli.getUserInput();
      await storage.writeSettings(settings);
      console.log('Настройки сохранены');
    } else {
      throw new Error("Необходимо задать настройки")
    }
  }

  console.log('\nПриложение запущено в фоновом режиме.');
  console.log('Ожидание времени выгрузки...');
  console.log('Нажмите Ctrl+C для выхода\n');

  const CHECK_INTERVAL = 60 * 1000;

  const intervalId = setInterval(async () => {
    if (!isRunning) {
      clearInterval(intervalId);
      console.log('\nПриложение остановлено');
      process.exit(0);
    }

    if (shouldRunNow(settings!)) {
      await processNews(settings!);
    }
  }, CHECK_INTERVAL);

  process.on('SIGINT', () => {
    console.log('\nПолучен сигнал завершения...');
    isRunning = false;
  });
}

run().catch(error => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});