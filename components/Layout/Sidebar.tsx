import React from 'react';
import { LayoutDashboard, Kanban, List, CreditCard, Settings, Search, LogOut } from 'lucide-react';
import { CURRENT_USER } from '../../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'leads', label: 'Lists', icon: List },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col justify-between z-20">
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-full"></div>
             </div>
             <span className="font-bold text-gray-900 text-lg tracking-tight">Rellio</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 mb-6">
            <div className="relative group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors"/>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all placeholder:text-gray-400 text-gray-700"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white">⌘K</span>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={18} strokeWidth={2} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <img src={CURRENT_USER.avatarUrl} className="w-8 h-8 rounded-full border border-gray-200" alt="Profile"/>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{CURRENT_USER.name}</p>
                    <p className="text-xs text-gray-500 truncate">Pro Plan</p>
                </div>
                <LogOut size={16} className="text-gray-300 group-hover:text-gray-500" />
             </div>
        </div>
      </div>
    </div>
  );
};