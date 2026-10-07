"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Leaflet greift auf window zu und darf daher nur im Browser geladen werden.
const IssMap = dynamic(() => import("./IssMap"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Karte wird geladen …</div>,
});

const API_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const POLL_INTERVAL_MS = 5000;
const REQUEST_TIMEOUT_MS = 8000;

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const coordFormat = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

function formatLatitude(lat) {
  return `${coordFormat.format(Math.abs(lat))}° ${lat >= 0 ? "N" : "S"}`;
}

function formatLongitude(lon) {
  return `${coordFormat.format(Math.abs(lon))}° ${lon >= 0 ? "O" : "W"}`;
}

export default function Tracker() {
  const [iss, setIss] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;
    let cancelled = false;

    async function fetchPosition() {
      try {
        const res = await fetch(API_URL, {
          cache: "no-store",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setIss({
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          velocity: data.velocity,
          visibility: data.visibility,
          timestamp: data.timestamp,
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.warn("ISS-Position konnte nicht geladen werden:", err);
        setError("Die ISS-Daten sind gerade nicht erreichbar. Wir versuchen es automatisch erneut …");
      } finally {
        // Polling läuft auch nach Fehlern weiter.
        if (!cancelled) timeoutId = setTimeout(fetchPosition, POLL_INTERVAL_MS);
      }
    }

    fetchPosition();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className="layout">
      <header className="header">
        <div>
          <h1>🛰️ ISS-Live-Tracker</h1>
          <p>Aktuelle Position der Internationalen Raumstation – aktualisiert alle 5 Sekunden.</p>
        </div>
        <ThemeToggle />
      </header>

      {error && (
        <div className="alert" role="alert">
          {error}
          {iss && " Angezeigt wird die zuletzt bekannte Position."}
        </div>
      )}

      <section className="map-wrapper">
        {iss ? (
          <IssMap latitude={iss.latitude} longitude={iss.longitude} />
        ) : (
          <div className="map-placeholder">
            {error ? "Noch keine Positionsdaten verfügbar." : "Position wird geladen …"}
          </div>
        )}
      </section>

      <section className="stats" aria-live="polite">
        <Stat label="Breite" value={iss ? formatLatitude(iss.latitude) : "–"} />
        <Stat label="Länge" value={iss ? formatLongitude(iss.longitude) : "–"} />
        <Stat label="Höhe" value={iss ? `${numberFormat.format(iss.altitude)} km` : "–"} />
        <Stat
          label="Geschwindigkeit"
          value={iss ? `${numberFormat.format(iss.velocity)} km/h` : "–"}
        />
      </section>

      <footer className="footer">
        {iss && (
          <span>
            Stand: {new Date(iss.timestamp * 1000).toLocaleTimeString("de-DE")} Uhr ·{" "}
          </span>
        )}
        Daten: <a href="https://wheretheiss.at" target="_blank" rel="noreferrer">wheretheiss.at</a>
      </footer>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
