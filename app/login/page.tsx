import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
            Create an account
          </Link>
        </>
      }
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to pick up where your camp left off.</p>
      </div>

      <LoginForm />
    </AuthLayout>
  );
}
