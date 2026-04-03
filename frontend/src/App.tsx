import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { Board } from "./components/Board";
import { Footer } from "./components/Footer";
import { GoalFormModal } from "./components/GoalFormModal";
import { Header } from "./components/Header";
import { useAuth } from "./hooks/useAuth";
import { useBoard } from "./hooks/useBoard";
import { BOARD_TITLE_LONG, type Goal } from "./types";
const BOARD_TITLE_SHORT = "Краткосрочные";

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

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);
  const showDueDateForNewGoal =
    editingGoal == null && selectedBoard?.title === BOARD_TITLE_LONG;

  const handleSaveGoal = async (text: string, dueDate?: string) => {
    const ok = editingGoal
      ? await editGoal(editingGoal.id, text)
      : await addGoal(text, dueDate);
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
          isShortBoard={selectedBoard?.title === BOARD_TITLE_SHORT}
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
        showDueDatePicker={showDueDateForNewGoal}
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
