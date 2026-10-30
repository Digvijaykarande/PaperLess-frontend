import { cn } from "@/lib/utils"

function Label({ className, ...props }) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  )
}

export { Label }
