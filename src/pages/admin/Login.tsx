import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Shield, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { useUIStore } from '../../store/uiStore';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFields = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { adminUser, checkSession } = useUIStore();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard immediately
    if (adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Authenticating credentials...');

    try {
      if (isDbConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;
        
        // Refresh Zustand session
        await checkSession();
      } else {
        // Simulated local sandbox login
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const isDemoAdmin = data.email === 'admin@purushottam.com' && data.password === 'admin123';
        const isDemoEditor = data.email === 'editor@purushottam.com' && data.password === 'editor123';

        if (isDemoAdmin || isDemoEditor || (data.email.length > 5 && data.password.length > 4)) {
          const profile = {
            id: `demo-user-${Date.now()}`,
            email: data.email,
            full_name: isDemoAdmin ? 'Demo Administrator' : 'Demo Editor',
            role: isDemoAdmin ? 'admin' as const : 'editor' as const,
            is_active: true,
          };
          localStorage.setItem('demo_admin_session', JSON.stringify(profile));
          await checkSession();
        } else {
          throw new Error('Invalid email or password. Use admin@purushottam.com / admin123 for sandbox access.');
        }
      }

      toast.success('Successfully authenticated. Welcome to the dashboard!', { id: toastId });
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Login failed. Please verify your credentials.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-forest-800/20 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-gold/5 blur-3xl" />

      <div className="w-full max-w-md bg-forest-900/40 backdrop-blur-xl border border-forest-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-gold flex items-center justify-center text-forest-950 shadow-lg shadow-amber-gold/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-wide">
              Purushottam Homestay
            </h2>
            <span className="text-[10px] text-amber-gold font-bold tracking-widest uppercase">
              Staff Portal Access
            </span>
          </div>
        </div>

        {/* Demo instructions */}
        {!isDbConfigured() && (
          <div className="mb-6 p-4 rounded-xl bg-forest-800/40 border border-forest-700/60 text-xs text-forest-200 leading-relaxed">
            <span className="font-bold text-amber-gold block mb-1">Sandbox Credentials:</span>
            <span>Admin: <strong>admin@purushottam.com</strong> / <strong>admin123</strong></span>
            <span className="block mt-0.5">Editor: <strong>editor@purushottam.com</strong> / <strong>editor123</strong></span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-forest-300 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. staff@purushottam.com"
              className="w-full px-4 py-3 bg-forest-950/50 border border-forest-800 focus:border-amber-gold focus:outline-none rounded-xl text-white text-sm placeholder-forest-500"
            />
            {errors.email && <p className="text-red-400 text-[10px]">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-forest-300 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-forest-950/50 border border-forest-800 focus:border-amber-gold focus:outline-none rounded-xl text-white text-sm placeholder-forest-500 pr-10"
              />
              <KeyRound className="h-4.5 w-4.5 text-forest-600 absolute right-3.5 top-3.5" />
            </div>
            {errors.password && <p className="text-red-400 text-[10px]">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-gold hover:bg-amber-gold-dark text-forest-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer shadow-amber-950/10 mt-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Secure Log In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-forest-400 hover:text-white transition-colors">
            ← Back to guest website
          </a>
        </div>

      </div>
    </div>
  );
};
export default Login;
