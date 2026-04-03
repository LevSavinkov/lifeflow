import { useState } from "react";
import { Card } from "./Card";
import { COLUMN_LABELS } from "../types";
import type { ColumnTitle, Goal } from "../types";

type Props = {
  title: ColumnTitle;
  goals: Goal[];
  onEditRequest: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onMove: (goalId: number, column: string) => void;
};

export function Column({ title, goals, onEditRequest, onDelete, onMove }: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`column${dragOver ? " column--drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const goalId = Number(e.dataTransfer.getData("text/plain"));
        if (!Number.isNaN(goalId)) onMove(goalId, title);
      }}
    >
      <div className="column-header">{COLUMN_LABELS[title]}</div>
      {goals.map((goal) => (
        <Card
          key={goal.id}
          goal={goal}
          dragging={draggingId === goal.id}
          onEditRequest={onEditRequest}
          onDelete={onDelete}
          onDragStart={(id, e) => {
            setDraggingId(id);
            e.dataTransfer.setData("text/plain", String(id));
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => setDraggingId(null)}
        />
      ))}
    </div>
  );
}
