/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  User,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import { Order, Feedback } from './types';
import { INITIAL_ORDERS, INITIAL_FEEDBACK } from './lib/mockData';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import FeedbackPage from './pages/FeedbackPage';
import SettingsPage from './pages/SettingsPage';

const Sidebar = ({ isOpen, onClose, isDesktop }: { isOpen: boolean; onClose: () => void; isDesktop: boolean }) => {
  const location = useLocation();
  
  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Orders', icon: ShoppingBag, path: '/orders' },
    { title: 'Feedback', icon: MessageSquare, path: '/feedback' },
    { title: 'Settings', icon: SettingsIcon, path: '/settings' },
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
        animate={{ x: isDesktop ? 0 : (isOpen ? 0 : -256) }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col lg:static lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" onClick={() => onClose()}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 uppercase">Ordera</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
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
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                AU
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@ordera.io</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 rounded-lg py-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium"
              onClick={() => {
                toast.success('Logged out successfully');
                localStorage.removeItem('ordera_auth');
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
            placeholder="Search orders..."
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

const MainLayout = ({ 
  children, 
  isAuthenticated, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isDesktop,
  titleMap 
}: { 
  children: ReactNode; 
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDesktop: boolean;
  titleMap: Record<string, string>;
}) => {
  const location = useLocation();
  
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login') {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-accent/30 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isDesktop={isDesktop} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} title={titleMap[location.pathname] || 'Ordera'} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
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
};

export default function App() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [feedback, setFeedback] = useState<Feedback[]>(INITIAL_FEEDBACK);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const titleMap: Record<string, string> = {
    '/': 'Dashboard Overview',
    '/orders': 'Order Management',
    '/feedback': 'Customer Feedback',
    '/settings': 'Account Settings',
  };

  // Mock persistence for auth status for demo
  useEffect(() => {
    const auth = localStorage.getItem('ordera_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ordera_auth', 'true');
  };

  return (
    <Router>
      <Toaster position="top-right" closeButton richColors />
      <MainLayout 
        isAuthenticated={isAuthenticated} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isDesktop={isDesktop}
        titleMap={titleMap}
      >
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/" 
            element={
              <DashboardPage />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <OrdersPage />
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <FeedbackPage />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <SettingsPage />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
