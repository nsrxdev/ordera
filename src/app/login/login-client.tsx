'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from '@/lib/validations/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/dashboard';

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@ordera.com', password: 'password' },
  });

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: 'Demo User',
      business_name: 'Ordera Demo Restaurant',
      email: 'demo@ordera.app',
      password: 'password',
    },
  });

  const onLogin = async (data: LoginInput) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Welcome back, ${data.email.split('@')[0]}!`);
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      toast.error(
        e?.message ||
          'Network error contacting Supabase. Check NEXT_PUBLIC_SUPABASE_URL/ANON_KEY and your connection.'
      );
    }
  };

  const onSignup = async (data: SignupInput) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            business_name: data.business_name,
          },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Account created. You can log in now.');
      setTab('login');
    } catch (e: any) {
      toast.error(
        e?.message ||
          'Network error contacting Supabase. Check NEXT_PUBLIC_SUPABASE_URL/ANON_KEY and your connection.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 mb-6 group hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">
            Ordera
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Bento Grid Intelligence for modern kitchens.
          </p>
        </div>

        <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-xl font-bold text-center text-slate-800 uppercase tracking-widest">
              Access
            </CardTitle>
            <CardDescription className="text-center text-xs font-semibold text-slate-400 uppercase tracking-tight">
              Login or create an account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="w-full bg-slate-50 border border-slate-100 rounded-xl p-1">
                <TabsTrigger
                  value="login"
                  className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-5 pt-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@ordera.io"
                      {...loginForm.register('email')}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-[10px] text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register('password')}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-[10px] text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting
                      ? 'Signing in…'
                      : 'Enter Dashboard'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form
                  onSubmit={signupForm.handleSubmit(onSignup)}
                  className="space-y-5 pt-6"
                >
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Full name
                    </Label>
                    <Input
                      {...signupForm.register('full_name')}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                    />
                    {signupForm.formState.errors.full_name && (
                      <p className="text-[10px] text-destructive">
                        {signupForm.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Business name
                    </Label>
                    <Input
                      {...signupForm.register('business_name')}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                    />
                    {signupForm.formState.errors.business_name && (
                      <p className="text-[10px] text-destructive">
                        {signupForm.formState.errors.business_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Email
                    </Label>
                    <Input
                      type="email"
                      {...signupForm.register('email')}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-[10px] text-destructive">
                        {signupForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Password
                    </Label>
                    <Input
                      type="password"
                      {...signupForm.register('password')}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-[10px] text-destructive">
                        {signupForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                    disabled={signupForm.formState.isSubmitting}
                  >
                    {signupForm.formState.isSubmitting
                      ? 'Creating…'
                      : 'Create account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-10 px-8 pt-6">
            <div className="text-center pt-2">
              <Button
                variant="link"
                className="p-0 h-auto font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                type="button"
              >
                Forgot your password?
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © 2026 Ordera Systems Inc.
        </p>
      </motion.div>
    </div>
  );
}

