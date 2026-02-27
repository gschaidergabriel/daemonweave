import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ThreadCard from "@/components/ThreadCard";

interface Props {
  params: { slug: string };
}

export default async function CategoryPage({ params }: Props) {
  const supabase = createClient();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) notFound();

  // Fetch threads with author
  const { data: threads } = await supabase
    .from("threads")
    .select("*, author:profiles(id, username, display_name, role, karma)")
    .eq("category_id", category.id)
    .order("pinned", { ascending: false })
    .order("last_reply_at", { ascending: false });

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
        {threads && threads.length > 0 ? (
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
