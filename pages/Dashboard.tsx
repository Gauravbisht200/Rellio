
import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowUpRight, Download, Plus, ChevronDown, MoreHorizontal, CheckCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Lead } from '../types';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, isPositive }) => (
  <GlassCard className="p-6 flex flex-col justify-between h-36">
    <div className="flex justify-between items-start">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-medium px-2 py-1 rounded-md ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {isPositive ? '+' : ''}{change}
      </span>
    </div>
    <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
  </GlassCard>
);

interface ActivityItem {
  id: string;
  user_id: string;
  action: string;
  target: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface DashboardProps {
  leads: Lead[];
  onOpenAddLead: () => void;
  onOpenImport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, onOpenAddLead, onOpenImport }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'closed'>('overview');
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Chart State
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);

  // Date Filter State
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        const { data: workspace } = await supabase.from('workspaces').select('id').eq('owner_user_id', user.id).single();

        if (workspace) {
          const { data } = await supabase
            .from('activities')
            .select('*, profiles(full_name)')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (data) {
            setActivities(data as any);
          }
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [user]);

  // Helper to get date range start based on filter
  const getRangeStartDate = () => {
    const now = new Date();
    if (timeRange === 'day') {
      const d = new Date();
      d.setHours(0, 0, 0, 0); // Start of today
      return d;
    }
    if (timeRange === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 6); // Last 7 days including today
      return d;
    }
    if (timeRange === 'month') {
      // Last 30 days roughly, or start of current month?
      // User likely wants "This Month" view or "Last 30 Days". 
      // Let's do start of month for "This Month" context, or sliding window.
      // Standard "This Month" dashboard:
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (timeRange === 'year') {
      return new Date(now.getFullYear(), 0, 1);
    }
    return new Date();
  };

  // Generate Chart Data
  const chartData = useMemo(() => {
    const rangeStart = getRangeStartDate();
    const now = new Date();
    const dataPoints: { name: string; value: number; dateStr: string }[] = [];

    // 1. Initialize empty buckets
    if (timeRange === 'day') {
      // Hourly buckets for today
      for (let i = 0; i < 24; i += 4) { // Every 4 hours to keep chart clean? Or simplified.
        // Let's do simple 4-hour blocks or just 1 block if it's "Today" summary. 
        // Actually user might want "Last 24 hours" or "Today".
        // Let's do "Today" with 3-hour intervals
        const h = i.toString().padStart(2, '0');
        dataPoints.push({ name: `${h}:00`, value: 0, dateStr: 'today' }); // dateStr placeholder logic needs update for sub-day
      }
      // Sub-day logic is complex with dateStr matching. Let's simplify 'day' to just show 1 bar or just map leads differently.
      // Better approach for 'day' graph: Show last 7 days but highlight today? 
      // Or if "Day" is selected, maybe show individual leads? 
      // Graph for a single day is usually hourly.
      // Let's implement simplified hourly buckets.
    } else if (timeRange === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(rangeStart);
        d.setDate(d.getDate() + i);
        dataPoints.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: 0,
          dateStr: d.toDateString()
        });
      }
    } else if (timeRange === 'month') {
      // Daily buckets for the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), i);
        dataPoints.push({
          name: i.toString(),
          value: 0,
          dateStr: d.toDateString()
        });
      }
    } else if (timeRange === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((m, idx) => {
        dataPoints.push({
          name: m,
          value: 0,
          dateStr: new Date(now.getFullYear(), idx, 1).toDateString() // Approximate for month matching
        });
      });
    }

    // 2. Fill buckets with Closed leads
    leads.forEach(lead => {
      if (lead.status !== 'Closed') return;
      const leadDate = new Date(lead.createdAt);
      if (leadDate < rangeStart) return;

      if (timeRange === 'day') {
        if (leadDate.toDateString() === now.toDateString()) {
          // For 'Today', just add to the first bucket (Total) or basic distribution
          // Simplification: Graph for 'Today' might just be a flat line or single point. 
          // To make it robust without checking hours:
          // We'll skip granular hourly graph for now and just rely on metrics, or reusing 'week' view for short term.
          // Actually, the user wants a dropdown. Let's make "Day" just show the total value for today.
          // But AreaChart needs points. Let's just make one point "Today".
          if (dataPoints.length === 0) dataPoints.push({ name: 'Today', value: 0, dateStr: 'today' });
          dataPoints[0].value += lead.value;
        }
      } else if (timeRange === 'week') {
        const point = dataPoints.find(p => p.dateStr === leadDate.toDateString());
        if (point) point.value += lead.value;
      } else if (timeRange === 'month') {
        if (leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear()) {
          const point = dataPoints.find(p => p.dateStr === leadDate.toDateString());
          if (point) point.value += lead.value;
        }
      } else if (timeRange === 'year') {
        if (leadDate.getFullYear() === now.getFullYear()) {
          const monthIdx = leadDate.getMonth();
          if (dataPoints[monthIdx]) dataPoints[monthIdx].value += lead.value;
        }
      }
    });

    return dataPoints;
  }, [leads, timeRange]);

  // Filter Leads based on Date Range
  const filteredLeads = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
    return leadDate >= startDate && leadDate <= endDate;
  });

  // Calculate Metrics from FILTERED Leads
  const totalRevenue = filteredLeads
    .filter(l => l.status === 'Closed')
    .reduce((sum, lead) => sum + lead.value, 0);

  const pipelineValue = filteredLeads
    .filter(l => ['New', 'Contacted', 'Qualified', 'Negotiation'].includes(l.status))
    .reduce((sum, lead) => sum + lead.value, 0);

  const closedDealsCount = filteredLeads.filter(l => l.status === 'Closed').length;

  const closedDeals = filteredLeads.filter(l => l.status === 'Closed');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(val);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
            <p className="text-sm text-gray-500">Performance metrics for the current period.</p>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onOpenImport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} /> Import
          </button>
          <button onClick={onOpenAddLead} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Overview
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'closed' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Closed Deals <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{closedDealsCount}</span>
          {activeTab === 'closed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              label="Total Revenue (Closed)"
              value={formatCurrency(totalRevenue)}
              change="12.5%"
              isPositive={true}
            />
            <MetricCard
              label="Pipeline Revenue"
              value={formatCurrency(pipelineValue)}
              change="3.2%"
              isPositive={true}
            />
            <MetricCard
              label="Closed Deals"
              value={closedDealsCount.toString()}
              change="5"
              isPositive={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <GlassCard className="lg:col-span-2 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8 relative">
                <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                <div className="relative">
                  <button
                    onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200"
                  >
                    {timeRange === 'day' ? 'Today' : (timeRange === 'week' ? 'This Week' : (timeRange === 'month' ? 'This Month' : 'This Year'))} <ChevronDown size={14} />
                  </button>
                  {isTimeFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      <button onClick={() => { setTimeRange('day'); setIsTimeFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Today</button>
                      <button onClick={() => { setTimeRange('week'); setIsTimeFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">This Week</button>
                      <button onClick={() => { setTimeRange('month'); setIsTimeFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">This Month</button>
                      <button onClick={() => { setTimeRange('year'); setIsTimeFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">This Year</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-[320px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111827" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                      cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Activity Section */}
            <GlassCard className="p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900">Activity</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
              </div>
              <div className="space-y-6 overflow-y-auto max-h-[300px] pr-2">
                {activities.length > 0 ? (
                  activities.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {item.profiles?.full_name ? getInitials(item.profiles.full_name) : 'SY'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{item.profiles?.full_name || 'System'}</span> <span className="text-gray-500 font-light">{item.action}</span>
                        </p>
                        <p className="text-sm text-gray-900 font-medium truncate">{item.target}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{getTimeAgo(item.created_at)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
              <button className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mt-2">
                View all activity
              </button>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'closed' && (
        <GlassCard noPadding className="overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Won Deals</h3>
              <p className="text-sm text-gray-500">History of all successfully closed deals.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Value</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(closedDeals.reduce((sum, l) => sum + l.value, 0))}</p>
            </div>
          </div>
          {closedDeals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">Deal</th>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">Value</th>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">Closed Date</th>
                    <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {closedDeals.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(lead.value)}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">Today</td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px]">JP</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No closed deals yet. Keep pushing!
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};
