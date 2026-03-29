import { confirm, checkbox } from "@inquirer/prompts";
import * as types from "./types.js";
import { loadRubrics } from "./loader/index.js";

export async function userWantsToEdit(currentSettings: types.Settings): Promise<boolean> {
  console.log(`\nТекущие выбранные рубрики:\n  - ${currentSettings.rubrics.join("\n  - ")}`);
  console.log(
    `Дни: ${currentSettings.schedule.daysOfWeek.join(", ")} | Время: ${currentSettings.schedule.time.join(", ")}\n`,
  );

  return await confirm({
    message: "Хотите изменить настройки?",
    default: false,
  });
}

export async function getUserInput(): Promise<types.Settings> {
  const rubrics = await loadRubrics();

  const choosenRubrics = await checkbox<types.RubricItem["id"]>({
    message: "Выберите интересующие рубрики",
    choices: rubrics.map((r) => ({ name: r.title, value: r.id })),
  });

  const choosenDaysOfWeek = await checkbox<types.DayOfWeek>({
    message: "В какие дни желаете получать новости? (0 - Вс, 6 - Сб)",
    choices: [
      { name: "Понедельник", value: 1 },
      { name: "Вторник", value: 2 },
      { name: "Среда", value: 3 },
      { name: "Четверг", value: 4 },
      { name: "Пятница", value: 5 },
      { name: "Суббота", value: 6 },
      { name: "Воскресенье", value: 0 },
    ],
  });

  const choosenTime = await checkbox<types.Time>({
    message: "В какое время желаете получать новости?",
    choices: [
      { name: "07:00", value: "07:00" },
      { name: "08:00", value: "08:00" },
      { name: "09:00", value: "09:00" },
      { name: "10:00", value: "10:00" },
      { name: "17:00", value: "17:00" },
      { name: "17:30", value: "17:30" },
      { name: "18:00", value: "18:00" },
      { name: "19:00", value: "19:00" },
    ],
  });

  return {
    rubrics: choosenRubrics,
    schedule: {
      daysOfWeek: choosenDaysOfWeek,
      time: choosenTime,
    },
  };
}
