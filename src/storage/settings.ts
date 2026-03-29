import { readFile, writeFile } from "node:fs/promises";
import { FileNotFoundError } from "../exceptions.js";
import type { Settings } from "../types.js";

const SETTINGS_PATH = new URL("./settings.json", import.meta.url);

export async function writeSettings(settings: Settings) {
  /**
   * Осуществляет асинхронную запись настроек в файл.
   *
   * @privateRemarks
   * Используется промисифицированная функция fs/promises::writeFile
   *
   * @param settings - объект с настройками
   *
   * @returns Промис, который разрешается при успешной записи,
   * отклоняется при возникновении ошибок записи
   *
   */

  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export async function loadSettings(): Promise<Settings> {
  /**
   * Осуществляет асинхронное чтение настроек из файла.
   *
   * @privateRemarks
   * Используется промисифицированная функция fs/promises::readFile
   *
   * @returns Промис, который разрешается объектом с настройками,
   * отклоняется при возникновении ошибок, в том числе при
   * отсутствии файла
   *
   * @throws {@link FileNotFoundError}
   * Причина отклонения промиса в случае отсутствия файла
   *
   */

  try {
    const data = await readFile(SETTINGS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new FileNotFoundError("Файл не найден: settings.json");
    }
    throw error;
  }
}
