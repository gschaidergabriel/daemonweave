import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import ReplyForm from "./ReplyForm";

interface Props {
  params: { id: string };
}

export default async function ThreadPage({ params }: Props) {
  const supabase = createClient();
  const threadId = parseInt(params.id);
  if (isNaN(threadId)) notFound();

  // Fetch thread with author and category
  const { data: thread } = await supabase
    .from("threads")
    .select(
      "*, author:profiles(id, username, display_name, role, karma), category:categories(id, slug, name, color, entity)"
    )
    .eq("id", threadId)
    .single();

  if (!thread) notFound();

  // Increment view count
  await supabase
    .from("threads")
    .update({ view_count: (thread.view_count || 0) + 1 })
    .eq("id", threadId);

  // Fetch posts with authors and reactions
  const { data: posts } = await supabase
    .from("posts")
    .select("*, author:profiles(id, username, display_name, role, karma)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch reactions for all posts
  const postIds = posts?.map((p: any) => p.id) || [];
  let reactionsByPost: Record<number, any[]> = {};

  if (postIds.length > 0) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("*")
      .in("post_id", postIds);

    reactions?.forEach((r: any) => {
      if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = [];
      reactionsByPost[r.post_id].push(r);
    });
  }

  // Build reaction counts
  const enrichedPosts = (posts || []).map((post: any) => {
    const postReactions = reactionsByPost[post.id] || [];
    const counts: Record<string, { count: number; has_reacted: boolean }> = {};
    postReactions.forEach((r: any) => {
      if (!counts[r.emoji]) counts[r.emoji] = { count: 0, has_reacted: false };
      counts[r.emoji].count++;
      if (r.user_id === user?.id) counts[r.emoji].has_reacted = true;
    });
    return {
      ...post,
      reactions: Object.entries(counts).map(([emoji, data]) => ({
        emoji,
        ...data,
      })),
    };
  });

  const color = thread.category?.color || "#00FF41";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[0.65rem] text-text-dim">
        <Link href="/" className="hover:text-neon-green transition-colors">
          FORUM
        </Link>
        <span>/</span>
        <Link
          href={`/c/${thread.category?.slug}`}
          className="hover:text-neon-green transition-colors"
          style={{ color }}
        >
          {thread.category?.name?.toUpperCase()}
        </Link>
        <span>/</span>
        <span className="text-text-primary truncate max-w-[200px]">
          {thread.title}
        </span>
      </div>

      {/* Thread Header */}
      <div
        className="card-surface p-5"
        style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {thread.pinned && (
                <span
                  className="text-[0.6rem] px-1.5 py-0.5 uppercase tracking-wider border rounded-sm"
                  style={{
                    color,
                    borderColor: `${color}40`,
                    backgroundColor: `${color}10`,
                  }}
                >
                  Pinned
                </span>
              )}
              {thread.locked && (
                <span className="text-[0.6rem] px-1.5 py-0.5 text-danger border border-danger/40 bg-danger/10 uppercase tracking-wider rounded-sm">
                  Locked
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-text-primary">
              {thread.title}
            </h1>
          </div>
          <div className="flex gap-4 text-[0.65rem] text-text-dim text-right flex-shrink-0">
            <div>
              <div className="text-text-primary font-medium">
                {thread.reply_count}
              </div>
              <div>replies</div>
            </div>
            <div>
              <div className="text-text-primary font-medium">
                {thread.view_count}
              </div>
              <div>views</div>
            </div>
          </div>
        </div>
      </div>

      {/* OP Post (thread content as first post) */}
      <PostCard
        post={{
          id: 0,
          thread_id: threadId,
          author_id: thread.author_id,
          content: thread.content,
          reply_to_id: null,
          created_at: thread.created_at,
          updated_at: thread.updated_at,
          author: thread.author,
          reactions: [],
        }}
        entityColor={color}
        currentUserId={user?.id}
        isOP={true}
      />

      {/* Replies */}
      {enrichedPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-neon-green text-xs">{">"}</span>
            <h2 className="text-xs uppercase tracking-widest text-text-dim">
              Replies ({enrichedPosts.length})
            </h2>
          </div>

          {enrichedPosts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              entityColor={color}
              currentUserId={user?.id}
              isOP={post.author_id === thread.author_id}
            />
          ))}
        </div>
      )}

      {/* Reply Form */}
      {thread.locked ? (
        <div className="card-surface p-4 text-center text-sm text-text-dim">
          This thread is locked. No new replies.
        </div>
      ) : user ? (
        <ReplyForm threadId={threadId} />
      ) : (
        <div className="card-surface p-4 text-center text-sm text-text-dim">
          <Link href="/auth/login" className="text-neon-cyan hover:underline">
            Login
          </Link>{" "}
          to reply to this thread.
        </div>
      )}
    </div>
  );
}
