import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { useBoard } from "./hooks/useBoard";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("lifeflow-theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lifeflow-theme", theme);
  }, [theme]);

  const { boards, selectedBoardId, goals, loading, saving, error, addGoal, editGoal, moveGoal, deleteGoal, deleteAll } =
    useBoard();

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      />

      {loading && <div className="app-loading">Загрузка...</div>}
      {error && <div className="app-error">{error}</div>}

      {!loading && (
        <Board
          goals={goals}
          saving={saving}
          onEdit={editGoal}
          onDelete={deleteGoal}
          onMove={moveGoal}
        />
      )}

      {!loading && selectedBoardId != null && (
        <Footer saving={saving} onAdd={addGoal} />
      )}

      {boards.length > 0 && goals.length > 0 && (
        <button type="button" className="app-delete-all" onClick={deleteAll}>
          удалить все цели
        </button>
      )}
    </div>
  );
}
