'use client'

import { useState } from 'react'

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('disclaimer_dismissed') === 'true'
  )

  if (dismissed) return null

  return (
    <div
      className="relative flex shrink-0 items-center justify-center px-10 py-1.5 text-xs font-medium"
      style={{
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger-text)',
      }}
    >
      &#9888; Base de conocimiento experimental con IA. No es asesoría fiscal ni jurídica.
      Consulta siempre a la AEAT o a un gestor cualificado.
      <button
        onClick={() => {
          sessionStorage.setItem('disclaimer_dismissed', 'true')
          setDismissed(true)
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-sm opacity-70 transition-opacity hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        &#x00D7;
      </button>
    </div>
  )
}
