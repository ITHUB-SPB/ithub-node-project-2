import { XMLParser } from "fast-xml-parser";
import htmlParser from "node-html-parser";
import * as types from "../types.js";

export function parseNews(rawData: string): types.NewsItem[] {
  const parser = new XMLParser();
  const parsedData = parser.parse(rawData);

  // В зависимости от ленты, item может быть объектом (если 1 новость) или массивом
  const items = parsedData?.rss?.channel?.item || [];
  return Array.isArray(items) ? items : [items];
}

export function parseRubrics(rawData: string): types.RubricItem[] {
  const root = htmlParser.parse(rawData);
  const rubrics: types.RubricItem[] = [];

  // Ищем все ссылки, ведущие на rss ленты
  const links = root.querySelectorAll("a");

  for (const link of links) {
    const href = link.getAttribute("href");
    if (href && href.includes("/rss/rubric/")) {
      const title = link.text.trim();
      if (!title) continue;

      let idUrlPart = href.split("/rss/rubric/")[1];
      if (!idUrlPart) continue;

      idUrlPart = idUrlPart.replace(/\/$/, "");
      const parts = idUrlPart.split("/");
      const id = parts.join("-");
      const parentId = parts.length > 1 ? parts[parts.length - 2] : undefined;
      const fullLink = href.startsWith("http") ? href : `https://www.vedomosti.ru${href}`;

      // Защита от дублей
      if (!rubrics.find((r) => r.id === id)) {
        rubrics.push({ title, id, parentId, link: fullLink });
      }
    }
  }

  return rubrics;
}
