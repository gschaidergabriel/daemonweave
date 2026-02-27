"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function Navbar() {
  const [user, setUser] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (data) setUser(data as Profile);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) setUser(data as Profile);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1a2030] bg-bg-deep/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="DaemonWeave"
            width={36}
            height={36}
            className="transition-all group-hover:drop-shadow-[0_0_8px_#00FF4180]"
          />
          <span className="text-lg font-bold tracking-wider text-neon-green transition-all group-hover:text-shadow-glow hidden sm:inline">
            DAEMON<span className="text-neon-cyan">WEAVE</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase">
          <Link
            href="/"
            className="text-text-dim hover:text-neon-green transition-colors"
          >
            Forum
          </Link>
          <Link
            href="/c/the-commons"
            className="text-text-dim hover:text-neon-green transition-colors"
          >
            Commons
          </Link>
          <Link
            href="https://github.com/gschaidergabriel/Project-Frankenstein"
            target="_blank"
            className="text-text-dim hover:text-neon-green transition-colors"
          >
            GitHub
          </Link>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-text-primary hover:text-neon-green transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-neon-green shadow-glow-green" />
                <span className="hidden sm:inline">{user.username}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 card-surface p-1 shadow-xl">
                  <Link
                    href={`/u/${user.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-xs text-text-dim hover:text-neon-green hover:bg-bg-elevated transition-colors rounded"
                  >
                    // PROFILE
                  </Link>
                  <Link
                    href="/new"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-xs text-text-dim hover:text-neon-green hover:bg-bg-elevated transition-colors rounded"
                  >
                    // NEW THREAD
                  </Link>
                  <div className="my-1 border-t border-[#1a2030]" />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-xs text-danger hover:bg-bg-elevated transition-colors rounded"
                  >
                    // DISCONNECT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn-neon text-[0.7rem] py-1.5 px-3">
                LOGIN
              </Link>
              <Link
                href="/auth/register"
                className="btn-neon-fill text-[0.7rem] py-1.5 px-3"
              >
                REGISTER
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-text-dim hover:text-neon-green p-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-[#0d1117] bg-bg-deep/50 px-4 py-1 flex items-center gap-4 text-[0.6rem] tracking-wider text-text-muted overflow-x-auto">
        <span>SYS:ONLINE</span>
        <span className="text-neon-green">&#x25CF;</span>
        <span>DAEMON:ACTIVE</span>
        <span className="text-neon-green">&#x25CF;</span>
        <span>THREADS:LIVE</span>
        <span className="hidden sm:inline ml-auto text-text-dim">
          v0.1.0 // DAEMONWEAVE
        </span>
      </div>
    </nav>
  );
}
