import { SITE } from "@/lib/site"

const OG_IMAGE = {
  url: "/og",
  width: 1200,
  height: 630,
  alt: `${SITE.name}: free online PDF tools`,
}

/** Metadata for one page: title, description, canonical URL, Open Graph and Twitter card. */
export function pageMeta({ title, description, path }) {
  const full = title ? `${title} · ${SITE.name}` : SITE.title
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_US",
      url: path,
      title: full,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: full, description, images: [OG_IMAGE.url] },
  }
}
