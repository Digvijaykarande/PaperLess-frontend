import { cn } from "@/lib/utils"

function Progress({ value = 0, className, ...props }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-primary-soft", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export { Progress }
