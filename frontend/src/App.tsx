import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { Board } from "./components/Board";
import { Footer } from "./components/Footer";
import { GoalFormModal } from "./components/GoalFormModal";
import { Header } from "./components/Header";
import { useAuth } from "./hooks/useAuth";
import { useBoard } from "./hooks/useBoard";
import type { Goal } from "./types";

function BoardScreen() {
  const {
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
  } = useBoard();

  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    setGoalFormOpen(false);
    setEditingGoal(null);
  }, [selectedBoardId]);

  const closeGoalForm = () => {
    setGoalFormOpen(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async (text: string) => {
    const ok = editingGoal
      ? await editGoal(editingGoal.id, text)
      : await addGoal(text);
    if (ok) closeGoalForm();
  };

  return (
    <>
      <div className="board-switcher" role="tablist" aria-label="Список досок">
        {boards.map((board) => {
          const isActive = board.id === selectedBoardId;
          return (
            <button
              key={board.id}
              type="button"
              className={`board-switcher-btn${isActive ? " board-switcher-btn--active" : ""}`}
              onClick={() => setSelectedBoardId(board.id)}
            >
              {board.title}
            </button>
          );
        })}
      </div>

      {loading && <div className="app-loading">Загрузка...</div>}
      {error && <div className="app-error">{error}</div>}

      {!loading && (
        <Board
          goals={goals}
          onEditRequest={(goal) => {
            setEditingGoal(goal);
            setGoalFormOpen(true);
          }}
          onDelete={deleteGoal}
          onMove={moveGoal}
        />
      )}

      {!loading && selectedBoardId != null && (
        <Footer
          onOpenAdd={() => {
            setEditingGoal(null);
            setGoalFormOpen(true);
          }}
        />
      )}

      <GoalFormModal
        open={goalFormOpen}
        editingGoal={editingGoal}
        saving={saving}
        onClose={closeGoalForm}
        onSave={handleSaveGoal}
      />
    </>
  );
}

export default function App() {
  const auth = useAuth();
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | null>(null);
  const isAuthenticated = auth.ready && auth.status === "authenticated";
  const isAnonymous = auth.ready && auth.status === "anonymous";

  return (
    <div className="app">
      <Header
        isReady={auth.ready}
        isAuthenticated={isAuthenticated}
        onSignIn={() => setAuthModalMode("login")}
        onSignUp={() => setAuthModalMode("register")}
        onLogout={auth.logout}
      />
      {isAnonymous && authModalMode !== null && (
        <AuthPanel
          error={auth.error}
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onLogin={async (email, password) => {
            await auth.login(email, password);
            setAuthModalMode(null);
          }}
          onRegister={async (email, password) => {
            await auth.register(email, password);
            setAuthModalMode(null);
          }}
        />
      )}
      {isAuthenticated && (
        <>
          <BoardScreen />
        </>
      )}
    </div>
  );
}
