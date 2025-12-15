import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowRight, CheckCircle2, Layout, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/dashboard');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0], // Basic default name
                            avatar_url: '',
                        },
                    },
                });
                if (error) throw error;
                // Auto-login or show verification message
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-gray-200">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">R</div>
                        Rellio
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
                        <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsLogin(true)}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            Start for free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        v1.0 is now live
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900">
                        Relationship management, <span className="text-gray-400">reimagined.</span>
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                        A minimalist CRM designed for speed and clarity. Managing your pipeline shouldn't feel like data entry. Experience the difference.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Get Started <ArrowRight size={16} />
                        </button>
                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                            View Demo
                        </button>
                    </div>

                    <div className="pt-8 flex items-center gap-8 text-gray-400">
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gray-900" /> <span className="text-sm">No credit card required</span></div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gray-900" /> <span className="text-sm">14-day free trial</span></div>
                    </div>
                </div>

                {/* Auth / Preview Card */}
                <div id="auth-card" className="relative z-10 animate-in slide-in-from-bottom-12 duration-1000 delay-200 fade-in">
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                    <GlassCard className="p-8 md:p-10 shadow-2xl border-gray-200/50 backdrop-blur-xl">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
                            <p className="text-gray-500 text-sm">{isLogin ? 'Enter your details to access your workspace.' : 'Start managing your leads in seconds.'}</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
                                    placeholder="you@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-1.5 font-medium text-gray-900 hover:underline"
                                >
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Feature Grid (Visual Filler) */}
            <div id="features" className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need, nothing you don't.</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">We stripped away the clutter to focus on what matters: your relationships and your pipeline.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <GlassCard className="p-8 hover:border-gray-300 transition-colors">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <Layout size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Kanban Pipeline</h3>
                            <p className="text-gray-500 leading-relaxed">Drag and drop deals through your custom pipeline. Visualise your progress and never drop the ball.</p>
                        </GlassCard>
                        <GlassCard className="p-8 hover:border-gray-300 transition-colors">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Sync</h3>
                            <p className="text-gray-500 leading-relaxed">Changes saved in real-time. Collaborate with your team without stepping on each other's toes.</p>
                        </GlassCard>
                        <GlassCard className="p-8 hover:border-gray-300 transition-colors">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise Security</h3>
                            <p className="text-gray-500 leading-relaxed">Your data is yours. Row-level security ensures complete privacy and isolation of your workspace.</p>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
};
