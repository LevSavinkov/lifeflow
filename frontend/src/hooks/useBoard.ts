import { useEffect, useState } from "react";
import {
  createGoal,
  listBoards,
  listGoals,
  patchGoal,
  removeAllGoals,
  removeGoal,
} from "../api/boards";
import type { Board, Goal } from "../types";

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Ошибка";
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
        setBoards(boardsData);

        const firstId = boardsData[0]?.id ?? null;
        setSelectedBoardId(firstId);

        if (firstId != null) {
          const goalsData = await listGoals(firstId);
          if (!cancelled) setGoals(goalsData);
        }
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

  const addGoal = async (text: string) => {
    if (selectedBoardId == null || !text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createGoal(selectedBoardId, text);
      setGoals((prev) => [...prev, created]);
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const editGoal = async (goalId: number, text: string) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await patchGoal(goalId, { text: text.trim() });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    } catch (e) {
      setError(toMessage(e));
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

  const deleteAll = async () => {
    if (selectedBoardId == null) return;
    setError(null);
    try {
      await removeAllGoals(selectedBoardId);
      setGoals([]);
    } catch (e) {
      setError(toMessage(e));
    }
  };

  return {
    boards,
    selectedBoardId,
    goals,
    loading,
    saving,
    error,
    addGoal,
    editGoal,
    moveGoal,
    deleteGoal,
    deleteAll,
  };
}
