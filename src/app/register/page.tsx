'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-black tracking-widest text-gray-900 dark:text-white">JDCB</p>
            <p className="text-xs text-gray-400">Weld &amp; Fabrication</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Join JDCB Weld &amp; Fabrication</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name *" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="John Banda" />
            <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+260" />
            <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company name" />

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
