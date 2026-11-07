-- CASEWORK synthetic AI demo usage control.
-- Apply only to a dedicated CASEWORK database; not to customer or LaunchLab data.
CREATE TABLE IF NOT EXISTS ai_usage (
 day_utc date NOT NULL,
 workspace text NOT NULL,
 count integer NOT NULL DEFAULT 0 CHECK (count >= 0),
 PRIMARY KEY (day_utc, workspace)
);
CREATE OR REPLACE FUNCTION reserve_ai_call(
 p_workspace text,
 p_daily_limit integer DEFAULT 12,
 p_workspace_limit integer DEFAULT 3
) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
 total_used integer;
 visitor_used integer;
 day_key date := (now() AT TIME ZONE 'utc')::date;
BEGIN
 IF length(p_workspace) < 16 OR length(p_workspace) > 120 THEN RETURN false; END IF;
 -- Serialise reservations to prevent concurrent calls overshooting global quota.
 PERFORM pg_advisory_xact_lock(hashtext('casework-ai-quota-' || day_key::text));
 SELECT COALESCE(sum(count),0) INTO total_used FROM ai_usage WHERE day_utc=day_key;
 SELECT COALESCE(count,0) INTO visitor_used FROM ai_usage WHERE day_utc=day_key AND workspace=p_workspace;
 IF total_used>=p_daily_limit OR visitor_used>=p_workspace_limit THEN RETURN false; END IF;
 INSERT INTO ai_usage(day_utc,workspace,count) VALUES (day_key,p_workspace,1)
 ON CONFLICT(day_utc,workspace) DO UPDATE SET count=ai_usage.count+1;
 RETURN true;
END $$;
