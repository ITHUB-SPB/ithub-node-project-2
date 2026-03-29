import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "node:path";
import type { RenderContext } from "../types.js";

async function renderMarkup(context: RenderContext): Promise<string> {
  /**
   * Рендерит информацию о новостях по рубрикам в html-строку по шаблону.
   *
   * @remarks
   * Получает на вход объект с новостями, передает его в шаблонизатор,
   * возвращает сгенерированную строку с HTML.
   *
   * @privateRemarks
   * Для шаблонизации используется библиотека `ejs`,
   * которая отрисовывает данные в подготовленные шаблоны
   * `templates/index.ejs`, `templates/header.partial.ejs`,
   * `templates/newsItem.partial.ejs`.
   *
   * @param context - объект с данными о новостях.
   *
   */

  const mainTemplatePath = String(new URL("./templates/index.ejs", import.meta.url));

  return await ejs.renderFile(mainTemplatePath, { context });
}

export default async function savePdf(context: RenderContext) {
  /**
   * Сохраняет html-контент в pdf-файл.
   *
   * @remarks
   * Получает на вход строку с html-контентом, помещает
   * его на страницу браузера и сохраняет в pdf-формат.
   *
   * Для сохранения использует файлы с названием вида
   * `vedomosti_yyyy_mm_dd_hh.pdf`.
   *
   * @privateRemarks
   * Для сохранения используется библиотеку `puppeteer`,
   * которая отвечает за открытие браузера, создание страницы,
   * наполнение ее html-содержимым и сохранение страницы в pdf.
   *
   * @param context - строка с HTML-содержимым для выгрузки.
   *
   */

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:T]/g, "_").slice(0, 13);
  const fileName = `vedomosti_${timestamp}.pdf`;
  const filePath = path.join(process.cwd(), "storage", fileName);

  try {
    const htmlContent = await renderMarkup(context);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.pdf({
      path: filePath,
      format: "A4",
      margin: { top: "20px", bottom: "20px" },
    });

    await browser.close();
    console.log(`Отчет успешно сохранен: ${fileName}`);
  } catch (error) {
    console.error("Ошибка при генерации PDF:", error);
  }
}
