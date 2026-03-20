import { useState } from "react";
import type { Goal } from "../types";

type Props = {
  goal: Goal;
  dragging: boolean;
  saving: boolean;
  onEdit: (goalId: number, text: string) => Promise<void>;
  onDelete: (goalId: number) => void;
  onDragStart: (goalId: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
};

export function Card({
  goal,
  dragging,
  saving,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const startEdit = () => {
    setEditing(true);
    setEditText(goal.text);
  };

  const confirmEdit = async () => {
    if (!editText.trim()) {
      setEditing(false);
      return;
    }
    await onEdit(goal.id, editText);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditText("");
  };

  const colTitle = goal.column_title;
  const className = [
    "card",
    colTitle === "in progress" && "card--in-progress",
    colTitle === "done" && "card--done",
    dragging && "card--dragging",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{ ["--card-rotation" as string]: `${(goal.id % 5) - 2}deg` }}
      draggable={!editing}
      onDragStart={(e) => onDragStart(goal.id, e)}
      onDragEnd={onDragEnd}
    >
      {editing ? (
        <div className="edit-block" onClick={(e) => e.stopPropagation()}>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
          <button onClick={confirmEdit} disabled={saving}>
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
                startEdit();
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
                onDelete(goal.id);
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
}
