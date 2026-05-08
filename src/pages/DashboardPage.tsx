import { useEffect, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  User
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Order, Feedback } from '@/types';
import { fetchJson } from '@/lib/http';
import { mapFeedback, mapOrder, type DbFeedback, type DbOrder } from '@/lib/mappers';

const StatCard = ({ 
  title, 
  value, 
  trend, 
  label 
}: { 
  title: string; 
  value: string; 
  trend?: number; 
  label: string 
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full group hover:shadow-md transition-shadow">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
      <div className="flex items-end justify-between mt-4">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${trend > 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};

type StatsResponse = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalFeedback: number;
  recentOrders: DbOrder[];
  recentFeedback: DbFeedback[];
};

type ChartsResponse = {
  revenueByDay: { name: string; revenue: number; count: number }[];
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [charts, setCharts] = useState<ChartsResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [s, c] = await Promise.all([
          fetchJson<StatsResponse>('/api/dashboard/stats'),
          fetchJson<ChartsResponse>('/api/dashboard/charts?days=7'),
        ]);
        if (!mounted) return;
        setStats(s);
        setCharts(c);
        setRecentOrders((s.recentOrders ?? []).map(mapOrder));
        setRecentFeedback((s.recentFeedback ?? []).map(mapFeedback));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const revenueByDay = useMemo(() => charts?.revenueByDay ?? [], [charts]);

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500">Welcome back! Here's a snapshot of your business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-lg h-9 text-xs font-semibold border-slate-200">Export PDF</Button>
          <Button className="rounded-lg h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 shadow-sm shadow-slate-200">+ New Entry</Button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-6 gap-6 min-h-[1000px] md:h-[900px]">
        {/* Stat Cards */}
        <div className="md:col-span-1 md:row-span-1">
          <StatCard
            title="Total Revenue"
            value={loading || !stats ? '—' : `$${stats.totalRevenue.toLocaleString()}`}
            trend={12.5}
            label="High"
          />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <StatCard
            title="Total Orders"
            value={loading || !stats ? '—' : stats.totalOrders.toString()}
            trend={8.2}
            label="High"
          />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <StatCard
            title="Avg. Order Value"
            value={loading || !stats ? '—' : `$${stats.avgOrderValue.toFixed(2)}`}
            trend={-2.1}
            label="Normal"
          />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <StatCard
            title="Total Feedback"
            value={loading || !stats ? '—' : stats.totalFeedback.toString()}
            trend={15.0}
            label="High"
          />
        </div>

        {/* Revenue Chart Area */}
        <div className="md:col-span-3 md:row-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Revenue & Order Trend</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Revenue
              </span>
              <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-200" /> Orders
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#C7D2FE" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Feedback (Sidebar-style block in Bento) */}
        <div className="md:col-span-1 md:row-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-6">Recent Feedback</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentFeedback.map((fb) => (
              <div key={fb.id} className="border-b border-slate-50 pb-4 last:border-0 group">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-800">{fb.customerName}</p>
                  <div className="flex text-amber-400 text-[10px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < fb.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic group-hover:text-slate-700 transition-colors">
                  "{fb.message}"
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                    {new Date(fb.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <button className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase">Reply</button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 py-2 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-all italic uppercase tracking-wider" asChild>
            <a href="/feedback">View all reviews &rarr;</a>
          </Button>
        </div>

        {/* Recent Orders Table */}
        <div className="md:col-span-3 md:row-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-800">Recent Orders</h3>
            <button className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform uppercase tracking-wider">
              + New Order
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400" />
                        <span className="font-semibold text-slate-800">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">${order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'Preparing' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
