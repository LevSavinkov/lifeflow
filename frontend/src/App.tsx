import { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8000";
const COLUMNS = ["to do", "in progress", "done"] as const;
const COLUMN_LABELS: Record<(typeof COLUMNS)[number], string> = {
  "to do": "To Do",
  "in progress": "In Progress",
  done: "Done",
};

type Goal = {
  id: number;
  text: string;
  column_title: string;
};

type Board = {
  id: number;
  title: string;
};

function getGoalsForColumn(goals: Goal[], colTitle: string): Goal[] {
  return goals.filter(
    (g) =>
      g.column_title === colTitle ||
      (colTitle === "to do" && !COLUMNS.includes(g.column_title as (typeof COLUMNS)[number]))
  );
}

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Ошибка";
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export default function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingGoalId, setDraggingGoalId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("lifeflow-theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lifeflow-theme", theme);
  }, [theme]);

  const loadGoals = async (boardId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Goal[]>(`${API_BASE}/boards/${boardId}/goals`);
      setGoals(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const loadStarted = useRef(false);
  useEffect(() => {
    if (loadStarted.current) return;
    loadStarted.current = true;
    (async () => {
      try {
        const boardsData = await apiRequest<Board[]>(`${API_BASE}/boards`);
        setBoards(boardsData);
        const firstId = boardsData[0]?.id ?? null;
        setSelectedBoardId(firstId);
        firstId != null ? await loadGoals(firstId) : setGoals([]);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addGoal = async () => {
    if (selectedBoardId == null || !text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await apiRequest<Goal>(`${API_BASE}/boards/${selectedBoardId}/goals`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setGoals((prev) => [...prev, created]);
      setText("");
      setIsAdding(false);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const updateGoal = async () => {
    if (editingGoalId == null || !editText.trim()) {
      setEditingGoalId(null);
      setEditText("");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await apiRequest<Goal>(`${API_BASE}/goals/${editingGoalId}`, {
        method: "PATCH",
        body: JSON.stringify({ text: editText.trim() }),
      });
      setGoals((prev) => prev.map((g) => (g.id === editingGoalId ? updated : g)));
      setEditingGoalId(null);
      setEditText("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const moveGoal = async (goalId: number, column_title: string) => {
    setError(null);
    try {
      const updated = await apiRequest<Goal>(`${API_BASE}/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ column_title }),
      });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const deleteGoal = async (goalId: number) => {
    setError(null);
    try {
      await apiRequest<void>(`${API_BASE}/goals/${goalId}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const deleteAll = async () => {
    if (selectedBoardId == null) return;
    setError(null);
    try {
      await apiRequest<void>(`${API_BASE}/boards/${selectedBoardId}/goals`, { method: "DELETE" });
      setGoals([]);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditText(goal.text);
  };

  const cancelEdit = () => {
    setEditingGoalId(null);
    setEditText("");
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon" aria-hidden />
          <span className="app-logo-text">Lifeflow</span>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
          aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
        >
          {theme === "light" ? "🌙 Тёмная" : "☀️ Светлая"}
        </button>
      </header>

      {loading && <div className="app-loading">Загрузка...</div>}
      {error && <div className="app-error">{error}</div>}

      {!loading && (
        <div className="board">
          {COLUMNS.map((colTitle) => (
            <div
              key={colTitle}
              className={`column ${dragOverColumn === colTitle ? "column--drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverColumn(colTitle);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColumn(null);
                setDraggingGoalId(null);
                const goalId = Number(e.dataTransfer.getData("text/plain"));
                if (!Number.isNaN(goalId)) moveGoal(goalId, colTitle);
              }}
            >
              <div className="column-header">{COLUMN_LABELS[colTitle]}</div>
              {getGoalsForColumn(goals, colTitle).map((goal) => {
                const cardClasses = [
                  "card",
                  colTitle === "in progress" && "card--in-progress",
                  colTitle === "done" && "card--done",
                  draggingGoalId === goal.id && "card--dragging",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={goal.id}
                    className={cardClasses}
                    style={{ ["--card-rotation" as string]: `${(goal.id % 5) - 2}deg` }}
                    draggable={editingGoalId !== goal.id}
                    onDragStart={(e) => {
                      setDraggingGoalId(goal.id);
                      e.dataTransfer.setData("text/plain", String(goal.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingGoalId(null)}
                  >
                    {editingGoalId === goal.id ? (
                      <div
                        className="edit-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <button onClick={updateGoal} disabled={saving}>
                          сохранить
                        </button>
                        <button type="button" onClick={cancelEdit}>
                          отмена
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="card-body">
                          <span className="card-text">{goal.text}</span>
                        </div>
                        <div className="card-actions">
                          <button
                            type="button"
                            className="card-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(goal);
                            }}
                            title="Редактировать"
                          >
                            ✎ ред.
                          </button>
                          <button
                            type="button"
                            className="card-btn card-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGoal(goal.id);
                            }}
                            title="Удалить"
                          >
                            🗑
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!loading && selectedBoardId != null && (
        <footer className="board-footer">
          {isAdding ? (
            <div className="add-block" onClick={(e) => e.stopPropagation()}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Текст задачи..."
                autoFocus
              />
              <button type="button" className="add-task-btn" onClick={addGoal} disabled={saving}>
                сохранить
              </button>
              <button type="button" className="card-btn" onClick={() => { setIsAdding(false); setText(""); }}>
                отмена
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-task-btn"
              onClick={() => setIsAdding(true)}
            >
              + Add Task
            </button>
          )}
        </footer>
      )}

      {boards.length > 0 && goals.length > 0 && (
        <button type="button" className="app-delete-all" onClick={deleteAll}>
          удалить все цели
        </button>
      )}
    </div>
  );
}