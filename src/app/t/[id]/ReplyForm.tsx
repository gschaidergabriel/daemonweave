"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Editor from "@/components/Editor";

interface Props {
  threadId: number;
}

export default function ReplyForm({ threadId }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to reply");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      thread_id: threadId,
      author_id: user.id,
      content: content.trim(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Update reply count and last_reply_at
    await supabase.rpc("increment_reply_count", { tid: threadId });

    setContent("");
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-neon-green text-xs">{">"}</span>
        <h2 className="text-xs uppercase tracking-widest text-text-dim">
          Post Reply
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Editor
          value={content}
          onChange={setContent}
          placeholder="Write your reply... (Markdown supported)"
          minRows={4}
        />

        {error && (
          <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn-neon-fill text-[0.7rem] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" />
                POSTING...
              </span>
            ) : (
              "POST REPLY"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
