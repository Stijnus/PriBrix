-- Enable async HTTP and cron scheduler
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- Schedule daily price ingestion at 06:00 UTC.
--
-- The function optionally validates the x-ingestion-secret header against
-- the INGESTION_SECRET edge function secret. To pass the secret from the
-- cron job, set it at the database level once:
--
--   ALTER DATABASE postgres SET app.ingestion_secret = 'your-secret-here';
--
-- If app.ingestion_secret is not configured, current_setting returns ''
-- and the function allows the request (no secret = open internal trigger).
select cron.schedule(
  'ingest-daily-prices',
  '0 6 * * *',
  $$
  select extensions.http_post(
    url     := 'https://zecyfmxxbuwyhjyehmdq.supabase.co/functions/v1/ingest_daily_prices',
    params  := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type',       'application/json',
      'x-ingestion-secret', coalesce(current_setting('app.ingestion_secret', true), '')
    )
  );
  $$
);
