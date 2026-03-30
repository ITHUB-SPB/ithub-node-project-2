import { readFile, writeFile } from "node:fs";
import { FileNotFoundError } from "../exceptions.js";
import type { Rubrics, RubricsStorage } from "../types.js";

const RUBRICS_PATH = new URL("../../storage/rubrics.json", import.meta.url);

export function writeRubrics(rubrics: Rubrics["rubrics"]): Promise<void> {
    return new Promise((resolve, reject) => {
        const data: RubricsStorage = {
            rubrics,
            lastModified: new Date().toISOString()
        };
        writeFile(RUBRICS_PATH, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function loadRubrics(): Promise<RubricsStorage> {
    return new Promise((resolve, reject) => {
        readFile(RUBRICS_PATH, "utf-8", (err, data) => {
            if (err) {
                if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                    reject(new FileNotFoundError("Файл не найден: rubrics.json" as `Файл не найден: ${string}.json`));
                } else {
                    reject(err);
                }
            } else {
                resolve(JSON.parse(data) as RubricsStorage);
            }
        });
    });
}