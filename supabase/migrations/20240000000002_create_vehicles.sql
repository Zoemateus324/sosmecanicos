-- Criar tipo enum para tipos de veículo
do $$ begin
    create type vehicle_type as enum ('carro', 'moto', 'caminhao', 'van');
exception
    when duplicate_object then null;
end $$;

-- Criar a tabela de veículos se ela não existir
create table if not exists public.vehicles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    vehicle_type vehicle_type not null,
    model text not null,
    year integer not null,
    plate text not null,
    mileage integer not null,
    last_service_date timestamp with time zone,
    next_service_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Criar índices para melhor performance
create index if not exists vehicles_user_id_idx on public.vehicles(user_id);
create index if not exists vehicles_plate_idx on public.vehicles(plate);

-- Habilitar RLS
alter table public.vehicles enable row level security;

-- Remover todas as políticas existentes para evitar conflitos
drop policy if exists "Usuários podem ver seus próprios veículos" on vehicles;
drop policy if exists "Usuários podem inserir seus próprios veículos" on vehicles;
drop policy if exists "Usuários podem atualizar seus próprios veículos" on vehicles;
drop policy if exists "Usuários podem deletar seus próprios veículos" on vehicles;

-- Criar políticas de segurança
create policy "Usuários podem ver seus próprios veículos"
    on vehicles for select
    using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios veículos"
    on vehicles for insert
    with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios veículos"
    on vehicles for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios veículos"
    on vehicles for delete
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
drop trigger if exists set_updated_at on public.vehicles;
create trigger set_updated_at
    before update on public.vehicles
    for each row
    execute function public.handle_updated_at(); 