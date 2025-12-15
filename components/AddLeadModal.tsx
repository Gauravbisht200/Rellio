import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { X } from 'lucide-react';
import { Lead, PipelineStage } from '../types';
import { TagInput } from './ui/TagInput';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (lead: Lead) => void;
    stages: PipelineStage[];
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAdd, stages }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        value: '',
        email: '',
        stageId: '',
        tags: ''
    });

    // Set default stage when modal opens or stages change
    React.useEffect(() => {
        if (stages.length > 0 && !formData.stageId) {
            setFormData(prev => ({ ...prev, stageId: stages[0].id }));
        }
    }, [stages, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: Date.now().toString(), // Helper ID, backend will replace
            name: formData.name,
            company: formData.company,
            value: Number(formData.value) || 0,
            email: formData.email,
            status: 'New', // Default status, effectively 'Open' in DB
            stageId: formData.stageId || (stages.length > 0 ? stages[0].id : 'default-stage-id'),
            ownerId: 'u1',
            createdAt: new Date().toISOString(),
            tags: formData.tags.split(',').filter(t => t.trim().length > 0)
        };
        onAdd(newLead);
        onClose();
        setFormData({ name: '', company: '', value: '', email: '', stageId: stages.length > 0 ? stages[0].id : '', tags: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-md animate-in zoom-in-95 duration-200" onClick={(e: any) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Create New Lead</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                        <input
                            required
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company</label>
                        <input
                            required
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Value ($)</label>
                        <input
                            type="number"
                            required
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stage</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                value={formData.stageId}
                                onChange={e => setFormData({ ...formData, stageId: e.target.value })}
                            >
                                {stages.map(stage => (
                                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tags</label>
                            <TagInput
                                tags={formData.tags ? formData.tags.split(',').filter(Boolean) : []}
                                onChange={(newTags) => setFormData({ ...formData, tags: newTags.join(',') })}
                                suggestions={['warm intro', 'cold call', 'lead', 'urgent', 'enterprise']}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Create Lead</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
