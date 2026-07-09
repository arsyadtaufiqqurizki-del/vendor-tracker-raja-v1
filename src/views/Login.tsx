import { useState, FormEvent } from 'react';
import { Factory, KeyRound, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { checkAccessKey } from '../lib/vendorRequests';
import { VendorRequestForm } from '../components/VendorRequestForm';
import { cn } from '../lib/utils';

type LoginMode = 'staff' | 'vendor-key' | 'vendor-form';

export function Login() {
  const [mode, setMode] = useState<LoginMode>('staff');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [accessKey, setAccessKey] = useState('');
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [keyError, setKeyError] = useState('');

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

  const handleCheckAccessKey = async (e: FormEvent) => {
    e.preventDefault();
    setKeyError('');
    setIsCheckingKey(true);
    try {
      const valid = await checkAccessKey(accessKey);
      if (valid) {
        setMode('vendor-form');
      } else {
        setKeyError('Kode akses tidak valid.');
      }
    } catch (err) {
      setKeyError((err as Error).message);
    } finally {
      setIsCheckingKey(false);
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
        className={cn(
          "w-full bg-surface-container-low p-xl rounded-2xl shadow-xl border border-outline-variant relative z-10 flex flex-col box-border my-xl",
          mode === 'vendor-form' ? "max-w-3xl" : "max-w-[400px]"
        )}
      >
        <div className="flex flex-col items-center mb-xl">
          <div className="h-16 w-16 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-md shadow-sm">
            <Factory className="h-8 w-8" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary text-center leading-tight mb-xs">Procurement RAJA</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">Enterprise Vendor Management</p>
        </div>

        {mode !== 'vendor-form' && (
          <div className="flex mb-lg rounded-lg bg-surface-container-lowest border border-outline-variant p-1">
            <button
              type="button"
              onClick={() => { setMode('staff'); setKeyError(''); }}
              className={cn(
                "flex-1 py-xs rounded-md font-label-caps text-label-caps transition-colors",
                mode === 'staff' ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('vendor-key'); setError(''); }}
              className={cn(
                "flex-1 py-xs rounded-md font-label-caps text-label-caps transition-colors",
                mode === 'vendor-key' ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              Vendor Login
            </button>
          </div>
        )}

        {mode === 'staff' && (
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
        )}

        {mode === 'vendor-key' && (
          <form onSubmit={handleCheckAccessKey} className="flex flex-col gap-md w-full">
            {keyError && (
              <div className="px-md py-sm rounded-lg bg-error-container/50 text-on-error-container font-body-sm text-body-sm">
                {keyError}
              </div>
            )}

            <div className="flex flex-col gap-xs w-full">
              <label className="font-label-md text-label-md text-on-surface w-full">Kode Akses</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-[48px] pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Masukkan 6 digit kode"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCheckingKey || accessKey.length !== 6}
              className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-md rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center h-[48px]"
            >
              {isCheckingKey ? (
                <div className="h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                'Lanjutkan'
              )}
            </button>
          </form>
        )}

        {mode === 'vendor-form' && (
          <VendorRequestForm
            accessKey={accessKey}
            onBack={() => { setMode('vendor-key'); setAccessKey(''); }}
          />
        )}

        {mode !== 'vendor-form' && (
          <div className="mt-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
