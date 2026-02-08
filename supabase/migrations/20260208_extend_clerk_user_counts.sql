CREATE OR REPLACE FUNCTION public.get_clerk_user_counts()
RETURNS TABLE (
  total_users bigint,
  new_today bigint,
  new_last_7_days bigint,
  new_this_month bigint,
  last_month_users bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('day', now()) AS today_start,
      date_trunc('day', now()) - interval '7 days' AS last_7_days_start,
      date_trunc('month', now()) AS this_month_start,
      date_trunc('month', now()) - interval '1 month' AS last_month_start
  )
  SELECT
    (SELECT count(*) FROM public.clerk_users) AS total_users,
    (SELECT count(*) FROM public.clerk_users cu, bounds b WHERE cu.created_at >= b.today_start) AS new_today,
    (SELECT count(*) FROM public.clerk_users cu, bounds b WHERE cu.created_at >= b.last_7_days_start) AS new_last_7_days,
    (SELECT count(*) FROM public.clerk_users cu, bounds b WHERE cu.created_at >= b.this_month_start) AS new_this_month,
    (SELECT count(*) FROM public.clerk_users cu, bounds b WHERE cu.created_at >= b.last_month_start AND cu.created_at < b.this_month_start) AS last_month_users;
$$;

GRANT EXECUTE ON FUNCTION public.get_clerk_user_counts() TO anon;
GRANT EXECUTE ON FUNCTION public.get_clerk_user_counts() TO authenticated;
