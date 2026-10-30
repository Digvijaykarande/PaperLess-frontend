"use client"

import { useState } from "react"
import Link from "next/link"
import { CircleAlert, CircleCheck, Download, LoaderCircle } from "lucide-react"

import { Dropzone } from "@/components/common/dropzone"
import { FileList } from "@/components/common/file-list"
import { JobProgress } from "@/components/common/job-progress"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePdfJob } from "@/hooks/use-pdf-job"
import { getTool } from "@/lib/tools"

const initialValues = (tool) =>
  Object.fromEntries((tool.fields ?? []).map((f) => [f.name, f.defaultValue ?? ""]))

export function ToolWorkspace({ slug }) {
  const tool = getTool(slug)
  const { file: rules } = tool
  const [files, setFiles] = useState([])
  const [values, setValues] = useState(() => initialValues(tool))
  const [formError, setFormError] = useState(null)
  const { job, run, reset } = usePdfJob()

  const running = job.status === "running"
  const needed = rules.min ?? 1

  function addFiles(incoming) {
    const valid = incoming.filter((f) =>
      rules.extensions.includes(f.name.split(".").pop().toLowerCase())
    )
    setFormError(
      valid.length < incoming.length ? `Only ${rules.label} files can be used with this tool.` : null
    )
    if (!valid.length) return
    setFiles((prev) => (rules.multiple ? [...prev, ...valid] : valid))
    if (job.status === "error") reset()
  }

  function move(index, dir) {
    setFiles((prev) => {
      const next = [...prev]
      ;[next[index], next[index + dir]] = [next[index + dir], next[index]]
      return next
    })
  }

  function startOver() {
    reset()
    setFiles([])
    setValues(initialValues(tool))
    setFormError(null)
  }

  function submit(e) {
    e.preventDefault()
    if (files.length < needed) {
      setFormError(`Add at least ${needed} ${needed === 1 ? "file" : "files"} to continue.`)
      return
    }
    const missing = (tool.fields ?? []).find((f) => f.type !== "select" && !f.optional && !values[f.name]?.toString().trim())
    const problem = tool.validate?.(values, files) ?? (missing ? `Fill in “${missing.label}”.` : null)
    if (problem) {
      setFormError(problem)
      return
    }
    setFormError(null)
    run(tool, files, values)
  }

  // ---- Done ----
  if (job.status === "done") {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CircleCheck className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-bold">{tool.result.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your file is ready to download.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={job.downloadUrl} target="_blank" rel="noopener noreferrer" download className={buttonVariants({ size: "lg" })}>
            <Download /> {tool.result.cta}
          </a>
          <Button size="lg" variant="outline" onClick={startOver}>
            Start over
          </Button>
        </div>
        <Link href="/tools" className="mt-6 text-sm font-medium text-primary-strong hover:underline">
          Try another tool
        </Link>
      </div>
    )
  }

  // ---- Working ----
  if (running) {
    return <JobProgress stage={job.stage} progress={job.progress} title={`${tool.action}…`} />
  }

  // ---- Choose / configure ----
  return (
    <form onSubmit={submit} noValidate className="space-y-6 p-4 sm:p-6">
      {(!files.length || rules.multiple) && (
        <Dropzone
          extensions={rules.extensions}
          label={rules.label}
          multiple={rules.multiple}
          compact={files.length > 0}
          onFiles={addFiles}
        />
      )}

      {files.length > 0 && (
        <section aria-label="Selected files" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {rules.multiple ? `Selected files (${files.length})` : "Selected file"}
            </h2>
            {rules.multiple && (
              <Button type="button" variant="link" size="sm" onClick={() => setFiles([])}>
                Clear all
              </Button>
            )}
          </div>
          <FileList
            files={files}
            reorderable={tool.slug === "merge" || tool.slug === "images-to-pdf"}
            onMove={move}
            onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
          {rules.multiple && files.length < needed && (
            <p className="text-sm text-muted-foreground">Add {needed - files.length} more to continue.</p>
          )}
          {tool.slug === "merge" && files.length > 1 && (
            <p className="text-sm text-muted-foreground">Files are merged top to bottom. Use the arrows to change the order.</p>
          )}
        </section>
      )}

      {files.length > 0 && tool.fields?.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {tool.fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === "select" ? (
                <Select
                  items={f.options}
                  value={values[f.name]}
                  onValueChange={(val) => setValues((v) => ({ ...v, [f.name]: val }))}
                >
                  <SelectTrigger id={f.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.name}
                  type={f.type}
                  min={f.min}
                  placeholder={f.placeholder}
                  autoComplete={f.type === "password" ? "off" : undefined}
                  value={values[f.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
              {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
        </div>
      )}

      {(formError || job.status === "error") && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {formError ?? job.error}
        </p>
      )}

      {files.length > 0 && (
        <Button type="submit" size="lg" className="w-full" disabled={running}>
          {running && <LoaderCircle className="animate-spin" />} {tool.action}
        </Button>
      )}
    </form>
  )
}
