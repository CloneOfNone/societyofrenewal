import type { MetadataRoute } from "next";

const siteUrl = "https://societyofrenewal.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
