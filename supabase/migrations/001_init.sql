-- Rooms (shareable camp workspaces)
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code char(6) not null unique,
  admin_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Room members (anyone who joined via code)
create table room_members (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- Inventory items
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text not null,
  category text not null,
  quantity integer not null default 1,
  unit text not null,
  needed integer not null default 1,
  arrived integer not null default 0,
  assigned_to text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Receipts
create table receipts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  submitted_by_id uuid references auth.users(id),
  submitted_by_name text not null,
  vendor text,
  receipt_date date,
  subtotal numeric(10,2),
  tax numeric(10,2),
  total numeric(10,2) not null,
  image_url text,
  reimbursed boolean default false,
  reimbursed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Receipt line items
create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references receipts(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null
);

-- RLS Policies
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table inventory_items enable row level security;
alter table receipts enable row level security;
alter table receipt_items enable row level security;

-- Room members can see rooms they belong to
create policy "members can view room" on rooms
  for select using (
    auth.uid() = admin_id or
    exists (select 1 from room_members where room_id = rooms.id and user_id = auth.uid())
  );

-- Anyone authenticated can create a room
create policy "auth users can create rooms" on rooms
  for insert with check (auth.uid() = admin_id);

-- Members can view/edit inventory in their rooms
create policy "members can view inventory" on inventory_items
  for select using (
    exists (select 1 from room_members where room_id = inventory_items.room_id and user_id = auth.uid())
    or exists (select 1 from rooms where id = inventory_items.room_id and admin_id = auth.uid())
  );

create policy "members can edit inventory" on inventory_items
  for all using (
    exists (select 1 from room_members where room_id = inventory_items.room_id and user_id = auth.uid())
    or exists (select 1 from rooms where id = inventory_items.room_id and admin_id = auth.uid())
  );

-- Same for receipts
create policy "members can view receipts" on receipts
  for select using (
    exists (select 1 from room_members where room_id = receipts.room_id and user_id = auth.uid())
    or exists (select 1 from rooms where id = receipts.room_id and admin_id = auth.uid())
  );

create policy "members can insert receipts" on receipts
  for insert with check (auth.uid() = submitted_by_id);

create policy "admin can update receipts" on receipts
  for update using (
    exists (select 1 from rooms where id = receipts.room_id and admin_id = auth.uid())
  );

create policy "members can view receipt items" on receipt_items
  for select using (
    exists (
      select 1 from receipts r
      join room_members rm on rm.room_id = r.room_id
      where r.id = receipt_items.receipt_id and rm.user_id = auth.uid()
    )
    or exists (
      select 1 from receipts r
      join rooms ro on ro.id = r.room_id
      where r.id = receipt_items.receipt_id and ro.admin_id = auth.uid()
    )
  );

create policy "members can insert receipt items" on receipt_items
  for insert with check (
    exists (
      select 1 from receipts r
      join room_members rm on rm.room_id = r.room_id
      where r.id = receipt_items.receipt_id and rm.user_id = auth.uid()
    )
    or exists (
      select 1 from receipts r
      join rooms ro on ro.id = r.room_id
      where r.id = receipt_items.receipt_id and ro.admin_id = auth.uid()
    )
  );

-- Also allow admin to be a room_member (for policy completeness)
create policy "users can join rooms" on room_members
  for insert with check (auth.uid() = user_id);

create policy "members can view room_members" on room_members
  for select using (
    exists (select 1 from room_members rm2 where rm2.room_id = room_members.room_id and rm2.user_id = auth.uid())
    or exists (select 1 from rooms where id = room_members.room_id and admin_id = auth.uid())
  );
