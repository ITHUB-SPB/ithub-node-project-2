import { XMLParser } from "fast-xml-parser";
import htmlParser from "node-html-parser";
import * as types from "../types.js";

export function parseNews(rawData: string): types.NewsItem[] {
  const parser = new XMLParser();
  const parsedData = parser.parse(rawData);
  const items = parsedData["rss"]["channel"]["item"];
  return items.map((item: any) => ({
    title: item.title || "",
    link: item.link || "",
    author: item.author || "",
    enclosure: item.enclosure?.url,
    description: item.description || "",
    pubDate: item.pubDate || "",
  }));
}

export function parseRubrics(rawData: string): types.RubricItem[] {
  const root = htmlParser.parse(rawData);
  const rubrics: types.RubricItem[] = [];

  const links = root.querySelectorAll('a[href*="/rss/rubric/"]');

  for (const link of links) {
    const href = link.getAttribute("href");
    const title = link.text.trim();

    if (href && title) {
      const fullUrl = href.startsWith("http")
        ? href
        : `https://www.vedomosti.ru${href}`;
      const id = href
        .replace("/rss/rubric/", "")
        .replace(/\.xml$/, "")
        .replace(/\//g, "-");

      rubrics.push({
        title: title,
        id: id,
        link: fullUrl,
      });
    }
  }

  return rubrics;
}
