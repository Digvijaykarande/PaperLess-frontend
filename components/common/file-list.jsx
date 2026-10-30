import { ChevronDown, ChevronUp, FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/utils"

export function FileList({ files, reorderable, disabled, onMove, onRemove }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {files.map((file, i) => (
        <li key={`${file.name}-${file.size}-${i}`} className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          {reorderable && files.length > 1 && (
            <div className="flex">
              <Button variant="ghost" size="icon-sm" disabled={disabled || i === 0} onClick={() => onMove(i, -1)} aria-label={`Move ${file.name} up`}>
                <ChevronUp />
              </Button>
              <Button variant="ghost" size="icon-sm" disabled={disabled || i === files.length - 1} onClick={() => onMove(i, 1)} aria-label={`Move ${file.name} down`}>
                <ChevronDown />
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon-sm" disabled={disabled} onClick={() => onRemove(i)} aria-label={`Remove ${file.name}`}>
            <X />
          </Button>
        </li>
      ))}
    </ul>
  )
}
