import { XMLParser } from "fast-xml-parser";
import htmlParser from "node-html-parser";
import * as types from "../types.js";

export function parseNews(rawData: string): types.NewsItem[] {
  const parser = new XMLParser();
  const parsedData = parser.parse(rawData);
  return parsedData["rss"]["channel"]["item"];
}

export function parseRubrics(rawData: string): types.RubricItem[] {
  const root = htmlParser.parse(rawData);
  const rubrics: types.RubricItem[] = [];

  const links = root.querySelectorAll("a.rss-list__link");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.includes("/rss/rubric/")) {
      const id = href.split("/").pop() || "";
      rubrics.push({
        title: link.text.trim(),
        id: id,
        link: `https://www.vedomosti.ru${href}`,
      });
    }
  });
  return rubrics;
}
