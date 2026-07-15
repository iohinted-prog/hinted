export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/feed", "/hints", "/circles", "/account", "/settings", "/onboarding", "/people", "/api/"],
      },
    ],
    sitemap: "https://hintdrop.app/sitemap.xml",
  };
}
