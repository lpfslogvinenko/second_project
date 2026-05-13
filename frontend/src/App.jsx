import { useEffect, useState } from "react";
import "./styles.css";
import { useTelegramAuth } from "./hooks/useTelegramAuth.js";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { MealInput } from "./components/MealInput.jsx";
import { Streaks } from "./components/Streaks.jsx";
import { Footer } from "./components/Footer.jsx";
import { api } from "./services/apiClient.js";

function Onboarding({ onComplete }) {
  const [goal, setGoal] = useState("2000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const n = Number(goal);
      if (!Number.isFinite(n) || n < 800 || n > 6000) {
        setError("Pick a daily goal between 800 and 6000 kcal.");
        setBusy(false);
        return;
      }
      await api.patchMe({
        daily_calorie_goal: n,
        onboarding_completed: true,
      });
      onComplete();
    } catch (err) {
      setError(err.message || "save_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <header className="app-header">
        <h1>Welcome</h1>
        <p className="muted">Set your daily calorie target to get started.</p>
      </header>
      <form className="card form" onSubmit={submit}>
        <label className="field">
          <span>Daily calorie goal</span>
          <input
            inputMode="numeric"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" className="primary wide" disabled={busy}>
          {busy ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

function Shell() {
  const { user, setUser } = useApp();
  const [view, setView] = useState("dashboard");

  if (!user?.onboarding_completed) {
    return (
      <Onboarding
        onComplete={async () => {
          const profile = await api.me();
          setUser(profile);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {view === "dashboard" ? (
          <Dashboard onLogMeal={() => setView("log")} />
        ) : null}
        {view === "log" ? <MealInput onDone={() => setView("dashboard")} /> : null}
        {view === "streaks" ? <Streaks /> : null}
      </main>
      <Footer view={view} onChange={setView} />
    </div>
  );
}

export default function App() {
  const { ready, error, user, setUser, reauth } = useTelegramAuth();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.colorScheme === "dark") {
      document.body.classList.add("tg-dark");
    }
  }, []);

  if (!ready) {
    return (
      <div className="screen center">
        <p className="muted">Starting…</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="screen center">
        <p className="error">{error}</p>
        <button type="button" className="secondary" onClick={reauth}>
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="screen center">
        <p className="muted">No user session.</p>
      </div>
    );
  }

  return (
    <AppProvider user={user} setUser={setUser}>
      <Shell />
    </AppProvider>
  );
}
