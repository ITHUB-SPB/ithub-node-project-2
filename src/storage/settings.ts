import { readFile, writeFile } from "node:fs/promises";
import { FileNotFoundError } from "../exceptions.js";
import type { Settings } from "../types.js";

const SETTINGS_PATH = new URL("../../storage/settings.json", import.meta.url);

export async function writeSettings(settings: Settings): Promise<void> {
    await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export async function loadSettings(): Promise<Settings> {
    try {
        const data = await readFile(SETTINGS_PATH, "utf-8");
        return JSON.parse(data) as Settings;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            throw new FileNotFoundError("Файл не найден: settings.json" as `Файл не найден: ${string}.json`);
        }
        throw error;
    }
}