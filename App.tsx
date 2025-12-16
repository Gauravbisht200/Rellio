import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Landing } from './pages/Landing';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { LeadsList } from './pages/LeadsList';
import { Billing } from './pages/Billing';
import { Settings } from './pages/Settings';
import { DEFAULT_PIPELINE, INITIAL_LEADS } from './constants';
import { GlassCard } from './components/ui/GlassCard';
import { Check, Shield, Mail, Terminal, Globe, User as UserIcon, Bell, Key } from 'lucide-react';
import { Lead, LeadStatus } from './types';
import { AddLeadModal } from './components/AddLeadModal';
import { ImportLeadsModal } from './components/ImportLeadsModal';
import { repairPipelineStages } from './lib/pipelineUtils';

// ... (existing imports)




// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) return null; // Or a loading spinner

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// App Layout Component (Sidebar + Content)
const AppLayout = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pipeline, setPipeline] = useState(DEFAULT_PIPELINE);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch Data from Supabase
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // 1. Get Workspace
                const { data: workspace } = await supabase
                    .from('workspaces')
                    .select('id')
                    .eq('owner_user_id', user.id)
                    .single();

                if (!workspace) return;

                // 2. Get Pipeline
                const { data: pipe } = await supabase
                    .from('pipelines')
                    .select('*')
                    .eq('workspace_id', workspace.id)
                    .eq('is_default', true)
                    .single();

                if (pipe) {
                    // 3. Get Stages
                    const { data: stages } = await supabase
                        .from('pipeline_stages')
                        .select('*')
                        .eq('pipeline_id', pipe.id)
                        .order('order_index');

                    if (stages) {
                        // Auto-repair logic: Ensure we have exactly the 6 strict stages
                        // We check if the stages list matches our expectation roughly. 
                        // If we see "Proposal Sent" or "Contact Made", we trigger a repair.
                        // Or simply run it once to be safe if names don't match.
                        const strictNames = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Closed', 'Lost'];
                        const needsRepair = stages.length !== 6 || !stages.every((s: any) => strictNames.includes(s.name));

                        let currentStages = stages;

                        if (needsRepair) {
                            console.log('Pipeline requires repair. Running auto-healer...');
                            await repairPipelineStages(pipe.id, stages);
                            // Re-fetch stages after repair
                            const { data: refreshedStages } = await supabase
                                .from('pipeline_stages')
                                .select('*')
                                .eq('pipeline_id', pipe.id)
                                .order('order_index');
                            if (refreshedStages) currentStages = refreshedStages;
                        }

                        const mappedStages = currentStages.map((s: any) => ({
                            id: s.id,
                            name: s.name,
                            order: s.order_index,
                            color: s.color || 'gray'
                        }));

                        setPipeline({
                            id: pipe.id,
                            name: pipe.name,
                            stages: mappedStages
                        });
                    }


                    // 4. Get Leads
                    const { data: leadsData } = await supabase
                        .from('leads')
                        .select('*')
                        .eq('workspace_id', workspace.id);

                    if (leadsData) {
                        const mappedLeads = leadsData.map((l: any) => ({
                            id: l.id,
                            name: l.name,
                            company: l.company || '',
                            email: l.email || '',
                            phone: l.phone,
                            value: Number(l.value),
                            status: l.status === 'Won' ? 'Closed' : (l.status === 'Open' ? 'New' : l.status),
                            stageId: l.pipeline_stage_id,
                            ownerId: l.owner_user_id,
                            createdAt: l.created_at,
                            avatarUrl: ''
                        }));
                        setLeads(mappedLeads);
                    }

                    // 5. Set up real-time subscription for leads
                    const leadsSubscription = supabase
                        .channel('leads-changes')
                        .on(
                            'postgres_changes',
                            {
                                event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                                schema: 'public',
                                table: 'leads',
                                filter: `workspace_id=eq.${workspace.id}`
                            },
                            (payload) => {
                                console.log('Real-time update:', payload);

                                if (payload.eventType === 'INSERT') {
                                    const newLead = payload.new as any;
                                    const mappedLead = {
                                        id: newLead.id,
                                        name: newLead.name,
                                        company: newLead.company || '',
                                        email: newLead.email || '',
                                        phone: newLead.phone,
                                        value: Number(newLead.value),
                                        status: newLead.status === 'Won' ? 'Closed' : (newLead.status === 'Open' ? 'New' : newLead.status),
                                        stageId: newLead.pipeline_stage_id,
                                        ownerId: newLead.owner_user_id,
                                        createdAt: newLead.created_at,
                                        avatarUrl: ''
                                    };
                                    setLeads(prev => [...prev, mappedLead]);
                                } else if (payload.eventType === 'UPDATE') {
                                    const updatedLead = payload.new as any;
                                    const mappedLead = {
                                        id: updatedLead.id,
                                        name: updatedLead.name,
                                        company: updatedLead.company || '',
                                        email: updatedLead.email || '',
                                        phone: updatedLead.phone,
                                        value: Number(updatedLead.value),
                                        status: updatedLead.status === 'Won' ? 'Closed' : (updatedLead.status === 'Open' ? 'New' : updatedLead.status),
                                        stageId: updatedLead.pipeline_stage_id,
                                        ownerId: updatedLead.owner_user_id,
                                        createdAt: updatedLead.created_at,
                                        avatarUrl: ''
                                    };
                                    setLeads(prev => prev.map(l => l.id === mappedLead.id ? mappedLead : l));
                                } else if (payload.eventType === 'DELETE') {
                                    const deletedId = (payload.old as any).id;
                                    setLeads(prev => prev.filter(l => l.id !== deletedId));
                                }
                            }
                        )
                        .subscribe();

                    // Cleanup subscription on unmount
                    return () => {
                        leadsSubscription.unsubscribe();
                    };
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [user]);

    // Sync URL path with activeTab logic (basic implementation)
    useEffect(() => {
        const path = location.pathname.substring(1); // remove leading slash
        if (['dashboard', 'pipeline', 'leads', 'billing', 'settings'].includes(path)) {
            setActiveTab(path);
        }
    }, [location]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        navigate(`/${tab}`);
    };

    // CRUD Functions (Supabase Integrated)
    const addLead = async (lead: Lead) => {
        try {
            const { data: workspace } = await supabase.from('workspaces').select('id').eq('owner_user_id', user.id).single();
            if (!workspace) return; // Should handle error

            // Ensure we use a valid UUID for the stage
            let targetStageId = lead.stageId;
            // If stageId is the placeholder 'stage-new' or invalid, default to the first stage from the real pipeline
            const stageExists = pipeline.stages.some(s => s.id === targetStageId);
            if ((!stageExists || targetStageId === 'stage-new') && pipeline.stages.length > 0) {
                targetStageId = pipeline.stages[0].id;
            }

            const { data, error } = await supabase.from('leads').insert({
                name: lead.name,
                company: lead.company,
                email: lead.email,
                phone: lead.phone,
                value: lead.value,
                status: lead.status === 'New' ? 'Open' : lead.status, // Normalize 'New' to 'Open' for DB consistency if desired, or keep 'New'
                pipeline_stage_id: targetStageId,
                workspace_id: workspace.id,
                owner_user_id: user.id
                // tags: lead.tags || [] // Temporarily commented out until tags column is added to database
            }).select().single();

            if (error) {
                console.error('Error adding lead:', error);
                // Ideally show user feedback here
                return;
            }

            // Update local state with the real ID from DB
            const newLead = {
                ...lead,
                id: data.id,
                stageId: data.pipeline_stage_id,
                status: data.status === 'Open' ? 'New' : data.status
            };
            setLeads([...leads, newLead]);
        } catch (err) {
            console.error(err);
        }
    };

    const updateLead = async (updatedLead: Lead) => {
        try {
            const { error } = await supabase.from('leads').update({
                name: updatedLead.name,
                company: updatedLead.company,
                email: updatedLead.email,
                phone: updatedLead.phone,
                value: updatedLead.value,
                status: updatedLead.status,
                pipeline_stage_id: updatedLead.stageId
            }).eq('id', updatedLead.id);

            if (error) throw error;
            setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
        } catch (err) {
            console.error('Error updating lead:', err);
        }
    };

    const deleteLead = async (leadId: string) => {
        try {
            const { error } = await supabase.from('leads').delete().eq('id', leadId);
            if (error) throw error;
            setLeads(leads.filter(l => l.id !== leadId));
        } catch (err) {
            console.error('Error deleting lead:', err);
        }
    };

    const updateLeadStage = async (leadId: string, newStageId: string) => {
        // Optimistic Update
        const oldLeads = [...leads];

        const updatedLeads = leads.map(lead => {
            if (lead.id === leadId) {
                // For now, just update the stageId. Status might be derived from stage later.
                return { ...lead, stageId: newStageId };
            }
            return lead;
        });
        setLeads(updatedLeads);

        try {
            // Check target stage
            const targetStage = pipeline.stages.find(s => s.id === newStageId);
            const newStatus = targetStage ? targetStage.name as LeadStatus : 'New';

            const updatePayload: any = {
                pipeline_stage_id: newStageId,
                status: newStatus
            };

            // Update local state reflectively
            const updatedLeadsWithStatus = updatedLeads.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            );
            setLeads(updatedLeadsWithStatus);

            const { error } = await supabase.from('leads').update(updatePayload).eq('id', leadId);

            if (error) throw error;
        } catch (err) {
            console.error('Error moving lead:', err);
            setLeads(oldLeads); // Revert
        }
    };

    const openAddLeadModal = () => setIsAddLeadModalOpen(true);
    const openImportModal = () => setIsImportModalOpen(true);

    const importLeads = async (importedLeads: Partial<Lead>[]) => {
        try {
            for (const lead of importedLeads) {
                if (lead.name) {
                    await addLead(lead as Lead);
                }
            }
        } catch (err) {
            console.error('Error importing batch:', err);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard leads={leads} onOpenAddLead={openAddLeadModal} onOpenImport={openImportModal} />;
            case 'pipeline':
                return (
                    <Pipeline
                        pipeline={pipeline}
                        leads={leads}
                        updateLeadStage={updateLeadStage}
                        onAddLead={addLead}
                        onUpdateLead={updateLead}
                        onDeleteLead={deleteLead}
                        onOpenAddLead={openAddLeadModal}
                        onOpenImport={openImportModal}
                    />
                );
            case 'leads':
                return (
                    <LeadsList
                        leads={leads}
                        onOpenAddLead={openAddLeadModal}
                        onOpenImport={openImportModal}
                        onDeleteLead={deleteLead}
                        onUpdateLeadStage={updateLeadStage}
                        stages={pipeline.stages}
                    />
                );
            case 'billing':
                return <Billing />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard leads={leads} onOpenAddLead={openAddLeadModal} onOpenImport={openImportModal} />;
        }
    };

    return (
        <div className="flex min-h-screen font-sans text-gray-900 antialiased selection:bg-primary-500/10 selection:text-primary-600 bg-white">
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
            <main className="ml-0 lg:ml-64 flex-1 h-screen overflow-y-auto relative bg-[#F9FAFB] pt-16 lg:pt-0">
                <div className="relative min-h-full">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard leads={leads} onOpenAddLead={openAddLeadModal} onOpenImport={openImportModal} />} />
                        <Route path="/pipeline" element={<Pipeline pipeline={pipeline} leads={leads} updateLeadStage={updateLeadStage} onAddLead={addLead} onUpdateLead={updateLead} onDeleteLead={deleteLead} onOpenAddLead={openAddLeadModal} onOpenImport={openImportModal} />} />
                        <Route path="/leads" element={
                            <LeadsList
                                leads={leads}
                                onOpenAddLead={openAddLeadModal}
                                onOpenImport={openImportModal}
                                onDeleteLead={deleteLead}
                                onUpdateLeadStage={updateLeadStage}
                                stages={pipeline.stages}
                            />
                        } />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </main>
            <AddLeadModal
                isOpen={isAddLeadModalOpen}
                onClose={() => setIsAddLeadModalOpen(false)}
                onAdd={addLead}
                stages={pipeline.stages}
            />
            <ImportLeadsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={importLeads}
                stages={pipeline.stages}
            />
        </div>
    );
};



export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}