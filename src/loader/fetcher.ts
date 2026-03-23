const RUBRICS_URL = "https://www.vedomosti.ru/info/rss/";

function baseFetch(url: string): Promise<string> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("некорректный ответ");
      }
      return response.text();
    })
}

export function fetchNews(rubricUrl: string): Promise<string> {
  return baseFetch(rubricUrl)
    .catch((error) => {
      console.error(`ошибка новостей ${rubricUrl}`);
      throw error
    });
}

export function fetchRubrics(): Promise<string> {
  return baseFetch(RUBRICS_URL)
    .catch((error) => {
      console.error("ошибка рубрик");
      throw error
    });
}
