const base = import.meta.env.VITE_API_BASE_URL || "";

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
  const res = await fetch(`${base}${path}`, { ...options, headers });
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
