import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { Board } from "./components/Board";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { useAuth } from "./hooks/useAuth";
import { useBoard } from "./hooks/useBoard";

function BoardScreen() {
  const { selectedBoardId, goals, loading, saving, error, addGoal, editGoal, moveGoal, deleteGoal } =
    useBoard();

  return (
    <>
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
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("lifeflow-theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const auth = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lifeflow-theme", theme);
  }, [theme]);

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      />
      {auth.ready && auth.status === "anonymous" && (
        <AuthPanel error={auth.error} onLogin={auth.login} onRegister={auth.register} />
      )}
      {auth.ready && auth.status === "authenticated" && (
        <>
          <div className="card-actions" style={{ justifyContent: "space-between", margin: "0 0 12px" }}>
            <span>Вы вошли как {auth.user?.email}</span>
            <button type="button" className="card-btn" onClick={auth.logout}>
              Выйти
            </button>
          </div>
          <BoardScreen />
        </>
      )}
    </div>
  );
}
