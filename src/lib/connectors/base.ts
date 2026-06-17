export interface FetchOptions extends RequestInit {
  // extend RequestInit with any future custom options
}

export class BaseConnector {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Fetch with exponential backoff retry.
   * Respects 429 Retry-After headers and backs off on transient errors.
   */
  protected async fetchWithRetry(
    url: string,
    options: FetchOptions = {},
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Rate limited — honour Retry-After or fall through to backoff
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.backoffMs(attempt);

          console.warn(
            `[${this.name}] Rate limited (429). Waiting ${waitMs}ms before retry ${attempt + 1}/${maxRetries}.`
          );

          if (attempt < maxRetries) {
            await this.sleep(waitMs);
            continue;
          }

          // Exhausted retries on rate limit
          throw new Error(
            `[${this.name}] Rate limit exceeded after ${maxRetries} retries. URL: ${url}`
          );
        }

        // Server errors worth retrying (5xx)
        if (response.status >= 500 && attempt < maxRetries) {
          const waitMs = this.backoffMs(attempt);
          console.warn(
            `[${this.name}] Server error ${response.status}. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries}).`
          );
          await this.sleep(waitMs);
          continue;
        }

        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxRetries) {
          const waitMs = this.backoffMs(attempt);
          console.error(
            `[${this.name}] Fetch error on attempt ${attempt + 1}/${maxRetries}: ${lastError.message}. Retrying in ${waitMs}ms.`
          );
          await this.sleep(waitMs);
        }
      }
    }

    throw (
      lastError ??
      new Error(`[${this.name}] fetchWithRetry failed for URL: ${url}`)
    );
  }

  /** Exponential backoff: 1s, 2s, 4s, ... capped at 30s */
  private backoffMs(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 30_000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected log(message: string, ...args: unknown[]): void {
    console.log(`[${this.name}] ${message}`, ...args);
  }

  protected logError(message: string, err?: unknown): void {
    console.error(`[${this.name}] ${message}`, err ?? "");
  }
}
