import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface ParsedCV {
  name?: string;
  email?: string;
  phone?: string;
  headline?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year?: number;
  }>;
  languages?: string[];
}

export async function parseCVText(text: string): Promise<ParsedCV> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract structured data from this CV/resume and return a JSON object with the following fields:
- name (string, optional): full name of the candidate
- email (string, optional): email address
- phone (string, optional): phone number
- headline (string, optional): professional headline or current title
- summary (string, optional): professional summary or objective
- skills (array of strings): technical and professional skills
- experience (array of objects with: title, company, startDate (YYYY-MM format), endDate (YYYY-MM or "Present", optional), description (optional))
- education (array of objects with: degree, institution, year (number, optional))
- languages (array of strings, optional): spoken/written languages

Return only valid JSON. If a field cannot be determined, omit it or use an empty array for array fields. Do not invent information not present in the CV.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content);

  return {
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    headline: parsed.headline,
    summary: parsed.summary,
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : undefined,
  };
}
