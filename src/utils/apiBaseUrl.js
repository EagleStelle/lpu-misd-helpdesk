import { getRuntimeConfig } from "./runtimeConfig.js";

export function getApiBaseUrl() {
  const normalizeBaseUrl = (url) => {
    if (url === "/") return "";
    return (url || "").replace(/\/$/, "");
  };

  const localUrl = normalizeBaseUrl(
    getRuntimeConfig("VITE_API_BASE_URL_LOCAL", "http://localhost:5000"),
  );
  const prodUrl = normalizeBaseUrl(getRuntimeConfig("VITE_API_BASE_URL_PROD"));

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocalhost) return localUrl;

  // In production, prefer explicit prod URL; otherwise assume same-origin (useful if you proxy)
  return prodUrl || window.location.origin;
}

