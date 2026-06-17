"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SkillsInput } from "./skills-input";

interface ExperienceEntry {
  id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationEntry {
  id?: string;
  degree: string;
  institution: string;
  year?: number;
  startDate?: string;
  endDate?: string;
}

interface ProfileData {
  headline?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  experience?: ExperienceEntry[] | null;
  education?: EducationEntry[] | null;
  preferredLocations?: string[] | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

interface ProfileFormProps {
  profile: ProfileData;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations("profile");

  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");
  const [skills, setSkills] = useState<string[]>(profile.skills ?? []);
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    (profile.experience ?? []).map((e) => ({ ...e, id: e.id ?? generateId() }))
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    (profile.education ?? []).map((e) => ({ ...e, id: e.id ?? generateId() }))
  );
  const [locations, setLocations] = useState<string[]>(profile.preferredLocations ?? []);
  const [locInput, setLocInput] = useState("");
  const [salaryMin, setSalaryMin] = useState(String(profile.salaryMin ?? ""));
  const [salaryMax, setSalaryMax] = useState(String(profile.salaryMax ?? ""));
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Experience ──────────────────────────────────────────
  const addExperience = () =>
    setExperience((prev) => [
      ...prev,
      { id: generateId(), title: "", company: "", startDate: "", endDate: "", description: "" },
    ]);

  const removeExperience = (id: string) =>
    setExperience((prev) => prev.filter((e) => e.id !== id));

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) =>
    setExperience((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  // ── Education ───────────────────────────────────────────
  const addEducation = () =>
    setEducation((prev) => [
      ...prev,
      { id: generateId(), degree: "", institution: "", startDate: "", endDate: "" },
    ]);

  const removeEducation = (id: string) =>
    setEducation((prev) => prev.filter((e) => e.id !== id));

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) =>
    setEducation((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  // ── Locations ───────────────────────────────────────────
  const addLocation = () => {
    const trimmed = locInput.trim();
    if (trimmed && !locations.includes(trimmed)) {
      setLocations((prev) => [...prev, trimmed]);
    }
    setLocInput("");
  };

  const removeLocation = (loc: string) =>
    setLocations((prev) => prev.filter((l) => l !== loc));

  // ── Save ────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          summary,
          skills,
          experience,
          education,
          preferredLocations: locations,
          salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
          salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

  const sectionClass = "rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4";

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior React Developer"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Short professional summary…"
              className={inputClass + " resize-none"}
            />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-gray-900">{t("skills")}</h2>
        <SkillsInput skills={skills} onChange={setSkills} />
      </section>

      {/* Experience */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t("experience")}</h2>
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            {t("addExperience")}
          </button>
        </div>

        {experience.length === 0 && (
          <p className="text-sm text-gray-400">No experience entries yet. Add your first one above.</p>
        )}

        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Experience Entry</span>
                <button
                  type="button"
                  onClick={() => removeExperience(exp.id!)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id!, "title", e.target.value)}
                    placeholder="Software Engineer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id!, "company", e.target.value)}
                    placeholder="Acme GmbH"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id!, "startDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">End Date (leave blank if current)</label>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id!, "endDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id!, "description", e.target.value)}
                  rows={2}
                  placeholder="Key responsibilities and achievements…"
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t("education")}</h2>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            {t("addEducation")}
          </button>
        </div>

        {education.length === 0 && (
          <p className="text-sm text-gray-400">No education entries yet.</p>
        )}

        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Education Entry</span>
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id!)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Degree / Certificate</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id!, "degree", e.target.value)}
                    placeholder="B.Sc. Computer Science"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id!, "institution", e.target.value)}
                    placeholder="TU Berlin"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id!, "startDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                  <input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id!, "endDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-gray-900">{t("preferences")}</h2>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">{t("locations")}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocation(); } }}
              placeholder="e.g. Berlin"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addLocation}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Add
            </button>
          </div>
          {locations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <span key={loc} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {loc}
                  <button
                    type="button"
                    onClick={() => removeLocation(loc)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={`Remove ${loc}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">{t("salary")}</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">Min (€/year)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="50000"
                min={0}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">Max (€/year)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="80000"
                min={0}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
        >
          {saving ? "Saving…" : t("saveProfile")}
        </button>
        {saveSuccess && (
          <span className="text-sm font-medium text-green-600">Saved successfully!</span>
        )}
        {saveError && (
          <span className="text-sm text-red-600">{saveError}</span>
        )}
      </div>
    </div>
  );
}
