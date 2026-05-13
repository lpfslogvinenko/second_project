import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { api } from "../services/apiClient";

const AppContext = createContext(null);

export function AppProvider({ children, user, setUser }) {
  const [meals, setMeals] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, s, sum, profile] = await Promise.all([
        api.meals(),
        api.streaks(),
        api.mealSummary(),
        api.me(),
      ]);
      setMeals(m.meals || []);
      setStreaks(s);
      setSummary(sum);
      setUser(profile);
    } catch (e) {
      setError(e.message || "load_failed");
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      meals,
      streaks,
      summary,
      loading,
      error,
      refreshAll,
    }),
    [user, setUser, meals, streaks, summary, loading, error, refreshAll]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
