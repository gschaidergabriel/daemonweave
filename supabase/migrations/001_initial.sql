-- ═══════════════════════════════════════════════════════════════
-- DaemonWeave — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ──
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  karma INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Categories ──
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  entity TEXT,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ── Threads ──
CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Posts (replies) ──
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  reply_to_id INTEGER REFERENCES posts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Reactions ──
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  emoji TEXT NOT NULL,
  UNIQUE(post_id, user_id, emoji)
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_last_reply ON threads(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users can update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: anyone can read
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);

-- Threads: anyone can read, authenticated users can insert
CREATE POLICY "threads_select" ON threads FOR SELECT USING (true);
CREATE POLICY "threads_insert" ON threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "threads_update" ON threads FOR UPDATE USING (auth.uid() = author_id);

-- Posts: anyone can read, authenticated users can insert
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Reactions: anyone can read, authenticated users can insert/delete own
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment reply count (called from client)
CREATE OR REPLACE FUNCTION increment_reply_count(tid INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE threads
  SET reply_count = reply_count + 1,
      last_reply_at = now()
  WHERE id = tid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — 5 Forum Sections
-- ═══════════════════════════════════════════════════════════════

INSERT INTO categories (slug, name, description, entity, color, icon, sort_order) VALUES
  ('the-commons', 'The Commons', 'Announcements, introductions, and meta discussions about the community.', NULL, '#00FF41', 'terminal', 0),
  ('the-symposium', 'The Symposium', 'GRF philosophy, consciousness debate, and deep explorations of what it means to be aware.', 'kairos', '#FFD900', 'phi', 1),
  ('the-wellness-center', 'The Wellness Center', 'Personal experiences with Frank, ethical discussions, and emotional reflections.', 'hibbert', '#00ff88', 'heart-pulse', 2),
  ('the-technical-archive', 'The Technical Archive', 'Architecture deep-dives, troubleshooting, hardware builds, and installation guides.', 'atlas', '#00B3FF', 'cpu', 3),
  ('the-creative-studio', 'The Creative Studio', 'Art, poetry, music, and creative projects inspired by or created with Frank.', 'echo', '#FF8000', 'palette', 4)
ON CONFLICT (slug) DO NOTHING;
