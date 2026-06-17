interface ProfileData {
  skills: string[];
  experience: Array<{ title: string; company: string; description?: string }>;
  preferredLocations: string[];
  salaryMin?: number;
  salaryMax?: number;
}

interface JobData {
  requirements: string[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  title: string;
  description: string;
}

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

function skillsMatch(profileSkill: string, requiredSkill: string): boolean {
  const p = normalizeSkill(profileSkill);
  const r = normalizeSkill(requiredSkill);
  // Exact match
  if (p === r) return true;
  // Partial match: one contains the other (e.g. "react" matches "react.js")
  if (p.includes(r) || r.includes(p)) return true;
  return false;
}

function scoreSkills(profile: ProfileData, job: JobData): number {
  const required = job.requirements.map(normalizeSkill);
  if (required.length === 0) return 50; // no requirements specified
  const profileSkills = profile.skills;

  let matchCount = 0;
  for (const req of required) {
    const matched = profileSkills.some((ps) => skillsMatch(ps, req));
    if (matched) matchCount++;
  }

  return (matchCount / Math.max(required.length, 1)) * 100;
}

function scoreLocation(profile: ProfileData, job: JobData): number {
  if (job.remote) return 100;

  if (!job.location) return 50; // no location data

  const jobLoc = job.location.toLowerCase();
  const preferred = profile.preferredLocations.map((l) => l.toLowerCase());

  // Exact match
  if (preferred.some((l) => l === jobLoc)) return 100;

  // Partial city match (e.g. "Berlin, Germany" vs "Berlin")
  if (preferred.some((l) => jobLoc.includes(l) || l.includes(jobLoc)))
    return 70;

  return 30;
}

function scoresalary(profile: ProfileData, job: JobData): number {
  const hasProfileSalary =
    profile.salaryMin !== undefined || profile.salaryMax !== undefined;
  const hasJobSalary =
    job.salaryMin !== undefined || job.salaryMax !== undefined;

  if (!hasProfileSalary || !hasJobSalary) return 50;

  const profileMin = profile.salaryMin ?? 0;
  const profileMax = profile.salaryMax ?? Number.MAX_SAFE_INTEGER;
  const jobMin = job.salaryMin ?? 0;
  const jobMax = job.salaryMax ?? Number.MAX_SAFE_INTEGER;

  // Ranges overlap
  if (profileMin <= jobMax && jobMin <= profileMax) return 100;

  // Compute gap as percentage of the midpoint
  const profileMid = (profileMin + Math.min(profileMax, 1_000_000)) / 2;
  const jobMid = (jobMin + Math.min(jobMax, 1_000_000)) / 2;
  const gap = Math.abs(profileMid - jobMid) / Math.max(profileMid, jobMid, 1);

  if (gap <= 0.2) return 70;

  return 30;
}

function scoreExperience(profile: ProfileData, job: JobData): number {
  const jobText = `${job.title} ${job.description}`.toLowerCase();

  // Extract words from job text (length > 3 to skip noise)
  const jobWords = new Set(
    jobText
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );

  const experienceText = profile.experience
    .map((e) => `${e.title} ${e.company} ${e.description ?? ""}`)
    .join(" ")
    .toLowerCase();

  const expWords = experienceText.split(/\W+/).filter((w) => w.length > 3);

  if (expWords.length === 0 || jobWords.size === 0) return 50;

  const matches = expWords.filter((w) => jobWords.has(w)).length;
  const ratio = matches / Math.max(jobWords.size, 1);

  // Scale: ratio of 0.1+ → 100, 0.05 → 70, below → 30
  if (ratio >= 0.1) return 100;
  if (ratio >= 0.05) return 70;
  return 30;
}

export function calculateMatchScore(
  profile: ProfileData,
  job: JobData
): number {
  const skills = scoreSkills(profile, job); // 50%
  const location = scoreLocation(profile, job); // 20%
  const salary = scoresalary(profile, job); // 20%
  const experience = scoreExperience(profile, job); // 10%

  const weighted =
    skills * 0.5 + location * 0.2 + salary * 0.2 + experience * 0.1;

  return Math.min(100, Math.max(0, Math.round(weighted)));
}
