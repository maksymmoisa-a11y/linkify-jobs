"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: "admin@linkify-jobs.de",
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = "/de/myhome";
      } else {
        setError("Zugang verweigert");
      }
    } catch {
      setError("Login fehlgeschlagen");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-xl font-bold text-gray-900">
          System Access
        </h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? "..." : "Anmelden"}
        </button>
        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
