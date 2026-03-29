import { confirm, checkbox } from "@inquirer/prompts";
import * as types from "./types.js";
import { loadRubrics } from "./storage/index.js";

export async function userWantsToEdit(currentSettings: types.Settings): Promise<boolean> {
  console.log(`\nТекущие настройки:`);
  console.log(`Рубрики:\n\t${currentSettings.rubrics.join("\n\t")}`);
  console.log(`Дни недели: ${currentSettings.schedule.daysOfWeek.join(', ')}`);
  console.log(`Время: ${currentSettings.schedule.time.join(', ')}`);

  return await confirm({
    message: "Хотите изменить настройки?",
    default: false,
  });
}

export async function getUserInput(): Promise<types.Settings> {
  let allRubrics: types.RubricItem[] = [];
  try {
    const stored = await loadRubrics();
    allRubrics = stored.rubrics;
  } catch {
    console.log('Рубрики еще не загружены, используем стандартный список');
    allRubrics = [
      { title: "Бизнес — ТЭК", id: "business-energy", link: "" },
      { title: "Политика", id: "politics", link: "" }
    ];
  }

  const choices = allRubrics.map(r => ({
    name: r.title,
    value: r.id
  }));

  const choosenRubrics = await checkbox<types.RubricItem["id"]>({
    message: "Выберите интересующие рубрики",
    choices: choices.length > 0 ? choices : [
      { name: "Бизнес - Энергетика", value: "business-energy" },
      { name: "Политика", value: "politics" },
    ],
    validate: (input) => input.length > 0 || "Выберите хотя бы одну рубрику"
  });

  const daysChoices: { name: string; value: types.DayOfWeek }[] = [
    { name: "Понедельник", value: 1 },
    { name: "Вторник", value: 2 },
    { name: "Среда", value: 3 },
    { name: "Четверг", value: 4 },
    { name: "Пятница", value: 5 },
    { name: "Суббота", value: 6 },
    { name: "Воскресенье", value: 0 },
  ];

  const choosenDaysOfWeek = await checkbox<types.DayOfWeek>({
    message: "В какие дни желаете получать новости?",
    choices: daysChoices,
    validate: (input) => input.length > 0 || "Выберите хотя бы один день"
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
    validate: (input) => input.length > 0 || "Выберите хотя бы одно время"
  });

  return {
    rubrics: choosenRubrics,
    schedule: {
      daysOfWeek: choosenDaysOfWeek,
      time: choosenTime
    }
  };
}