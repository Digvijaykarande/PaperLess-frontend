// Copies the PDF.js worker, standard fonts and CMaps into /public so the editor can load them
// from our own origin (the production CSP only allows scripts from 'self').
import { cpSync, mkdirSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const src = join(root, "node_modules", "pdfjs-dist")
const dest = join(root, "public", "pdfjs")

if (!existsSync(src)) {
  console.warn("[pdfjs] pdfjs-dist is not installed yet, skipping asset copy.")
  process.exit(0)
}
mkdirSync(dest, { recursive: true })
cpSync(join(src, "build", "pdf.worker.min.js"), join(dest, "pdf.worker.min.js"))
cpSync(join(src, "standard_fonts"), join(dest, "standard_fonts"), { recursive: true })
cpSync(join(src, "cmaps"), join(dest, "cmaps"), { recursive: true })
console.log("[pdfjs] copied worker, standard fonts and cmaps to public/pdfjs")
