-- Allow organizers to view registrations for their own events
create policy "Organizers can view registrations for their own events"
  on event_registrations for select
  using (
    auth.uid()::text in (
      select created_by_user_id from events where id = event_id
    )
  );

-- Allow organizers to update registrations for their own events (e.g. confirm payment)
create policy "Organizers can update registrations for their own events"
  on event_registrations for update
  using (
    auth.uid()::text in (
      select created_by_user_id from events where id = event_id
    )
  );
