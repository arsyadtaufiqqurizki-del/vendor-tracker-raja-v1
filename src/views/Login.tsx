import { useState, FormEvent } from 'react';
import { Factory, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Email atau password salah.'
        : signInError.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-container-lowest p-md relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] bg-surface-container-low p-xl rounded-2xl shadow-xl border border-outline-variant relative z-10 flex flex-col box-border"
      >
        <div className="flex flex-col items-center mb-xl">
          <div className="h-16 w-16 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-md shadow-sm">
            <Factory className="h-8 w-8" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary text-center leading-tight mb-xs">Procurement RAJA</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">Enterprise Vendor Management</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md w-full">
          {error && (
            <div className="px-md py-sm rounded-lg bg-error-container/50 text-on-error-container font-body-sm text-body-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-xs w-full">
            <label className="font-label-md text-label-md text-on-surface w-full">Email Address</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-[48px] pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="admin@raja.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs mb-sm w-full">
            <label className="font-label-md text-label-md text-on-surface">
              Password
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-[48px] pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-md rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center h-[48px]"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-xl text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
