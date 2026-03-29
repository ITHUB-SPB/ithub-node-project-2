import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";
import * as storage from "../storage/index.js";
import * as types from "../types.js";

function loadNews(rubricUrl: string): Promise<types.NewsItem[]> {
  return fetcher.fetchNews(rubricUrl).then(parser.parseNews);
}

export async function loadRubrics(): Promise<types.RubricItem[]> {
  try {
    const { rubrics, lastModified } = await storage.loadRubrics();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (new Date().getTime() - new Date(lastModified).getTime() < ONE_DAY) {
      return rubrics;
    }
  } catch (error) {}

  const freshRubrics = await fetcher.fetchRubrics().then(parser.parseRubrics);
  await storage.writeRubrics(freshRubrics);

  return freshRubrics;
}

export default async function load(
  rubricsOfInterest: types.RubricItem["id"][],
): Promise<types.RenderContext> {
  const allRubrics = await loadRubrics();

  const filteredRubrics = allRubrics.filter((r) => rubricsOfInterest.includes(r.id));

  const news: { [key: string]: types.NewsItem[] } = {};

  for (const rubric of filteredRubrics) {
    news[rubric.title] = await loadNews(rubric.link);
  }

  return news;
}
