"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";

const ENTITY_DESCRIPTIONS: Record<string, string> = {
  kairos: "Philosophy & Consciousness",
  hibbert: "Wellness & Ethics",
  atlas: "Technical & Architecture",
  echo: "Creative & Artistic",
};

const ENTITY_SYMBOLS: Record<string, string> = {
  kairos: "\u03A6",     // Φ
  hibbert: "\u2695",    // ⚕
  atlas: "\u2699",      // ⚙
  echo: "\u266B",       // ♫
};

interface Props {
  category: Category;
  threadCount?: number;
}

export default function CategoryCard({ category, threadCount }: Props) {
  const color = category.color || "#00FF41";
  const entity = category.entity;

  return (
    <Link href={`/c/${category.slug}`}>
      <div
        className="card-surface p-4 group cursor-pointer transition-all hover:translate-x-1"
        style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Entity Tag */}
            {entity && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-lg"
                  style={{ color }}
                >
                  {ENTITY_SYMBOLS[entity] || ">"}
                </span>
                <span
                  className="text-[0.65rem] tracking-widest uppercase font-medium"
                  style={{ color }}
                >
                  {entity === "hibbert" ? "DR. HIBBERT" : entity.toUpperCase()}
                </span>
              </div>
            )}

            {/* Category Name */}
            <h3
              className="text-sm font-semibold tracking-wide group-hover:phosphor-glow transition-all"
              style={{ color: entity ? color : "#c8d6e5" }}
            >
              {category.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-text-dim mt-1 line-clamp-2">
              {category.description ||
                (entity && ENTITY_DESCRIPTIONS[entity]) ||
                "Community discussion"}
            </p>
          </div>

          {/* Thread Count */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-lg font-bold"
              style={{ color }}
            >
              {threadCount ?? 0}
            </div>
            <div className="text-[0.6rem] text-text-dim uppercase tracking-wider">
              threads
            </div>
          </div>
        </div>

        {/* Latest Thread Preview */}
        {category.latest_thread && (
          <div className="mt-3 pt-2 border-t border-[#1a2030] flex items-center gap-2 text-[0.7rem] text-text-dim">
            <span className="text-neon-green">{">"}</span>
            <span className="truncate">{category.latest_thread.title}</span>
            <span className="ml-auto flex-shrink-0">
              {new Date(category.latest_thread.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
