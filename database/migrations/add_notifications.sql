-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Clerk ID
  title text not null,
  message text not null,
  type text default 'info', -- info, success, warning, error
  link text, -- optional URL to invite user to click
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notifications enable row level security;

-- Policy: Users can view their own notifications
create policy "Users can view their own notifications"
  on notifications for select
  using (user_id = auth.uid()::text);

-- Policy: Users can update their own notifications (mark as read)
create policy "Users can update their own notifications"
  on notifications for update
  using (user_id = auth.uid()::text);

-- Policy: Authenticated users can insert notifications (e.g. user A follows user B, notifies B)
-- Note: In production, this should be stricter or handled via Edge Functions/Triggers
create policy "Authenticated users can insert notifications"
  on notifications for insert
  with check (auth.role() = 'authenticated');

-- Create index for performance
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_is_read_idx on notifications(is_read);
