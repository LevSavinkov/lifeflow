import { useEffect, useState } from "react";
import {
  createGoal,
  listBoards,
  listGoals,
  patchGoal,
  removeGoal,
} from "../api/boards";
import type { Board, Goal } from "../types";

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Ошибка";
}

/** Временно скрыта на фронте; бэкенд и данные доски не трогаем. */
const BOARD_TITLE_HIDDEN_ON_FRONTEND = "Среднесрочные";

function visibleBoards(boards: Board[]): Board[] {
  return boards.filter((b) => b.title !== BOARD_TITLE_HIDDEN_ON_FRONTEND);
}

export function useBoard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const boardsData = await listBoards();
        if (cancelled) return;
        const shown = visibleBoards(boardsData);
        setBoards(shown);

        setSelectedBoardId((current) => {
          if (current != null && shown.some((b) => b.id === current)) return current;
          return shown[0]?.id ?? null;
        });
      } catch (e) {
        if (!cancelled) setError(toMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (selectedBoardId == null) {
        setGoals([]);
        return;
      }

      setLoading(true);
      try {
        const goalsData = await listGoals(selectedBoardId);
        if (!cancelled) setGoals(goalsData);
      } catch (e) {
        if (!cancelled) setError(toMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBoardId]);

  const addGoal = async (text: string, dueDate?: string): Promise<boolean> => {
    if (selectedBoardId == null || !text.trim()) return false;
    setSaving(true);
    setError(null);
    try {
      const created = await createGoal(
        selectedBoardId,
        text,
        dueDate ? { dueDate } : undefined
      );
      setGoals((prev) => [...prev, created]);
      return true;
    } catch (e) {
      setError(toMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const editGoal = async (goalId: number, text: string): Promise<boolean> => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    setSaving(true);
    setError(null);
    try {
      const updated = await patchGoal(goalId, { text: trimmed });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      return true;
    } catch (e) {
      setError(toMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const moveGoal = async (goalId: number, column_title: string) => {
    setError(null);
    try {
      const updated = await patchGoal(goalId, { column_title });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch (e) {
      setError(toMessage(e));
    }
  };

  const deleteGoal = async (goalId: number) => {
    setError(null);
    try {
      await removeGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (e) {
      setError(toMessage(e));
    }
  };

  return {
    boards,
    selectedBoardId,
    setSelectedBoardId,
    goals,
    loading,
    saving,
    error,
    addGoal,
    editGoal,
    moveGoal,
    deleteGoal,
  };
}
