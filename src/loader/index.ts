import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";
import * as storage from "../storage/index.js";
import * as types from "../types.js";
import { isRubricsExpired } from "../storage/rubrics.js";
import { fetchNews } from "./fetcher.js";


function loadNews(rubricUrl: string): Promise<types.NewsItem[]> {
  return fetchNews(rubricUrl).then(parser.parseNews);

}


async function loadRubrics(): Promise<types.RubricItem[]> {
  try {
    const { rubrics, lastModified } = await storage.loadRubrics();
    if (!isRubricsExpired(lastModified)) {
      return rubrics;
    }
  } catch (err) {

  }

  const freshRubrics = await fetcher.fetchRubrics().then(parser.parseRubrics);
  await storage.writeRubrics(freshRubrics);
  return freshRubrics;
}

export default async function load(
  rubricsOfInterest: types.RubricItem["id"][],
): Promise<types.RenderContext> {
  const allRubrics = await loadRubrics();


const filteredRubrics = allRubrics.filter(rubric => 
  rubricsOfInterest.includes(rubric.id)
);

  const news: { [key: string]: types.NewsItem[] } = {};

  for (const rubric of filteredRubrics) {
    news[rubric.title] = await loadNews(rubric.link);
  }

  return news;
}

export { loadRubrics };