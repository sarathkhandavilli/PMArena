-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =========================
-- TENANTS
-- =========================
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,

  max_users int not null,
  current_users int default 0,

  is_active boolean default true,

  created_at timestamp default now(),
  created_by uuid,

  updated_at timestamp,
  updated_by uuid,

  deleted_at timestamp
);

-- =========================
-- USERS
-- =========================
create table users (
  id uuid primary key, -- same as auth.users.id

  email text unique not null,
  name text,

  role text not null check (role in ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE')),

  tenant_id uuid,

  is_active boolean default true,

  created_at timestamp default now(),
  created_by uuid,

  updated_at timestamp,
  updated_by uuid,

  deleted_at timestamp
);

-- =========================
-- PROBLEMS
-- =========================
create table problems (
  id uuid primary key default gen_random_uuid(),

  title text,
  user_comment text,
  problem_statement text,

  industry text,
  sub_industry text,
  company text,
  signal text,
  severity int,

  department text,

  is_active boolean default true,

  created_at timestamp default now(),
  created_by uuid,

  updated_at timestamp,
  updated_by uuid,

  deleted_at timestamp
);

-- =========================
-- IMPORTS
-- =========================
create table imports (
  id uuid primary key default gen_random_uuid(),

  file_name text,
  uploaded_by uuid,

  rows_processed int,
  status text,

  created_at timestamp default now(),
  created_by uuid,

  updated_at timestamp,
  updated_by uuid,

  deleted_at timestamp
);

-- =========================
-- SOLUTIONS
-- =========================
create table solutions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid,
  problem_id uuid,

  root_cause text,
  solution text,
  metrics text,
  experiment text,

  score int,
  max_score int,

  created_at timestamp default now(),
  created_by uuid,

  updated_at timestamp,
  updated_by uuid,

  deleted_at timestamp
);

-- =========================
-- SCORES
-- =========================
create table scores (
  id uuid primary key default gen_random_uuid(),

  user_id uuid,
  problem_id uuid,

  score int,

  created_at timestamp default now(),
  created_by uuid,

  updated_at timestamp,
  updated_by uuid,

  deleted_at timestamp
);

-- =========================
-- ADMIN AUDIT LOGS
-- =========================
create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),

  admin_user_id uuid,
  action text,

  target_entity text,
  target_id uuid,

  details jsonb,

  created_at timestamp default now()
);

-- =========================
-- RELATIONSHIPS
-- =========================

-- Users ↔ Tenants
alter table users
add constraint fk_users_tenant
foreign key (tenant_id) references tenants(id);

-- Tenants audit
alter table tenants
add constraint fk_tenants_created_by foreign key (created_by) references users(id),
add constraint fk_tenants_updated_by foreign key (updated_by) references users(id);

-- Users audit (self reference)
alter table users
add constraint fk_users_created_by foreign key (created_by) references users(id),
add constraint fk_users_updated_by foreign key (updated_by) references users(id);

-- Problems audit
alter table problems
add constraint fk_problems_created_by foreign key (created_by) references users(id),
add constraint fk_problems_updated_by foreign key (updated_by) references users(id);

-- Imports
alter table imports
add constraint fk_imports_uploaded_by foreign key (uploaded_by) references users(id),
add constraint fk_imports_created_by foreign key (created_by) references users(id),
add constraint fk_imports_updated_by foreign key (updated_by) references users(id);

-- Solutions
alter table solutions
add constraint fk_solutions_user foreign key (user_id) references users(id),
add constraint fk_solutions_problem foreign key (problem_id) references problems(id),
add constraint fk_solutions_created_by foreign key (created_by) references users(id),
add constraint fk_solutions_updated_by foreign key (updated_by) references users(id);

-- Scores
alter table scores
add constraint fk_scores_user foreign key (user_id) references users(id),
add constraint fk_scores_problem foreign key (problem_id) references problems(id),
add constraint fk_scores_created_by foreign key (created_by) references users(id),
add constraint fk_scores_updated_by foreign key (updated_by) references users(id);

-- Admin logs
alter table admin_audit_logs
add constraint fk_admin_logs_user foreign key (admin_user_id) references users(id);