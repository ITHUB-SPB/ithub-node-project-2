import { readFile, writeFile } from "node:fs/promises";
import { FileNotFoundError } from "../exceptions.js";
import type { Settings } from "../types.js";

const SETTINGS_PATH = new URL("./settings.json", import.meta.url);

export async function writeSettings(settings: Settings) {
  try {
    await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

export async function loadSettings(): Promise<Settings> {
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
