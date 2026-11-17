// Helpers de URL — config-free.
// withBase: prefixa com a base do site (import.meta.env.BASE_URL).
// absUrl: URL absoluta usando o origin de import.meta.env.SITE (injetado pelo astro.config `site`).
export function withBase(path = '/'): string {
  const p = String(path);
  // URL absoluta, protocol-relative ou esquema (mailto:, tel:, #) passa direto:
  // prefixar a base transformaria https://... em /https://...
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(p)) return p;
  const base = import.meta.env.BASE_URL;
  return (base.replace(/\/$/, '') + '/' + p.replace(/^\//, '')).replace(/([^:])\/{2,}/g, '$1/');
}

export function absUrl(path = '/'): string {
  return new URL(withBase(path), String(import.meta.env.SITE)).href;
}
