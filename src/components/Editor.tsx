"use client";

import { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

export default function Editor({
  value,
  onChange,
  placeholder = "Write your post... (Markdown supported)",
  minRows = 6,
}: Props) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newText =
      value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  return (
    <div className="card-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#1a2030] bg-bg-elevated/50">
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="px-2 py-1 text-xs text-text-dim hover:text-neon-green hover:bg-bg-hover rounded transition-colors font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="px-2 py-1 text-xs text-text-dim hover:text-neon-green hover:bg-bg-hover rounded transition-colors italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("`", "`")}
          className="px-2 py-1 text-xs text-text-dim hover:text-neon-green hover:bg-bg-hover rounded transition-colors font-mono"
          title="Code"
        >
          {"</>"}
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("```\n", "\n```")}
          className="px-2 py-1 text-xs text-text-dim hover:text-neon-green hover:bg-bg-hover rounded transition-colors"
          title="Code Block"
        >
          {"[~]"}
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("[", "](url)")}
          className="px-2 py-1 text-xs text-text-dim hover:text-neon-green hover:bg-bg-hover rounded transition-colors"
          title="Link"
        >
          {"<a>"}
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("> ")}
          className="px-2 py-1 text-xs text-text-dim hover:text-neon-green hover:bg-bg-hover rounded transition-colors"
          title="Quote"
        >
          {'"'}
        </button>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`px-3 py-1 text-[0.65rem] uppercase tracking-wider rounded transition-colors ${
              preview
                ? "text-neon-green bg-neon-green/10"
                : "text-text-dim hover:text-neon-green"
            }`}
          >
            {preview ? "EDIT" : "PREVIEW"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {preview ? (
        <div className="markdown-content p-4 min-h-[150px] text-sm">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-text-dim italic">Nothing to preview...</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full p-4 bg-transparent text-sm text-text-primary placeholder-text-dim resize-y outline-none font-mono"
          style={{ minHeight: `${minRows * 1.6}em` }}
        />
      )}
    </div>
  );
}
