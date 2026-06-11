import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://airesu.me";
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/tos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
