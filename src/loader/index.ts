import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";
import * as storage from "../storage/index.js";
import * as types from "../types.js";
import { fetchNews } from "./fetcher.js";

function loadNews(rubricUrl: string): Promise<types.NewsItem[]> {
  return fetchNews(rubricUrl).then(parser.parseNews);
}

async function loadRubrics(): Promise<types.RubricItem[]> {
  const { rubrics, lastModified } = await storage.loadRubrics();

  if (new Date(lastModified) > new Date()) {
    return rubrics;
  }

  const freshRubrics = await fetcher.fetchRubrics().then(parser.parseRubrics);

  storage.writeRubrics(freshRubrics);

  return freshRubrics;
}

export default async function load(
  rubricsOfInterest: types.RubricItem["id"][],
): Promise<types.RenderContext> {
  const allRubrics = await loadRubrics();

  // filter by rubrics set in settings
  const filteredRubrics = allRubrics.filter((r) => rubricsOfInterest.includes(r.id));

  const news: { [key: string]: types.NewsItem[] } = {};

  for (const rubric of filteredRubrics) {
    news[rubric.title] = await loadNews(rubric.link);
  }

  return news;
}
