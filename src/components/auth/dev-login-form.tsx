"use client";

import { signIn } from "next-auth/react";

export function DevLoginForm() {
  async function loginAs(email: string, redirectTo: string) {
    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = redirectTo;
      } else {
        alert("Login fehlgeschlagen: " + (result?.error || "Unbekannter Fehler"));
      }
    } catch (err) {
      alert("Login Error: " + String(err));
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <p className="mb-3 text-center text-xs font-medium text-orange-600">
        Dev Login (nur Entwicklung)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => loginAs("test@linkify-jobs.de", "/de/app")}
          className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 active:bg-orange-700 transition-colors cursor-pointer"
        >
          Als Kandidat
        </button>
        <button
          type="button"
          onClick={() => loginAs("admin@linkify-jobs.de", "/de/myhome")}
          className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 active:bg-red-700 transition-colors cursor-pointer"
        >
          Als Admin
        </button>
      </div>
    </div>
  );
}
