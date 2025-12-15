
-- Create Workspaces Table
create table if not exists workspaces (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  owner_user_id uuid references auth.users not null
);

alter table workspaces enable row level security;

-- Create Profiles Table (extends auth.users)
-- This stores user details like full_name and avatar_url
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  workspace_id uuid references workspaces(id),
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

-- Create Subscriptions Table
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  workspace_id uuid references workspaces(id) not null,
  plan_name text not null default 'Free', -- 'Free', 'Pro', 'Enterprise'
  status text not null default 'active', -- 'active', 'canceled', 'past_due'
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false
);

alter table subscriptions enable row level security;

-- Create Invoices Table
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  subscription_id uuid references subscriptions(id) not null,
  amount numeric not null,
  currency text default 'usd',
  status text default 'paid', -- 'paid', 'open', 'void'
  pdf_url text
);

alter table invoices enable row level security;

-- Create Pipelines Table
create table if not exists pipelines (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  workspace_id uuid references workspaces(id) not null,
  is_default boolean default false
);

alter table pipelines enable row level security;

-- Create Pipeline Stages Table
create table if not exists pipeline_stages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  pipeline_id uuid references pipelines(id) on delete cascade not null,
  order_index integer default 0,
  color text
);

alter table pipeline_stages enable row level security;

-- Create Leads Table
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  email text,
  phone text,
  value numeric default 0,
  status text default 'Open', -- Open, Won, Lost
  source text,
  notes text,
  workspace_id uuid references workspaces(id) not null,
  pipeline_stage_id uuid references pipeline_stages(id),
  owner_user_id uuid references auth.users(id),
  tags text[] default '{}'
);

alter table leads enable row level security;


-- POLICIES --

-- Workspaces
do $$ begin
  create policy "Users can view own workspaces" on workspaces for select using (auth.uid() = owner_user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert own workspaces" on workspaces for insert with check (auth.uid() = owner_user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update own workspaces" on workspaces for update using (auth.uid() = owner_user_id);
exception when duplicate_object then null;
end $$;

-- Profiles
do $$ begin
  create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null;
end $$;

-- Subscriptions: Access based on workspace ownership
do $$ begin
  create policy "Users can view subscriptions for their workspace" on subscriptions
    for select using (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- Invoices: Access based on subscription -> workspace ownership
do $$ begin
  create policy "Users can view invoices for their workspace" on invoices
    for select using (
      subscription_id in (
        select id from subscriptions where workspace_id in (
          select id from workspaces where owner_user_id = auth.uid()
        )
      )
    );
exception when duplicate_object then null;
end $$;

-- Pipelines
do $$ begin
  create policy "Users can view pipelines in their workspace" on pipelines
    for select using (
      workspace_id in (select id from profiles where profiles.id = auth.uid())
      or 
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert pipelines in their workspace" on pipelines
    for insert with check (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update pipelines in their workspace" on pipelines
    for update using (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- Pipeline Stages
do $$ begin
  create policy "Users can view stages" on pipeline_stages
    for select using (
      pipeline_id in (
        select id from pipelines where workspace_id in (
          select id from workspaces where owner_user_id = auth.uid()
        )
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert stages" on pipeline_stages
    for insert with check (
      pipeline_id in (
        select id from pipelines where workspace_id in (
          select id from workspaces where owner_user_id = auth.uid()
        )
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update stages" on pipeline_stages
    for update using (
      pipeline_id in (
        select id from pipelines where workspace_id in (
          select id from workspaces where owner_user_id = auth.uid()
        )
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete stages" on pipeline_stages
    for delete using (
      pipeline_id in (
        select id from pipelines where workspace_id in (
          select id from workspaces where owner_user_id = auth.uid()
        )
      )
    );
exception when duplicate_object then null;
end $$;

-- Leads
do $$ begin
  create policy "Users can view leads in their workspace" on leads
    for select using (
      workspace_id in (select id from profiles where profiles.id = auth.uid())
      or
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert leads in their workspace" on leads
    for insert with check (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update leads in their workspace" on leads
    for update using (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete leads in their workspace" on leads
    for delete using (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;


-- Functions & Triggers --

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
  new_pipeline_id uuid;
begin
  -- 1. Create a default workspace
  insert into public.workspaces (name, owner_user_id)
  values (coalesce(new.email, 'New User') || '''s Workspace', new.id)
  returning id into new_workspace_id;

  -- 2. Create a profile linked to that workspace
  insert into public.profiles (id, full_name, avatar_url, workspace_id)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new_workspace_id);

  -- 3. Create default subscription (Free)
  insert into public.subscriptions (workspace_id, plan_name, status)
  values (new_workspace_id, 'Free', 'active');

  -- 4. Create default pipeline
  insert into public.pipelines (name, workspace_id, is_default)
  values ('Sales Pipeline', new_workspace_id, true)
  returning id into new_pipeline_id;

  -- 5. Create default stages
  insert into public.pipeline_stages (name, pipeline_id, order_index, color)
  values 
    ('New', new_pipeline_id, 0, 'bg-gray-200'),
    ('Contacted', new_pipeline_id, 1, 'bg-blue-200'),
    ('Qualified', new_pipeline_id, 2, 'bg-indigo-200'),
    ('Negotiation', new_pipeline_id, 3, 'bg-orange-200'),
    ('Closed', new_pipeline_id, 4, 'bg-green-200'),
    ('Lost', new_pipeline_id, 5, 'bg-red-200');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger: on_auth_user_created
-- Safe drop before create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Activities Table
create table if not exists activities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  workspace_id uuid references workspaces(id) not null,
  user_id uuid references profiles(id), -- Nullable if system action. References profiles for easy joins.
  action text not null,
  target text,
  metadata jsonb -- For extra details if needed
);

alter table activities enable row level security;

-- Activities Policies
-- Activities Policies
do $$ begin
  create policy "Users can view activities in their workspace" on activities
    for select using (
      workspace_id in (select id from workspaces where owner_user_id = auth.uid())
      or
      workspace_id in (select id from profiles where profiles.id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- Function to log lead activity
create or replace function public.log_lead_activity()
returns trigger as $$
declare
  w_id uuid;
  u_id uuid;
  act text;
  tgt text;
begin
  -- Try to get user_id from auth.uid() if available, otherwise it works as system/trigger
  -- Note: In triggers, auth.uid() works if invoked via API
  u_id := auth.uid();
  
  if (TG_OP = 'INSERT') then
    w_id := new.workspace_id;
    act := 'Created new lead';
    tgt := new.name;
  elsif (TG_OP = 'UPDATE') then
    w_id := new.workspace_id;
    tgt := new.name;
    if (old.status <> new.status) then
       act := 'Updated status to ' || new.status;
    elsif (old.pipeline_stage_id <> new.pipeline_stage_id) then
       act := 'Moved lead';
    else
       act := 'Updated lead details';
    end if;
  elsif (TG_OP = 'DELETE') then
    w_id := old.workspace_id;
    act := 'Deleted lead';
    tgt := old.name;
  end if;

  insert into public.activities (workspace_id, user_id, action, target)
  values (w_id, u_id, act, tgt);

  return null;
end;
$$ language plpgsql security definer;

-- Trigger for Lead Logging
drop trigger if exists on_lead_change on leads;
create trigger on_lead_change
  after insert or update or delete on leads
  for each row execute procedure public.log_lead_activity();
