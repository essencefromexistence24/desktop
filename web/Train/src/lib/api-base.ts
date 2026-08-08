let apiBase = ''

function detectTauri(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    '__TAURI__' in window ||
    '__TAURI_INTERNALS__' in window ||
    window.location.protocol === 'tauri:'
  )
}

const isTauri = detectTauri()
const isViteDev = import.meta.env.DEV

// The desktop preview serves this app as a static SPA (not inside Tauri), so
// point API calls at the local train backend. The backend is expected on the
// canonical port (8888); `setApiBase`/`use-tauri-backend` can override it.
if (!isViteDev) {
  apiBase = 'http://127.0.0.1:8888'
}

const initialApiBase = apiBase

export function resetApiBase() {
  apiBase = initialApiBase
}

export function setApiBase(port: number) {
  apiBase = `http://127.0.0.1:${port}`
}

export function getApiBase(): string {
  return apiBase
}

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${apiBase}${path}`
}

export { isTauri }
