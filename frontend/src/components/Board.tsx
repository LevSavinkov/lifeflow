import { Column } from "./Column";
import { COLUMNS, getGoalsForColumn } from "../types";
import type { Goal } from "../types";

type Props = {
  goals: Goal[];
  isShortBoard: boolean;
  onEditRequest: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onMove: (goalId: number, column: string) => void;
};

export function Board({
  goals,
  isShortBoard,
  onEditRequest,
  onDelete,
  onMove,
}: Props) {
  return (
    <div className="board">
      {COLUMNS.map((colTitle) => (
        <Column
          key={colTitle}
          title={colTitle}
          goals={getGoalsForColumn(goals, colTitle)}
          isShortBoard={isShortBoard}
          onEditRequest={onEditRequest}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
