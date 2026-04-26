-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Children table
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  birthday date not null,
  created_at timestamptz default now()
);

-- Meal records table
create table public.meal_records (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date not null,
  meal_time text check (meal_time in ('morning', 'noon', 'evening', 'snack')) not null,
  foods jsonb default '[]',
  notes text default '',
  photo_urls text[] default '{}',
  created_at timestamptz default now()
);

-- Allergy records table
create table public.allergy_records (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  food_name text not null,
  severity text check (severity in ('mild', 'moderate', 'severe')) not null,
  notes text default '',
  date date not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.children enable row level security;
alter table public.meal_records enable row level security;
alter table public.allergy_records enable row level security;

-- Children policies
create policy "Users can view own children" on public.children
  for select using (auth.uid() = user_id);
create policy "Users can insert own children" on public.children
  for insert with check (auth.uid() = user_id);
create policy "Users can update own children" on public.children
  for update using (auth.uid() = user_id);
create policy "Users can delete own children" on public.children
  for delete using (auth.uid() = user_id);

-- Meal records policies
create policy "Users can view own meal records" on public.meal_records
  for select using (
    child_id in (select id from public.children where user_id = auth.uid())
  );
create policy "Users can insert own meal records" on public.meal_records
  for insert with check (
    child_id in (select id from public.children where user_id = auth.uid())
  );
create policy "Users can update own meal records" on public.meal_records
  for update using (
    child_id in (select id from public.children where user_id = auth.uid())
  );
create policy "Users can delete own meal records" on public.meal_records
  for delete using (
    child_id in (select id from public.children where user_id = auth.uid())
  );

-- Allergy records policies
create policy "Users can view own allergy records" on public.allergy_records
  for select using (
    child_id in (select id from public.children where user_id = auth.uid())
  );
create policy "Users can insert own allergy records" on public.allergy_records
  for insert with check (
    child_id in (select id from public.children where user_id = auth.uid())
  );
create policy "Users can update own allergy records" on public.allergy_records
  for update using (
    child_id in (select id from public.children where user_id = auth.uid())
  );
create policy "Users can delete own allergy records" on public.allergy_records
  for delete using (
    child_id in (select id from public.children where user_id = auth.uid())
  );

-- Storage bucket for meal photos
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', true);

-- Storage policies
create policy "Users can upload meal photos" on storage.objects
  for insert with check (bucket_id = 'meal-photos' and auth.role() = 'authenticated');
create policy "Anyone can view meal photos" on storage.objects
  for select using (bucket_id = 'meal-photos');
create policy "Users can delete own meal photos" on storage.objects
  for delete using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
