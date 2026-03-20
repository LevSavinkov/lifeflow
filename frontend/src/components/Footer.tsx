import { useState } from "react";

type Props = {
  saving: boolean;
  onAdd: (text: string) => Promise<void>;
};

export function Footer({ saving, onAdd }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");

  const handleAdd = async () => {
    if (!text.trim()) return;
    await onAdd(text);
    setText("");
    setIsAdding(false);
  };

  return (
    <footer className="board-footer">
      {isAdding ? (
        <div className="add-block" onClick={(e) => e.stopPropagation()}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Текст задачи..."
            autoFocus
          />
          <button
            type="button"
            className="add-task-btn"
            onClick={handleAdd}
            disabled={saving}
          >
            сохранить
          </button>
          <button
            type="button"
            className="card-btn"
            onClick={() => {
              setIsAdding(false);
              setText("");
            }}
          >
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
  );
}
