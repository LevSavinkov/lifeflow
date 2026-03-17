import { useEffect, useRef, useState } from "react";

const COLUMNS = ["to do", "in progress", "done"] as const;
const API_BASE = "http://localhost:8000";

type Goal = {
  id: number;
  text: string;
  done: boolean;
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

export default function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingGoalId, setDraggingGoalId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const loadGoals = async (boardId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/boards/${boardId}/goals`);
      if (!res.ok) throw new Error("Не удалось загрузить цели");
      const data: Goal[] = await res.json();
      setGoals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки целей");
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
        const boardsRes = await fetch(`${API_BASE}/boards`);
        if (!boardsRes.ok) throw new Error("Не удалось загрузить доски");
        const boardsData: Board[] = await boardsRes.json();
        setBoards(boardsData);
        const firstBoardId = boardsData[0]?.id ?? null;
        setSelectedBoardId(firstBoardId);
        if (firstBoardId != null) await loadGoals(firstBoardId);
        else setGoals([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addGoal = async () => {
    if (selectedBoardId == null || !text.trim()) return;

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE}/boards/${selectedBoardId}/goals`, {
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

  const moveGoal = async (goalId: number, column_title: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column_title }),
      });
      if (!res.ok) throw new Error("Не удалось переместить цель");
      const updated: Goal = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка перемещения");
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/goals/${goalId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Не удалось удалить цель");
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления цели");
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
    if (selectedBoardId == null) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/boards/${selectedBoardId}/goals`, {
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

  const createBoard = async () => {
    if (!boardTitle.trim()) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_BASE}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: boardTitle.trim() }),
      });
      if (!res.ok) {
        throw new Error("Не удалось создать доску");
      }
      const created: Board = await res.json();
      setBoards((prev) => [...prev, created]);
      setSelectedBoardId(created.id);
      setGoals([]);
      setBoardTitle("");
      setIsCreatingBoard(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания доски");
    } finally {
      setSaving(false);
    }
  };

  const cancelCreateBoard = () => {
    setIsCreatingBoard(false);
    setBoardTitle("");
    setError(null);
  };

  return (
    <div style={styles.container}>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && boards.length === 0 && !isCreatingBoard && (
        <button onClick={() => setIsCreatingBoard(true)}>Создать доску</button>
      )}

      {!loading && isCreatingBoard && (
        <div style={styles.addBlock}>
          <input
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="Название доски"
            style={styles.input}
            autoFocus
          />
          <button onClick={createBoard} disabled={saving}>
            Создать
          </button>
          <button onClick={cancelCreateBoard}>Отмена</button>
        </div>
      )}

      {boards.length > 0 && !isCreatingBoard && (
        <div style={styles.boardsRow}>
          <select
            value={selectedBoardId ?? undefined}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedBoardId(id);
              loadGoals(id);
            }}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setIsCreatingBoard(true)}>
            + создать доску
          </button>
          <button
            type="button"
            style={styles.deleteBoardBtn}
            onClick={async () => {
              if (selectedBoardId == null) return;
              try {
                setError(null);
                const res = await fetch(`${API_BASE}/boards/${selectedBoardId}`, {
                  method: "DELETE",
                });
                if (!res.ok) throw new Error("Не удалось удалить доску");
                const nextBoards = boards.filter((b) => b.id !== selectedBoardId);
                setBoards(nextBoards);
                if (nextBoards.length > 0) {
                  setSelectedBoardId(nextBoards[0].id);
                  await loadGoals(nextBoards[0].id);
                } else {
                  setSelectedBoardId(null);
                  setGoals([]);
                }
              } catch (e) {
                setError(e instanceof Error ? e.message : "Ошибка удаления доски");
              }
            }}
          >
            Удалить доску
          </button>
        </div>
      )}

      {boards.length > 0 && (
        <div style={styles.columnsRow}>
          {COLUMNS.map((colTitle) => (
            <div
              key={colTitle}
              style={{
                ...styles.column,
                ...(dragOverColumn === colTitle ? styles.columnDragOver : {}),
              }}
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
                if (goalId && !Number.isNaN(goalId)) {
                  moveGoal(goalId, colTitle);
                }
              }}
            >
              <div style={styles.columnHeader}>{colTitle}</div>
              {getGoalsForColumn(goals, colTitle).map(
                (goal) => (
                  <div
                    key={goal.id}
                    draggable={editingGoalId !== goal.id}
                    onDragStart={(e) => {
                      setDraggingGoalId(goal.id);
                      e.dataTransfer.setData("text/plain", String(goal.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingGoalId(null)}
                    style={{
                      ...styles.card,
                      ...(draggingGoalId === goal.id ? styles.cardDragging : {}),
                    }}
                    onClick={() =>
                      editingGoalId !== goal.id && toggleGoal(goal.id)
                    }
                  >
                    <input type="checkbox" checked={goal.done} readOnly />
                    {editingGoalId === goal.id ? (
                      <div
                        style={styles.editBlock}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                        <span style={styles.cardText}>{goal.text}</span>
                        <button
                          type="button"
                          style={styles.cardBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(goal);
                          }}
                        >
                          ред.
                        </button>
                        <button
                          type="button"
                          style={styles.cardDeleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGoal(goal.id);
                          }}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                )
              )}
              {colTitle === "to do" && (
                <>
                  {isAdding ? (
                    <div
                      style={styles.addBlock}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Введите цель"
                        style={styles.input}
                      />
                      <button onClick={addGoal}>сохранить</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAdding(true);
                      }}
                    >
                      + добавить цель
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {boards.length > 0 && goals.length > 0 && (
        <button onClick={deleteAll} style={styles.delete}>
          удалить все цели
        </button>
      )}
    </div>
  );
}

const styles: {
  container: React.CSSProperties;
  boardsRow: React.CSSProperties;
  columnsRow: React.CSSProperties;
  column: React.CSSProperties;
  columnDragOver: React.CSSProperties;
  columnHeader: React.CSSProperties;
  card: React.CSSProperties;
  cardDragging: React.CSSProperties;
  cardText: React.CSSProperties;
  cardBtn: React.CSSProperties;
  cardDeleteBtn: React.CSSProperties;
  addBlock: React.CSSProperties;
  editBlock: React.CSSProperties;
  input: React.CSSProperties;
  delete: React.CSSProperties;
  deleteBoardBtn: React.CSSProperties;
} = {
  container: {
    maxWidth: 900,
    margin: "80px auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontFamily: "sans-serif",
  },
  boardsRow: {
    marginBottom: 16,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  columnsRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  column: {
    flex: 1,
    minWidth: 0,
    minHeight: 120,
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "background 0.15s ease",
  },
  columnDragOver: {
    background: "rgba(100, 149, 237, 0.12)",
    borderColor: "cornflowerblue",
  },
  columnHeader: {
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "grab",
    padding: "10px 12px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 6,
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    minHeight: 44,
  },
  cardDragging: {
    opacity: 0.5,
    cursor: "grabbing",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  cardText: {
    userSelect: "none",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardBtn: {
    flexShrink: 0,
    padding: "2px 8px",
    fontSize: 12,
  },
  cardDeleteBtn: {
    flexShrink: 0,
    padding: "2px 8px",
    fontSize: 14,
    color: "#999",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  addBlock: {
    display: "flex",
    gap: 8,
  },
  editBlock: {
    display: "flex",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
  },
  delete: {
    marginTop: 40,
  },
  deleteBoardBtn: {
    color: "crimson",
  },
};
