'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 lg:flex-row">

      {/* ── Hero image — top on mobile, left half on desktop ── */}
      <div className="relative w-full h-[44vh] lg:h-screen lg:w-1/2 flex-shrink-0 overflow-hidden">
        <Image
          src="/background.jpeg"
          alt="JDCB Weld & Fabrication workshop"
          fill
          className="object-cover object-center"
          priority
        />

        {/* bottom scrim — same as mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-black/60 to-transparent" />

        {/* theme toggle — top right, same position as mobile */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute top-12 right-4 z-10 bg-black/30 rounded-full px-3 py-1.5 text-base leading-none"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* brand — bottom left, same as mobile */}
        <div className="absolute bottom-6 left-6">
          <p className="text-5xl font-black text-white tracking-widest drop-shadow-lg">JDCB</p>
          <p className="text-sm font-semibold text-white/85 mt-0.5 tracking-wide">Weld &amp; Fabrication</p>
        </div>
      </div>

      {/* ── Form — slides up over image on mobile, right panel on desktop ── */}
      <div className="
        relative z-10 flex flex-col justify-center
        -mt-6 rounded-t-3xl
        bg-gray-50 dark:bg-gray-950
        px-5 pt-8 pb-10
        lg:mt-0 lg:rounded-none lg:flex-1 lg:items-center lg:px-12
      ">
        <div className="w-full max-w-md">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Sign in to manage your projects
              </p>
            </div>
            {/* theme toggle only shown on desktop (mobile has it on image) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="hidden lg:flex p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
