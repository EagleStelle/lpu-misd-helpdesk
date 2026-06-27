export function getRuntimeConfig(key, fallback = "") {
  const browserConfig =
    typeof window !== "undefined" ? window.__APP_CONFIG__ || {} : {};
  const env = import.meta.env || {};

  const value =
    browserConfig[key] ??
    browserConfig[`VITE_${key}`] ??
    env[key] ??
    env[`VITE_${key}`];

  return value ?? fallback;
}
