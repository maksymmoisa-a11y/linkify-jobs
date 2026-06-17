import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface CoverLetterInput {
  profile: {
    name: string;
    headline?: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      description?: string;
    }>;
  };
  job: {
    title: string;
    companyName: string;
    companyInfo?: {
      industry?: string;
      description?: string;
    };
    description: string;
    requirements?: string[];
  };
  language: "de" | "en";
}

export async function generateCoverLetter(
  input: CoverLetterInput
): Promise<string> {
  const { profile, job, language } = input;

  const languageInstruction =
    language === "de"
      ? "Write the cover letter in German (Deutsch). Use formal Sie-form."
      : "Write the cover letter in English.";

  const companyContext = job.companyInfo
    ? [
        job.companyInfo.industry
          ? `Industry: ${job.companyInfo.industry}`
          : null,
        job.companyInfo.description
          ? `Company description: ${job.companyInfo.description}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const experienceSummary = profile.experience
    .map(
      (e) =>
        `- ${e.title} at ${e.company}${e.description ? `: ${e.description}` : ""}`
    )
    .join("\n");

  const systemPrompt = `You are a professional cover letter writer. ${languageInstruction}

Rules:
- Be professional, concise, and compelling (300-400 words)
- Emphasize the candidate's skills that overlap with the job requirements
- Reference the company's direction, industry, or culture where relevant
- Highlight experience entries that are most relevant to the role
- Do NOT invent facts, certifications, or achievements not present in the provided profile
- Address the letter to the hiring team or company (no specific person unless provided)
- Include a strong opening and a call-to-action closing paragraph
- Do not include placeholders like [Your Address] — write the body of the letter only, starting from the salutation`;

  const userPrompt = `Candidate profile:
Name: ${profile.name}
${profile.headline ? `Headline: ${profile.headline}` : ""}
Skills: ${profile.skills.join(", ")}

Experience:
${experienceSummary}

Job to apply for:
Title: ${job.title}
Company: ${job.companyName}
${companyContext ? `\n${companyContext}` : ""}

Job description:
${job.description}

${job.requirements && job.requirements.length > 0 ? `Requirements:\n${job.requirements.map((r) => `- ${r}`).join("\n")}` : ""}

Write a cover letter for this candidate applying for this position.`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return content.trim();
}
