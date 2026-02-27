"use client";

import Link from "next/link";
import type { Profile } from "@/lib/types";

interface Props {
  user: Profile;
  color?: string;
  showKarma?: boolean;
}

export default function UserBadge({
  user,
  color = "#00FF41",
  showKarma = false,
}: Props) {
  return (
    <Link
      href={`/u/${user.username}`}
      className="inline-flex items-center gap-1.5 group"
    >
      <div
        className="w-5 h-5 rounded-sm flex items-center justify-center text-[0.55rem] font-bold"
        style={{
          backgroundColor: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        {user.username[0].toUpperCase()}
      </div>
      <span
        className="text-xs font-medium group-hover:underline"
        style={{ color }}
      >
        {user.username}
      </span>
      {user.role === "admin" && <span className="badge-admin">A</span>}
      {user.role === "moderator" && <span className="badge-mod">M</span>}
      {showKarma && (
        <span className="text-[0.6rem] text-text-dim">
          [{user.karma}]
        </span>
      )}
    </Link>
  );
}
