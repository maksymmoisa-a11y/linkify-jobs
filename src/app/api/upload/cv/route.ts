import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth/config";
import { upsertProfile } from "@/lib/db/queries/profiles";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];

const UPLOADS_BASE = path.join(process.cwd(), "uploads", "cv");

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const file = formData.get("cv");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided in field 'cv'" }, { status: 400 });
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB` },
      { status: 400 }
    );
  }

  // Validate type
  const ext = path.extname(file.name).toLowerCase();
  if (
    !ALLOWED_MIME_TYPES.includes(file.type) &&
    !ALLOWED_EXTENSIONS.includes(ext)
  ) {
    return Response.json(
      { error: "Invalid file type. Only PDF and DOCX files are accepted." },
      { status: 400 }
    );
  }

  // Sanitize filename — keep original name but strip path separators
  const safeFilename = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");

  // Ensure user upload directory exists
  const userDir = path.join(UPLOADS_BASE, userId);
  await mkdir(userDir, { recursive: true });

  const filePath = path.join(userDir, safeFilename);

  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Store relative URL in profile
  const cvFileUrl = `/uploads/cv/${userId}/${safeFilename}`;
  await upsertProfile(userId, { cvFileUrl });

  return Response.json({ url: cvFileUrl, filename: safeFilename });
}
