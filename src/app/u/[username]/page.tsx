import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  // Fetch user's threads
  const { data: threads } = await supabase
    .from("threads")
    .select("id, title, created_at, reply_count, view_count, category:categories(name, color, slug)")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch user's post count
  const { count: postCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id);

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[0.65rem] text-text-dim">
        <Link href="/" className="hover:text-neon-green transition-colors">
          FORUM
        </Link>
        <span>/</span>
        <span className="text-text-primary">PROFILE</span>
      </div>

      {/* Profile Card */}
      <div className="card-surface p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-sm flex items-center justify-center text-xl font-bold bg-neon-green/10 text-neon-green border border-neon-green/30">
            {profile.username[0].toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-neon-green">
                {profile.display_name || profile.username}
              </h1>
              {profile.role === "admin" && (
                <span className="badge-admin">ADMIN</span>
              )}
              {profile.role === "moderator" && (
                <span className="badge-mod">MOD</span>
              )}
            </div>
            <p className="text-xs text-text-dim">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-text-primary mt-2">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-xs">
              <div>
                <span className="text-neon-green font-bold">{profile.karma}</span>
                <span className="text-text-dim ml-1">karma</span>
              </div>
              <div>
                <span className="text-text-primary font-bold">
                  {threads?.length || 0}
                </span>
                <span className="text-text-dim ml-1">threads</span>
              </div>
              <div>
                <span className="text-text-primary font-bold">
                  {postCount || 0}
                </span>
                <span className="text-text-dim ml-1">replies</span>
              </div>
              <div className="text-text-dim">
                member since {memberSince}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Threads */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-neon-green text-xs">{">"}</span>
          <h2 className="text-xs uppercase tracking-widest text-text-dim">
            Threads by {profile.username}
          </h2>
        </div>

        {threads && threads.length > 0 ? (
          <div className="card-surface divide-y divide-[#1a2030]">
            {threads.map((thread: any) => (
              <Link
                key={thread.id}
                href={`/t/${thread.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/50 transition-colors group"
              >
                <span className="text-text-muted text-xs group-hover:text-neon-green">
                  {">"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                    {thread.title}
                  </div>
                  <div className="flex gap-3 text-[0.6rem] text-text-dim mt-0.5">
                    {thread.category && (
                      <span style={{ color: thread.category.color }}>
                        {thread.category.name}
                      </span>
                    )}
                    <span>{thread.reply_count} replies</span>
                    <span>{thread.view_count} views</span>
                  </div>
                </div>
                <span className="text-[0.6rem] text-text-dim flex-shrink-0">
                  {new Date(thread.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface p-6 text-center text-sm text-text-dim">
            No threads yet.
          </div>
        )}
      </div>
    </div>
  );
}
