import { confirm, checkbox } from "@inquirer/prompts";
import * as types from "./types.js";
import { loadRubrics } from "./loader/index.js";

export async function userWantsToEdit(
  currentSettings: types.Settings,
): Promise<boolean> {
  /**
   * Проверка на необходимость повторного ввода настроек.
   * @remarks
   * Пользователю представляются текущие настройки, после чего он
   * отвечает, желает ли их изменить.
   * @returns логическое значение о необходимости повторного ввода.
   **/

  console.log(`выбранные рубрики:\n${currentSettings.rubrics.join("\n\t")}`);

  return await confirm({
    message: "изменить настройки?",
    default: false,
  });
}

export async function getUserInput(): Promise<types.Settings> {
  /**
   * Интерактивный консольный ввод настроек.
   * @remarks
   * Первым промптом предлагается выбрать рубрики,
   * вторым - дни недели, третьим - часы получения.
   * Во всех промптах выбор множественный.
   * @privateRemarks
   * Используются промпты из @inquirer/prompts.
   * Для получения перечня рубрик перед выдачей
   * используется loader::loadRubrics().
   * @returns промис, разрешающийся настройками
   * @throws если не удается получить настройки.
   *
   */
  const rubricsList = await loadRubrics();

  const rubricChoices = rubricsList.map((r) => ({
    name: r.title,
    value: r.id,
  }));

  const choosenRubrics = await checkbox({
    message: "выберите рубрики",
    choices: rubricChoices,
  });

  const daysChoices = [
    { name: "Воскресенье", value: 0 },
    { name: "Понедельник", value: 1 },
    { name: "Вторник", value: 2 },
    { name: "Среда", value: 3 },
    { name: "Четверг", value: 4 },
    { name: "Пятница", value: 5 },
    { name: "Суббота", value: 6 },
  ];

  const choosenDaysOfWeek = await checkbox({
    message: "выбор дня",
    choices: daysChoices,
  });

  const choosenTime = await checkbox<types.Time>({
    message: "выбор времени",
    choices: [
      { name: "07:00", value: "07:00" },
      { name: "08:00", value: "08:00" },
      { name: "09:00", value: "09:00" },
      { name: "10:00", value: "10:00" },
      { name: "17:00", value: "17:00" },
      { name: "18:00", value: "18:00" },
      { name: "19:00", value: "19:00" },
      { name: "20:00", value: "20:00" },
    ],
  });

  return {
    rubrics: choosenRubrics,
    schedule: {
      daysOfWeek: choosenDaysOfWeek as types.DayOfWeek[],
      time: choosenTime,
    },
  };
}