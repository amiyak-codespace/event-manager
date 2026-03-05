import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EventsPage }   from './pages/EventsPage';
import { LoginPage }    from './pages/LoginPage';
import { SignupPage }   from './pages/SignupPage';
import { CmsBoardPage } from './pages/CmsBoardPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <p className="text-white/70 text-sm">Loading…</p>
        </div>
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

/** Global idle-session warning toast — shown to logged-in users */
function IdleWarningToast() {
  const { idleWarn, dismissWarn } = useAuth();
  if (idleWarn === null) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-xl max-w-sm">
      <span className="text-xl">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">Session expiring</p>
        <p className="text-xs text-amber-600">
          Logging out in <span className="font-bold">{idleWarn}s</span> due to inactivity
        </p>
      </div>
      <button onClick={dismissWarn}
        className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-200 transition-colors">
        Stay
      </button>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/cms" element={<ProtectedRoute><CmsBoardPage /></ProtectedRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <IdleWarningToast />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
