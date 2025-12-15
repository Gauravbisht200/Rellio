import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Plus, MoreHorizontal, X, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Lead, Pipeline as PipelineType, LeadStatus } from '../types';
import { AddLeadModal } from '../components/AddLeadModal';
import Papa from 'papaparse';
import { TagInput } from '../components/ui/TagInput';

interface PipelineProps {
  pipeline: PipelineType;
  leads: Lead[];
  updateLeadStage: (leadId: string, newStageId: string) => void;
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenAddLead: () => void;
  onOpenImport: () => void;
}

export const Pipeline: React.FC<PipelineProps> = ({ pipeline, leads, updateLeadStage, onAddLead, onUpdateLead, onDeleteLead, onOpenAddLead, onOpenImport }) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  // Removed local isAddModalOpen state as it's hoisted to App.tsx
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      updateLeadStage(draggedLeadId, stageId);
      setDraggedLeadId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(val);
  };

  const handleExport = () => {
    const csvData = leads.map(lead => ({
      Name: lead.name,
      Company: lead.company,
      Email: lead.email,
      Phone: lead.phone,
      Value: lead.value,
      Status: lead.status,
      Tags: lead.tags ? lead.tags.join(', ') : ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pipeline_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      onUpdateLead(editingLead);
      setEditingLead(null);
    }
  };

  const handleDeleteLead = () => {
    if (editingLead) {
      if (confirm('Are you sure you want to delete this lead?')) {
        onDeleteLead(editingLead.id);
        setEditingLead(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
          <p className="text-gray-500 text-sm">Manage your deal flow across stages.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowDownToLine size={16} />
            Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowUpFromLine size={16} />
            Export
          </button>
          <button
            onClick={() => onOpenAddLead()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Deal
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {pipeline.stages.map((stage) => {
            const stageLeads = leads.filter(l => l.stageId === stage.id);
            const stageTotal = stageLeads.reduce((sum, l) => sum + l.value, 0);

            return (
              <div
                key={stage.id}
                className="w-80 flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-100/50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700 text-sm">{stage.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full mb-2 overflow-hidden">
                    <div className={`h-full ${stage.color.replace('bg-', 'bg-')}`} style={{ width: '100%', opacity: 0.5 }}></div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{formatCurrency(stageTotal)}</p>
                </div>

                {/* Drop Zone */}
                <div className="flex-1 overflow-y-auto px-2 space-y-2.5 pb-20">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="cursor-grab active:cursor-grabbing"
                      onClick={() => setEditingLead(lead)}
                    >
                      <GlassCard className="p-3 hover:shadow-md transition-shadow duration-200 group border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                          <button className="text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{lead.company}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {lead.tags?.map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium border border-gray-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <Badge variant="neutral">
                            {lead.status}
                          </Badge>
                          <span className="text-xs font-semibold text-gray-700">{formatCurrency(lead.value)}</span>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                  <button
                    onClick={() => onOpenAddLead()}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 text-xs hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={12} /> Add deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md animate-in zoom-in-95 duration-200" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Edit Lead</h3>
              <button onClick={() => setEditingLead(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                <input
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={editingLead.name}
                  onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company</label>
                <input
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={editingLead.company}
                  onChange={e => setEditingLead({ ...editingLead, company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Value ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={editingLead.value}
                    onChange={e => setEditingLead({ ...editingLead, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={editingLead.status}
                    onChange={e => setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed">Closed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={editingLead.email}
                  onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tags</label>
                <TagInput
                  tags={editingLead.tags || []}
                  onChange={(newTags) => setEditingLead({ ...editingLead, tags: newTags })}
                  suggestions={['warm intro', 'cold call', 'lead', 'urgent', 'enterprise']}
                />
              </div>
              <div className="pt-4 flex items-center justify-between gap-3">
                <button type="button" onClick={handleDeleteLead} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Save Changes</button>
                </div>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};