-- Construction Cost Estimation schema
-- PostgreSQL / Supabase compatible

-- Projects
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

-- Cost categories (Material, Labor, Equipment, ...)
create table if not exists cost_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    created_at timestamptz not null default now()
);

-- Unit cost rates (versioned by effective_date / region)
create table if not exists cost_rates (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references cost_categories(id) on delete restrict,
    code text not null,
    name text not null,
    unit text not null,
    rate numeric(18,4) not null check (rate >= 0),
    currency text not null default 'ETB',
    region text,
    source text,
    effective_date date,
    notes text,
    created_at timestamptz not null default now(),
    unique (code, region, effective_date)
);

create index if not exists idx_cost_rates_category_id on cost_rates(category_id);
create index if not exists idx_cost_rates_region on cost_rates(region);

-- Rate analyses (assembled unit rates from components)
create table if not exists rate_analyses (
    id uuid primary key default gen_random_uuid(),
    code text not null,
    description text not null,
    unit text not null,
    region text,
    currency text not null default 'ETB',
    created_at timestamptz not null default now()
);

create table if not exists rate_analysis_components (
    id uuid primary key default gen_random_uuid(),
    rate_analysis_id uuid not null references rate_analyses(id) on delete cascade,
    cost_rate_id uuid not null references cost_rates(id) on delete restrict,
    quantity numeric(18,6) not null check (quantity >= 0),
    waste_percent numeric(8,4) not null default 0 check (waste_percent >= 0),
    unit_rate_snapshot numeric(18,4) not null check (unit_rate_snapshot >= 0),
    amount numeric(18,2) generated always as (
        (quantity * (1 + waste_percent / 100) * unit_rate_snapshot)::numeric(18,2)
    ) stored,
    created_at timestamptz not null default now()
);

create index if not exists idx_rate_analysis_components_analysis
    on rate_analysis_components(rate_analysis_id);

-- BOQ sections (work packages / chapters)
create table if not exists boq_sections (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    name text not null,
    code text,
    description text,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_boq_sections_project_id on boq_sections(project_id);

-- BOQ items
create table if not exists boq_items (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    section_id uuid references boq_sections(id) on delete set null,
    rate_analysis_id uuid references rate_analyses(id) on delete set null,
    item_no integer not null check (item_no >= 1),
    description text not null,
    unit text not null,
    quantity numeric(18,4) not null check (quantity > 0),
    unit_rate numeric(18,4) not null check (unit_rate >= 0),
    amount numeric(18,2) generated always as (quantity * unit_rate) stored,
    created_at timestamptz not null default now(),
    unique (project_id, item_no)
);

create index if not exists idx_boq_items_project_id on boq_items(project_id);
create index if not exists idx_boq_items_section_id on boq_items(section_id);

-- Estimate versions (snapshots of BOQ with markups)
create table if not exists estimate_versions (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    version_no integer not null check (version_no >= 1),
    name text not null,
    overhead_percent numeric(8,4) not null default 0 check (overhead_percent >= 0),
    profit_percent numeric(8,4) not null default 0 check (profit_percent >= 0),
    contingency_percent numeric(8,4) not null default 0 check (contingency_percent >= 0),
    notes text,
    created_at timestamptz not null default now(),
    unique (project_id, version_no)
);

create index if not exists idx_estimate_versions_project_id on estimate_versions(project_id);

create table if not exists estimate_version_items (
    id uuid primary key default gen_random_uuid(),
    estimate_version_id uuid not null references estimate_versions(id) on delete cascade,
    item_no integer not null,
    description text not null,
    unit text not null,
    quantity numeric(18,4) not null,
    unit_rate numeric(18,4) not null,
    amount numeric(18,2) generated always as (quantity * unit_rate) stored,
    section_name text,
    created_at timestamptz not null default now()
);

create index if not exists idx_estimate_version_items_version
    on estimate_version_items(estimate_version_id);

-- Optional: keep the original simple estimate_items for early prototypes
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
    unique (project_id, item_no)
);

create index if not exists idx_estimate_items_project_id on estimate_items(project_id);
