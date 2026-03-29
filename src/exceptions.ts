export class FileNotFoundError extends Error {
  constructor(message: `Файл не найден: ${string}.json`) {
    super(message);
    this.name = "FileNotFoundError";
  }
}

export class SettingsOutdatedError extends Error {
  constructor() {
    super();
    this.name = "SettingsOutdatedError";
  }
}
