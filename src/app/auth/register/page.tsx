"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate username
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters (letters, numbers, _ -)");
      setLoading(false);
      return;
    }

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existing) {
      setError("Username already taken");
      setLoading(false);
      return;
    }

    // Sign up
    const { error: authError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      // Email confirmation required
      setSuccess(true);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="card-surface p-8">
            <div className="text-4xl mb-4">&#x2713;</div>
            <h2 className="text-lg font-bold text-neon-green mb-2">
              REGISTRATION COMPLETE
            </h2>
            <p className="text-sm text-text-dim">
              Check your email to confirm your account.
              <br />
              Then{" "}
              <Link href="/auth/login" className="text-neon-cyan hover:underline">
                login here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-neon-cyan">REGISTER</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="card-surface p-6 space-y-4">
          <div>
            <label className="block text-[0.65rem] text-text-dim uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-terminal"
              placeholder="daemon_user"
              required
              minLength={3}
              maxLength={20}
            />
          </div>

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
              minLength={6}
            />
            <p className="text-[0.6rem] text-text-dim mt-1">
              Min. 6 characters
            </p>
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
                INITIALIZING...
              </span>
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-dim mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-neon-cyan hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
