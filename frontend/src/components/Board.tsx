import { Column } from "./Column";
import { COLUMNS, getGoalsForColumn } from "../types";
import type { Goal } from "../types";

type Props = {
  goals: Goal[];
  saving: boolean;
  onEdit: (goalId: number, text: string) => Promise<void>;
  onDelete: (goalId: number) => void;
  onMove: (goalId: number, column: string) => void;
};

export function Board({ goals, saving, onEdit, onDelete, onMove }: Props) {
  return (
    <div className="board">
      {COLUMNS.map((colTitle) => (
        <Column
          key={colTitle}
          title={colTitle}
          goals={getGoalsForColumn(goals, colTitle)}
          saving={saving}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
