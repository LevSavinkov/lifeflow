import { useEffect, useState } from "react";

import { login, logout, refresh, register, type AuthUser } from "../api/auth";
import { setAccessToken } from "../api/client";

/** Подсказка для следующих заходов: не показывать форму входа до попытки refresh. */
const SESSION_HINT_KEY = "lifeflow-session";

type AuthStatus = "authenticated" | "anonymous";

function toMessage(e: unknown): string {
  if (!(e instanceof Error)) return "Ошибка авторизации";
  const message = e.message;
  try {
    const parsed = JSON.parse(message) as {
      detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
    };
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail)) {
      const mapped = parsed.detail.map((item) => {
        const loc = (item.loc ?? []).map(String).join(".");
        const msg = item.msg ?? "Некорректное значение";
        if (loc.endsWith("email")) return "Введите корректный email (например, name@example.com).";
        if (loc.endsWith("password")) return "Пароль должен быть не короче 4 символов.";
        return msg;
      });
      return mapped.join(" ");
    }
  } catch {}
  if (message.includes("Invalid credentials")) return "Неверный email или пароль.";
  return message || "Ошибка авторизации";
}

function setSessionHint(on: boolean) {
  if (typeof sessionStorage === "undefined") return;
  if (on) sessionStorage.setItem(SESSION_HINT_KEY, "1");
  else sessionStorage.removeItem(SESSION_HINT_KEY);
}

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("anonymous");
  /** Без подсказки сессии сразу показываем форму входа; с подсказкой ждём один refresh. */
  const [ready, setReady] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem(SESSION_HINT_KEY) !== "1";
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tokenRes = await refresh();
        if (cancelled) return;
        setAccessToken(tokenRes.access_token);
        setUser(tokenRes.user);
        setSessionHint(true);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        setAccessToken(null);
        setUser(null);
        setSessionHint(false);
        setStatus("anonymous");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const doLogin = async (email: string, password: string) => {
    setError(null);
    const res = await login(email, password);
    setAccessToken(res.access_token);
    setUser(res.user);
    setSessionHint(true);
    setStatus("authenticated");
  };

  const doRegister = async (email: string, password: string) => {
    setError(null);
    const res = await register(email, password);
    setAccessToken(res.access_token);
    setUser(res.user);
    setSessionHint(true);
    setStatus("authenticated");
  };

  const doLogout = async () => {
    try {
      await logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setSessionHint(false);
      setStatus("anonymous");
    }
  };

  const withError = async <T,>(fn: () => Promise<T>) => {
    try {
      return await fn();
    } catch (e) {
      setError(toMessage(e));
      throw e;
    }
  };

  return {
    ready,
    status,
    user,
    error,
    login: (email: string, password: string) => withError(() => doLogin(email, password)),
    register: (email: string, password: string) =>
      withError(() => doRegister(email, password)),
    logout: () => withError(doLogout),
  };
}
