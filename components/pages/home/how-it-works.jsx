import { SectionHeading } from "@/components/common/section-heading"

const STEPS = [
  { title: "Choose a tool", text: "Browse by task, or search for what you need, like “compress” or “PDF to Word”." },
  { title: "Add your file", text: "Drag it onto the page or browse your device. Set any options the tool asks for." },
  { title: "Download the result", text: "When it’s done you get a download link. Start over with another file any time." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="defer-render mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <SectionHeading title="Three steps, no learning curve" />
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
