import type { Job } from "@/lib/db/queries/jobs";

interface JobSchemaProps {
  job: Job;
}

export function JobSchema({ job }: JobSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString().split("T")[0],
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      ...(job.companyInfo?.website && { sameAs: job.companyInfo.website }),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location ?? undefined,
        addressCountry: "DE",
      },
    },
    ...(job.remote && { jobLocationType: "TELECOMMUTE" }),
  };

  if (job.expiresAt) {
    schema.validThrough = job.expiresAt.toISOString().split("T")[0];
  }

  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency ?? "EUR",
      value: {
        "@type": "QuantitativeValue",
        unitText: "YEAR",
        ...(job.salaryMin && { minValue: job.salaryMin }),
        ...(job.salaryMax && { maxValue: job.salaryMax }),
      },
    };
  }

  if (job.applicationUrl) {
    schema.url = job.applicationUrl;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
