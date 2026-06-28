import { Package } from 'lucide-react';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0b0f1a' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,117,24,0.2)', border: '1px solid rgba(255,117,24,0.3)' }}>
            <Package className="w-7 h-7" style={{ color: '#FF7518' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#f0f4ff' }}>SSV Camp App</h1>
          <p className="text-sm mt-1" style={{ color: '#8b95aa' }}>Create your account</p>
        </div>
        <div className="glass p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
