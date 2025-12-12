import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Lead, Pipeline as PipelineType } from '../types';

interface PipelineProps {
  pipeline: PipelineType;
  leads: Lead[];
  updateLeadStage: (leadId: string, newStageId: string) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({ pipeline, leads, updateLeadStage }) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

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

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
          <p className="text-gray-500 text-sm">Manage your deal flow across stages.</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
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
                      >
                        <GlassCard className="p-3 hover:shadow-md transition-shadow duration-200 group border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                            <button className="text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">{lead.company}</p>
                          
                          <div className="flex justify-between items-center mt-3">
                             <Badge variant="neutral">
                                {lead.status}
                             </Badge>
                             <span className="text-xs font-semibold text-gray-700">{formatCurrency(lead.value)}</span>
                          </div>
                        </GlassCard>
                      </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 text-xs hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5">
                      <Plus size={12} /> Add deal
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};