import type { DragEvent } from "react";
import type { Goal } from "../types";

const PREVIEW_MAX = 80;

function formatDueShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function isGoalOverdue(goal: Goal): boolean {
  if (!goal.due_at) return false;
  if (goal.column_title === "done") return false;
  const end = new Date(goal.due_at);
  if (Number.isNaN(end.getTime())) return false;
  return Date.now() > end.getTime();
}

/** Локальный календарный день: «сегодня» вместо даты для целей до конца текущего дня. */
function formatDueSticker(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameLocalDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameLocalDay) return "сегодня";
  return `до ${formatDueShort(iso)}`;
}

function dueStickerLabel(goal: Goal, isShortBoard: boolean): string {
  if (!goal.due_at) return "";
  if (isGoalOverdue(goal)) return formatDueShort(goal.due_at);
  if (isShortBoard) return "сегодня";
  return formatDueSticker(goal.due_at);
}

type Props = {
  goal: Goal;
  dragging: boolean;
  isShortBoard: boolean;
  onEditRequest: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onDragStart: (goalId: number, e: DragEvent) => void;
  onDragEnd: () => void;
};

export function Card({
  goal,
  dragging,
  isShortBoard,
  onEditRequest,
  onDelete,
  onDragStart,
  onDragEnd,
}: Props) {
  const displayText =
    goal.text.length > PREVIEW_MAX ? `${goal.text.slice(0, PREVIEW_MAX)}…` : goal.text;

  const colTitle = goal.column_title;
  const overdue = isGoalOverdue(goal);
  const className = [
    "card",
    colTitle === "in progress" && "card--in-progress",
    colTitle === "done" && "card--done",
    overdue && "card--overdue",
    dragging && "card--dragging",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{ ["--card-rotation" as string]: `${(goal.id % 5) - 2}deg` }}
      draggable
      onDragStart={(e) => onDragStart(goal.id, e)}
      onDragEnd={onDragEnd}
    >
      <div className="card-body">
        <span className="card-text">{displayText}</span>
        {goal.due_at ? <span className="card-due">{dueStickerLabel(goal, isShortBoard)}</span> : null}
      </div>
      <div className="card-actions">
        <button
          type="button"
          className="card-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEditRequest(goal);
          }}
          title="Редактировать"
          aria-label="Редактировать"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button
          type="button"
          className="card-icon-btn card-icon-btn--danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(goal.id);
          }}
          title="Удалить"
          aria-label="Удалить"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
