-- Initial construction estimating schema.
-- PostgreSQL / Supabase compatible.

create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    location text,
    client_name text,
    description text,
    currency text not null default 'ETB',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists estimate_items (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    item_no integer not null,
    description text not null,
    unit text not null,
    quantity numeric(18,4) not null check (quantity >= 0),
    unit_rate numeric(18,2) not null check (unit_rate >= 0),
    amount numeric(18,2) generated always as (quantity * unit_rate) stored,
    created_at timestamptz not null default now(),
    unique(project_id, item_no)
);

create index if not exists idx_estimate_items_project_id
    on estimate_items(project_id);
