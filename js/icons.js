/* Logo + icônes de catégories (SVG filet or) + utilitaires d'échappement */
(function () {
  const g = (inner, vb) => `<svg class="ico" viewBox="${vb || "0 0 64 64"}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

  const CAT = {
    perfume: g('<rect x="19" y="26" width="26" height="30" rx="3"/><rect x="26" y="17" width="12" height="9" rx="1.5"/><path d="M28 17v-5h8v5"/><path d="M24 36h16"/>'),
    watch: g('<circle cx="32" cy="32" r="13"/><path d="M32 24v8l5 3"/><path d="M27 19l2-10h6l2 10M27 45l2 10h6l2-10"/>'),
    scarf: g('<path d="M10 22c8-6 16 6 24 0s14-6 20 0v20c-6-6-12-6-20 0s-16-6-24 0z"/><path d="M22 28l4 4-4 4M36 28l4 4-4 4"/>'),
    leather: g('<rect x="9" y="17" width="46" height="32" rx="5"/><path d="M9 28h46"/><circle cx="43" cy="38" r="3"/>'),
    eyewear: g('<circle cx="19" cy="36" r="10"/><circle cx="45" cy="36" r="10"/><path d="M29 35c2-2 4-2 6 0M9 34L5 24M55 34l4-10"/>'),
    stationery: g('<path d="M44 8l12 12-30 30-14 4 4-14z"/><path d="M38 14l12 12M16 40l8 8"/>'),
    gourmet: g('<rect x="12" y="14" width="40" height="36" rx="3"/><path d="M12 26h40M12 38h40M25 14v36M38 14v36"/>'),
    care: g('<rect x="14" y="30" width="36" height="24" rx="5"/><rect x="18" y="20" width="28" height="10" rx="3"/><path d="M26 42h12"/>'),
    flowers: g('<path d="M32 30c-8-2-12-10-6-16 3-3 6-2 6 2 0-4 3-5 6-2 6 6 2 14-6 16z"/><path d="M32 30v26M32 44c-6-1-10-4-12-8M32 48c6-1 10-4 12-8"/>'),
    lifestyle: g('<path d="M14 20h28v22a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z"/><path d="M42 26h5a6 6 0 0 1 0 12h-5"/><path d="M22 10c0 3 3 3 3 6M30 10c0 3 3 3 3 6"/>'),
    clothing: g('<path d="M22 10l10-4 10 4 12 8-6 8-6-3v31H22V23l-6 3-6-8z"/><path d="M26 10c1 5 11 5 12 0"/>'),
    accessory: g('<path d="M20 12h24l10 14-22 28L10 26z"/><path d="M10 26h44M24 12l-4 14 12 28 12-28-4-14"/>'),
    other: g('<rect x="10" y="26" width="44" height="28" rx="3"/><path d="M8 18h48v8H8zM32 18v36"/><path d="M32 18c-6-10-18-8-14 0M32 18c6-10 18-8 14 0"/>')
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* URL d'image sûre : relative, https, ou data:image */
  const safeUrl = (u) => {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https:\/\/|\.\/|\/|img\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(u)) return u;
    return "";
  };

  window.ICONS = {
    cat: (k) => CAT[k] || CAT.other,
    esc, safeUrl,
    chev: '<svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M2 6h20v3H2zM12 6v15"/><path d="M12 6C10 2 6 3 7.5 6M12 6c2-4 6-3 4.5 0"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'
  };
})();
