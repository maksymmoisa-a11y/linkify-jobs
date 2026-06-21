"use client";

import { useState, useRef, useEffect } from "react";

interface SearchSuggestionsProps {
  suggestions: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

export function SearchSuggestions({ suggestions, placeholder, value, onChange, id, className }: SearchSuggestionsProps) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = value.trim()
    ? suggestions.filter(s => s.toLowerCase().startsWith(value.toLowerCase().trim())).slice(0, 8)
    : suggestions.slice(0, 8);

  const showSuggestions = focused && filtered.length > 0;

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        className={className || "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"}
      />
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg flex flex-wrap gap-1.5">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setFocused(false); }}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
