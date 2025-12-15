import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, ArrowUpFromLine, MoreHorizontal, Plus, ChevronDown, ArrowUpDown, Download } from 'lucide-react';
import { Lead } from '../types';
import Papa from 'papaparse';
import { Trash2, TrendingUp, MoreVertical } from 'lucide-react';

interface LeadsListProps {
    leads: Lead[];
    onOpenAddLead: () => void;
    onOpenImport: () => void;
    onDeleteLead: (id: string) => void;
    onUpdateLeadStage: (leadId: string, newStageId: string) => void;
    stages: { id: string; name: string }[];
}

export const LeadsList: React.FC<LeadsListProps> = ({ leads, onOpenAddLead, onOpenImport, onDeleteLead, onUpdateLeadStage, stages }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

    // Toolbar States
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showStatusSubMenu, setShowStatusSubMenu] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Filter Logic
    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sort Logic
    const sortedLeads = [...filteredLeads].sort((a, b) => {
        if (!sortConfig) return 0;

        let comparison = 0;
        if (sortConfig.key === 'value') {
            comparison = a.value - b.value;
        } else if (sortConfig.key === 'createdAt') {
            // Assuming createdAt is ISO string. If strictly relying on ID for insertion order, simpler, but date is better.
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortConfig.key === 'name') {
            comparison = a.name.localeCompare(b.name);
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    const toggleSelectAll = () => {
        if (selectedLeads.length === sortedLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(sortedLeads.map(l => l.id));
        }
    };

    const toggleSelectLead = (id: string) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(selectedLeads.filter(l => l !== id));
        } else {
            setSelectedLeads([...selectedLeads, id]);
        }
    };

    const handleExport = () => {
        const dataToExport = selectedLeads.length > 0
            ? leads.filter(l => selectedLeads.includes(l.id))
            : leads;

        const csvData = dataToExport.map(lead => ({
            Name: lead.name,
            Company: lead.company,
            Email: lead.email,
            Phone: lead.phone,
            Value: lead.value,
            Status: lead.status,
            Source: 'Web', // Field missing in Lead type?
            Tags: lead.tags ? lead.tags.join(', ') : ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
            selectedLeads.forEach(id => onDeleteLead(id));
            setSelectedLeads([]);
            setShowActionsMenu(false);
        }
    };

    const handleBulkStatusChange = (status: string) => {
        // Find stage ID corresponding to status name
        // Simple mapping assumption: Stage Name === Status
        // We need to look up stage ID from the 'stages' prop
        const targetStage = stages.find(s => s.name === status);
        if (targetStage) {
            selectedLeads.forEach(id => {
                onUpdateLeadStage(id, targetStage.id);
            });
            setSelectedLeads([]);
            setShowActionsMenu(false);
            setShowStatusSubMenu(false);
        } else {
            console.error(`Stage not found for status: ${status}`);
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
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 text-sm px-2 py-1 rounded-md transition-colors ${showFilterMenu || filterStatus !== 'All' ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Filter size={14} /> Filter {filterStatus !== 'All' && <span className="text-xs bg-gray-200 px-1 rounded">{filterStatus}</span>}
                        </button>
                        {showFilterMenu && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Status</div>
                                {['All', 'New', 'Contacted', 'Qualified', 'Negotiation', 'Closed', 'Lost'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStatus === status ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className={`flex items-center gap-2 text-sm px-2 py-1 rounded-md transition-colors ${showSortMenu || sortConfig ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <ArrowUpDown size={14} /> Sort
                        </button>
                        {showSortMenu && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                <button onClick={() => { setSortConfig({ key: 'createdAt', direction: 'desc' }); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Newest First</button>
                                <button onClick={() => { setSortConfig({ key: 'createdAt', direction: 'asc' }); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Oldest First</button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button onClick={() => { setSortConfig({ key: 'value', direction: 'desc' }); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Value (High to Low)</button>
                                <button onClick={() => { setSortConfig({ key: 'value', direction: 'asc' }); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Value (Low to High)</button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center">
                        {showSearchInput ? (
                            <div className="flex items-center bg-gray-100 rounded-md px-2 py-1 transition-all w-48">
                                <Search size={14} className="text-gray-500 mr-2" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onBlur={() => !searchTerm && setShowSearchInput(false)}
                                    placeholder="Search..."
                                    className="bg-transparent border-none text-sm focus:outline-none w-full p-0 text-gray-700 placeholder-gray-400"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSearchInput(true)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-2 py-1"
                            >
                                <Search size={14} /> Search
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className={`p-1 rounded transition-colors ${showActionsMenu || selectedLeads.length > 0 ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
                            disabled={selectedLeads.length === 0}
                            title={selectedLeads.length === 0 ? "Select leads to perform actions" : "Bulk Actions"}
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {showActionsMenu && selectedLeads.length > 0 && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                <div className="px-4 py-2 text-xs text-gray-400 font-semibold border-b border-gray-100">
                                    {selectedLeads.length} Selected
                                </div>
                                <button onClick={handleExport} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <ArrowUpFromLine size={14} /> Export Selected
                                </button>

                                <div className="relative group">
                                    <button
                                        onClick={() => setShowStatusSubMenu(!showStatusSubMenu)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                    >
                                        <span className="flex items-center gap-2"><TrendingUp size={14} /> Change Status</span>
                                        <ChevronDown size={12} className="-rotate-90" />
                                    </button>
                                    {/* Mobile/Simple approach: Just toggle sub-menu below or use a portal. For now, absolute positioning to the left or right? 
                                        Let's just drop it down or overlay. 
                                        Actually, let's keep it simple: Expand in place or simple list.
                                    */}
                                    {showStatusSubMenu && (
                                        <div className="absolute top-0 right-full mr-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                            {stages.map(stage => (
                                                <button
                                                    key={stage.id}
                                                    onClick={() => handleBulkStatusChange(stage.name)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    {stage.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="h-px bg-gray-100 my-1"></div>
                                <button onClick={handleBulkDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete Selected
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <button onClick={onOpenImport} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={14} /> Import
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <ArrowUpFromLine size={14} /> Export
                    </button>
                    <button onClick={onOpenAddLead} className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
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
                                        checked={selectedLeads.length === sortedLeads.length && sortedLeads.length > 0}
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
                            {sortedLeads.map((lead, index) => {
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
                                            {lead.status === 'Closed' && <Badge variant="warning">Word-of-mouth</Badge>}
                                            {!['New', 'Contacted', 'Qualified', 'Closed'].includes(lead.status) && <Badge variant="neutral">Outreach</Badge>}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Footnote */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                    <span>Showing {sortedLeads.length} items</span>
                    <div className="flex gap-2">
                        <button className="hover:text-gray-900 disabled:opacity-50" disabled>Previous</button>
                        <button className="hover:text-gray-900">Next</button>
                    </div>
                </div>
            </GlassCard>
        </div >
    );
};