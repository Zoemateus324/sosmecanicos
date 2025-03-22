-- Criar a tabela de solicitações de serviço
create table if not exists public.service_requests (
    id uuid default gen_random_uuid() primary key,
    vehicle_id uuid references public.vehicles(id) not null,
    user_id uuid references auth.users(id) not null,
    service_type text not null,
    scheduled_date timestamp with time zone not null,
    description text,
    status text not null default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Criar índices
create index if not exists service_requests_vehicle_id_idx on public.service_requests(vehicle_id);
create index if not exists service_requests_user_id_idx on public.service_requests(user_id);
create index if not exists service_requests_status_idx on public.service_requests(status);

-- Habilitar RLS
alter table public.service_requests enable row level security;

-- Remover todas as políticas existentes para evitar conflitos
drop policy if exists "Usuários podem ver suas próprias solicitações" on service_requests;
drop policy if exists "Usuários podem criar solicitações" on service_requests;
drop policy if exists "Usuários podem atualizar suas próprias solicitações" on service_requests;
drop policy if exists "Usuários podem deletar suas próprias solicitações" on service_requests;

-- Criar políticas de segurança
create policy "Usuários podem ver suas próprias solicitações"
    on service_requests for select
    using (auth.uid() = user_id);

create policy "Usuários podem criar solicitações"
    on service_requests for insert
    with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias solicitações"
    on service_requests for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias solicitações"
    on service_requests for delete
    using (auth.uid() = user_id);

-- Função para atualizar o updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Trigger para atualizar o updated_at antes de cada update
drop trigger if exists set_service_requests_updated_at on public.service_requests;
create trigger set_service_requests_updated_at
    before update on public.service_requests
    for each row
    execute function public.handle_updated_at(); 