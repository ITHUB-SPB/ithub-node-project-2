import { readFile, writeFile } from "node:fs/promises";
import { FileNotFoundError } from "../exceptions.js";
import type { Rubrics, RubricsStorage } from "../types.js";

const RUBRICS_PATH = new URL("./rubrics.json", import.meta.url);

export async function writeRubrics(rubrics: Rubrics["rubrics"]): Promise<void> {
    const data: RubricsStorage = {
    rubrics: rubrics,
    lastModified: new Date().toISOString()
};

    const jsonString = JSON.stringify(data, null, 2);
    await writeFile(RUBRICS_PATH, jsonString, 'utf8');
}

export async function loadRubrics(): Promise<RubricsStorage> {
    try {
        const data = await readFile(RUBRICS_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            throw new FileNotFoundError(`Файл не найден: rubrics.json`);
        }
        throw err;
    }
}
export function isRubricsExpired(lastModified: string): boolean {
    const lastDate = new Date(lastModified).getTime();
    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000; 
    return (now - lastDate) > dayInMs;
}