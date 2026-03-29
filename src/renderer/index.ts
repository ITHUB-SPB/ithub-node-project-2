import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import type { RenderContext } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function renderMarkup(context: RenderContext): Promise<string> {
  const mainTemplatePath = path.join(__dirname, "templates", "index.ejs");

  return new Promise((resolve, reject) => {
    ejs.renderFile(
      mainTemplatePath,
      { newsContext: context },
      (error: Error | null, html: string) => {
        if (error) reject(error);
        resolve(html);
      },
    );
  });
}

export default async function savePdf(context: RenderContext) {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");

  const pathToSaveFile = `vedomosti_${yyyy}_${mm}_${dd}_${hh}.pdf`;

  try {
    console.log("Генерация HTML...");
    const htmlContent = await renderMarkup(context);

    console.log("Запуск Puppeteer...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.pdf({ path: pathToSaveFile, format: "A4", printBackground: true });

    await browser.close();
    console.log(`Успех: Отчет сохранен как ${pathToSaveFile}`);
  } catch (error) {
    console.error("Ошибка при генерации PDF: ", error);
  }
}
