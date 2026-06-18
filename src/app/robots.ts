import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://linkify-jobs.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/de/", "/en/", "/de/jobs/", "/en/jobs/"],
        disallow: ["/api/", "/dashboard/", "/admin/", "/profile/", "/applications/", "/settings/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
