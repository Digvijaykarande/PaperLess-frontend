import Link from "next/link"

import { LegalPage, List, Section } from "@/components/layout/legal-page"
import { buttonVariants } from "@/components/ui/button"
import { SITE } from "@/lib/site"
import { pageMeta } from "@/lib/seo"
import { TOOLS } from "@/lib/tools"

export const metadata = pageMeta({
  title: "About PaperLess",
  description:
    "PaperLess is a free set of simple online PDF tools, built to make everyday document jobs quick: merge, split, compress, convert and more.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <LegalPage
      title="About PaperLess"
      updated={false}
      intro={`PaperLess is a set of ${TOOLS.length} free PDF tools that each do one job well. Pick a tool, add your file and download the result.`}
    >
      <Section title="Why it exists">
        <p>
          Everyday document jobs, like combining two files, shrinking a PDF for email or turning a PDF into a Word
          document, shouldn&rsquo;t need an installer, an account or a confusing screen. PaperLess keeps each tool on
          its own page with the fewest steps possible.
        </p>
      </Section>
      <Section title="What we stand for">
        <List
          items={[
            "Simple: one tool, one job, a clear result.",
            "Open to everyone: every tool is free and works without an account.",
            "Honest about your files: they are used only to produce your result and deleted automatically. Read the Privacy Policy for the details.",
          ]}
        />
      </Section>
      <Section title="Who builds it">
        <p>
          PaperLess is designed, built and maintained by {SITE.author}, a full-stack developer. Feedback and bug reports
          are very welcome through the{" "}
          <Link href="/contact" className="font-semibold text-primary-strong hover:underline">
            contact page
          </Link>
          .
        </p>
      </Section>
      <Link href="/tools" className={buttonVariants({ size: "lg" })}>
        Explore all tools
      </Link>
    </LegalPage>
  )
}
