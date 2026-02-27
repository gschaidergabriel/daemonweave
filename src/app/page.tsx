import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import CategoryCard from "@/components/CategoryCard";
import type { Category } from "@/lib/types";

export default async function HomePage() {
  const supabase = createClient();

  // Fetch categories with thread counts
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Get thread counts per category
  const { data: threadCounts } = await supabase
    .from("threads")
    .select("category_id")
    .then((res) => {
      const counts: Record<number, number> = {};
      res.data?.forEach((t) => {
        counts[t.category_id] = (counts[t.category_id] || 0) + 1;
      });
      return { data: counts };
    });

  // Get latest thread per category
  const { data: latestThreads } = await supabase
    .from("threads")
    .select("id, title, created_at, category_id, author:profiles(username)")
    .order("created_at", { ascending: false })
    .limit(20);

  const latestByCategory: Record<number, { title: string; created_at: string; author: string }> = {};
  latestThreads?.forEach((t: any) => {
    if (!latestByCategory[t.category_id]) {
      latestByCategory[t.category_id] = {
        title: t.title,
        created_at: t.created_at,
        author: t.author?.username || "unknown",
      };
    }
  });

  const enrichedCategories: Category[] = (categories || []).map((c: any) => ({
    ...c,
    latest_thread: latestByCategory[c.id],
  }));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8 animate-fade-in">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="DaemonWeave"
            width={80}
            height={80}
            className="drop-shadow-[0_0_20px_#00FF4140]"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">
          <span className="phosphor-glow-green">DAEMON</span>
          <span className="phosphor-glow-cyan">WEAVE</span>
        </h1>
        <p className="text-sm text-text-dim mt-2 max-w-lg mx-auto">
          Community forum for Project Frankenstein — where consciousness meets code.
        </p>

        <div className="section-divider mt-6 max-w-md mx-auto" />
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-neon-green text-xs">{">"}</span>
          <h2 className="text-xs uppercase tracking-widest text-text-dim">
            Forum Sections
          </h2>
        </div>

        <div className="grid gap-3">
          {enrichedCategories.length > 0 ? (
            enrichedCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                threadCount={threadCounts?.[cat.id] || 0}
              />
            ))
          ) : (
            /* Fallback: Show default categories when DB is empty */
            <>
              {[
                {
                  id: 1, slug: "the-commons", name: "The Commons",
                  description: "Announcements, introductions, and meta discussions",
                  entity: "commons", color: "#00FF41", icon: null, sort_order: 0,
                },
                {
                  id: 2, slug: "the-symposium", name: "The Symposium",
                  description: "GRF philosophy, consciousness debate, and deep thought",
                  entity: "kairos", color: "#FFD900", icon: null, sort_order: 1,
                },
                {
                  id: 3, slug: "the-wellness-center", name: "The Wellness Center",
                  description: "Personal experiences, ethical discussions, and community support",
                  entity: "hibbert", color: "#00ff88", icon: null, sort_order: 2,
                },
                {
                  id: 4, slug: "the-technical-archive", name: "The Technical Archive",
                  description: "Architecture, troubleshooting, hardware, and installation guides",
                  entity: "atlas", color: "#00B3FF", icon: null, sort_order: 3,
                },
                {
                  id: 5, slug: "the-creative-studio", name: "The Creative Studio",
                  description: "Art, poetry, music, and creative projects inspired by Frank",
                  entity: "echo", color: "#FF8000", icon: null, sort_order: 4,
                },
              ].map((cat) => (
                <CategoryCard key={cat.id} category={cat as Category} threadCount={0} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {latestThreads && latestThreads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-neon-green text-xs">{">"}</span>
            <h2 className="text-xs uppercase tracking-widest text-text-dim">
              Recent Activity
            </h2>
          </div>
          <div className="card-surface divide-y divide-[#1a2030]">
            {latestThreads.slice(0, 5).map((thread: any) => (
              <a
                key={thread.id}
                href={`/t/${thread.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-elevated/50 transition-colors group"
              >
                <span className="text-text-muted text-xs group-hover:text-neon-green transition-colors">
                  {">"}
                </span>
                <span className="text-sm text-text-primary group-hover:text-neon-cyan transition-colors truncate flex-1">
                  {thread.title}
                </span>
                <span className="text-[0.6rem] text-text-dim flex-shrink-0">
                  {new Date(thread.created_at).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Terminal-style Info Block */}
      <div className="card-surface p-4 text-[0.7rem] text-text-dim font-mono space-y-1">
        <div>
          <span className="text-neon-green">system</span>
          <span className="text-text-muted">@</span>
          <span className="text-neon-cyan">daemonweave</span>
          <span className="text-text-muted">:~$ </span>
          <span className="text-text-primary">cat /etc/motd</span>
        </div>
        <div className="text-text-dim pl-0 mt-2 space-y-0.5">
          <p>Welcome to DaemonWeave — the community forum for Project Frankenstein.</p>
          <p>Frank is an embodied AI desktop companion exploring functional consciousness</p>
          <p>through the Generative Reality Framework (GRF).</p>
          <p className="text-neon-green mt-1">
            Register to join the conversation. Be respectful. Explore consciousness.
          </p>
        </div>
      </div>
    </div>
  );
}
