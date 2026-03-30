import ejs from 'ejs'
import puppeteer from 'puppeteer'
import type { RenderContext } from '../types.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function renderMarkup(context: RenderContext): Promise<string> {
  const mainTemplatePath = join(__dirname, 'templates', 'index.ejs')

  return new Promise((resolve, reject) => {
    ejs.renderFile(mainTemplatePath, { context }, (error: Error | null, html?: string) => {
      if (error) {
        reject(error)
      } else {
        resolve(html || '')
      }
    })
  })
}

function getFileName(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  return `vedomosti_${year}_${month}_${day}_${hour}.pdf`
}

export default async function savePdf(context: RenderContext): Promise<void> {
  const pathToSaveFile = join(process.cwd(), 'storage', getFileName())

  try {
    console.log('Рендеринг HTML...')
    const htmlContent = await renderMarkup(context)
    
    console.log('Запуск браузера...')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    console.log('Сохранение PDF...')
    await page.pdf({
      path: pathToSaveFile,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    })
    
    await browser.close()
    console.log(`PDF сохранен: ${pathToSaveFile}`)
  } catch (error) {
    console.error('Ошибка при создании PDF:', error)
    throw error
  }
}
