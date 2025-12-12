import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, ArrowUpFromLine, MoreHorizontal, Plus, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Lead } from '../types';

interface LeadsListProps {
  leads: Lead[];
}

export const LeadsList: React.FC<LeadsListProps> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(l => l !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* Table Controls Header */}
      <div className="flex justify-between items-center mb-4">
         <button className="flex items-center gap-2 text-sm font-medium text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors">
            All deals <ChevronDown size={14} className="text-gray-400" />
         </button>

         <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-2 py-1">
                 <Filter size={14}/> Filter
             </button>
             <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-2 py-1">
                 <ArrowUpDown size={14}/> Sort
             </button>
             <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-2 py-1">
                 <Search size={14}/> Search
             </button>
             <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                 •••
             </button>
             <div className="h-4 w-px bg-gray-300 mx-1"></div>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <ArrowUpFromLine size={14} /> Export
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                <Plus size={16} />
                Add New
             </button>
         </div>
      </div>

      <GlassCard noPadding className="overflow-hidden shadow-sm border-gray-200">
        <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                        <th className="py-3 pl-4 pr-2 w-10">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                onChange={toggleSelectAll}
                            />
                        </th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-16">ID</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Deals</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Value</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right pr-8">Source</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map((lead, index) => {
                        const isSelected = selectedLeads.includes(lead.id);
                        return (
                        <tr 
                            key={lead.id} 
                            className={`group hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-gray-50' : 'bg-white'}`}
                        >
                            <td className="py-3.5 pl-4 pr-2">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleSelectLead(lead.id)}
                                />
                            </td>
                            <td className="py-3.5 px-4 text-sm text-gray-500">0{index + 1}</td>
                            <td className="py-3.5 px-4 text-sm font-medium text-gray-900">{lead.company}</td>
                            <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                    {lead.avatarUrl ? (
                                        <img src={lead.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {lead.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-700">{lead.name}</span>
                                </div>
                            </td>
                            <td className="py-3.5 px-4 text-sm text-gray-500">{lead.email}</td>
                            <td className="py-3.5 px-4 text-sm font-medium text-gray-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(lead.value)}
                            </td>
                            <td className="py-3.5 px-4 text-right pr-6">
                                {/* Mimicking the badges from the reference image */}
                                {lead.status === 'New' && <Badge variant="cyan">Social Networks</Badge>}
                                {lead.status === 'Contacted' && <Badge variant="neutral">Outreach</Badge>}
                                {lead.status === 'Qualified' && <Badge variant="success">Referrals</Badge>}
                                {lead.status === 'Won' && <Badge variant="warning">Word-of-mouth</Badge>}
                                {!['New', 'Contacted', 'Qualified', 'Won'].includes(lead.status) && <Badge variant="neutral">Outreach</Badge>}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
        {/* Pagination Footnote */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
            <span>Showing {filteredLeads.length} items</span>
            <div className="flex gap-2">
                <button className="hover:text-gray-900 disabled:opacity-50" disabled>Previous</button>
                <button className="hover:text-gray-900">Next</button>
            </div>
        </div>
      </GlassCard>
    </div>
  );
};