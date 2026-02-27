"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="DaemonWeave"
            width={48}
            height={48}
            className="mx-auto mb-4 drop-shadow-[0_0_12px_#00FF4140]"
          />
          <h1 className="text-lg font-bold tracking-wider">
            <span className="text-neon-green">SYSTEM</span>
            <span className="text-text-dim"> // </span>
            <span className="text-neon-cyan">LOGIN</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="card-surface p-6 space-y-4">
          <div>
            <label className="block text-[0.65rem] text-text-dim uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-terminal"
              placeholder="user@daemon.net"
              required
            />
          </div>

          <div>
            <label className="block text-[0.65rem] text-text-dim uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-terminal"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-fill w-full justify-center py-2.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" />
                AUTHENTICATING...
              </span>
            ) : (
              "CONNECT"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-dim mt-4">
          No account?{" "}
          <Link href="/auth/register" className="text-neon-cyan hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
