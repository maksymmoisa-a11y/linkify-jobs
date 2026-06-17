"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CoverLetterEditor } from "./cover-letter-editor";

interface ApplicationField {
  name: string;
  type: "text" | "textarea" | "file" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[];
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  applicationFields?: ApplicationField[] | null;
}

interface ProfileData {
  headline?: string | null;
  skills?: string[] | null;
}

interface UserData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface ApplicationFormProps {
  job: Job;
  profile?: ProfileData | null;
  user?: UserData | null;
}

type Step = "form" | "review" | "submitted";

export function ApplicationForm({ job, profile: _profile, user }: ApplicationFormProps) {
  const t = useTranslations("jobs");
  const tApp = useTranslations("applications");

  const fields: ApplicationField[] = job.applicationFields ?? [
    { name: "name", type: "text", label: "Full Name", required: true },
    { name: "email", type: "text", label: "Email Address", required: true },
    { name: "phone", type: "text", label: "Phone Number", required: false },
    { name: "coverLetter", type: "textarea", label: "Cover Letter", required: false },
  ];

  const buildInitial = (): Record<string, string | boolean | File | null> => {
    const init: Record<string, string | boolean | File | null> = {};
    for (const f of fields) {
      if (f.type === "checkbox") {
        init[f.name] = false;
      } else if (f.type === "file") {
        init[f.name] = null;
      } else {
        // Pre-fill from user/profile
        if (f.name === "name") init[f.name] = user?.name ?? "";
        else if (f.name === "email") init[f.name] = user?.email ?? "";
        else if (f.name === "phone") init[f.name] = user?.phone ?? "";
        else init[f.name] = "";
      }
    }
    return init;
  };

  const [formData, setFormData] = useState<Record<string, string | boolean | File | null>>(buildInitial);
  const [coverLetter, setCoverLetter] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setValue = (name: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasCoverLetterField = fields.some((f) => f.name === "coverLetter");

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const body = new FormData();
      body.append("jobId", job.id);
      body.append("coverLetter", coverLetter);
      for (const [key, val] of Object.entries(formData)) {
        if (val instanceof File) {
          body.append(key, val);
        } else if (val !== null) {
          body.append(key, String(val));
        }
      }
      const res = await fetch("/api/applications", { method: "POST", body });
      if (!res.ok) throw new Error(await res.text());
      setStep("submitted");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

  // ── Submitted state ──────────────────────────────────────
  if (step === "submitted") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-green-900">{tApp("applicationSubmitted")}</h2>
        <p className="text-sm text-green-700">
          {job.title} at {job.companyName}
        </p>
      </div>
    );
  }

  // ── Review step ──────────────────────────────────────────
  if (step === "review") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900">{tApp("reviewAndSubmit")}</h2>

          <div className="divide-y divide-gray-100">
            {fields
              .filter((f) => f.name !== "coverLetter")
              .map((f) => {
                const val = formData[f.name];
                if (f.type === "file") return null;
                return (
                  <div key={f.name} className="py-2 grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-gray-600">{f.label}</span>
                    <span className="col-span-2 text-gray-900 break-words">
                      {f.type === "checkbox"
                        ? (val ? "Yes" : "No")
                        : (String(val || "—"))}
                    </span>
                  </div>
                );
              })}
          </div>

          {coverLetter && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Cover Letter</p>
              <div className="max-h-40 overflow-y-auto rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                {coverLetter}
              </div>
            </div>
          )}
        </div>

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            {submitting ? "Submitting…" : tApp("submitApplication")}
          </button>
        </div>
      </div>
    );
  }

  // ── Form step ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        {fields
          .filter((f) => f.name !== "coverLetter")
          .map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                {f.label}
                {f.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>

              {f.type === "text" && (
                <input
                  type="text"
                  value={String(formData[f.name] ?? "")}
                  onChange={(e) => setValue(f.name, e.target.value)}
                  required={f.required}
                  className={inputClass}
                />
              )}

              {f.type === "textarea" && (
                <textarea
                  value={String(formData[f.name] ?? "")}
                  onChange={(e) => setValue(f.name, e.target.value)}
                  rows={3}
                  required={f.required}
                  className={inputClass + " resize-none"}
                />
              )}

              {f.type === "select" && f.options && (
                <select
                  value={String(formData[f.name] ?? "")}
                  onChange={(e) => setValue(f.name, e.target.value)}
                  required={f.required}
                  className={inputClass + " bg-white"}
                >
                  <option value="">— Select —</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {f.type === "checkbox" && (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData[f.name])}
                    onChange={(e) => setValue(f.name, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              )}

              {f.type === "file" && (
                <input
                  type="file"
                  onChange={(e) => setValue(f.name, e.target.files?.[0] ?? null)}
                  required={f.required}
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
              )}
            </div>
          ))}
      </div>

      {/* Cover Letter section — always shown, uses CoverLetterEditor */}
      {!hasCoverLetterField && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Cover Letter</h3>
          <CoverLetterEditor
            jobId={job.id}
            value={coverLetter}
            onChange={setCoverLetter}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setStep("review")}
        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm sm:w-auto"
      >
        {tApp("reviewAndSubmit")} →
      </button>
    </div>
  );
}
