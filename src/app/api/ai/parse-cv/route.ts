import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { parseCVText } from "@/lib/ai/cv-parser";
import { updateProfileFromCV } from "@/lib/db/queries/profiles";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return Response.json(
      { error: "Missing or empty 'text' field in request body" },
      { status: 400 }
    );
  }

  if (text.length > 50_000) {
    return Response.json(
      { error: "CV text is too long. Maximum 50,000 characters." },
      { status: 400 }
    );
  }

  const parsed = await parseCVText(text);
  const profile = await updateProfileFromCV(userId, parsed);

  return Response.json({ parsed, profile });
}
