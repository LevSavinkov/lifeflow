import { useEffect, useRef, useState } from "react";

type Goal = {
  id: number;
  text: string;
  done: boolean;
};

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:8000";

  const loadStarted = useRef(false);
  useEffect(() => {
    if (loadStarted.current) return;
    loadStarted.current = true; // Strict Mode вызывает эффект дважды
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/goals`);
        if (!res.ok) {
          throw new Error("Не удалось загрузить цели");
        }
        const data: Goal[] = await res.json();
        setGoals(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addGoal = async () => {
    if (!text.trim()) return;

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        throw new Error("Не удалось сохранить цель");
      }
      const created: Goal = await res.json();
      setGoals((prev) => [...prev, created]);
      setText("");
      setIsAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
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

  const updateGoal = async () => {
    if (editingGoalId == null || !editText.trim()) {
      cancelEdit();
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE}/goals/${editingGoalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) {
        throw new Error("Не удалось обновить цель");
      }
      const updated: Goal = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === editingGoalId ? updated : g)));
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления");
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = async (id: number) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/goals/${id}/toggle`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Не удалось обновить цель");
      }
      const updated: Goal = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления");
    }
  };

  const deleteAll = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/goals`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Не удалось удалить цели");
      }
      setGoals([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    }
  };

  return (
    <div style={styles.container}>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {goals.map((goal) => (
        <div
          key={goal.id}
          style={styles.goal}
          onClick={() => editingGoalId !== goal.id && toggleGoal(goal.id)}
        >
          <input type="checkbox" checked={goal.done} readOnly />
          {editingGoalId === goal.id ? (
            <div style={styles.editBlock} onClick={(e) => e.stopPropagation()}>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={styles.input}
                autoFocus
              />
              <button onClick={updateGoal} disabled={saving}>
                сохранить
              </button>
              <button onClick={cancelEdit}>отмена</button>
            </div>
          ) : (
            <>
              <span style={styles.text}>{goal.text}</span>
              <button
                type="button"
                style={styles.editBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(goal);
                }}
              >
                редактировать
              </button>
            </>
          )}
        </div>
      ))}

      {isAdding ? (
        <div style={styles.addBlock}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите цель"
            style={styles.input}
          />
          <button onClick={addGoal}>сохранить</button>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)}>+ добавить цель</button>
      )}

      {goals.length > 0 && (
        <button onClick={deleteAll} style={styles.delete}>
          удалить все
        </button>
      )}
    </div>
  );
}

const styles: {
  container: React.CSSProperties;
  goal: React.CSSProperties;
  text: React.CSSProperties;
  addBlock: React.CSSProperties;
  editBlock: React.CSSProperties;
  input: React.CSSProperties;
  editBtn: React.CSSProperties;
  delete: React.CSSProperties;
} = {
  container: {
    maxWidth: 400,
    margin: "80px auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontFamily: "sans-serif",
  },
  goal: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  text: {
    userSelect: "none",
    flex: 1,
  },
  addBlock: {
    display: "flex",
    gap: 8,
  },
  editBlock: {
    display: "flex",
    gap: 8,
    flex: 1,
  },
  input: {
    flex: 1,
  },
  editBtn: {
    marginLeft: "auto",
  },
  delete: {
    marginTop: 40,
  },
};
