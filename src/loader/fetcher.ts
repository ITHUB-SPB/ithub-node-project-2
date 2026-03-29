const RUBRICS_URL = "https://www.vedomosti.ru/info/rss/";

function baseFetch(url: string): Promise<string> {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Некорректный ответ сервера");
    }
    return response.text();
  });
}

export function fetchNews(rubricUrl: string): Promise<string> {
  return baseFetch(rubricUrl).catch((error) => {
    console.error(`Ошибка при получении новостей по ${rubricUrl}`);
    throw error;
  });
}

export function fetchRubrics(): Promise<string> {
  return baseFetch(RUBRICS_URL).catch((error) => {
    console.error("Ошибка при получении рубрик");
    throw error;
  });
}
