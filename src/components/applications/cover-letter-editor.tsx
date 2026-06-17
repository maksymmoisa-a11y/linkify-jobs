"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CoverLetterEditorProps {
  jobId: string;
  value: string;
  onChange: (value: string) => void;
}

type Language = "de" | "en";

export function CoverLetterEditor({ jobId, value, onChange }: CoverLetterEditorProps) {
  const t = useTranslations("applications");
  const [language, setLanguage] = useState<Language>("de");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, language }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onChange(data.coverLetter ?? data.text ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">{t("coverLetterLanguage")}:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {generating ? (
            <>
              <svg
                className="h-3.5 w-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("generating")}
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668 2.093.75.75 0 11-.636 1.359A31.693 31.693 0 0010.75 4.549v2.936c3.296.818 5.25 3.046 5.25 5.765 0 3.358-2.944 6-7 6s-7-2.642-7-6c0-2.719 1.954-4.947 5.25-5.765V4.549a31.693 31.693 0 00-6.032 1.911.75.75 0 01-.636-1.359 33.187 33.187 0 016.668-2.093V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
              </svg>
              {t("generateCoverLetter")}
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        placeholder={generating ? "" : "Your cover letter will appear here. Generate with AI or write manually…"}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
        disabled={generating}
      />

      <p className="text-xs text-gray-400">
        {value.length > 0 ? `${value.length} characters` : "Write or generate your cover letter above"}
      </p>
    </div>
  );
}
