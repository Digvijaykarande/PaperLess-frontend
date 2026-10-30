export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://paperless-e0hpfnaahbd8ajbx.centralindia-01.azurewebsites.net/api/v1"

async function readJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

/** Step 1: ask the backend for a signed Cloudinary upload. */
export async function getUploadSignature() {
  const res = await fetch(`${API_BASE}/storage/signature`)
  const data = await readJson(res)
  if (!res.ok || !data?.signature) {
    throw new Error("Could not start the upload. Is the server running?")
  }
  return data
}

/**
 * Step 2: upload one file straight to Cloudinary.
 * Uses XHR so we can report real upload progress (bytes loaded so far).
 * `resource` is "raw" for documents and "auto" for images.
 */
export function uploadToCloudinary(file, sig, resource, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)
    form.append("api_key", sig.apiKey)
    form.append("timestamp", sig.timestamp)
    form.append("signature", sig.signature)
    form.append("folder", sig.folder)

    const xhr = new XMLHttpRequest()
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resource}/upload`
    )
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded)
    }
    xhr.onload = () => {
      let data = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url) {
        resolve(data.secure_url)
      } else {
        reject(new Error(data?.error?.message ?? `Could not upload ${file.name}.`))
      }
    }
    xhr.onerror = () =>
      reject(new Error("Network error while uploading. Check your connection."))
    xhr.send(form)
  })
}

/** Step 3: run a PDF tool on the uploaded file(s). Resolves to the download URL. */
export async function runTool(endpoint, payload) {
  const res = await fetch(`${API_BASE}/pdf/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await readJson(res)
  if (!data?.downloadUrl) {
    throw new Error(data?.error ?? "Something went wrong while processing your file.")
  }
  return data.downloadUrl
}