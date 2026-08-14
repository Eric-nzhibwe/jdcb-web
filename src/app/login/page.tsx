'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError,    setFormError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');
    if (!email || !password) { setFormError('Please enter email and password'); return; }
    try {
      const u = await login({ email, password });
      router.replace(u.role === 'client' ? '/client/dashboard' : '/contractor/dashboard');
    } catch {
      // error shown from context
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,#2d9e5f_0%,transparent_60%)]" />
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-black tracking-widest text-white">JDCB</p>
            <p className="text-xs text-white/50">Weld &amp; Fabrication</p>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Manage projects.<br />Track progress.<br />
            <span className="text-primary">Deliver results.</span>
          </h1>
          <p className="text-white/60 text-lg">
            Your complete welding &amp; fabrication project platform.
          </p>
        </div>
        <div className="flex gap-4 relative">
          {['Projects', 'Tasks', 'Reports', 'Expenses'].map((f) => (
            <div key={f} className="bg-white/8 rounded-xl px-4 py-2.5">
              <p className="text-white text-xs font-semibold">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {(formError || error) && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {formError || error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
