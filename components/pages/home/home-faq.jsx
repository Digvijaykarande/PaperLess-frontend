import { Faq } from "@/components/common/faq"
import { SectionHeading } from "@/components/common/section-heading"
import { HOME_FAQS } from "@/lib/seo-content"

export function HomeFaq() {
  return (
    <section className="defer-render mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <SectionHeading title="Frequently asked questions" />
      <div className="mt-8">
        <Faq items={HOME_FAQS} />
      </div>
    </section>
  )
}
