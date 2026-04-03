export const COLUMNS = ["to do", "in progress", "done"] as const;
export type ColumnTitle = (typeof COLUMNS)[number];

export const COLUMN_LABELS: Record<ColumnTitle, string> = {
  "to do": "To Do",
  "in progress": "In Progress",
  done: "Done",
};

/** Совпадает с названием доски на бэкенде */
export const BOARD_TITLE_LONG = "Долгосрочные";

export type Goal = {
  id: number;
  text: string;
  column_title: string;
  /** ISO 8601, конец выбранного дня (UTC) */
  due_at?: string | null;
};

export type Board = {
  id: number;
  title: string;
};

export function getGoalsForColumn(goals: Goal[], colTitle: ColumnTitle): Goal[] {
  return goals.filter(
    (g) =>
      g.column_title === colTitle ||
      (colTitle === "to do" && !COLUMNS.includes(g.column_title as ColumnTitle))
  );
}
