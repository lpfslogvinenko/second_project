import { useEffect } from "react";
import { Header } from "./Header.jsx";
import { useApp } from "../context/AppContext.jsx";

export function Dashboard({ onLogMeal }) {
  const { user, meals, streaks, summary, loading, error, refreshAll } = useApp();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="screen">
      <Header
        title="Today"
        subtitle={
          user?.first_name
            ? `Hi, ${user.first_name}`
            : "Your daily calorie snapshot"
        }
      />

      {loading ? <p className="muted">Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {summary ? (
        <section className="card">
          <div className="row spread">
            <span className="muted">Consumed</span>
            <strong>{summary.consumed_today} kcal</strong>
          </div>
          <div className="row spread">
            <span className="muted">Goal</span>
            <strong>{summary.daily_calorie_goal} kcal</strong>
          </div>
          <div className="progress">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  (summary.consumed_today / Math.max(1, summary.daily_calorie_goal)) *
                    100
                )}%`,
              }}
            />
          </div>
          <p className="muted small">
            {summary.remaining} kcal remaining today
          </p>
        </section>
      ) : null}

      {streaks ? (
        <section className="card">
          <div className="row spread">
            <span className="muted">Current streak</span>
            <strong>{streaks.currentStreak} days</strong>
          </div>
          <p className="muted small">{streaks.message}</p>
        </section>
      ) : null}

      <section className="card">
        <div className="row spread">
          <h2>Recent meals</h2>
        </div>
        {!meals?.length ? (
          <p className="muted">No meals yet. Log your first meal.</p>
        ) : (
          <ul className="meal-list">
            {meals.slice(0, 8).map((m) => (
              <li key={m.id} className="meal-item">
                <div>
                  <div className="meal-title">
                    {m.description || m.ai_label || "Meal"}
                  </div>
                  <div className="muted small">
                    {new Date(m.logged_at).toLocaleString()}
                  </div>
                </div>
                <div className="pill">{m.calories} kcal</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" className="primary wide" onClick={onLogMeal}>
        Log meal
      </button>
    </div>
  );
}
