import { useEffect } from "react";
import { Header } from "./Header.jsx";
import { useApp } from "../context/AppContext.jsx";

export function Streaks() {
  const { streaks, loading, error, refreshAll } = useApp();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const pct =
    streaks?.currentStreak != null
      ? Math.min(100, (streaks.currentStreak / 14) * 100)
      : 0;

  return (
    <div className="screen">
      <Header title="Streaks" subtitle="Consistency beats perfection." />
      {loading ? <p className="muted">Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {streaks ? (
        <>
          <section className="card">
            <div className="row spread">
              <span className="muted">Current streak</span>
              <strong>{streaks.currentStreak} days</strong>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="muted small">{streaks.message}</p>
          </section>

          <section className="card">
            <h2>Achievements</h2>
            <ul className="achievements">
              <li className={streaks.longestStreak >= 3 ? "done" : ""}>
                3-day foundation — longest {streaks.longestStreak} days
              </li>
              <li className={streaks.weeklyActiveDays >= 5 ? "done" : ""}>
                Active week — {streaks.weeklyActiveDays} / 7 days with logs
              </li>
              <li className={streaks.currentStreak >= 7 ? "done" : ""}>
                Week streak — keep logging daily
              </li>
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
