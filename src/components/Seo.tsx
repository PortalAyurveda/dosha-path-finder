import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE = "https://portalayurveda.com";
const DEFAULT_OG = `${BASE}/og-image.jpg`;

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product" | "profile";
  noindex?: boolean;
  canonicalPath?: string; // override caso necessário
  jsonLd?: Record<string, any> | Record<string, any>[];
}

/**
 * Centraliza Helmet/SEO de cada rota.
 * Sobrescreve title/description/og:* do index.html.
 */
export default function Seo({
  title,
  description,
  image = DEFAULT_OG,
  type = "website",
  noindex = false,
  canonicalPath,
  jsonLd,
}: SeoProps) {
  const { pathname } = useLocation();
  const url = `${BASE}${canonicalPath ?? pathname}`;
  const fullTitle = title.includes("Portal Ayurveda")
    ? title
    : `${title} — Portal Ayurveda`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet defer={false}>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Portal Ayurveda" />
      <meta property="og:locale" content="pt_BR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
