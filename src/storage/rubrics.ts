import { readFile, writeFile } from "node:fs";
import { FileNotFoundError } from "../exceptions.js";
import type { Rubrics, RubricsStorage } from "../types.js";

const RUBRICS_PATH = new URL("./rubrics.json", import.meta.url);

export function writeRubrics(rubrics: Rubrics["rubrics"]): Promise<void> {
  return new Promise((resolve, reject) => {
    const data: RubricsStorage = {
      rubrics,
      lastModified: new Date().toISOString(),
    };
    writeFile(RUBRICS_PATH, JSON.stringify(data, null, 2), "utf-8", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function loadRubrics(): Promise<RubricsStorage> {
  return new Promise((resolve, reject) => {
    readFile(RUBRICS_PATH, "utf-8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          reject(new FileNotFoundError("Файл не найден: rubrics.json"));
        } else {
          reject(err);
        }
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}
