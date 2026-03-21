import { API_BASE, apiRequest } from "./client";
import type { Board, Goal } from "../types";

export const listBoards = () =>
  apiRequest<Board[]>(`${API_BASE}/boards`);

export const createBoard = (title: string) =>
  apiRequest<Board>(`${API_BASE}/boards`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });

export const listGoals = (boardId: number) =>
  apiRequest<Goal[]>(`${API_BASE}/boards/${boardId}/goals`);

export const createGoal = (boardId: number, text: string) =>
  apiRequest<Goal>(`${API_BASE}/boards/${boardId}/goals`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

export const patchGoal = (
  goalId: number,
  patch: { text?: string; column_title?: string }
) =>
  apiRequest<Goal>(`${API_BASE}/goals/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const removeGoal = (goalId: number) =>
  apiRequest<void>(`${API_BASE}/goals/${goalId}`, { method: "DELETE" });
