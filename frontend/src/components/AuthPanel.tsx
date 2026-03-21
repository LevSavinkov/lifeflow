import { useState } from "react";

type Props = {
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
};

export function AuthPanel({ error, onLogin, onRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [localError, setLocalError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password.trim()) {
      setLocalError("Заполните email и пароль.");
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
    <div className="app-loading">
      <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
      <div className="add-block">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        <button type="button" className="add-task-btn" onClick={submit}>
          {mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
        <button
          type="button"
          className="card-btn"
          onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
        >
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
        </button>
      </div>
      {localError && <div className="app-error">{localError}</div>}
      {error && <div className="app-error">{error}</div>}
    </div>
  );
}
