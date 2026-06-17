export interface NormalizedJob {
  externalId: string;
  sourcePortal: string;
  title: string;
  companyName: string;
  companyInfo?: {
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
  };
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requirements?: string[];
  applicationFields?: Array<{
    name: string;
    type: "text" | "textarea" | "file" | "select" | "checkbox";
    label: string;
    required: boolean;
    options?: string[];
  }>;
  applicationUrl?: string;
  expiresAt?: Date;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  radius?: number;
  page?: number;
  pageSize?: number;
}

export interface JobSearchResult {
  jobs: NormalizedJob[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JobConnector {
  name: string;
  slug: string;
  fetchJobs(params: JobSearchParams): Promise<JobSearchResult>;
  getJobDetails?(externalId: string): Promise<NormalizedJob | null>;
}
