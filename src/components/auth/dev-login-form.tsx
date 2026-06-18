"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function DevLoginForm() {
  const [email, setEmail] = useState("test@linkify-jobs.de");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      redirect: false,
    });

    if (result?.error) {
      setError("Login fehlgeschlagen");
      setLoading(false);
    } else {
      window.location.href = "/de/dashboard";
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <p className="mb-3 text-center text-xs font-medium text-orange-600">
        Dev Login (nur Entwicklung)
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Als Kandidat"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await signIn("credentials", {
                email: "admin@linkify-jobs.de",
                redirect: false,
              });
              if (result?.error) {
                setError("Login fehlgeschlagen");
                setLoading(false);
              } else {
                window.location.href = "/de/admin";
              }
            }}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Als Admin"}
          </button>
        </div>
        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </form>
    </div>
  );
}
