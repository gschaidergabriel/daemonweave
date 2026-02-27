"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Editor from "@/components/Editor";
import type { Category } from "@/lib/types";

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="spinner" /></div>}>
      <NewThreadForm />
    </Suspense>
  );
}

function NewThreadForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (data) {
        setCategories(data as Category[]);
        // Pre-select from query param
        const preselect = searchParams.get("category");
        if (preselect) {
          const match = data.find((c: any) => c.slug === preselect);
          if (match) setCategoryId(match.id);
        }
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) return;

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    const { data: thread, error: insertError } = await supabase
      .from("threads")
      .insert({
        category_id: categoryId,
        author_id: user.id,
        title: title.trim(),
        slug,
        content: content.trim(),
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/t/${thread.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-[0.65rem] text-text-dim mb-6">
        <Link href="/" className="hover:text-neon-green transition-colors">
          FORUM
        </Link>
        <span>/</span>
        <span className="text-text-primary">NEW THREAD</span>
      </div>

      <h1 className="text-lg font-bold tracking-wider mb-6">
        <span className="text-neon-green">{">"}</span>
        <span className="text-neon-cyan ml-2">CREATE THREAD</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Select */}
        <div>
          <label className="block text-[0.65rem] text-text-dim uppercase tracking-wider mb-2">
            Section
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`text-left p-3 rounded card-surface transition-all text-sm ${
                  categoryId === cat.id
                    ? "ring-1"
                    : "hover:bg-bg-elevated"
                }`}
                style={
                  categoryId === cat.id
                    ? {
                        borderColor: cat.color || "#00FF41",
                        boxShadow: `0 0 8px ${cat.color || "#00FF41"}20`,
                        borderLeftWidth: "3px",
                        borderLeftColor: cat.color || "#00FF41",
                      }
                    : {
                        borderLeftWidth: "3px",
                        borderLeftColor: `${cat.color || "#00FF41"}30`,
                      }
                }
              >
                <span
                  className="font-medium text-xs"
                  style={{ color: cat.color || "#00FF41" }}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[0.65rem] text-text-dim uppercase tracking-wider mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-terminal"
            placeholder="Thread title..."
            required
            maxLength={200}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-[0.65rem] text-text-dim uppercase tracking-wider mb-1.5">
            Content
          </label>
          <Editor
            value={content}
            onChange={setContent}
            placeholder="Write your post... (Markdown supported)"
            minRows={8}
          />
        </div>

        {error && (
          <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/"
            className="text-xs text-text-dim hover:text-neon-green transition-colors"
          >
            {"<"} CANCEL
          </Link>
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim() || !categoryId}
            className="btn-neon-fill text-[0.7rem] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" />
                CREATING...
              </span>
            ) : (
              "PUBLISH THREAD"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
