import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowUpRight, Download, Plus, ChevronDown, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RECENT_ACTIVITY } from '../constants';

const data = [
  { name: 'Mon', value: 3800 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 4500 },
  { name: 'Thu', value: 3200 },
  { name: 'Fri', value: 6000 },
  { name: 'Sat', value: 4800 },
  { name: 'Sun', value: 5100 },
];

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

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
         <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
            <p className="text-sm text-gray-500">Performance metrics for the current period.</p>
         </div>
         <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <Download size={16} /> Export
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                <Plus size={16} />
                Add Lead
             </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard label="Total Revenue" value="$128,450" change="12.5%" isPositive={true} />
         <MetricCard label="Active Leads" value="1,234" change="3.2%" isPositive={true} />
         <MetricCard label="Conversion Rate" value="2.4%" change="-0.4%" isPositive={false} />
      </div>

      {/* Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section - Takes up 2/3 */}
          <GlassCard className="lg:col-span-2 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                 <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                    This Week <ChevronDown size={14} />
                 </button>
              </div>
              <div className="h-[320px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#111827" stopOpacity={0.05}/>
                                <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                            itemStyle={{ color: '#F3F4F6' }}
                            cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </GlassCard>

          {/* Activity Section - Takes up 1/3 */}
          <GlassCard className="p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-semibold text-gray-900">Activity</h3>
                 <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
              </div>
              <div className="space-y-6">
                 {RECENT_ACTIVITY.map((item) => (
                     <div key={item.id} className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                             {item.initials}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className="text-sm text-gray-900">
                                 <span className="font-semibold">{item.user}</span> <span className="text-gray-500 font-light">{item.action}</span>
                             </p>
                             <p className="text-sm text-gray-900 font-medium truncate">{item.target}</p>
                         </div>
                         <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                     </div>
                 ))}
                 <button className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mt-2">
                     View all activity
                 </button>
              </div>
          </GlassCard>
      </div>
    </div>
  );
};