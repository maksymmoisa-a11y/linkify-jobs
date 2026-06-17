"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface ParsedCvData {
  headline?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
  }>;
}

type UploadStatus = "idle" | "uploading" | "uploaded" | "parsing" | "parsed" | "error";

export function CvUpload() {
  const t = useTranslations("profile");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<ParsedCvData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      setErrorMsg("Only PDF and DOCX files are accepted.");
      setStatus("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File exceeds 5 MB limit.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress with XHR for upload progress events
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", "/api/upload/cv");
        xhr.send(formData);
      });
      setProgress(100);
      setStatus("uploaded");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleParseWithAi = async () => {
    setStatus("parsing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai/parse-cv", { method: "POST" });
      if (!res.ok) throw new Error(`Parse failed: ${res.statusText}`);
      const data: ParsedCvData = await res.json();
      setParsedData(data);
      setStatus("parsed");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Parse failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setFileName("");
    setErrorMsg("");
    setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {(status === "idle" || status === "error") && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-700">
            {t("cvUploadDrag")}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t("uploadCvHint")}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Uploading progress */}
      {status === "uploading" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium text-gray-700">{fileName}</span>
            <span className="ml-2 shrink-0 text-gray-500">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded — ready to parse */}
      {status === "uploaded" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="h-5 w-5 shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <p className="truncate text-sm font-medium text-green-800">{t("cvUploadSuccess")}</p>
            <span className="truncate text-xs text-green-700 hidden sm:block">— {fileName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleParseWithAi}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {t("parseWithAi")}
            </button>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700 underline">
              {t("uploadCv")}
            </button>
          </div>
        </div>
      )}

      {/* Parsing */}
      {status === "parsing" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
          <svg
            className="h-5 w-5 shrink-0 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium text-blue-800">{t("cvUploadParsing")}</p>
        </div>
      )}

      {/* Parsed preview */}
      {status === "parsed" && parsedData && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Parsed CV Data</h3>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700 underline">
              Re-upload
            </button>
          </div>

          {parsedData.headline && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Headline</p>
              <p className="mt-0.5 text-sm text-gray-800">{parsedData.headline}</p>
            </div>
          )}

          {parsedData.skills && parsedData.skills.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Skills</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {parsedData.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {parsedData.experience && parsedData.experience.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Experience</p>
              <ul className="mt-1.5 space-y-1.5">
                {parsedData.experience.map((exp, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{exp.title}</span> at {exp.company}
                    <span className="ml-1.5 text-xs text-gray-500">
                      {exp.startDate} – {exp.endDate ?? "Present"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsedData.education && parsedData.education.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Education</p>
              <ul className="mt-1.5 space-y-1.5">
                {parsedData.education.map((edu, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{edu.degree}</span> — {edu.institution}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
