"use client";

import { useState, KeyboardEvent } from "react";

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    } else if (e.key === "Backspace" && input === "" && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-600"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-blue-500 hover:bg-blue-200 hover:text-blue-700 transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <path d="M4.28 3.22a.75.75 0 00-1.06 1.06L4.94 6 3.22 7.72a.75.75 0 001.06 1.06L6 7.06l1.72 1.72a.75.75 0 101.06-1.06L7.06 6l1.72-1.72a.75.75 0 00-1.06-1.06L6 4.94 4.28 3.22z" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? "Type a skill and press Enter…" : "Add more…"}
          className="min-w-[140px] flex-1 border-0 bg-transparent py-0.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>
    </div>
  );
}
