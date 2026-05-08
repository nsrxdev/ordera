import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@ordera.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        onLogin();
        toast.success(`Welcome back, ${email.split('@')[0]}!`);
      } else {
        toast.error('Please enter valid credentials');
      }
    }, 1000);
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Ordera</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Bento Grid Intelligence for modern kitchens.</p>
        </div>

        <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-xl font-bold text-center text-slate-800 uppercase tracking-widest">Sign In</CardTitle>
            <CardDescription className="text-center text-xs font-semibold text-slate-400 uppercase tracking-tight">
              Access your business dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@ordera.io" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-600"
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-10 px-8 pt-6">
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Enter Dashboard'
                )}
              </Button>
              <div className="text-center pt-2">
                <Button variant="link" className="p-0 h-auto font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Forgot your password?</Button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © 2026 Ordera Systems Inc.
        </p>
      </motion.div>
    </div>
  );
}
