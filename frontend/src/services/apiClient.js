function apiBase() {
  const raw = (import.meta.env.VITE_API_BASE_URL || "").trim();
  return raw.replace(/\/+$/, "");
}

/** True when fetch() failed before HTTP (locale-independent as far as possible). */
export function isTransientNetworkError(err) {
  if (err && typeof err.status === "number" && err.status > 0) {
    return false;
  }
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    (msg.includes("fetch") && msg.includes("network")) ||
    msg.includes("не удалось связаться") ||
    msg.includes("не удалось выполнить") ||
    msg.includes("aborted")
  );
}

export function getToken() {
  return localStorage.getItem("ct_token");
}

export function setToken(t) {
  if (t) localStorage.setItem("ct_token", t);
  else localStorage.removeItem("ct_token");
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const base = apiBase();
  const url = `${base}${path}`;
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e) {
    const hint =
      !base &&
      import.meta.env.PROD &&
      " Укажите VITE_API_BASE_URL на Vercel (URL бэкенда Render, https://..., без слэша в конце).";
    const network = isTransientNetworkError(e);
    const err = new Error(
      (network
        ? `Не удалось связаться с API (${url}). Проверьте VITE_API_BASE_URL, CORS_ORIGIN на Render и что сервис не «спит».`
        : e.message) + (hint || "")
    );
    err.cause = e;
    throw err;
  }
  if (!res.ok) {
    let detail = null;
    try {
      detail = await res.json();
    } catch {
      /* ignore */
    }
    const err = new Error(detail?.error || res.statusText);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  authDev: () => apiFetch("/api/auth/dev", { method: "POST" }),
  authTelegram: (initData) =>
    apiFetch("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData }),
    }),
  me: () => apiFetch("/api/users/me"),
  patchMe: (body) =>
    apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  meals: () => apiFetch("/api/meals"),
  mealSummary: () => apiFetch("/api/meals/summary"),
  logMeal: (formData) =>
    apiFetch("/api/meals", { method: "POST", body: formData }),
  streaks: () => apiFetch("/api/streaks"),
};
