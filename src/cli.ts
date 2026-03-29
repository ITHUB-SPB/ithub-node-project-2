import { confirm, checkbox } from "@inquirer/prompts";
import * as types from "./types.js";


export async function userWantsToEdit(currentSettings: types.Settings): Promise<boolean> {
  /**
   * Проверка на необходимость повторного ввода настроек.
   * 
   * @remarks
   * Пользователю представляются текущие настройки, после чего он
   * отвечает, желает ли их изменить.
   * 
   * @returns логическое значение о необходимости повторного ввода.
   * 
   **/

  console.log(`Выбранные рубрики:\n${currentSettings.rubrics.join("\n\t")}`);

  return await confirm({
    message: "Хотите изменить настройки?",
    default: false,
  });
}

export async function getUserInput(): Promise<types.Settings> {
  /**
   * Интерактивный консольный ввод настроек.
   * 
   * @remarks
   * Первым промптом предлагается выбрать рубрики,
   * вторым - дни недели, третьим - часы получения.
   * Во всех промптах выбор множественный.
   * 
   * @privateRemarks
   * Используются промпты из @inquirer/prompts.
   *
   * Для получения перечня рубрик перед выдачей 
   * используется loader::loadRubrics().
   * 
   * @returns промис, разрешающийся настройками
   * 
   * @throws если не удается получить настройки. 
   * 
   */

  const choosenRubrics = await checkbox<types.RubricItem["id"]>({
    message: "Выберите интересующие рубрики",
    choices: [
      { name: "Бизнес - Энергетика", value: "business-energy" },
      { name: "Политика", value: "politics" },
    ],
  });

  const choosenDaysOfWeek = await checkbox<types.DayOfWeek>({
    message: "В какие дни желаете получать новости?",
    choices: [],
  });

  const choosenTime = await checkbox<types.Time>({
    message: "В какое время желаете получать новости?",
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
      daysOfWeek: choosenDaysOfWeek,
      time: choosenTime
    }
  };
}