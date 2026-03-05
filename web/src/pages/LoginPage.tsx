import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
      {/* Background decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo card */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-white/30 rounded-3xl blur-md" />
            <div className="relative h-16 w-16 rounded-3xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Event Manager</h1>
          <p className="text-indigo-200 text-sm mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back — sign in to continue
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl shadow-2xl border border-white/40 p-8">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/70 border-slate-200 focus:border-violet-400 focus:ring-violet-400/20 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/70 border-slate-200 focus:border-violet-400 focus:ring-violet-400/20 rounded-xl h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50/80 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl btn-primary-gradient text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </div>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-indigo-200 mt-6">
          Don&rsquo;t have an account?{' '}
          <Link
            to="/signup"
            className="text-white font-semibold hover:text-indigo-100 underline underline-offset-2 transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
