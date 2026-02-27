"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import { REACTION_DISPLAY, REACTION_EMOJIS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import MarkdownRenderer from "./MarkdownRenderer";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  post: Post;
  entityColor?: string;
  currentUserId?: string;
  isOP?: boolean;
  onReply?: (postId: number) => void;
}

export default function PostCard({
  post,
  entityColor,
  currentUserId,
  isOP,
  onReply,
}: Props) {
  const [reactions, setReactions] = useState(post.reactions || []);
  const supabase = createClient();
  const color = entityColor || "#00FF41";

  const toggleReaction = async (emoji: string) => {
    if (!currentUserId) return;

    const existing = reactions.find(
      (r) => r.emoji === emoji && r.has_reacted
    );

    if (existing) {
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .eq("emoji", emoji);

      setReactions((prev) =>
        prev.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count - 1, has_reacted: false }
            : r
        )
      );
    } else {
      await supabase
        .from("reactions")
        .insert({ post_id: post.id, user_id: currentUserId, emoji });

      setReactions((prev) => {
        const exists = prev.find((r) => r.emoji === emoji);
        if (exists) {
          return prev.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, has_reacted: true }
              : r
          );
        }
        return [...prev, { emoji, count: 1, has_reacted: true }];
      });
    }
  };

  const role = post.author?.role;

  return (
    <div className="card-surface p-4" id={`post-${post.id}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: `${color}15`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          {(post.author?.username || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color }}>
              {post.author?.username || "unknown"}
            </span>
            {isOP && (
              <span className="text-[0.6rem] px-1.5 py-0.5 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-sm uppercase tracking-wider">
                OP
              </span>
            )}
            {role === "admin" && <span className="badge-admin">ADMIN</span>}
            {role === "moderator" && <span className="badge-mod">MOD</span>}
          </div>
          <div className="text-[0.6rem] text-text-dim">
            {timeAgo(post.created_at)}
            {post.author && (
              <span className="ml-2">// karma: {post.author.karma}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="markdown-content text-sm">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Reactions + Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1a2030]">
        {REACTION_EMOJIS.map((emoji) => {
          const r = reactions.find((rx) => rx.emoji === emoji);
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`reaction-btn ${r?.has_reacted ? "active" : ""}`}
              title={emoji}
            >
              <span>{REACTION_DISPLAY[emoji]}</span>
              {r && r.count > 0 && <span>{r.count}</span>}
            </button>
          );
        })}

        <div className="ml-auto">
          {onReply && (
            <button
              onClick={() => onReply(post.id)}
              className="text-[0.65rem] text-text-dim hover:text-neon-green transition-colors uppercase tracking-wider"
            >
              {">"} reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
