import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted">Start tracking camp inventory in minutes.</p>
      </div>

      <SignupForm />
    </AuthLayout>
  );
}
