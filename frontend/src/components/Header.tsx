type Props = {
  isReady: boolean;
  isAuthenticated: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
  onLogout: () => void;
};

export function Header({ isReady, isAuthenticated, onSignIn, onSignUp, onLogout }: Props) {
  return (
    <header className="app-header">
      <div className="app-logo">
        <div className="app-logo-icon" aria-hidden />
        <span className="app-logo-text">Lifeflow</span>
      </div>
      <div className="header-actions">
        {isReady && !isAuthenticated ? (
          <>
            <button type="button" className="header-auth-btn header-auth-btn--ghost" onClick={onSignIn}>
              Войти
            </button>
            <button type="button" className="header-auth-btn" onClick={onSignUp}>
              Регистрация
            </button>
          </>
        ) : (
          <button type="button" className="header-auth-btn header-auth-btn--ghost" onClick={onLogout}>
            Выйти
          </button>
        )}
      </div>
    </header>
  );
}
