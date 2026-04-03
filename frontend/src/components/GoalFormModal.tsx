import { useEffect, useState } from "react";
import type { Goal } from "../types";

type Props = {
  open: boolean;
  editingGoal: Goal | null;
  saving: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
};

export function GoalFormModal({ open, editingGoal, saving, onClose, onSave }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setText(editingGoal?.text ?? "");
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

  const handleSave = async () => {
    if (!text.trim()) {
      setError("Описание цели не может быть пустым");
      return;
    }
    setError("");
    await onSave(text.trim());
  };

  const handleCancel = () => {
    setText("");
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
