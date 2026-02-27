"use client";

import Link from "next/link";
import type { Thread } from "@/lib/types";
import { ENTITY_COLORS } from "@/lib/types";

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
  thread: Thread;
  entityColor?: string;
}

export default function ThreadCard({ thread, entityColor }: Props) {
  const color = entityColor || "#00FF41";

  return (
    <Link href={`/t/${thread.id}`}>
      <div className="card-surface px-4 py-3 group hover:translate-x-0.5 transition-all">
        <div className="flex items-start gap-3">
          {/* Pinned / Status Indicator */}
          <div className="flex-shrink-0 mt-1">
            {thread.pinned ? (
              <span className="text-neon-yellow text-xs" title="Pinned">
                &#x25C8;
              </span>
            ) : (
              <span className="text-text-muted text-xs">&#x25CB;</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
              {thread.locked && (
                <span className="text-text-dim mr-1.5" title="Locked">
                  &#x1F512;
                </span>
              )}
              {thread.title}
            </h4>

            <div className="flex items-center gap-3 mt-1 text-[0.65rem] text-text-dim">
              <span>
                by{" "}
                <span style={{ color }} className="font-medium">
                  {thread.author?.username || "unknown"}
                </span>
              </span>
              <span>&#x2022;</span>
              <span>{timeAgo(thread.created_at)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 flex-shrink-0 text-[0.65rem] text-text-dim">
            <div className="text-center">
              <div className="text-text-primary font-medium">
                {thread.reply_count}
              </div>
              <div>replies</div>
            </div>
            <div className="text-center">
              <div className="text-text-primary font-medium">
                {thread.view_count}
              </div>
              <div>views</div>
            </div>
            <div className="hidden sm:block text-right text-text-dim">
              <div className="text-[0.6rem]">last activity</div>
              <div className="text-text-primary text-[0.65rem]">
                {timeAgo(thread.last_reply_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
