import { TOOLS } from "@/lib/tools"
import { absoluteUrl } from "@/lib/site"

export default function sitemap() {
  const now = new Date()
  const entry = (path, priority) => ({ url: absoluteUrl(path), lastModified: now, priority })

  return [
    entry("/", 1),
    entry("/tools", 0.9),
    ...TOOLS.map((t) => entry(`/tools/${t.slug}`, 0.8)),
    entry("/about", 0.4),
    entry("/contact", 0.3),
    entry("/privacy", 0.2),
    entry("/terms", 0.2),
  ]
}
