import { BaseConnector } from "./base";
import type {
  JobConnector,
  JobSearchParams,
  JobSearchResult,
  NormalizedJob,
} from "./types";

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";
const COUNTRY = "de"; // Germany

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: number;
  latitude?: number;
  longitude?: number;
  contract_type?: string;
  contract_time?: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
    area?: string[];
  };
  category?: {
    label?: string;
    tag?: string;
  };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
  mean: number;
}

export class AdzunaConnector extends BaseConnector implements JobConnector {
  public readonly name = "Adzuna";
  public readonly slug = "adzuna";

  private appId: string;
  private appKey: string;

  constructor() {
    super("adzuna");
    this.appId = process.env.ADZUNA_APP_ID || "";
    this.appKey = process.env.ADZUNA_APP_KEY || "";
  }

  async fetchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    if (!this.appId || !this.appKey) {
      throw new Error("Adzuna API credentials not configured (ADZUNA_APP_ID, ADZUNA_APP_KEY)");
    }

    const page = params.page ?? 1;
    const pageSize = Math.min(50, params.pageSize ?? 50);

    const query = new URLSearchParams();
    query.set("app_id", this.appId);
    query.set("app_key", this.appKey);
    query.set("results_per_page", String(pageSize));
    query.set("content-type", "application/json");

    if (params.keyword) query.set("what", params.keyword);
    if (params.location) query.set("where", params.location);
    if (params.radius) query.set("distance", String(params.radius));

    const url = `${ADZUNA_BASE}/${COUNTRY}/search/${page}?${query.toString()}`;
    this.log("Searching:", url.replace(this.appKey, "***"));

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Adzuna search failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as AdzunaResponse;
    const results = data.results ?? [];

    return {
      jobs: results.map((job) => this.mapToNormalizedJob(job)),
      total: data.count ?? results.length,
      page,
      pageSize,
    };
  }

  async getJobDetails(externalId: string): Promise<NormalizedJob | null> {
    // Adzuna doesn't have a single-job detail endpoint
    // The search results already contain full data
    return null;
  }

  private mapToNormalizedJob(job: AdzunaJob): NormalizedJob {
    const isRemote = this.detectRemote(job.title, job.description);

    return {
      externalId: String(job.id),
      sourcePortal: this.slug,
      title: job.title || "Unbekannte Stelle",
      companyName: job.company?.display_name || "Unbekanntes Unternehmen",
      companyInfo: job.category ? {
        industry: job.category.label,
      } : undefined,
      location: job.location?.display_name || undefined,
      remote: isRemote,
      salaryMin: job.salary_is_predicted === 0 ? job.salary_min : undefined,
      salaryMax: job.salary_is_predicted === 0 ? job.salary_max : undefined,
      salaryCurrency: "EUR",
      description: job.description || "",
      applicationUrl: job.redirect_url || undefined,
      expiresAt: job.created
        ? new Date(new Date(job.created).getTime() + 60 * 24 * 60 * 60 * 1000)
        : undefined,
    };
  }

  private detectRemote(title?: string, description?: string): boolean {
    const text = `${title ?? ""} ${description ?? ""}`.toLowerCase();
    const keywords = [
      "remote", "homeoffice", "home office", "mobiles arbeiten",
      "telearbeit", "von zuhause", "work from home",
    ];
    return keywords.some((kw) => text.includes(kw));
  }
}

export const adzunaConnector = new AdzunaConnector();
