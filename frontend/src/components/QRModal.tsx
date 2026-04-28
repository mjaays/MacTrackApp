import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import '../styles/QRModal.css'

export function QRModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/network/network-url')
      .then(r => r.json())
      .then(d => setUrl(d.url))
      .catch(() => setUrl(window.location.origin))
  }, [])

  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <div className="qr-header">
          <h3>Open on mobile</h3>
          <button className="qr-close" onClick={onClose}>&#x2715;</button>
        </div>
        {url ? (
          <>
            <div className="qr-code-wrap">
              <QRCodeSVG value={url} size={220} level="M" />
            </div>
            <p className="qr-url">{url}</p>
          </>
        ) : (
          <p className="qr-loading">Getting network address…</p>
        )}
        <p className="qr-hint">Connect to the same WiFi, then scan</p>
      </div>
    </div>
  )
}
