import { Lead, Pipeline, User } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Jessica Parker',
  email: 'jessica@rellio.app',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

export const RECENT_ACTIVITY = [
    { id: 1, user: 'Alex Morgan', action: 'closed a deal', target: 'Acme Corp', time: '2m', initials: 'AM' },
    { id: 2, user: 'Sarah Connor', action: 'added lead', target: 'Cyberdyne', time: '1h', initials: 'SC' },
    { id: 3, user: 'John Doe', action: 'moved stage', target: 'Stark Ind', time: '3h', initials: 'JD' },
    { id: 4, user: 'Ellen Ripley', action: 'emailed', target: 'Weyland-Yutani', time: '5h', initials: 'ER' },
    { id: 5, user: 'Bruce Wayne', action: 'updated value', target: 'Wayne Ent', time: '1d', initials: 'BW' },
];

export const DEFAULT_PIPELINE: Pipeline = {
  id: 'p1',
  name: 'Sales Pipeline',
  stages: [
    { id: 'stage-new', name: 'New Lead', order: 0, color: 'bg-gray-200' },
    { id: 'stage-contacted', name: 'Contacted', order: 1, color: 'bg-blue-200' },
    { id: 'stage-qualified', name: 'Qualified', order: 2, color: 'bg-indigo-200' },
    { id: 'stage-negotiation', name: 'Negotiation', order: 3, color: 'bg-purple-200' },
    { id: 'stage-won', name: 'Closed Won', order: 4, color: 'bg-green-200' },
  ],
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Tyra Dhillon',
    company: 'Acme',
    email: 'tyradhillon@acme.com',
    value: 3912,
    status: 'New',
    stageId: 'stage-new',
    ownerId: 'u1',
    createdAt: '2023-10-01',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  },
  {
    id: 'l2',
    name: 'Brittni Lando',
    company: 'Academic Project',
    email: 'lando@academicproject.com',
    value: 2345,
    status: 'Contacted',
    stageId: 'stage-contacted',
    ownerId: 'u1',
    createdAt: '2023-09-28',
    avatarUrl: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
  },
  {
    id: 'l3',
    name: 'Kevin Chen',
    company: 'Aimbus',
    email: 'chen@aimbus.com',
    value: 13864,
    status: 'Won',
    stageId: 'stage-won',
    ownerId: 'u1',
    createdAt: '2023-10-05',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  {
    id: 'l4',
    name: 'Josh Ryan',
    company: 'Big Bang Production',
    email: 'joshryan@gmail.com',
    value: 6314,
    status: 'Qualified',
    stageId: 'stage-qualified',
    ownerId: 'u1',
    createdAt: '2023-10-02',
    avatarUrl: '', // No avatar case
  },
  {
    id: 'l5',
    name: 'Chieko Chute',
    company: 'Book Launch',
    email: 'chieko67@booklaunch.com',
    value: 5982,
    status: 'New',
    stageId: 'stage-new',
    ownerId: 'u1',
    createdAt: '2023-10-10',
    avatarUrl: 'https://i.pravatar.cc/150?u=a048581f4e29026704d',
  },
];