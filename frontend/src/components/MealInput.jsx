import { useState } from "react";
import { Header } from "./Header.jsx";
import { api } from "../services/apiClient.js";
import { useApp } from "../context/AppContext.jsx";

export function MealInput({ onDone }) {
  const { refreshAll } = useApp();
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      if (description) fd.append("description", description);
      if (calories !== "") fd.append("calories", String(Number(calories) || 0));
      if (file) fd.append("photo", file);
      await api.logMeal(fd);
      setDescription("");
      setCalories("");
      setFile(null);
      await refreshAll();
      onDone?.();
    } catch (err) {
      setError(err.message || "save_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <Header title="Log meal" subtitle="Text, calories, or a quick photo." />
      <form className="card form" onSubmit={submit}>
        <label className="field">
          <span>Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Chicken salad, medium"
          />
        </label>
        <label className="field">
          <span>Calories (optional if AI adds them later)</span>
          <input
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="420"
          />
        </label>
        <label className="field">
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" className="primary wide" disabled={busy}>
          {busy ? "Saving…" : "Log meal"}
        </button>
      </form>
    </div>
  );
}
