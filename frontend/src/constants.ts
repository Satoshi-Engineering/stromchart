let BACKEND_API_ORIGIN = import.meta.env.VITE_BACKEND_API_ORIGIN || document.location.origin
if (import.meta.env.VITE_BUILD_LIBS === '1') {
  BACKEND_API_ORIGIN = import.meta.env.VITE_LIBS_BACKEND_API_ORIGIN
}

export {
  BACKEND_API_ORIGIN,
}
export const DEFAULT_DOCUMENT_TITLE = import.meta.env.VITE_DEFAULT_DOCUMENT_TITLE || 'Stromchart'
