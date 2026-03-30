import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";
import * as storage from "../storage/index.js";
import * as types from "../types.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function loadNews(rubricUrl: string): Promise<types.NewsItem[]> {
  return fetcher.fetchNews(rubricUrl).then(parser.parseNews);
}

async function loadRubrics(): Promise<types.RubricItem[]> {
  const { rubrics, lastModified } = await storage.loadRubrics();

  const lastModifiedDate = new Date(lastModified);
  const now = new Date();
  const isFresh = now.getTime() - lastModifiedDate.getTime() < ONE_DAY_MS;

  if (isFresh) {
    return rubrics;
  }

  const freshRubrics = await fetcher.fetchRubrics().then(parser.parseRubrics);
  await storage.writeRubrics(freshRubrics);

  return freshRubrics;
}

export default async function load(
  rubricsOfInterest: types.RubricItem["id"][],
): Promise<types.RenderContext> {
  const allRubrics = await loadRubrics();

  const filteredRubrics = allRubrics.filter((r) =>
    rubricsOfInterest.includes(r.id),
  );

  const news: { [key: string]: types.NewsItem[] } = {};

  for (const rubric of filteredRubrics) {
    console.log("Загрузка новостей для рубрики: ${rubric.title}");
    news[rubric.title] = await loadNews(rubric.link);
  }

  return news;
}
