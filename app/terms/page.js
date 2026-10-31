import Link from "next/link"

import { LegalPage, List, Section } from "@/components/layout/legal-page"
import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Terms of Use",
  description: "The terms for using PaperLess, the free online PDF tools.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="By using PaperLess you agree to these terms. They are short and written to be read."
    >
      <Section title="Using PaperLess">
        <p>
          PaperLess provides free online PDF tools. You may use them for personal or business documents, as long as you
          follow these terms and the law.
        </p>
      </Section>

      <Section title="Acceptable use">
        <List
          items={[
            "Only upload files you own or have permission to process.",
            "Don't upload unlawful content or files designed to harm the service or others, such as malware.",
            "Don't use automated tools to overload the service or get around its limits.",
          ]}
        />
      </Section>

      <Section title="Your files">
        <p>
          You keep all rights to your files. You give PaperLess permission to process them only to produce the result you
          asked for. See the{" "}
          <Link href="/privacy" className="font-semibold text-primary-strong hover:underline">
            Privacy Policy
          </Link>{" "}
          for how files are stored and deleted.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          PaperLess is provided &ldquo;as is&rdquo;. We work hard to get conversions right, but results can vary,
          especially for complex layouts, so please check important documents before you rely on them. Keep a copy of
          your original files.
        </p>
      </Section>

      <Section title="Limits and availability">
        <p>
          We may set limits, such as file size, and may change, pause or remove tools at any time. We don&rsquo;t promise
          that the service will always be available or error-free.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          To the extent the law allows, PaperLess and its creator are not liable for losses that come from using the
          service, including lost or damaged files.
        </p>
      </Section>

      <Section title="Changes">
        <p>We may update these terms. Continuing to use PaperLess after a change means you accept the new terms.</p>
      </Section>
    </LegalPage>
  )
}
