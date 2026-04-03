import { useEffect, useState } from "react";
import type { Goal } from "../types";

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDueRu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  open: boolean;
  editingGoal: Goal | null;
  saving: boolean;
  /** Только при создании на доске «Долгосрочные» */
  showDueDatePicker: boolean;
  onClose: () => void;
  onSave: (text: string, dueDate?: string) => Promise<void>;
};

export function GoalFormModal({
  open,
  editingGoal,
  saving,
  showDueDatePicker,
  onClose,
  onSave,
}: Props) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setText(editingGoal?.text ?? "");
    setDueDate("");
    setError("");
  }, [editingGoal, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const readOnlyDue = editingGoal?.due_at ?? null;

  const handleSave = async () => {
    if (!text.trim()) {
      setError("Описание цели не может быть пустым");
      return;
    }
    if (showDueDatePicker && !dueDate) {
      setError("Выберите дату окончания");
      return;
    }
    setError("");
    await onSave(text.trim(), showDueDatePicker ? dueDate : undefined);
  };

  const handleCancel = () => {
    setText("");
    setDueDate("");
    setError("");
    onClose();
  };

  return (
    <div
      className="goal-form-backdrop"
      role="presentation"
      onClick={handleCancel}
    >
      <div
        className="goal-form-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="goal-form-header">
          <h3 id="goal-form-title" className="goal-form-title">
            {editingGoal ? "Редактировать цель" : "Новая цель"}
          </h3>
          <button
            type="button"
            className="goal-form-close"
            onClick={handleCancel}
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <textarea
          className="goal-form-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Описание цели..."
          rows={6}
          autoFocus
        />

        {readOnlyDue ? (
          <p className="goal-form-due-readonly">
            Срок: <strong>{formatDueRu(readOnlyDue)}</strong>
            <span className="goal-form-due-hint"> (изменить нельзя)</span>
          </p>
        ) : null}

        {showDueDatePicker ? (
          <label className="goal-form-date-field">
            <span className="goal-form-date-label">Дата окончания</span>
            <input
              type="date"
              className="goal-form-date-input"
              value={dueDate}
              min={todayLocalISO()}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        ) : null}

        {error ? <p className="goal-form-error">{error}</p> : null}

        <div className="goal-form-actions">
          <button type="button" className="goal-form-btn goal-form-btn--ghost" onClick={handleCancel}>
            Отмена
          </button>
          <button
            type="button"
            className="goal-form-btn goal-form-btn--primary"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
