import { readFile, writeFile } from "node:fs/promises";
import { FileNotFoundError } from "../exceptions.js";
import type { Settings } from "../types.js";

const SETTINGS_PATH = new URL("./settings.json", import.meta.url);

export async function writeSettings(settings: Settings): Promise<void> {
    const jsonString = JSON.stringify(settings, null, 2);
    await writeFile(SETTINGS_PATH, jsonString, 'utf8');
}

export async function loadSettings(): Promise<Settings> {
    try {
        const data = await readFile(SETTINGS_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            throw new FileNotFoundError(`Файл не найден: settings.json`);
        }
        throw err;
    }
}


