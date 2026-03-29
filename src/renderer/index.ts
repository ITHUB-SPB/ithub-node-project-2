import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import type { RenderContext } from '../types.js';


function renderMarkup(context: RenderContext): Promise<string> {

const mainTemplatePath = decodeURIComponent(new URL('./templates/index.ejs', import.meta.url).pathname);

  return new Promise((resolve, reject) => {
    ejs.renderFile(
      mainTemplatePath,
      { context },
      (error: Error | null, html: string) => {
        if (error) {
          reject(error);
        }

        resolve(html);
      },
    );
  });
}

export default async function savePdf(context: RenderContext) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const fileName = `vedomosti_${year}_${month}_${day}_${hour}.pdf`;

  // const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pdfDir = path.join(process.cwd(), 'pdf');
  const filePath = path.join(pdfDir, fileName);

  try {
    await fs.mkdir(pdfDir, { recursive: true });

    const htmlContent = await renderMarkup(context);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    console.log(`pdf сохранен: ${filePath}`);
  } catch (error) {
    console.error('ошибка при сохранении pdf:', error);
  }
}