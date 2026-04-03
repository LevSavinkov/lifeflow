import { useState } from "react";

type Props = {
  error: string | null;
  initialMode?: "login" | "register";
  onClose?: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
};

export function AuthPanel({
  error,
  initialMode = "login",
  onClose,
  onLogin,
  onRegister,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [localError, setLocalError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submit = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password.trim()) {
      setLocalError("Заполните email и пароль.");
      return;
    }
    if (mode === "register" && !normalizedName) {
      setLocalError("Заполните имя.");
      return;
    }
    if (!emailRegex.test(normalizedEmail)) {
      setLocalError("Введите корректный email (например, name@example.com).");
      return;
    }
    if (password.length < 4) {
      setLocalError("Пароль должен быть не короче 4 символов.");
      return;
    }
    setLocalError(null);
    if (mode === "login") {
      await onLogin(normalizedEmail, password);
    } else {
      await onRegister(normalizedEmail, password);
    }
  };

  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
          {onClose && (
            <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          )}
        </div>
        <form
          className="auth-modal-body"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {mode === "register" && (
            <label className="auth-field">
              <span>Имя</span>
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="ваш@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="auth-field">
            <span>Пароль</span>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          <div className="auth-modal-actions">
            {onClose && (
              <button type="button" className="auth-cancel-btn" onClick={onClose}>
                Отмена
              </button>
            )}
            <button type="submit" className="auth-submit-btn">
              {mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
          >
            {mode === "login" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
          </button>
        </form>
        {localError && <div className="app-error">{localError}</div>}
        {error && <div className="app-error">{error}</div>}
      </div>
    </div>
  );
}
