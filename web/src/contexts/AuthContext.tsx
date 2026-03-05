import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi, type AuthUser } from '../lib/api';

const IDLE_LIMIT_MS    = 60_000;
const REFRESH_EVERY_MS = 30_000;
const WARN_BEFORE_MS   = 15_000;

interface AuthContextValue {
  user:     AuthUser | null;
  token:    string | null;
  loading:  boolean;
  idleWarn: number | null;
  dismissWarn: () => void;
  login:   (email: string, password: string) => Promise<void>;
  signup:  (name: string, email: string, password: string) => Promise<void>;
  logout:  () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(() => localStorage.getItem('em_token'));
  const [loading, setLoading] = useState(true);
  const [idleWarn, setIdleWarn] = useState<number | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const warnedRef       = useRef(false);

  // Verify stored token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.me().then(setUser).catch(() => {
      localStorage.removeItem('em_token'); setToken(null);
    }).finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('em_token');
    setToken(null); setUser(null); setIdleWarn(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('em_token', res.token);
    setToken(res.token); setUser(res.user);
    lastActivityRef.current = Date.now();
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.signup(name, email, password);
    localStorage.setItem('em_token', res.token);
    setToken(res.token); setUser(res.user);
    lastActivityRef.current = Date.now();
  }, []);

  const dismissWarn = useCallback(() => {
    setIdleWarn(null);
    warnedRef.current = false;
    lastActivityRef.current = Date.now();
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user) return;
    const markActive = () => {
      const wasWarned = warnedRef.current;
      lastActivityRef.current = Date.now();
      warnedRef.current = false;
      if (wasWarned) setIdleWarn(null);
    };
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    EVENTS.forEach(e => window.addEventListener(e, markActive, { passive: true }));
    return () => EVENTS.forEach(e => window.removeEventListener(e, markActive));
  }, [user]);

  // Session tick: idle logout + token refresh
  useEffect(() => {
    if (!user) return;
    let lastRefreshAt = Date.now();

    const tick = setInterval(async () => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= IDLE_LIMIT_MS) {
        clearInterval(tick);
        logout();
        return;
      }

      if (idleMs >= IDLE_LIMIT_MS - WARN_BEFORE_MS && !warnedRef.current) {
        warnedRef.current = true;
        setIdleWarn(Math.round((IDLE_LIMIT_MS - idleMs) / 1000));
      }

      const timeSinceRefresh = Date.now() - lastRefreshAt;
      if (timeSinceRefresh >= REFRESH_EVERY_MS && idleMs < REFRESH_EVERY_MS) {
        lastRefreshAt = Date.now();
        try {
          const { token: newToken } = await authApi.refresh();
          localStorage.setItem('em_token', newToken);
          setToken(newToken);
        } catch { logout(); }
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, idleWarn, dismissWarn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
