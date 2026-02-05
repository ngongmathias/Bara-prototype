CREATE OR REPLACE FUNCTION public.get_clerk_user_counts()
RETURNS TABLE (
  total_users bigint,
  new_this_month bigint,
  last_month_users bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('month', now()) AS this_month_start,
      date_trunc('month', now()) - interval '1 month' AS last_month_start
  )
  SELECT
    (SELECT count(*) FROM public.clerk_users) AS total_users,
    (SELECT count(*) FROM public.clerk_users cu, bounds b WHERE cu.created_at >= b.this_month_start) AS new_this_month,
    (SELECT count(*) FROM public.clerk_users cu, bounds b WHERE cu.created_at >= b.last_month_start AND cu.created_at < b.this_month_start) AS last_month_users;
$$;

GRANT EXECUTE ON FUNCTION public.get_clerk_user_counts() TO anon;
GRANT EXECUTE ON FUNCTION public.get_clerk_user_counts() TO authenticated;


CREATE OR REPLACE FUNCTION public.get_clerk_user_new_by_month(months integer)
RETURNS TABLE (
  month_start date,
  new_users bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH month_series AS (
    SELECT
      (date_trunc('month', now()) - (gs.n || ' months')::interval)::date AS month_start,
      (date_trunc('month', now()) - (gs.n || ' months')::interval + interval '1 month')::date AS next_month_start
    FROM generate_series(0, greatest(months - 1, 0)) AS gs(n)
  )
  SELECT
    ms.month_start,
    COALESCE(
      (
        SELECT count(*)
        FROM public.clerk_users cu
        WHERE cu.created_at >= ms.month_start
          AND cu.created_at < ms.next_month_start
      ),
      0
    ) AS new_users
  FROM month_series ms
  ORDER BY ms.month_start;
$$;

GRANT EXECUTE ON FUNCTION public.get_clerk_user_new_by_month(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_clerk_user_new_by_month(integer) TO authenticated;
