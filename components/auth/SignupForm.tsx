'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) { toast.error('Display name is required'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Display Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b95aa' }} />
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            placeholder="Pranav B."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b95aa' }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b95aa' }} />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Min 6 characters"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: '#FF7518', color: '#fff' }}
      >
        <UserPlus className="w-4 h-4" />
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm" style={{ color: '#8b95aa' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:underline" style={{ color: '#FF7518' }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
