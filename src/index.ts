import * as cli from "./cli.js";
import * as storage from "./storage/index.js";
import * as types from "./types.js";
import * as exceptions from "./exceptions.js";
import load from "./loader/index.js";
import savePdf from "./renderer/index.js";

export default async function run() {
  /**
   * Главная функция для запуска приложения.
   * @remarks
   * При первичном запуске пользователь выбирает интересующие его
   * рубрики и расписание получения новостей, настройки сохраняются.
   *
   * При дальнейших запусках у пользователя есть возможность изменить
   * настройки либо согласиться с уже заданными.
   *
   * Далее процесс ожидает наступления установленного времени,
   * совершает загрузку новостей по выбранным рубрикам, после чего
   * сохраняет их в pdf-файл, и продолжает работу в фоновом режиме.
   * @throws если не удается получить настройки.
   *
   * @public
   *
   */

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
      storage.writeSettings(settings);
    } else {
      throw new Error("настройки");
    }
  }

  setInterval(async () => {
    const now = new Date();
    const currentDay = now.getDay() as types.DayOfWeek;
    const currentTime = now.toTimeString().slice(0, 5) as types.Time;

    console.log(`[${currentTime}] время`);

    if (
      settings.schedule.daysOfWeek.includes(currentDay) &&
      settings.schedule.time.includes(currentTime)
    ) {
      console.log("загрузка");
      try {
        const news = await load(settings.rubrics);
        console.log(`загружено: ${Object.values(news).flat().length}`);

        console.log("pdf создается");
        await savePdf(news);
        console.log("pdf готов");
      } catch (error) {
        console.error("ошибка:", error);
      }
    }
  }, 60_000);
}

run();