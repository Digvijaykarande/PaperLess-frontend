"use client"

import { useCallback, useState } from "react"
import { getUploadSignature, runTool, uploadToCloudinary } from "@/lib/api"

const IDLE = { status: "idle", stage: null, progress: 0, downloadUrl: null, error: null }

/**
 * Runs the whole job for a tool: upload -> process -> download link.
 * stage: "upload" | "process" | "done"
 */
export function usePdfJob() {
  const [job, setJob] = useState(IDLE)

  const run = useCallback(async (tool, files, values) => {
    setJob({ ...IDLE, status: "running", stage: "upload" })
    try {
      const sig = await getUploadSignature()
      const totalBytes = files.reduce((sum, f) => sum + f.size, 0) || 1
      const urls = []
      let uploadedBytes = 0

      for (const file of files) {
        const url = await uploadToCloudinary(file, sig, tool.resource, (loaded) => {
          const pct = Math.round(((uploadedBytes + loaded) / totalBytes) * 80)
          setJob((j) => ({ ...j, progress: Math.max(j.progress, pct) }))
        })
        uploadedBytes += file.size
        urls.push(url)
      }

      setJob((j) => ({ ...j, stage: "process", progress: 85 }))
      const downloadUrl = await runTool(tool.endpoint, tool.buildPayload(urls, values))
      setJob({ status: "done", stage: "done", progress: 100, downloadUrl, error: null })
    } catch (err) {
      setJob({ ...IDLE, status: "error", error: err.message })
    }
  }, [])

  const reset = useCallback(() => setJob(IDLE), [])

  return { job, run, reset }
}
