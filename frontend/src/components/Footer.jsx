export function Footer({ view, onChange }) {
  const tabs = [
    { id: "dashboard", label: "Home" },
    { id: "log", label: "Log" },
    { id: "streaks", label: "Streaks" },
  ];
  return (
    <footer className="app-footer">
      <nav className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={view === t.id ? "tab active" : "tab"}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </footer>
  );
}
