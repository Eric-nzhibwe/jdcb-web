'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [displayName,  setDisplayName]  = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone,        setPhone]        = useState('');
  const [company,      setCompany]      = useState('');
  const [role,         setRole]         = useState<UserRole>('contractor');
  const [formError,    setFormError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');
    if (!displayName || !email || !password) { setFormError('Please fill in all required fields'); return; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    try {
      const u = await register({ displayName, email, password, role, phone, company });
      router.replace(u.role === 'client' ? '/client/dashboard' : '/contractor/dashboard');
    } catch {
      // shown from context
    }
  };

  const hint = role === 'client'
    ? 'As a Client you create projects, set budgets, and assign contractors.'
    : 'As a Contractor you execute assigned projects and submit progress reports.';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 lg:flex-row">

      {/* ── Hero image ── */}
      <div className="relative w-full h-[30vh] lg:h-screen lg:w-1/2 flex-shrink-0 overflow-hidden">
        <Image
          src="/background.jpeg"
          alt="JDCB Weld & Fabrication workshop"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-black/60 to-transparent" />

        {/* theme toggle on image */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute top-12 right-4 z-10 bg-black/30 rounded-full px-3 py-1.5 text-base leading-none"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* brand */}
        <div className="absolute bottom-6 left-6">
          <p className="text-5xl font-black text-white tracking-widest drop-shadow-lg">JDCB</p>
          <p className="text-sm font-semibold text-white/85 mt-0.5 tracking-wide">Weld &amp; Fabrication</p>
        </div>
      </div>

      {/* ── Form — slides up over image on mobile ── */}
      <div className="
        relative z-10 flex flex-col justify-center
        -mt-6 rounded-t-3xl
        bg-gray-50 dark:bg-gray-950
        px-5 pt-8 pb-10
        lg:mt-0 lg:rounded-none lg:flex-1 lg:items-center lg:overflow-y-auto lg:px-12
      ">
        <div className="w-full max-w-md">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Create account</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join JDCB Weld &amp; Fabrication</p>
            </div>
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
              label="Full Name *"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Banda"
            />
            <Input
              label="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="new-password"
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
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+260"
            />
            <Input
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company name"
            />
            <Select
              label="Role *"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'contractor', label: 'Contractor' },
                { value: 'client',     label: 'Client' },
              ]}
            />

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary">
              {hint}
            </div>

            {(formError || error) && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {formError || error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
