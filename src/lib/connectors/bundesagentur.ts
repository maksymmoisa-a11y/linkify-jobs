import { BaseConnector } from "./base";
import type {
  JobConnector,
  JobSearchParams,
  JobSearchResult,
  NormalizedJob,
} from "./types";

// ─── Public BA OAuth2 credentials (published in their open API docs) ─────────
const BA_CLIENT_ID = "c003a37f-024f-462a-b36d-b001be4cd24a";
const BA_CLIENT_SECRET = "32a39620-32b3-4307-9aa1-511e3d7f48a8";
const BA_TOKEN_URL =
  "https://rest.arbeitsagentur.de/oauth/gettoken_cc";
const BA_BASE_URL =
  "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs";

// ─── BA API raw types ─────────────────────────────────────────────────────────

interface BaToken {
  access_token: string;
  expires_in: number; // seconds
  /** Absolute timestamp (ms) when we consider the token expired */
  expiresAt?: number;
}

interface BaArbeitsort {
  ort?: string;
  plz?: string;
  region?: string;
  land?: string;
  koordinaten?: { lat?: number; lon?: number };
}

interface BaStellenangebot {
  hashId: string;
  titel: string;
  arbeitgeber?: string;
  arbeitsort?: BaArbeitsort;
  eintrittsdatum?: string;
  aktuelleVeroeffentlichungsdatum?: string;
  modifikationsTimestamp?: string;
  beruf?: string;
  angebotsart?: number;
  // Detail-only fields
  stellenbeschreibung?: string;
  fertigkeiten?: Array<{ bezeichnung?: string }>;
  arbeitgeberHashId?: string;
  externeUrl?: string;
  refnr?: string;
}

interface BaSearchResponse {
  stellenangebote: BaStellenangebot[];
  maxErgebnisse: number;
}

interface BaDetailResponse extends BaStellenangebot {
  // detail endpoint wraps in the same shape with extra fields
}

// ─── Connector ────────────────────────────────────────────────────────────────

export class BundesagenturConnector
  extends BaseConnector
  implements JobConnector
{
  public readonly name = "Bundesagentur für Arbeit";
  public readonly slug = "bundesagentur";

  private tokenCache: BaToken | null = null;

  constructor() {
    super("bundesagentur");
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async getToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid (with 60s buffer)
    if (
      this.tokenCache &&
      this.tokenCache.expiresAt &&
      this.tokenCache.expiresAt > now + 60_000
    ) {
      return this.tokenCache.access_token;
    }

    this.log("Fetching new OAuth2 token…");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: BA_CLIENT_ID,
      client_secret: BA_CLIENT_SECRET,
    });

    const response = await this.fetchWithRetry(BA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `BA token request failed (${response.status}): ${text}`
      );
    }

    const data = (await response.json()) as BaToken;
    this.tokenCache = {
      ...data,
      expiresAt: now + data.expires_in * 1000,
    };

    this.log("Token acquired, expires in", data.expires_in, "seconds.");
    return this.tokenCache.access_token;
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async fetchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    const token = await this.getToken();

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    const query = new URLSearchParams();
    if (params.keyword) query.set("was", params.keyword);
    if (params.location) query.set("wo", params.location);
    if (params.radius != null) query.set("umkreis", String(params.radius));
    query.set("page", String(page));
    query.set("size", String(pageSize));

    const url = `${BA_BASE_URL}?${query.toString()}`;
    this.log("Searching jobs:", url);

    const response = await this.fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `BA job search failed (${response.status}): ${text}`
      );
    }

    const data = (await response.json()) as BaSearchResponse;
    const stellenangebote = data.stellenangebote ?? [];

    return {
      jobs: stellenangebote.map((s) => this.mapToNormalizedJob(s)),
      total: data.maxErgebnisse ?? stellenangebote.length,
      page,
      pageSize,
    };
  }

  // ── Detail ────────────────────────────────────────────────────────────────

  async getJobDetails(hashId: string): Promise<NormalizedJob | null> {
    const token = await this.getToken();
    const url = `${BA_BASE_URL}/${encodeURIComponent(hashId)}`;

    this.log("Fetching job details:", hashId);

    const response = await this.fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `BA job detail fetch failed (${response.status}): ${text}`
      );
    }

    const data = (await response.json()) as BaDetailResponse;
    return this.mapToNormalizedJob(data);
  }

  // ── Mapping ───────────────────────────────────────────────────────────────

  private mapToNormalizedJob(s: BaStellenangebot): NormalizedJob {
    const location = this.buildLocation(s.arbeitsort);

    // Extract requirements from skills list if available
    const requirements: string[] =
      s.fertigkeiten
        ?.map((f) => f.bezeichnung ?? "")
        .filter(Boolean) ?? [];

    // Detect remote by checking for common German remote keywords in title/description
    const remote = this.detectRemote(s.titel, s.stellenbeschreibung);

    // Parse expiry: if we have a Veröffentlichungsdatum, jobs typically expire 60 days later
    let expiresAt: Date | undefined;
    if (s.aktuelleVeroeffentlichungsdatum) {
      const published = new Date(s.aktuelleVeroeffentlichungsdatum);
      if (!isNaN(published.getTime())) {
        expiresAt = new Date(
          published.getTime() + 60 * 24 * 60 * 60 * 1000
        );
      }
    }

    return {
      externalId: s.hashId,
      sourcePortal: this.slug,
      title: s.titel ?? "Unbekannte Stelle",
      companyName: s.arbeitgeber ?? "Unbekanntes Unternehmen",
      location,
      remote,
      description: s.stellenbeschreibung ?? s.titel ?? "",
      requirements: requirements.length > 0 ? requirements : undefined,
      applicationUrl: s.externeUrl ?? undefined,
      expiresAt,
    };
  }

  private buildLocation(arbeitsort?: BaArbeitsort): string | undefined {
    if (!arbeitsort) return undefined;

    const parts: string[] = [];
    if (arbeitsort.ort) parts.push(arbeitsort.ort);
    if (arbeitsort.plz) parts.push(arbeitsort.plz);
    if (arbeitsort.region) parts.push(arbeitsort.region);

    return parts.length > 0 ? parts.join(", ") : undefined;
  }

  private detectRemote(
    title?: string,
    description?: string
  ): boolean {
    const haystack = `${title ?? ""} ${description ?? ""}`.toLowerCase();
    const remoteKeywords = [
      "remote",
      "homeoffice",
      "home office",
      "mobiles arbeiten",
      "telearbeit",
      "von zuhause",
    ];
    return remoteKeywords.some((kw) => haystack.includes(kw));
  }
}

// Default export for convenience
export const bundesagenturConnector = new BundesagenturConnector();
