import "leaflet/dist/leaflet.css";
import "./globals.css";
import { THEME_STORAGE_KEY } from "./components/theme";

export const metadata = {
  title: "ISS-Live-Tracker",
  description: "Aktuelle Position der Internationalen Raumstation live auf der Karte",
};

// Läuft vor dem ersten Zeichnen, damit nicht kurz das falsche Farbschema aufblitzt.
const themeScript = `(function () {
  var t = null;
  try { t = localStorage.getItem("${THEME_STORAGE_KEY}"); } catch (e) {}
  if (t !== "light" && t !== "dark") {
    try { t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; }
    catch (e) { t = "dark"; }
  }
  document.documentElement.dataset.theme = t;
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
