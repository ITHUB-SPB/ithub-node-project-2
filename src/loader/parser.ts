import { XMLParser } from "fast-xml-parser";
import { parse } from 'node-html-parser';
import * as types from "../types.js";

export function parseNews(rawData: string): types.NewsItem[] {
  const parser = new XMLParser();
  const parsedData = parser.parse(rawData);
  return parsedData["rss"]["channel"]["item"];
}

export function parseRubrics(rawData: string): types.RubricItem[] {
  const root = parse(rawData);
  const links = root.querySelectorAll('a[href*="/rss/rubric/"]');

return links
  .map(link => {
    const href = link.getAttribute('href') || '';
    const title = link.textContent.trim();
    const pathParts = href.split('/rss/rubric/')[1]?.split('/') || [];
    const id = pathParts[pathParts.length - 1];
    
    if (!id) return undefined;

    const parentId = pathParts.length > 1 ? pathParts[0] : undefined;

    return {
      title,
      id,
      link: href.startsWith('http') ? href : `https://www.vedomosti.ru${href}`,
      ...(parentId && { parentId })
    } as types.RubricItem;
  })
  .filter((item): item is types.RubricItem => item !== undefined);
}
