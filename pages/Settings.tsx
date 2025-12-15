import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { Globe, User as UserIcon, Bell, Shield, Key, Terminal, Mail, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Reuse Toggle component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange?: () => void }) => (
    <div
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${checked ? 'left-6' : 'left-1'}`}></div>
    </div>
);

export const Settings: React.FC = () => {
    const { user, signOut } = useAuth();
    const [activeCategory, setActiveCategory] = useState('General');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const updateProfile = async () => {
        setSaving(true);
        try {
            await supabase
                .from('profiles')
                .update({ full_name: fullName, updated_at: new Date() })
                .eq('id', user.id);

            // Show success toast (mock)
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { name: 'General', icon: Globe },
        { name: 'Account', icon: UserIcon },
        { name: 'Notifications', icon: Bell },
        { name: 'Security', icon: Shield },
        { name: 'API Keys', icon: Key },
    ];

    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <button onClick={signOut} className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    Sign Out
                </button>
            </header>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                {/* Left Navigation */}
                <div className="w-full md:w-60 flex flex-col gap-1 shrink-0 overflow-x-auto md:overflow-visible flex-row md:flex-col pb-4 md:pb-0">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveCategory(item.name)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left shrink-0 ${activeCategory === item.name
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
                <div className="flex-1 space-y-8 w-full">
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

                    {activeCategory === 'Account' && (
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Details</h3>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="text"
                                        value={user?.email}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={updateProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {activeCategory !== 'General' && activeCategory !== 'Account' && (
                        <div className="flex items-center justify-center h-64 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <p className="text-sm text-gray-500">Settings for {activeCategory} coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
