export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Negotiation' | 'Closed' | 'Lost' | 'Won';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  value: number;
  status: LeadStatus;
  stageId: string;
  ownerId: string;
  createdAt: string;
  avatarUrl?: string;
  tags?: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface DashboardMetrics {
  totalPipelineValue: number;
  dealsWon: number;
  newLeads: number;
  conversionRate: number;
}
