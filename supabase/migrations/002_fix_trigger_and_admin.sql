-- ═══════════════════════════════════════════════════════════════
-- FIX: Trigger + Admin User Setup
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_'))
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    display_name = EXCLUDED.display_name;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also allow threads to be updated by anyone (for view_count increment)
DROP POLICY IF EXISTS "threads_update_views" ON threads;
CREATE POLICY "threads_update_views" ON threads
  FOR UPDATE USING (true)
  WITH CHECK (true);
