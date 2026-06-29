import { Package } from 'lucide-react';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-accent border border-primary/20 shadow-[0_2px_12px_rgba(79,70,229,0.10)]">
            <Package className="size-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">SSV Camp App</h1>
          <p className="text-[15px] mt-2 text-muted-foreground">Create your account</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-8 shadow-[0_2px_12px_rgba(79,70,229,0.07),0_1px_3px_rgba(0,0,0,0.04)]">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
