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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard className="w-full h-full sm:h-auto sm:max-w-md sm:rounded-xl rounded-none overflow-y-auto">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="Acme Inc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value ($)</label>
                        <input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="10000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Stage</label>
                        <select
                            value={formData.stageId}
                            onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
                            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-sm"
                        >
                            {stages.map(stage => (
                                <option key={stage.id} value={stage.id}>{stage.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <TagInput
                            value={formData.tags}
                            onChange={(tags) => setFormData({ ...formData, tags })}
                            placeholder="Add tags..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4 sm:pb-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-base sm:text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 sm:py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors text-base sm:text-sm"
                        >
                            Create Lead
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
