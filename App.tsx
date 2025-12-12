import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { LeadsList } from './pages/LeadsList';
import { DEFAULT_PIPELINE, INITIAL_LEADS } from './constants';
import { GlassCard } from './components/ui/GlassCard';
import { Check, Shield, Slack, MessageCircle, UserPlus, Mail, Building, User as UserIcon, Bell, Key, Globe, Terminal, ChevronRight } from 'lucide-react';
import { Badge } from './components/ui/Badge';

const Billing: React.FC = () => (
  <div className="p-12 max-w-5xl mx-auto animate-in fade-in duration-500">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
    <p className="text-gray-500 mb-10">Manage your subscription and payment methods.</p>
    
    <div className="grid md:grid-cols-2 gap-8">
       <GlassCard className="p-8 relative overflow-hidden group border-primary-500/20">
          <div className="absolute top-0 right-0 p-4">
             <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Active</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
          <p className="text-4xl font-bold text-gray-900 mb-6">$29<span className="text-base text-gray-400 font-normal">/mo</span></p>
          <ul className="space-y-4 mb-8">
             {['Unlimited Leads', '5 Pipelines', 'Advanced Analytics', 'Priority Support'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                   <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Check size={12} strokeWidth={3} />
                   </div>
                   {item}
                </li>
             ))}
          </ul>
          <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
             Manage Subscription
          </button>
       </GlassCard>
       
       <GlassCard className="p-8 flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
                 <div className="w-12 h-8 bg-gray-800 rounded-sm text-white text-[10px] flex items-center justify-center font-bold tracking-wider">VISA</div>
                 <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">•••• 4242</p>
                    <p className="text-xs text-gray-500">Expires 12/25</p>
                 </div>
              </div>
           </div>
           <button className="text-primary-600 text-sm font-medium hover:underline text-left">Update payment method</button>
       </GlassCard>
    </div>
  </div>
);

// Custom Toggle Component
const Toggle = ({ checked }: { checked: boolean }) => (
    <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${checked ? 'left-6' : 'left-1'}`}></div>
    </div>
);

const Settings: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('General');

    const navItems = [
        { name: 'General', icon: Globe },
        { name: 'Account', icon: UserIcon },
        { name: 'Notifications', icon: Bell },
        { name: 'Security', icon: Shield },
        { name: 'API Keys', icon: Key },
    ];

    return (
    <div className="p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
        <header className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </header>

        <div className="flex gap-12 items-start">
            {/* Left Navigation */}
            <div className="w-60 flex flex-col gap-1 shrink-0">
                {navItems.map((item) => (
                    <button 
                        key={item.name}
                        onClick={() => setActiveCategory(item.name)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                            activeCategory === item.name 
                                ? 'bg-gray-100 text-gray-900' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <item.icon size={18} strokeWidth={2} /> 
                        {item.name}
                    </button>
                ))}
            </div>

            {/* Right Content */}
            <div className="flex-1 space-y-8">
                {activeCategory === 'General' && (
                    <>
                        {/* Workspace Preferences */}
                        <GlassCard className="p-0 border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Workspace Preferences</h3>
                                <p className="text-sm text-gray-500">Manage your workspace appearance and behavior.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                                    <Toggle checked={false} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Desktop Notifications</span>
                                    <Toggle checked={true} />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Integrations */}
                        <GlassCard className="p-0 border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Integrations</h3>
                                <p className="text-sm text-gray-500">Connect third-party tools.</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {/* Slack Item */}
                                <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#1F2937] rounded-lg flex items-center justify-center text-white">
                                            <Terminal size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Slack</h4>
                                            <p className="text-xs text-gray-500">Messaging</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        Connect
                                    </button>
                                </div>

                                {/* Gmail Item */}
                                <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Gmail</h4>
                                            <p className="text-xs text-gray-500">Email Sync</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-green-600 px-4">
                                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                        Connected
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </>
                )}
                
                {/* Placeholders for other tabs */}
                {activeCategory !== 'General' && (
                    <div className="flex items-center justify-center h-64 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-sm text-gray-500">Settings for {activeCategory} coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pipeline] = useState(DEFAULT_PIPELINE);
  const [leads, setLeads] = useState(INITIAL_LEADS);

  const updateLeadStage = (leadId: string, newStageId: string) => {
    setLeads(prev => prev.map(lead => {
        if (lead.id === leadId) {
            // Simple optimistic update for the demo
            return { ...lead, stageId: newStageId, status: newStageId === 'stage-won' ? 'Won' : lead.status };
        }
        return lead;
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pipeline':
        return <Pipeline pipeline={pipeline} leads={leads} updateLeadStage={updateLeadStage} />;
      case 'leads':
        return <LeadsList leads={leads} />;
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans text-gray-900 antialiased selection:bg-primary-500/10 selection:text-primary-600 bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="ml-64 flex-1 h-screen overflow-y-auto relative bg-[#F9FAFB]">
        <div className="relative min-h-full">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}