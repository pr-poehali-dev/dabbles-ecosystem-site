import { apiUrl, setToken } from "./api";
import { User } from "./api";

const CALLBACK_PATH = "/meroshkins/yandex-callback";

export function getYandexCallbackUri() {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

/** Редиректит браузер на страницу входа Яндекса */
export async function redirectToYandex() {
  const redirectUri = getYandexCallbackUri();
  const base = apiUrl("yandex-auth");
  const res = await fetch(`${base}?action=url&redirect_uri=${encodeURIComponent(redirectUri)}`);
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error("Не удалось получить ссылку Яндекса");
  }
}

/** Обменивает code (из URL) на токен Даббл, возвращает user */
export async function exchangeYandexCode(code: string): Promise<{ token: string; user: User }> {
  const redirectUri = getYandexCallbackUri();
  const base = apiUrl("yandex-auth");
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка авторизации через Яндекс");
  setToken(data.token);
  return data;
}
