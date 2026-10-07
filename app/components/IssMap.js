"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

const issIcon = L.divIcon({
  className: "iss-icon",
  html: "🛰️",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function IssMap({ latitude, longitude }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Karte einmalig erstellen
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 3,
      worldCopyJump: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
    }).addTo(map);
    markerRef.current = L.marker([latitude, longitude], { icon: issIcon, title: "ISS" }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marker bei neuer Position verschieben
  useEffect(() => {
    markerRef.current?.setLatLng([latitude, longitude]);
  }, [latitude, longitude]);

  return <div ref={containerRef} className="map" />;
}
