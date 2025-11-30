import React, { useState } from 'react'

type ForecastResult = {
  shortForecast: string
  temperature?: number
  characterization?: string
}

export default function App() {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ForecastResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function getForecast() {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const resp = await fetch(`http://localhost:3000/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Weather Lookup</h1>
      <div className="form">
        <label>
          Latitude
          <input value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 39.7456" />
        </label>
        <label>
          Longitude
          <input value={lon} onChange={e => setLon(e.target.value)} placeholder="e.g. -97.0892" />
        </label>
        <button onClick={getForecast} disabled={loading}>Get Forecast</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">Error: {error}</p>}
      {result && (
        <div className="result">
          <p><strong>Short Forecast:</strong> {result.shortForecast}</p>
          <p><strong>Temperature:</strong> {result.temperature}</p>
          <p><strong>Characterization:</strong> {result.characterization}</p>
        </div>
      )}

      <footer>
        <small>Backend: http://localhost:3000</small>
      </footer>
    </div>
  )
}
