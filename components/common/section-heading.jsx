import { cn } from "@/lib/utils"

export function SectionHeading({ title, description, className }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{description}</p>
      )}
    </div>
  )
}
