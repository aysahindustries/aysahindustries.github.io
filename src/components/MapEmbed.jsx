export function mapSrc(settings) {
  let src = (settings.map_embed_url || '').trim()
  // Accept a full <iframe ...> snippet pasted from Google Maps.
  const m = src.match(/src=["']([^"']+)["']/)
  if (m) src = m[1]
  if (!src) src = `https://www.google.com/maps?q=${encodeURIComponent(settings.address || 'Kigali, Rwanda')}&output=embed`
  return src
}

export default function MapEmbed({ settings, height = 220, className = '' }) {
  return (
    <iframe
      className={'map ' + className}
      title="Map"
      src={mapSrc(settings)}
      style={{ height }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  )
}
