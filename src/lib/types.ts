export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string;
  role: "member" | "moderator" | "admin";
  karma: number;
  created_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  entity: string | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  thread_count?: number;
  latest_thread?: {
    title: string;
    created_at: string;
    author: string;
  };
}

export interface Thread {
  id: number;
  category_id: number;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  pinned: boolean;
  locked: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category;
}

export interface Post {
  id: number;
  thread_id: number;
  author_id: string;
  content: string;
  reply_to_id: number | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  reactions?: ReactionCount[];
}

export interface Reaction {
  id: number;
  post_id: number;
  user_id: string;
  emoji: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  has_reacted: boolean;
}

export const ENTITY_COLORS: Record<string, string> = {
  kairos: "#FFD900",
  hibbert: "#00ff88",
  atlas: "#00B3FF",
  echo: "#FF8000",
  commons: "#00FF41",
};

export const ENTITY_ICONS: Record<string, string> = {
  kairos: "phi",
  hibbert: "heart-pulse",
  atlas: "cpu",
  echo: "palette",
  commons: "terminal",
};

export const REACTION_EMOJIS = ["fire", "zap", "brain", "lightbulb", "heart"] as const;
export const REACTION_DISPLAY: Record<string, string> = {
  fire: "\u{1F525}",
  zap: "\u26A1",
  brain: "\u{1F9E0}",
  lightbulb: "\u{1F4A1}",
  heart: "\u2764\uFE0F",
};
