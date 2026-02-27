import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThreadCard from "@/components/ThreadCard";

const FALLBACK_CATEGORIES: Record<string, { name: string; color: string; entity: string | null; description: string }> = {
  "the-commons": { name: "The Commons", color: "#00FF41", entity: "commons", description: "Announcements, introductions, and meta discussions about the community." },
  "the-symposium": { name: "The Symposium", color: "#FFD900", entity: "kairos", description: "GRF philosophy, consciousness debate, and deep explorations of what it means to be aware." },
  "the-wellness-center": { name: "The Wellness Center", color: "#00ff88", entity: "hibbert", description: "Personal experiences with Frank, ethical discussions, and emotional reflections." },
  "the-technical-archive": { name: "The Technical Archive", color: "#00B3FF", entity: "atlas", description: "Architecture deep-dives, troubleshooting, hardware builds, and installation guides." },
  "the-creative-studio": { name: "The Creative Studio", color: "#FF8000", entity: "echo", description: "Art, poetry, music, and creative projects inspired by or created with Frank." },
};

interface Props {
  params: { slug: string };
}

export default async function CategoryPage({ params }: Props) {
  let category: any = null;
  let threads: any[] = [];

  try {
    const supabase = createClient();

    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (cat) {
      category = cat;

      const { data: t } = await supabase
        .from("threads")
        .select("*, author:profiles(id, username, display_name, role, karma)")
        .eq("category_id", cat.id)
        .order("pinned", { ascending: false })
        .order("last_reply_at", { ascending: false });

      if (t) threads = t;
    }
  } catch {
    // Supabase connection failed
  }

  // Fallback to static data if DB query failed
  if (!category) {
    const fb = FALLBACK_CATEGORIES[params.slug];
    if (!fb) {
      return (
        <div className="text-center py-20">
          <h1 className="text-xl text-neon-green mb-2">404</h1>
          <p className="text-text-dim">Section not found.</p>
          <Link href="/" className="text-neon-cyan text-sm hover:underline mt-4 inline-block">
            {"<"} Back to Forum
          </Link>
        </div>
      );
    }
    category = { ...fb, slug: params.slug, id: 0 };
  }

  const color = category.color || "#00FF41";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Header */}
      <div>
        <div className="flex items-center gap-2 text-[0.65rem] text-text-dim mb-2">
          <Link href="/" className="hover:text-neon-green transition-colors">
            FORUM
          </Link>
          <span>/</span>
          <span style={{ color }} className="uppercase tracking-wider">
            {category.name}
          </span>
        </div>

        <div
          className="card-surface p-5"
          style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-xl font-bold tracking-wide"
                style={{ color }}
              >
                {category.name}
              </h1>
              {category.entity && (
                <p className="text-xs text-text-dim mt-1 uppercase tracking-wider">
                  Entity:{" "}
                  {category.entity === "hibbert"
                    ? "Dr. Hibbert"
                    : category.entity === "commons"
                    ? "Community"
                    : category.entity.charAt(0).toUpperCase() +
                      category.entity.slice(1)}
                </p>
              )}
              <p className="text-sm text-text-dim mt-2">
                {category.description}
              </p>
            </div>
            <Link href="/new" className="btn-neon text-[0.65rem] flex-shrink-0">
              + NEW THREAD
            </Link>
          </div>
        </div>

        <div className="section-divider mt-4" />
      </div>

      {/* Threads */}
      <div className="space-y-2">
        {threads.length > 0 ? (
          threads.map((thread: any) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              entityColor={color}
            />
          ))
        ) : (
          <div className="card-surface p-8 text-center text-text-dim text-sm">
            <p>No threads yet in this section.</p>
            <p className="mt-1">
              <Link href="/new" className="text-neon-cyan hover:underline">
                Be the first to start a discussion
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
