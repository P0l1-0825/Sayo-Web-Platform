"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-4">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#3E2723] text-white font-bold text-3xl shadow-lg mx-auto">
              S
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#3E2723]">Error inesperado</h1>
              <p className="text-sm text-gray-600">
                Algo salió mal. Por favor intenta de nuevo.
              </p>
              {error?.message && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg p-2 mt-2 break-all">
                  {error.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-lg bg-[#3E2723] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5D4037] transition-colors"
              >
                Reintentar
              </button>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ir al Inicio
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
