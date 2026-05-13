import { useEffect, useState, useCallback } from "react";
import { api, setToken, getToken } from "../services/apiClient";

export function useTelegramAuth() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const authenticate = useCallback(async () => {
    const devAuth =
      import.meta.env.VITE_ENABLE_DEV_AUTH === "true" ||
      import.meta.env.DEV;

    const existing = getToken();
    if (existing) {
      try {
        const profile = await api.me();
        setUser(profile);
        setReady(true);
        return;
      } catch {
        setToken(null);
      }
    }

    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData && devAuth) {
      try {
        const data = await api.authDev();
        setToken(data.token);
        setUser(data.user);
        setError(null);
      } catch (e) {
        setError(e.message || "dev_auth_failed");
      } finally {
        setReady(true);
      }
      return;
    }

    if (!tg) {
      setError(
        "Telegram WebApp is not available. Open this app from Telegram, or run the stack locally with ENABLE_DEV_AUTH=1 on the API."
      );
      setReady(true);
      return;
    }
    tg.ready();
    tg.expand();

    if (!initData) {
      setError(
        "Missing initData. For local development, enable ENABLE_DEV_AUTH=1 on the backend or open the Mini App from your bot."
      );
      setReady(true);
      return;
    }

    try {
      const data = await api.authTelegram(initData);
      setToken(data.token);
      setUser(data.user);
      setError(null);
    } catch (e) {
      setError(e.message || "auth_failed");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return { ready, error, user, setUser, reauth: authenticate };
}
