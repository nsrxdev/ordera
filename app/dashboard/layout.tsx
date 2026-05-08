'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const Sidebar = ({
  isOpen,
  onClose,
  isDesktop,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
}) => {
  const pathname = usePathname();

  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Orders', icon: ShoppingBag, path: '/dashboard/orders' },
    { title: 'Feedback', icon: MessageSquare, path: '/dashboard/feedback' },
    { title: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isDesktop ? 0 : isOpen ? 0 : -256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col lg:static lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 uppercase">
                Ordera
              </span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-sm">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 mt-auto">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-lg py-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium"
              onClick={async () => {
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
                toast.success('Logged out successfully');
                window.location.href = '/login';
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const Topbar = ({ onMenuClick, title }: { onMenuClick: () => void; title: string }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-500" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search…"
            className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
          />
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) router.replace('/login');
      setCheckedAuth(true);
    });
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard Overview',
    '/dashboard/orders': 'Order Management',
    '/dashboard/feedback': 'Customer Feedback',
    '/dashboard/settings': 'Account Settings',
  };

  const pathKey = pathname ?? '/dashboard';

  if (!checkedAuth) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="flex h-screen bg-accent/30 overflow-hidden font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDesktop={isDesktop}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} title={titleMap[pathKey] || 'Ordera'} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

