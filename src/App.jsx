import React, { useState } from 'react'

export default function App() {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)

  // Accept optional coordinates so callers can pass fresh values (e.g. from geolocation)
  async function getForecast(latParam, lonParam) {
    const latToUse = latParam ?? lat
    const lonToUse = lonParam ?? lon

    setError(null)
    setResult(null)
    setLoading(true)
    try {
      if (!latToUse || !lonToUse) throw new Error('Latitude and longitude must be provided')
      const resp = await fetch(`http://localhost:3000/forecast?lat=${encodeURIComponent(latToUse)}&lon=${encodeURIComponent(lonToUse)}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleUseLocation() {
    setError(null)
    setGeoLoading(true)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setGeoLoading(false)
      return
    }

    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        // Keep 6 decimal places for readability
        const latStr = String(Number(latitude).toFixed(6))
        const lonStr = String(Number(longitude).toFixed(6))
        setLat(latStr)
        setLon(lonStr)
        setGeoLoading(false)
        // Automatically fetch forecast for current location
        getForecast(latStr, lonStr)
      },
      err => {
        setError('Unable to retrieve location: ' + (err.message || err.code))
        setGeoLoading(false)
      },
      options
    )
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => getForecast()} disabled={loading}>Get Forecast</button>
          <button onClick={handleUseLocation} disabled={geoLoading || loading}>
            {geoLoading ? 'Locating…' : 'Use my location & Get Forecast'}
          </button>
        </div>
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
