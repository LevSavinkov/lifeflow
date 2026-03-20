type Props = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function Header({ theme, onToggle }: Props) {
  return (
    <header className="app-header">
      <div className="app-logo">
        <div className="app-logo-icon" aria-hidden />
        <span className="app-logo-text">Lifeflow</span>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggle}
        title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
        aria-label={
          theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"
        }
      >
        {theme === "light" ? "🌙 Тёмная" : "☀️ Светлая"}
      </button>
    </header>
  );
}
