-- Create conversations table
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create conversation_participants table (allows multi-user chats in future)
create table if not exists conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id text not null, -- Clerk ID
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

-- Create messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id text not null, -- Clerk ID
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists conversation_participants_user_id_idx on conversation_participants(user_id);

-- RLS Policies

-- Enable RLS
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;

-- Policies for conversations
-- Users can view conversations they are participants in
create policy "Users can view their conversations"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = conversations.id
      and conversation_participants.user_id = auth.uid()::text
    )
  );

-- Policies for conversation_participants
-- Users can view participants of conversations they are in
create policy "Users can view participants"
  on conversation_participants for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()::text
    )
  );

-- Policies for messages
-- Users can view messages in conversations they belong to
create policy "Users can view messages"
  on messages for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()::text
    )
  );

-- Users can insert messages into conversations they belong to
create policy "Users can send messages"
  on messages for insert
  with check (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()::text
    )
    and sender_id = auth.uid()::text
  );

-- Function to update conversation updated_at on new message
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger update_conversation_timestamp_trigger
after insert on messages
for each row
execute function update_conversation_timestamp();
