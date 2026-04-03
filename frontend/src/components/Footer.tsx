type Props = {
  onOpenAdd: () => void;
};

export function Footer({ onOpenAdd }: Props) {
  return (
    <footer className="board-footer">
      <button type="button" className="add-task-btn add-task-btn--fab" onClick={onOpenAdd}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Добавить цель
      </button>
    </footer>
  );
}
