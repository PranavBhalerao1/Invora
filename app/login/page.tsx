import { Package } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-accent border border-primary/20">
            <Package className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SSV Camp App</h1>
          <p className="text-sm mt-1 text-muted-foreground">Sign in to your account</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
