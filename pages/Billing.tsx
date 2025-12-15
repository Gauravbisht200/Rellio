import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { Check, Download, CreditCard, Clock, AlertTriangle } from 'lucide-react';

interface Subscription {
    id: string;
    plan_name: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
}

interface Invoice {
    id: string;
    created_at: string;
    amount: number;
    status: string;
    pdf_url: string | null;
}

export const Billing: React.FC = () => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Workspace for current user
            const { data: workspace } = await supabase
                .from('workspaces')
                .select('id')
                .eq('owner_user_id', user.id)
                .single();

            if (workspace) {
                // 2. Get Subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('workspace_id', workspace.id)
                    .single();

                setSubscription(sub);

                if (sub) {
                    // 3. Get Invoices
                    const { data: inv } = await supabase
                        .from('invoices')
                        .select('*')
                        .eq('subscription_id', sub.id)
                        .order('created_at', { ascending: false });

                    setInvoices(inv || []);
                }
            }
        } catch (error) {
            console.error('Error fetching billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading billing details...</div>;

    return (
        <div className="p-8 md:p-12 max-w-5xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
            <p className="text-gray-500 mb-10">Manage your subscription, payment methods, and invoices.</p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Subscription Card */}
                <GlassCard className="p-8 relative overflow-hidden group border-primary-500/20 flex flex-col">
                    <div className="absolute top-0 right-0 p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {subscription?.status || 'No Plan'}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{subscription?.plan_name || 'Free'} Plan</h3>
                    <p className="text-4xl font-bold text-gray-900 mb-1">
                        {subscription?.plan_name === 'Pro' ? '$29' : '$0'}
                        <span className="text-base text-gray-400 font-normal">/mo</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        {subscription?.current_period_end
                            ? `Renews on ${formatDate(subscription.current_period_end)}`
                            : 'Forever free'}
                    </p>

                    <ul className="space-y-4 mb-8 flex-1">
                        {['Unlimited Leads', '5 Pipelines', 'Advanced Analytics', 'Priority Support'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                        {subscription?.plan_name === 'Pro' ? 'Manage Subscription' : 'Upgrade to Pro'}
                    </button>
                </GlassCard>

                {/* Payment Method Card */}
                <GlassCard className="p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Method</h3>
                        {subscription?.plan_name === 'Pro' ? (
                            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
                                <div className="w-12 h-8 bg-gray-800 rounded-sm text-white text-[10px] flex items-center justify-center font-bold tracking-wider">VISA</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">•••• 4242</p>
                                    <p className="text-xs text-gray-500">Expires 12/25</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border border-dashed border-gray-200 rounded-lg bg-gray-50 mb-6 text-center">
                                <CreditCard className="mx-auto text-gray-400 mb-2" size={24} />
                                <p className="text-sm text-gray-500">No payment method added</p>
                            </div>
                        )}
                    </div>
                    <button className="text-primary-600 text-sm font-medium hover:underline text-left">
                        {subscription?.plan_name === 'Pro' ? 'Update payment method' : 'Add payment method'}
                    </button>
                </GlassCard>
            </div>

            {/* Invoices Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Invoices</h3>
                <GlassCard className="p-0 overflow-hidden">
                    {invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                                        <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                                        <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">{formatDate(inv.created_at)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600">${inv.amount.toFixed(2)}</td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Clock size={20} />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No invoices yet</h3>
                            <p className="text-sm text-gray-500 mt-1">When you verify your subscription, invoices will appear here.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
