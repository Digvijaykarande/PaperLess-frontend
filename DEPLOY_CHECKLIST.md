# PaperLess: launch checklist

## 1. Before the first deploy (frontend)
1. `npm install && npm run build` locally with a real `.env.local` (copy `.env.example`).
   The build fails on purpose if `NEXT_PUBLIC_API_BASE_URL` is missing.
2. Set the same variables on your host (Vercel / Azure Static Web Apps):
   `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL` (your real https domain, no trailing slash),
   `NEXT_PUBLIC_CONTACT_EMAIL`. Without `NEXT_PUBLIC_SITE_URL` the sitemap and canonicals point at localhost.
3. Replace the placeholder contact email (`hello@example.com`).
4. Have the Privacy Policy and Terms reviewed. They are plain-language starting points, not legal advice.

## 2. Backend (Spring Boot) changes that the frontend now assumes
The site tells visitors that files are deleted automatically and that uploads are limited.
Make this true before launch.

- **Auto-delete files** after `NEXT_PUBLIC_FILE_RETENTION_HOURS` (default 1 hour): uploaded files and results in Cloudinary.
  A `@Scheduled` job that deletes resources older than the cutoff (Cloudinary Admin API) is the simplest route.
- **CORS**: allow only your production origin (and `http://localhost:3000` for dev) on `/api/v1/**`.
- **Rate limit `GET /storage/signature`** (and the `/pdf/**` endpoints), for example Bucket4j per IP.
  Today anyone can request signatures and use up your Cloudinary quota.
- **Size/type limits**: reject files over `NEXT_PUBLIC_MAX_FILE_MB` and non-PDF/Office/image types on the server too.
  The frontend check is only a convenience. Free Cloudinary plans cap raw uploads at 10 MB.
- **Never log passwords** sent to `/pdf/protect` and `/pdf/unlock` (check request logging and exception messages).
- **Azure**: on a free/student App Service, enable "Always On" if the plan allows it, otherwise expect cold starts
  (the UI already shows a "waking up the server" message after 6 seconds).
- Confirm what `pdf-to-images` outputs (the page copy says "images in a ZIP" without naming a format).

## 3. After the site is live
1. Open Google Search Console, add the property, verify (either DNS, or put the token in `GOOGLE_SITE_VERIFICATION`).
2. Submit `https://YOUR-DOMAIN/sitemap.xml`. Do the same in Bing Webmaster Tools.
3. Test one tool page in the Rich Results Test (FAQ + breadcrumb) and PageSpeed Insights.
4. Check `https://YOUR-DOMAIN/robots.txt`, `/sitemap.xml`, `/og` (social image) and `/home` (should redirect to `/`).
5. If you add analytics, allow its domain in the CSP in `next.config.mjs` and mention it in the Privacy Policy.

## 4. What changed
- `/` is now the homepage; `/home` permanently redirects to it.
- Per-tool titles, descriptions, canonical URLs, Open Graph/Twitter cards, JSON-LD (WebApplication, BreadcrumbList, FAQPage, Organization, WebSite, ItemList).
- `robots.txt`, `sitemap.xml`, web manifest, social image, Apple touch icon.
- Content on every tool page (intro, how-to steps, notes, FAQs) and a full tool list + FAQ on the homepage.
- About, Contact, Privacy and Terms pages; footer links every tool.
- Sign in / Register hidden (404 + noindex) until `NEXT_PUBLIC_ENABLE_AUTH=true`.
- Security headers + CSP in production, `poweredByHeader` off, 404/500 pages, skip-to-content link.
- API client timeouts, friendlier errors, client-side file size limit, slow-server notice.
- Removed the hardcoded Azure API URL fallback.
