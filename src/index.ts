import * as cli from "./cli.js";
import * as storage from "./storage/index.js";
import * as types from "./types.js";
import * as exceptions from "./exceptions.js";
import load from "./loader/index.js";
import savePdf from "./renderer/index.js";

export default async function run() {
  let settings: types.Settings | null = null;

  try {
    settings = await storage.loadSettings();
    if (await cli.userWantsToEdit(settings)) {
      throw new exceptions.SettingsOutdatedError();
    }
  } catch (error) {
    if (
      error instanceof exceptions.FileNotFoundError ||
      error instanceof exceptions.SettingsOutdatedError
    ) {
      settings = await cli.getUserInput();
      await storage.writeSettings(settings);
    } else {
      throw new Error("Необходимо задать настройки");
    }
  }

  console.log("\nПриложение переведено в фоновый режим.");
  console.log("Ожидание расписания... (Нажмите Ctrl+C для выхода)\n");

  let isTaskRunning = false;

  const scheduleInterval = setInterval(async () => {
    if (!settings || isTaskRunning) return;

    const now = new Date();
    const currentDay = now.getDay() as types.DayOfWeek;

    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${h}:${m}` as types.Time;

    if (
      settings.schedule.daysOfWeek.includes(currentDay) &&
      settings.schedule.time.includes(currentTime)
    ) {
      isTaskRunning = true;
      console.log(`[${currentTime}] Наступило время выгрузки! Парсинг новостей...`);

      try {
        const news = await load(settings.rubrics);
        await savePdf(news);
      } catch (err) {
        console.error("Произошла ошибка при выполнении фоновой задачи:", err);
      } finally {
        isTaskRunning = false;
        console.log("Возврат в режим ожидания...\n");
      }
    }
  }, 60_000);

  process.on("SIGINT", () => {
    console.log("\n\nПолучен сигнал завершения работы (SIGINT).");
    console.log("Очистка интервалов и выход...");
    clearInterval(scheduleInterval);
    process.exit(0);
  });
}

run();
