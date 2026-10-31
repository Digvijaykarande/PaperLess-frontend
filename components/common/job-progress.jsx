import { Check, LoaderCircle } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "upload", label: "Uploading" },
  { id: "process", label: "Processing" },
  { id: "done", label: "Ready" },
]

export function JobProgress({ stage, progress, title, slow }) {
  const current = STEPS.findIndex((s) => s.id === stage)
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center" aria-live="polite">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {slow
          ? "Waking up the server. The first request after a quiet spell can take up to a minute."
          : "This usually takes a few seconds."}
      </p>
      <div className="mt-8 w-full max-w-md">
        <Progress value={progress} />
        <p className="mt-2 text-right text-xs font-medium text-muted-foreground">{progress}%</p>
      </div>
      <ol className="mt-6 flex w-full max-w-md items-center justify-between">
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={step.id} className="flex flex-col items-center gap-2 text-xs font-medium">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary-strong",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : active ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> : i + 1}
              </span>
              <span className={cn(!done && !active && "text-muted-foreground")}>{step.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
