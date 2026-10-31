import Link from "next/link"

import { LegalPage, List, Section } from "@/components/layout/legal-page"
import { RETENTION_LABEL, SITE } from "@/lib/site"
import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "How PaperLess handles your files and data: what is uploaded, how long it is kept, and who processes it.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="PaperLess processes your documents only to give you the result you asked for. This page explains what that involves."
    >
      <Section title="What we collect">
        <List
          items={[
            "Your files and the options you enter for a tool (for example a password or watermark text), solely to run that tool.",
            "Standard server logs, such as IP address, browser type, pages requested and timestamps, used for security and troubleshooting.",
            "PaperLess does not currently require an account, so we don't collect names or email addresses to use the tools.",
          ]}
        />
      </Section>

      <Section title="How your files are handled">
        <p>
          When you run a tool, your file is uploaded from your browser over an encrypted (HTTPS) connection to our cloud
          storage provider, processed by our server, and the result is made available as a download link.
        </p>
        <p>
          Uploaded files and results are deleted automatically after about {RETENTION_LABEL}. We don&rsquo;t read your
          documents, sell them, share them for advertising or use them to train models.
        </p>
        <p>
          Download links are long and hard to guess, but anyone who has the link can open the file until it is deleted,
          so please don&rsquo;t share it. Passwords you enter for protecting or unlocking a PDF are used only for that
          operation.
        </p>
      </Section>

      <Section title="Cookies and analytics">
        <p>
          PaperLess does not use cookies for tracking or advertising. If we add privacy-friendly analytics in the future,
          we will describe it here.
        </p>
      </Section>

      <Section title="Services we rely on">
        <List
          items={[
            "Cloudinary, for temporary file storage and delivery.",
            "Microsoft Azure, for the servers that process your files.",
            "Our website hosting provider, for serving this site.",
          ]}
        />
      </Section>

      <Section title="Your choices">
        <p>
          Because files are removed automatically, there is nothing for you to delete. If you have a question or want us
          to remove a file sooner, contact us through the{" "}
          <Link href="/contact" className="font-semibold text-primary-strong hover:underline">
            contact page
          </Link>{" "}
          or at {SITE.email}.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>If we change how PaperLess handles data, we will update this page and the date at the top.</p>
      </Section>
    </LegalPage>
  )
}
