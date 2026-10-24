/* SIGNATURE — application cliente (site + PWA), FR / AR — v2 */
(function () {
  "use strict";
  const T = (k, v) => I18N.t(k, v), F = (o, b) => I18N.f(o, b), M = (n) => I18N.money(n);
  const esc = ICONS.esc, safe = ICONS.safeUrl;
  const $ = (s, r) => (r || document).querySelector(s);
  const jump = (y) => { try { window.scrollTo({ top: y, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, y); } };
  const root = () => $("#app");
  const CFG = window.SIGNATURE_CONFIG || {};

  let CATALOG = null, USER = null, IS_ADMIN = false, deferredInstall = null, routeToken = 0;

  /* ---------- brouillon de box (persistant) ---------- */
  const DKEY = "sig_draft_v2";
  let draft = { step: 1, size_id: "", material_id: "", color_id: "", items: [], message: "", form: { name: "", phone: "", wilaya: "", commune: "", address: "", delivery_note: "" } };
  try { const raw = JSON.parse(localStorage.getItem(DKEY) || "null"); if (raw && typeof raw === "object") draft = Object.assign(draft, raw, { form: Object.assign(draft.form, raw.form || {}) }); } catch (e) {}
  if (!Array.isArray(draft.items)) draft.items = [];
  const saveDraft = () => { try { localStorage.setItem(DKEY, JSON.stringify(draft)); } catch (e) {} };

  /* ---------- utilitaires ---------- */
  function toast(msg, ms) {
    const old = $(".toast"); if (old) old.remove();
    const el = document.createElement("div"); el.className = "toast"; el.textContent = msg; el.setAttribute("role", "status");
    document.body.appendChild(el); setTimeout(() => el.remove(), ms || 3200);
  }
  const sorted = (a) => a.slice().sort((x, y) => (x.sort || 0) - (y.sort || 0));
  const active = (a) => sorted(a.filter(x => x.active !== false));
  const opts = (type) => active(CATALOG.options.filter(o => o.type === type));
  const optById = (id) => CATALOG.options.find(o => o.id === id);
  const prodById = (id) => CATALOG.products.find(p => p.id === id);
  const available = (p) => p && p.active !== false && p.in_stock !== false;
  const slotsOf = (p) => Math.max(1, Number(p && p.slots) || 1);
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());
  const cleanPhone = (s) => String(s).replace(/[\s.\-()]/g, "");
  const isPhone = (s) => /^(?:\+213|00213|0)[2-7]\d{7,8}$/.test(cleanPhone(s));
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const hexOk = (h, d) => (/^#[0-9a-f]{3,8}$/i.test(h || "") ? h : d);
  const ERR = { missing_fields: "err_required", invalid_options: "err_options", invalid_color: "err_color", invalid_product: "err_unavailable", empty_box: "err_empty", over_capacity: "err_capacity", auth: "err_auth", exists: "err_exists", weak: "err_weak", rate: "err_rate", otp: "err_otp", unconfirmed: "err_unconfirmed", not_authenticated: "need_login" };
  const errMsg = (e) => T(ERR[(e && (e.code || e.message)) || ""] || "err_generic");

  /* matière → couleurs associées */
  const colorsFor = (matId) => opts("color").filter(c => !c.material_id || c.material_id === matId);
  function ensureDefaults() {
    const sizes = opts("size"), mats = opts("material");
    if (sizes.length && !sizes.some(o => o.id === draft.size_id)) draft.size_id = sizes[0].id;
    if (!sizes.length) draft.size_id = "";
    if (mats.length && !mats.some(o => o.id === draft.material_id)) draft.material_id = mats[0].id;
    if (!mats.length) draft.material_id = "";
    const cols = colorsFor(draft.material_id);
    if (cols.length && !cols.some(o => o.id === draft.color_id)) draft.color_id = cols[0].id;
    if (!cols.length) draft.color_id = "";
    draft.items = draft.items.filter((id, i, a) => typeof id === "string" && a.indexOf(id) === i && available(prodById(id)));
    const cap = capacity();
    while (usedSlots() > cap && draft.items.length) draft.items.pop();   // sécurité (catalogue modifié entre-temps)
  }
  const capacity = () => { const s = optById(draft.size_id); return s && s.capacity ? Number(s.capacity) : Infinity; };
  const usedSlots = () => draft.items.reduce((a, id) => a + slotsOf(prodById(id)), 0);
  const boxPrice = () => ["size_id", "material_id", "color_id"].reduce((a, k) => a + (optById(draft[k]) ? Number(optById(draft[k]).price) || 0 : 0), 0);
  const itemsTotal = () => draft.items.reduce((a, id) => a + (prodById(id) ? Number(prodById(id).price) || 0 : 0), 0);
  const deliveryFee = () => Number(CATALOG.settings.delivery_fee) || 0;
  const grandTotal = () => boxPrice() + itemsTotal() + deliveryFee();
  const slotLabel = (n) => (n > 1 ? T("slot_n", { n }) : T("slot_1"));
  const logoImg = (cls) => `<img class="${cls}" src="img/logo-emblem.webp" alt="" width="258" height="560" decoding="async">`;
  const waLink = (text) => { const w = digits(CATALOG && CATALOG.settings.whatsapp); return w ? `https://wa.me/${w}${text ? "?text=" + encodeURIComponent(text) : ""}` : ""; };

  /* ---------- fenêtre modale légère ---------- */
  function openModal(html, cls) {
    closeModal();
    const bg = document.createElement("div"); bg.className = "modal-bg"; bg.id = "site-modal"; bg.setAttribute("role", "dialog"); bg.setAttribute("aria-modal", "true");
    bg.innerHTML = `<div class="modal ${cls || ""}">${html}</div>`;
    bg.addEventListener("click", (e) => { if (e.target === bg) closeModal(); });
    document.body.appendChild(bg); document.body.classList.add("noscroll");
  }
  function closeModal() { const m = $("#site-modal"); if (m) m.remove(); document.body.classList.remove("noscroll"); }

  /* ---------- installation (Android / iOS) ---------- */
  function installButtons(cls) {
    return `<div class="install ${cls || ""}">
      <button class="btn btn-line" type="button" data-act="install-android"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6 18a1 1 0 0 0 1 1h1v3a1.5 1.5 0 0 0 3 0v-3h2v3a1.5 1.5 0 0 0 3 0v-3h1a1 1 0 0 0 1-1V8H6zM3.5 8A1.5 1.5 0 0 0 2 9.5v6a1.5 1.5 0 0 0 3 0v-6A1.5 1.5 0 0 0 3.5 8zm17 0A1.5 1.5 0 0 0 19 9.5v6a1.5 1.5 0 0 0 3 0v-6A1.5 1.5 0 0 0 20.5 8zM15.5 2.2l1.2-1.7-.5-.4-1.3 1.8a6 6 0 0 0-5.8 0L7.8.1l-.5.4 1.2 1.7A5.9 5.9 0 0 0 6 7h12a5.9 5.9 0 0 0-2.5-4.8zM9.5 5.3a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zm5 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z"/></svg><span>${esc(T("install_android"))}</span></button>
      <button class="btn btn-line" type="button" data-act="install-ios"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg><span>${esc(T("install_ios"))}</span></button>
    </div>`;
  }
  function installAndroid() {
    if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice && deferredInstall.userChoice.then(() => { deferredInstall = null; }).catch(() => {}); return; }
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return toast(T("install_ready") + " ✓");
    if (CFG.APK_URL) { location.href = CFG.APK_URL; return; }
    openModal(`<h3>${esc(T("install_android"))}</h3><p>${esc(T("install_howto"))}</p><div class="foot"><span></span><button class="btn btn-gold btn-sm" type="button" data-act="close-modal">${esc(T("close"))}</button></div>`);
  }
  function installIos() {
    openModal(`<h3>${esc(T("install_ios"))}</h3><p>${esc(T("ios_building"))}</p><div class="foot"><span></span><button class="btn btn-gold btn-sm" type="button" data-act="close-modal">${esc(T("close"))}</button></div>`);
  }

  /* ---------- structure : en-tête / pied ---------- */
  function brandHTML() {
    return `<a class="brand" href="#/" aria-label="Signature Gift Collections">${logoImg("logo-emblem")}<img class="logo-word" src="img/logo-wordmark.webp" alt="Signature Gift Collections" width="611" height="135" decoding="async"></a>`;
  }
  function chrome() {
    const s = CATALOG ? CATALOG.settings : {};
    const ann = CATALOG ? F(s, "announce") : "";
    const h = location.hash.replace(/^#\/?/, "").split("/")[0];
    $("#top").innerHTML = `
      ${DB.demo ? `<div class="demo-bar">${esc(T("demo_banner"))}</div>` : ""}
      ${ann ? `<div class="announce">${esc(ann)}</div>` : ""}
      <header class="site-header quilt"><div class="container bar">
        ${brandHTML()}
        <nav class="nav">
          <a href="#/compose" class="${h === "compose" ? "on" : ""}" aria-label="${esc(T("nav_compose"))}">${ICONS.gift}<span class="nav-text">${esc(T("nav_compose"))}</span></a>
          <a href="#/account" class="${h === "account" || h === "orders" ? "on" : ""}" aria-label="${esc(T("nav_account"))}">${ICONS.user}<span class="nav-text">${esc(USER ? T("nav_account") : T("nav_login"))}</span></a>
          <button class="lang" data-act="lang" type="button">${esc(T("lang_switch"))}</button>
        </nav>
      </div></header>`;
    const ig = s.instagram ? `<li><a href="https://instagram.com/${encodeURIComponent(s.instagram)}" target="_blank" rel="noopener">Instagram @${esc(s.instagram)}</a></li>` : "";
    const wa = s.whatsapp ? `<li><a href="https://wa.me/${digits(s.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a></li>` : "";
    $("#foot").innerHTML = `
      <footer class="site-footer quilt"><div class="container">
        <div><a class="brand foot-brand" href="#/" aria-label="Signature Gift Collections">${logoImg("logo-emblem")}<span><img class="logo-word" src="img/logo-wordmark.webp" alt="" width="611" height="135" loading="lazy"><img class="logo-tag" src="img/logo-tagline.webp" alt="${esc(T("motto"))}" width="439" height="67" loading="lazy"></span></a></div>
        <div><h4>${esc(T("footer_contact"))}</h4><ul>
          ${s.phone ? `<li><a href="tel:${esc(cleanPhone(s.phone))}">${esc(s.phone)}</a></li>` : ""}
          ${s.email ? `<li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>` : ""}
          ${wa}${ig}</ul></div>
        <div><h4>${esc(T("brand"))}</h4><ul>
          <li><a href="#/compose">${esc(T("nav_compose"))}</a></li>
          <li><a href="#/collections">${esc(T("nav_collections"))}</a></li>
          <li><a href="#/account">${esc(USER ? T("nav_account") : T("nav_login"))}</a></li></ul>
          ${installButtons("small")}</div>
      </div><div class="copyright">© ${new Date().getFullYear()} Signature Gift Collections — ${esc(T("footer_rights"))}</div></footer>`;
  }

  /* ---------- accueil ---------- */
  function splitTag(s) {
    const i = [s.indexOf(","), s.indexOf("…")].filter(x => x > -1).sort((a, b) => a - b)[0];
    return i == null ? [s, ""] : [s.slice(0, i + 1), s.slice(i + 1).trim()];
  }
  function collectionCard(c) {
    const size = c.kind === "size" ? CATALOG.options.find(o => o.type === "size" && (o.code === c.ref || o.id === c.ref)) : null;
    const meta = c.kind === "size" && size ? `${T("opt_empty_box")} · ${M(size.price)}` : T("col_quote");
    const act = c.kind === "size"
      ? `<button class="btn btn-line btn-sm" data-act="usecol" data-id="${esc(c.id)}" type="button">${esc(T("col_use"))} ${ICONS.chev}</button>`
      : `<a class="btn btn-line btn-sm" href="#/quote/${esc(c.ref || c.code)}">${esc(T("col_quote"))} ${ICONS.chev}</a>`;
    return `<article class="col-card">
      <div class="ph">${safe(c.image_url) ? `<img src="${esc(safe(c.image_url))}" alt="${esc(F(c, "name"))}" loading="lazy">` : ""}</div>
      <div class="bd"><div class="meta">${esc(meta)}</div>
        <h3>${esc(F(c, "name"))}</h3><p>${esc(F(c, "tagline"))}</p>${act}</div></article>`;
  }
  function homeView() {
    const s = CATALOG.settings, [a, b] = splitTag(T("tagline"));
    const cols = active(CATALOG.collections);
    return `
    <section class="hero quilt"><div class="container">
      <div><div class="kicker">${esc(T("hero_kicker"))}</div>
        <h1>${esc(a)} <em>${esc(b)}</em></h1>
        <p>${esc(T("hero_text"))}</p>
        <div class="cta"><a class="btn btn-gold" href="#/compose">${esc(T("cta_compose"))}</a><a class="btn btn-line" href="#/collections">${esc(T("cta_discover"))}</a></div>
        <div class="motto">${esc(T("motto"))}</div></div>
      <figure><img src="img/hero.jpg" alt="Signature Gift Collections" width="1100" height="1004" fetchpriority="high"></figure>
    </div></section>
    <section class="section" id="collections"><div class="container">
      <div class="sec-head"><h2>${esc(T("col_title"))}</h2><div class="orn"><i></i></div><p>${esc(T("col_sub"))}</p></div>
      <div class="grid-col">${cols.map(collectionCard).join("")}</div>
    </div></section>
    <section class="section" style="background:var(--cream-2)"><div class="container">
      <div class="sec-head"><h2>${esc(T("how_title"))}</h2><div class="orn"><i></i></div></div>
      <div class="steps">${[1, 2, 3, 4].map(n => `<div class="step"><h3>${esc(T("how_" + n + "_t"))}</h3><p>${esc(T("how_" + n + "_d"))}</p></div>`).join("")}</div>
    </div></section>
    <section class="section values-sec"><div class="container">
      <div class="sec-head"><h2>${esc(T("val_title"))}</h2><div class="orn"><i></i></div></div>
      <div class="values3">${[1, 2, 3].map(n => `<div class="val"><div class="val-n">${n}</div><h3>${esc(T("val_" + n))}</h3><p>${esc(T("val_" + n + "_d"))}</p></div>`).join("")}</div>
    </div></section>
    <section class="section dark quilt"><div class="container corp">
      <div><div class="kicker">${esc(T("footer_install"))}</div><h2 class="gold-text" style="margin-top:8px">Signature</h2></div>
      <p>${esc(T("install_howto"))}</p>
      ${installButtons("center")}
    </div></section>`;
  }

  /* ---------- devis (VIP Corporate / Bespoke) ---------- */
  function quoteView(ref) {
    const c = CATALOG.collections.find(x => x.kind === "quote" && (x.ref === ref || x.code === ref));
    if (!c) { location.hash = "#/"; return ""; }
    const name = F(c, "name"), key = "quote_" + String(c.ref || c.code).replace(/-/g, "_");
    const desc = I18N.t(key) === key ? F(c, "tagline") : T(key);
    return `<div class="container page"><div class="quote">
      <a class="back" href="#/collections">${ICONS.chev}<span>${esc(T("nav_collections"))}</span></a>
      <div class="q-hero">${safe(c.image_url) ? `<img src="${esc(safe(c.image_url))}" alt="${esc(name)}" loading="lazy">` : ""}</div>
      <h2>${esc(T("quote_title"))}</h2>
      <div class="q-name gold-text">${esc(name)}</div>
      <p class="q-desc">${esc(desc)}</p>
      <p class="muted center" style="margin-bottom:16px">${esc(T("quote_sub"))}</p>
      <form class="form" id="quote-form" data-name="${esc(name)}" novalidate>
        <div class="row2"><div class="fld"><label for="q-n">${esc(T("q_name"))}</label><input id="q-n" autocomplete="name"></div>
          <div class="fld"><label for="q-c">${esc(T("q_company"))}</label><input id="q-c" autocomplete="organization"></div></div>
        <div class="fld"><label for="q-q">${esc(T("q_qty"))}</label><input id="q-q" inputmode="numeric"></div>
        <div class="fld"><label for="q-d">${esc(T("q_need"))}</label><textarea id="q-d" style="min-height:90px" dir="auto"></textarea></div>
        <a class="btn btn-gold" id="q-wa" href="${esc(quoteHref(name, {}))}" target="_blank" rel="noopener">${esc(T("btn_quote_wa"))}</a>
      </form></div></div>`;
  }
  function quoteHref(name, v) {
    const lines = [T("quote_wa_hi", { c: name })];
    if (v.n) lines.push(T("q_name") + " : " + v.n);
    if (v.c) lines.push(T("q_company") + " : " + v.c);
    if (v.q) lines.push(T("q_qty") + " : " + v.q);
    if (v.d) lines.push(v.d);
    const msg = lines.join("\n");
    const w = waLink(msg);
    return w || `mailto:${(CATALOG && CATALOG.settings.email) || ""}?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(msg)}`;
  }

  /* ---------- composition ---------- */
  function previewHTML() {
    const cap = capacity(), items = draft.items.map(prodById).filter(Boolean), used = usedSlots();
    const total = Number.isFinite(cap) ? cap : Math.max(6, used);
    const cols = total <= 4 ? 4 : total <= 6 ? 3 : 4;
    const color = optById(draft.color_id), size = optById(draft.size_id), mat = optById(draft.material_id);
    const filled = items.map(p => {
      const n = Math.min(slotsOf(p), cols), img = safe(p.image_url);
      return `<div class="slot f" style="grid-column:span ${n};aspect-ratio:${n}/1" title="${esc(F(p, "name"))}">${img ? `<img src="${esc(img)}" alt="">` : ICONS.cat(p.category)}</div>`;
    }).join("");
    const empties = Array.from({ length: Math.max(0, total - used) }, () => `<div class="slot"></div>`).join("");
    const fee = deliveryFee();
    return `<div class="preview">
      <h4>${esc(T("sum_box"))} <span>${esc([size && size.description_fr ? F(size, "description") : size && F(size, "name"), mat && F(mat, "name"), color && F(color, "name")].filter(Boolean).join(" · "))}</span></h4>
      <div class="boxprev" style="--box:${esc(hexOk(color && color.hex, "#17120f"))};--cols:${cols}"><div class="gr">${filled}${empties}</div></div>
      ${Number.isFinite(cap) ? `<div class="cases-line">${esc(T("content_count", { n: used, max: cap }))}</div>` : ""}
      <div class="prev-lines">
        <div><span>${esc(T("opt_empty_box"))}</span><span>${M(boxPrice())}</span></div>
        <div><span>${esc(T("sum_items"))} (${items.length})</span><span>${M(itemsTotal())}</span></div>
        <div><span>${esc(T("sum_delivery"))}</span><span>${fee > 0 ? M(fee) : esc(T("sum_delivery_tbc"))}</span></div>
        <div class="tot"><span>${esc(T("sum_total"))}</span><span>${M(grandTotal())}</span></div>
      </div></div>`;
  }

  function stepperHTML(step) {
    const names = ["step_box", "step_content", "step_note", "step_order"];
    return `<ol class="stepper" aria-label="${esc(T("step_n", { n: step, t: 4 }))}">${names.map((k, i) => `<li class="${i + 1 === step ? "on" : i + 1 < step ? "sdone" : ""}" ${i + 1 < step ? `data-act="goto" data-step="${i + 1}"` : ""}>${esc(T(k))}</li>`).join("")}</ol>`;
  }

  function step1HTML() {
    const sizes = opts("size"), mats = opts("material"), cols = colorsFor(draft.material_id);
    const sw = (o) => `<span class="sw" style="background:${esc(hexOk(o.hex, "#ccc"))}"></span>`;
    return `<h2>${esc(T("box_title"))}</h2><p class="sub">${esc(T("box_sub"))}</p>
      <div class="opt-group"><h3>${esc(T("opt_size"))}</h3><div class="opts sizes">${sizes.map(o => {
        const on = draft.size_id === o.id;
        return `<button type="button" class="opt" data-act="opt" data-type="size" data-id="${esc(o.id)}" aria-pressed="${on}">
          <b>${esc(F(o, "name"))}</b>${F(o, "description") ? `<em>${esc(F(o, "description"))}</em>` : ""}
          <small>${o.capacity ? esc(T("opt_capacity", { n: o.capacity })) : ""}</small>
          <span class="pr">${esc(T("opt_empty_box"))} · ${M(o.price)}</span><span class="tick">${ICONS.check}</span></button>`;
      }).join("")}</div></div>
      ${mats.length ? `<div class="opt-group"><h3>${esc(T("opt_matcolor"))}</h3>
        <div class="seg" role="tablist">${mats.map(m => `<button type="button" role="tab" data-act="opt" data-type="material" data-id="${esc(m.id)}" aria-pressed="${draft.material_id === m.id}">${esc(F(m, "name"))}${Number(m.price) > 0 ? ` <small>+ ${M(m.price)}</small>` : ""}</button>`).join("")}</div>
        <div class="opts colors">${cols.map(o => {
          const on = draft.color_id === o.id;
          return `<button type="button" class="opt color" data-act="opt" data-type="color" data-id="${esc(o.id)}" aria-pressed="${on}">${sw(o)}<b>${esc(F(o, "name"))}</b>${Number(o.price) > 0 ? `<span class="pr">+ ${M(o.price)}</span>` : ""}<span class="tick">${ICONS.check}</span></button>`;
        }).join("")}</div></div>` : ""}`;
  }

  const CAT_ORDER = ["perfume", "leather", "care", "accessory", "watch", "scarf", "clothing", "gourmet", "lifestyle", "eyewear", "stationery", "flowers", "other"];
  let catFilter = "all";
  function step2HTML() {
    const prods = sorted(CATALOG.products.filter(p => p.active !== false));
    const present = [...new Set(prods.map(p => p.category || "other"))].sort((a, b) => (CAT_ORDER.indexOf(a) + 99 * (CAT_ORDER.indexOf(a) < 0)) - (CAT_ORDER.indexOf(b) + 99 * (CAT_ORDER.indexOf(b) < 0)));
    if (catFilter !== "all" && !present.includes(catFilter)) catFilter = "all";
    const cap = capacity(), used = usedSlots(), left = cap - used;
    const list = prods.filter(p => catFilter === "all" || (p.category || "other") === catFilter);
    return `<h2>${esc(T("content_title"))}</h2><p class="sub">${esc(T("content_sub"))}</p>
      <div class="count-bar"><b>${esc(Number.isFinite(cap) ? T("content_count", { n: used, max: cap }) : T("content_count_free", { n: used }))}</b><div class="meter"><i style="width:${Number.isFinite(cap) ? Math.min(100, used / cap * 100) : Math.min(100, used * 12)}%"></i></div></div>
      ${Number.isFinite(cap) && left <= 0 ? `<div class="full-msg">${esc(T("content_full"))}</div>` : ""}
      <div class="cats"><button type="button" class="chip" data-act="cat" data-cat="all" aria-pressed="${catFilter === "all"}">${esc(T("cat_all"))}</button>
        ${present.map(c => `<button type="button" class="chip" data-act="cat" data-cat="${esc(c)}" aria-pressed="${catFilter === c}">${esc(I18N.cat(c))}</button>`).join("")}</div>
      <div class="prods">${list.map(p => {
        const on = draft.items.includes(p.id), ok = available(p), img = safe(p.image_url), n = slotsOf(p);
        const blocked = ok && !on && n > left;
        return `<div class="prod ${on ? "on" : ""} ${blocked ? "blocked" : ""}" data-id="${esc(p.id)}">
          <button type="button" class="im" data-act="info" data-id="${esc(p.id)}" aria-label="${esc(T("detail"))} — ${esc(F(p, "name"))}">${img ? `<img src="${esc(img)}" alt="" width="400" height="400" decoding="async">` : ICONS.cat(p.category)}</button>
          <span class="cs">${esc(slotLabel(n))}</span>${ok ? "" : `<span class="oos">${esc(T("out_of_stock"))}</span>`}
          <div class="tx"><span class="nm">${esc(F(p, "name"))}</span><span class="pp">${M(p.price)}</span>
            <button type="button" class="add ${on ? "on" : ""}" data-act="tog" data-id="${esc(p.id)}" ${ok ? "" : "disabled"} aria-pressed="${on}">${on ? esc(T("in_box")) + " ✓" : esc(blocked ? T("no_room") : T("add"))}</button></div></div>`;
      }).join("") || `<p class="muted">${esc(T("content_empty_cat"))}</p>`}</div>`;
  }
  function productModal(id) {
    const p = prodById(id); if (!p) return;
    const on = draft.items.includes(id), ok = available(p), img = safe(p.image_url), left = capacity() - usedSlots();
    const can = ok && (on || slotsOf(p) <= left);
    openModal(`<div class="pm"><div class="pm-im">${img ? `<img src="${esc(img)}" alt="${esc(F(p, "name"))}">` : ICONS.cat(p.category)}</div>
      <div class="pm-tx"><div class="kicker" style="color:var(--gold-3)">${esc(I18N.cat(p.category))}</div><h3>${esc(F(p, "name"))}</h3>
      <div class="pm-meta"><b>${M(p.price)}</b><span>${esc(slotLabel(slotsOf(p)))}</span></div>
      <p class="pm-desc" dir="auto">${esc(F(p, "description"))}</p></div></div>
      <div class="foot"><button class="btn btn-ghost btn-sm" type="button" data-act="close-modal">${esc(T("close"))}</button>
        <button class="btn btn-gold btn-sm" type="button" data-act="tog-close" data-id="${esc(id)}" ${can ? "" : "disabled"}>${esc(on ? T("remove") : can ? T("add") : T("no_room"))}</button></div>`, "wide");
  }

  function step3HTML() {
    const left = 250 - draft.message.length;
    return `<h2>${esc(T("note_title"))}</h2><p class="sub">${esc(T("note_sub"))}</p>
      <div class="note-wrap"><div class="fld"><textarea id="msg" maxlength="250" placeholder="${esc(T("note_ph"))}" data-f="message" dir="auto">${esc(draft.message)}</textarea>
        <div class="hint" id="msg-left">${esc(T("note_left", { n: left }))} — ${esc(T("note_skip"))}</div></div>
        <div><div class="kicker" style="margin-bottom:8px;color:var(--gold-3)">${esc(T("note_preview"))}</div>
          <div class="card-note ${draft.message.trim() ? "" : "empty"}" id="note-prev" dir="auto">${esc(draft.message.trim() || T("note_ph"))}</div></div></div>`;
  }

  /* ---------- authentification (connexion / inscription / code OTP) ---------- */
  let authMode = "login", otpEmail = "", otpDemo = "", otpSentAt = 0;
  try { const s = JSON.parse(sessionStorage.getItem("sig_otp") || "null"); if (s && s.email) { otpEmail = s.email; authMode = "otp"; } } catch (e) {}
  const saveOtp = () => { try { if (otpEmail && authMode === "otp") sessionStorage.setItem("sig_otp", JSON.stringify({ email: otpEmail })); else sessionStorage.removeItem("sig_otp"); } catch (e) {} };
  function setAuth(mode) { authMode = mode; saveOtp(); }

  function authFormHTML(mode, next) {
    if (mode === "otp") {
      return `<form id="otp-form" class="form" novalidate>
        <div class="otp-ico">${ICONS.mail}</div>
        <p class="center">${esc(T("otp_sub", { e: otpEmail }))}</p>
        <div class="fld"><label for="a-otp" class="sr">${esc(T("otp_ph"))}</label><input id="a-otp" class="otp-in" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="······" dir="ltr" autofocus></div>
        ${otpDemo ? `<div class="alert info" id="otp-demo">${esc(T("otp_demo", { c: otpDemo }))}</div>` : `<div class="hint center muted" style="font-size:.82rem">${esc(T("otp_spam"))}</div>`}
        <div id="a-err"></div>
        <button class="btn btn-gold" type="submit">${esc(T("btn_verify"))}</button>
        <div class="center"><button class="link" type="button" data-act="otp-resend">${esc(T("otp_resend"))}</button> · <button class="link" type="button" data-act="auth-sw" data-mode="login">${esc(T("to_login"))}</button></div>
      </form>`;
    }
    return `<form id="auth-form" class="form" data-mode="${mode}" data-next="${esc(next || "")}" novalidate>
      <div class="fld"><label for="a-email">${esc(T("f_email"))}</label><input id="a-email" type="email" autocomplete="email" inputmode="email" required value="${esc(otpEmail)}"></div>
      <div class="fld"><label for="a-pw">${esc(T("f_password"))}</label><input id="a-pw" type="password" autocomplete="${mode === "login" ? "current-password" : "new-password"}" required minlength="6">
        ${mode === "register" ? `<div class="hint">${esc(T("f_password_hint"))}</div>` : ""}</div>
      <div id="a-err"></div>
      <button class="btn btn-gold" type="submit">${esc(T(mode === "login" ? "btn_login" : "btn_register"))}</button>
      <div class="center"><button class="link" type="button" data-act="auth-sw" data-mode="${mode === "login" ? "register" : "login"}">${esc(T(mode === "login" ? "to_register" : "to_login"))}</button>
        ${mode === "login" ? ` · <button class="link" type="button" data-act="otp-have">${esc(T("otp_have"))}</button>` : ""}</div>
    </form>`;
  }

  function step4HTML() {
    if (!USER) return `<h2>${esc(T("order_title"))}</h2><div class="alert info mt">${esc(T("need_login"))}</div><div class="mt">${authFormHTML(authMode, "compose")}</div>`;
    const f = draft.form;
    return `<h2>${esc(T("order_title"))}</h2><p class="sub">${esc(T("order_sub"))}</p>
      <form id="order-form" class="form" novalidate>
        <div class="row2"><div class="fld"><label for="f-name">${esc(T("f_name"))} *</label><input id="f-name" data-f="form.name" value="${esc(f.name)}" autocomplete="name" required></div>
          <div class="fld"><label for="f-phone">${esc(T("f_phone"))} *</label><input id="f-phone" data-f="form.phone" value="${esc(f.phone)}" type="tel" inputmode="tel" autocomplete="tel" placeholder="${esc(T("f_phone_hint"))}" required></div></div>
        <div class="row2"><div class="fld"><label for="f-wilaya">${esc(T("f_wilaya"))} *</label><select id="f-wilaya" data-f="form.wilaya" required><option value="">${esc(T("f_choose"))}</option>
            ${I18N.wilayas.map(w => `<option value="${w.code}" ${String(f.wilaya) === String(w.code) ? "selected" : ""}>${String(w.code).padStart(2, "0")} — ${esc(w[I18N.lang])}</option>`).join("")}</select></div>
          <div class="fld"><label for="f-commune">${esc(T("f_commune"))}</label><input id="f-commune" data-f="form.commune" value="${esc(f.commune)}"></div></div>
        <div class="fld"><label for="f-address">${esc(T("f_address"))} *</label><textarea id="f-address" data-f="form.address" style="min-height:80px" required>${esc(f.address)}</textarea></div>
        <div class="fld"><label for="f-note">${esc(T("f_note"))}</label><input id="f-note" data-f="form.delivery_note" value="${esc(f.delivery_note)}"></div>
        <div class="paybox">${ICONS.phone}<div><b>${esc(T("pay_cod"))}</b>${esc(T("pay_confirm"))}</div></div>
        <div id="o-err"></div>
      </form>`;
  }

  function composeHTML() {
    const step = Math.min(4, Math.max(1, draft.step || 1));
    const body = [step1HTML, step2HTML, step3HTML, step4HTML][step - 1]();
    const last = step === 4;
    return `<div class="container page">${stepperHTML(step)}
      <div class="layout"><div class="panel" id="panel">${body}</div><aside class="aside" id="aside">${previewHTML()}</aside></div></div>
      <div class="sticky-bar"><div class="container">
        <div class="tot"><small>${esc(T("sum_total"))}</small><b id="bar-total">${M(grandTotal())}</b></div>
        <div class="btns">${step > 1 ? `<button class="btn btn-line btn-sm" type="button" data-act="back">${esc(T("btn_back"))}</button>` : ""}
          ${last ? (USER ? `<button class="btn btn-gold" type="submit" form="order-form" id="confirm-btn">${esc(T("btn_confirm"))}</button>` : "") : `<button class="btn btn-gold" type="button" data-act="next">${esc(T("btn_next"))}</button>`}</div>
      </div></div>`;
  }
  async function composeView() {
    ensureDefaults();
    draft.step = Math.min(4, Math.max(1, draft.step || 1)); saveDraft();
    if (draft.step === 4 && USER) {
      const p = await DB.withTimeout(DB.profile(), 6000).catch(() => null);
      if (p) { const f = draft.form; for (const k of ["name", "phone", "wilaya", "commune", "address"]) if (!f[k] && p[k]) f[k] = p[k]; saveDraft(); }
    }
    return `<div id="compose">${composeHTML()}</div>`;
  }
  /* mise à jour sur place (sans écran de chargement) : fluidité des interactions */
  function refreshCompose(top) {
    const c = $("#compose"); if (!c) return rerender(true);
    const y = window.scrollY, cats = $(".cats", c), cx = cats ? cats.scrollLeft : 0;
    c.innerHTML = composeHTML();
    const cats2 = $(".cats", c); if (cats2) cats2.scrollLeft = cx;
    jump(top ? 0 : y);
  }

  function validateStep(step) {
    ensureDefaults();
    if (step === 1) {
      if (opts("size").length && !draft.size_id) { toast(T("err_options")); return false; }
      if (opts("material").length && !draft.material_id) { toast(T("err_options")); return false; }
      if (colorsFor(draft.material_id).length && !draft.color_id) { toast(T("pick_color_first")); return false; }
    }
    if (step === 2) {
      if (!draft.items.length) { toast(T("err_empty")); return false; }
      if (usedSlots() > capacity()) { toast(T("err_capacity")); return false; }
    }
    return true;
  }

  function useCollection(id) {
    const c = CATALOG.collections.find(x => x.id === id); if (!c || c.kind !== "size") return;
    const size = CATALOG.options.find(o => o.type === "size" && (o.code === c.ref || o.id === c.ref));
    if (size && (!size.capacity || usedSlots() <= size.capacity)) draft.size_id = size.id;
    else if (size) { draft.size_id = size.id; draft.items = []; }
    draft.step = 1; saveDraft(); catFilter = "all"; location.hash = "#/compose";
  }

  function toggleItem(id) {
    const p = prodById(id); if (!available(p)) return false;
    const i = draft.items.indexOf(id);
    if (i >= 0) draft.items.splice(i, 1);
    else {
      if (usedSlots() + slotsOf(p) > capacity()) { toast(capacity() - usedSlots() <= 0 ? T("content_full") : T("no_room") + " (" + slotLabel(slotsOf(p)) + ")"); return false; }
      draft.items.push(id);
    }
    saveDraft(); return true;
  }

  async function submitOrder(form) {
    const err = $("#o-err"), btn = $("#confirm-btn"), f = draft.form;
    const show = (k) => { err.innerHTML = `<div class="alert bad" role="alert">${esc(T(k))}</div>`; err.scrollIntoView({ block: "center", behavior: "smooth" }); };
    ["name", "phone", "wilaya", "address"].forEach(k => { const el = form.querySelector(`[data-f="form.${k}"]`); if (el) el.closest(".fld").classList.toggle("err", !String(f[k] || "").trim()); });
    if (!f.name.trim() || !String(f.phone).trim() || !f.wilaya || !f.address.trim()) return show("err_required");
    if (!isPhone(f.phone)) { form.querySelector('[data-f="form.phone"]').closest(".fld").classList.add("err"); return show("err_phone"); }
    if (!validateStep(1) || !validateStep(2)) return;
    btn.disabled = true; btn.textContent = T("btn_sending");
    try {
      const res = await DB.withTimeout(DB.placeOrder({
        size_id: draft.size_id || null, material_id: draft.material_id || null, color_id: draft.color_id || null,
        items: draft.items.map(id => ({ id, qty: 1 })), message: draft.message.trim(),
        name: f.name.trim(), phone: cleanPhone(f.phone), wilaya: String(f.wilaya), commune: f.commune.trim(), address: f.address.trim(), delivery_note: f.delivery_note.trim(), lang: I18N.lang
      }), 20000);
      DB.saveProfile({ name: f.name.trim(), phone: cleanPhone(f.phone), wilaya: String(f.wilaya), commune: f.commune.trim(), address: f.address.trim() }).catch(() => {});
      draft.items = []; draft.message = ""; draft.step = 1; saveDraft();
      location.hash = "#/done/" + (res.order_number || res.number);
    } catch (e) {
      btn.disabled = false; btn.textContent = T("btn_confirm");
      show(e && e.code === "timeout" ? "err_slow" : (ERR[e && e.code] || "err_generic"));
    }
  }

  /* ---------- compte / commandes ---------- */
  async function accountView() {
    if (!USER) return `<div class="container"><div class="auth"><h2>${esc(T(authMode === "login" ? "login_title" : authMode === "otp" ? "otp_title" : "register_title"))}</h2>${authFormHTML(authMode, "account")}</div></div>`;
    return `<div class="container page"><div class="auth"><h2>${esc(T("nav_account"))}</h2>
      <p class="center muted" style="margin-bottom:16px">${esc(T("logged_as", { e: USER.email }))}</p>
      <div class="form"><a class="btn btn-gold" href="#/orders">${esc(T("nav_orders"))}</a>
        ${IS_ADMIN ? `<a class="btn btn-line dark" href="#/admin">${esc(T("nav_admin"))}</a>` : ""}
        <a class="btn btn-ghost" href="#/compose">${esc(T("nav_compose"))}</a>
        <button class="btn btn-ghost" type="button" data-act="logout">${esc(T("nav_logout"))}</button></div></div></div>`;
  }

  function orderCard(o) {
    const items = o.items || [], b = o.box || {};
    const bn = ["size", "material", "color"].map(k => b[k] && F(b[k], "name")).filter(Boolean).join(" · ");
    return `<div class="ord"><header><b>SIG-${esc(o.number)}</b><span class="badge ${esc(o.status)}">${esc(T("st_" + o.status))}</span></header>
      <div class="muted" style="font-size:.85rem">${esc(new Date(o.created_at).toLocaleString(I18N.lang === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", { dateStyle: "medium", timeStyle: "short" }))}</div>
      <div style="margin-top:6px"><b>${esc(T("sum_box"))} :</b> ${esc(bn)}</div>
      <ul>${items.map(i => `<li>${esc(F(i, "name"))}</li>`).join("")}</ul>
      ${o.message ? `<div class="muted" style="font-size:.9rem">« ${esc(o.message)} »</div>` : ""}
      <div style="margin-top:8px;font-family:var(--serif);font-size:1.25rem"><b>${M(o.total)}</b></div></div>`;
  }
  async function ordersView() {
    if (!USER) { location.hash = "#/account"; return ""; }
    const list = await DB.withTimeout(DB.myOrders(), 12000);
    return `<div class="container page"><h2 style="font-size:2rem;margin-bottom:16px">${esc(T("orders_title"))}</h2>
      ${list.length ? list.map(orderCard).join("") : `<p class="muted">${esc(T("orders_empty"))}</p><p class="mt"><a class="btn btn-gold" href="#/compose">${esc(T("cta_compose"))}</a></p>`}</div>`;
  }
  function doneView(num) {
    const wa = waLink("Bonjour Signature, commande n° SIG-" + num);
    return `<div class="container page"><div class="done"><div class="seal">${ICONS.check.replace('width="16" height="16"', 'width="36" height="36"')}</div>
      <h2>${esc(T("done_title"))}</h2><div class="num">${esc(T("done_num", { n: "SIG-" + num }))}</div><p>${esc(T("done_text"))}</p>
      <div class="cta">${wa ? `<a class="btn btn-line dark" href="${esc(wa)}" target="_blank" rel="noopener">${esc(T("done_wa"))}</a>` : ""}<a class="btn btn-gold" href="#/orders">${esc(T("done_orders"))}</a><a class="btn btn-ghost" href="#/">${esc(T("done_home"))}</a></div></div></div>`;
  }

  /* ---------- routeur ---------- */
  const views = {
    home: async () => homeView(), collections: async () => homeView(),
    compose: composeView, account: accountView, login: accountView, orders: ordersView,
    quote: async (arg) => quoteView(arg),
    done: async (arg) => doneView(esc(arg)),
    admin: async () => (window.ADMIN_VIEW ? window.ADMIN_VIEW() : "")
  };

  async function route() {
    const token = ++routeToken;
    closeModal();
    const [p, ...rest] = location.hash.replace(/^#\/?/, "").split("/");
    const name = views[p || "home"] ? (p || "home") : "home";
    chrome();
    const host = root();
    host.innerHTML = `<div class="spinner" role="status" aria-label="loading"></div>`;
    let html = "";
    try {
      if (!CATALOG) await loadAll();
      chrome();
      html = await views[name](rest.join("/"));
    } catch (e) {
      console.error(e);
      const why = e && e.code === "timeout" ? T("err_slow") : T("err_generic");
      const detail = esc(String((e && (e.message || e.code)) || "").slice(0, 160));
      html = `<div class="container page"><div class="alert bad" role="alert">${esc(why)}</div>
        <p class="muted mt" style="font-size:.8rem;direction:ltr">${detail}</p>
        <p class="mt"><button class="btn btn-gold" data-act="retry" type="button">${esc(T("btn_retry"))}</button>
        <button class="btn btn-ghost" data-act="reset-local" type="button">${esc(T("btn_reset"))}</button></p></div>`;
    }
    if (token !== routeToken) return;
    host.innerHTML = html;
    if (name === "admin" && window.ADMIN_BIND) window.ADMIN_BIND();
    if (name === "collections") { const el = $("#collections"); if (el) el.scrollIntoView({ behavior: "instant" }); } else jump(0);
    document.title = "Signature — Gift Collections";
  }

  async function loadAll() {
    CATALOG = await DB.withTimeout(DB.catalog(), 15000);
    try { USER = await DB.withTimeout(DB.user(), 6000); IS_ADMIN = USER ? await DB.withTimeout(DB.isAdmin(), 6000) : false; }
    catch (e) { console.error(e); DB.clearLocal(); USER = null; IS_ADMIN = false; }   // session illisible : on repart propre
  }
  async function refreshUser() {
    try { USER = await DB.withTimeout(DB.user(), 6000); IS_ADMIN = USER ? await DB.withTimeout(DB.isAdmin(), 6000) : false; }
    catch (e) { console.error(e); USER = null; IS_ADMIN = false; }
  }
  async function rerender(keepScroll) { const y = window.scrollY; await route(); if (keepScroll) jump(y); }

  /* ---------- événements (délégation) ---------- */
  document.addEventListener("click", async (e) => {
    if (e.target.closest("#adm-root")) return;
    const el = e.target.closest("[data-act]"); if (!el) return;
    const act = el.dataset.act;
    if (act === "lang") { I18N.set(I18N.lang === "fr" ? "ar" : "fr"); closeModal(); chrome(); return rerender(true); }
    if (act === "close-modal") return closeModal();
    if (act === "install-android") return installAndroid();
    if (act === "install-ios") return installIos();
    if (act === "usecol") return useCollection(el.dataset.id);
    if (act === "opt") {
      const t = el.dataset.type, id = el.dataset.id;
      if (t === "size") {
        const s = optById(id);
        if (s && s.capacity && usedSlots() > Number(s.capacity)) return toast(T("err_capacity") + " (" + T("content_count", { n: usedSlots(), max: s.capacity }) + ")", 4200);
      }
      draft[t + "_id"] = id;
      if (t === "material") draft.color_id = "";
      ensureDefaults(); saveDraft(); return refreshCompose();
    }
    if (act === "cat") { catFilter = el.dataset.cat; return refreshCompose(); }
    if (act === "tog") { toggleItem(el.dataset.id); return refreshCompose(); }
    if (act === "tog-close") { toggleItem(el.dataset.id); closeModal(); return refreshCompose(); }
    if (act === "info") return productModal(el.dataset.id);
    if (act === "next") { if (validateStep(draft.step)) { draft.step = Math.min(4, draft.step + 1); saveDraft(); refreshCompose(true); } return; }
    if (act === "back") { draft.step = Math.max(1, draft.step - 1); saveDraft(); return refreshCompose(true); }
    if (act === "goto") { draft.step = Number(el.dataset.step); saveDraft(); return refreshCompose(true); }
    if (act === "auth-sw") { setAuth(el.dataset.mode); return inPlaceAuth(); }
    if (act === "otp-have") {
      const em = ($("#a-email") || {}).value || otpEmail;
      if (!isEmail(em)) { const b = $("#a-err"); if (b) b.innerHTML = `<div class="alert bad" role="alert">${esc(T("err_email"))}</div>`; return; }
      otpEmail = em.trim().toLowerCase(); otpDemo = ""; setAuth("otp"); return inPlaceAuth();
    }
    if (act === "otp-resend") {
      if (Date.now() - otpSentAt < 30000) return toast(T("err_rate"));
      try { const r = await DB.withTimeout(DB.resendOtp(otpEmail), 15000); otpSentAt = Date.now(); otpDemo = (r && r.demoCode) || ""; toast(T("otp_resent")); if (otpDemo) inPlaceAuth(); }
      catch (err) { toast(errMsg(err)); }
      return;
    }
    if (act === "logout") { await DB.signOut(); await refreshUser(); location.hash = "#/"; return route(); }
    if (act === "retry") { CATALOG = null; return route(); }
    if (act === "reset-local") { DB.clearLocal(); CATALOG = null; USER = null; IS_ADMIN = false; return route(); }
  });
  /* change le formulaire d'authentification sans tout recharger */
  function inPlaceAuth() {
    const h = location.hash.replace(/^#\/?/, "").split("/")[0];
    if (h === "compose") return refreshCompose();
    return rerender(true);
  }

  document.addEventListener("input", (e) => {
    if (e.target.closest("#quote-form")) {
      const f = e.target.closest("#quote-form"), v = { n: $("#q-n", f).value.trim(), c: $("#q-c", f).value.trim(), q: $("#q-q", f).value.trim(), d: $("#q-d", f).value.trim() };
      $("#q-wa", f).href = quoteHref(f.dataset.name, v); return;
    }
    const el = e.target.closest("[data-f]"); if (!el || el.closest("#adm-root")) return;
    const path = el.dataset.f.split(".");
    if (path.length === 2) draft[path[0]][path[1]] = el.value; else draft[path[0]] = el.value;
    saveDraft();
    if (el.dataset.f === "message") {
      const prev = $("#note-prev"), left = $("#msg-left");
      if (prev) { prev.textContent = el.value.trim() || T("note_ph"); prev.classList.toggle("empty", !el.value.trim()); }
      if (left) left.textContent = T("note_left", { n: 250 - el.value.length }) + " — " + T("note_skip");
    }
  });
  document.addEventListener("change", (e) => {
    const el = e.target.closest("select[data-f]"); if (!el || el.closest("#adm-root")) return;
    const path = el.dataset.f.split("."); draft[path[0]][path[1]] = el.value; saveDraft();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (form.closest("#adm-root")) return;
    if (form.id === "quote-form") { e.preventDefault(); return; }
    if (form.id === "order-form") { e.preventDefault(); return submitOrder(form); }
    if (form.id === "otp-form") {
      e.preventDefault();
      const box = $("#a-err"), code = digits($("#a-otp").value), btn = form.querySelector("button[type=submit]");
      if (code.length < 6) { box.innerHTML = `<div class="alert bad" role="alert">${esc(T("err_otp"))}</div>`; return; }
      btn.disabled = true;
      try {
        await DB.withTimeout(DB.verifyOtp(otpEmail, code), 20000);
        otpDemo = ""; otpEmail = ""; setAuth("login"); await refreshUser(); toast(T("confirm_email"));
        const h = location.hash.replace(/^#\/?/, "").split("/")[0];
        if (h === "compose") { await rerender(); } else { location.hash = "#/account"; await rerender(); }
      } catch (err) { btn.disabled = false; box.innerHTML = `<div class="alert bad" role="alert">${esc(err && err.code === "timeout" ? T("err_slow") : errMsg(err))}</div>`; }
      return;
    }
    if (form.id === "auth-form") {
      e.preventDefault();
      const mode = form.dataset.mode, email = $("#a-email").value.trim(), pw = $("#a-pw").value, box = $("#a-err");
      const bad = (k, cls) => { box.innerHTML = `<div class="alert ${cls || "bad"}" role="alert">${esc(T(k))}</div>`; };
      if (!isEmail(email)) return bad("err_email");
      if (pw.length < 6) return bad("err_weak");
      const btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      try {
        if (mode === "login") await DB.withTimeout(DB.signIn(email, pw), 20000);
        else {
          const r = await DB.withTimeout(DB.signUp(email, pw), 25000);
          if (r.needsOtp) { otpEmail = email.toLowerCase(); otpDemo = r.demoCode || ""; otpSentAt = Date.now(); setAuth("otp"); return inPlaceAuth(); }
        }
        await refreshUser(); await rerender();
      } catch (err) {
        btn.disabled = false;
        if (err && err.code === "unconfirmed") {   // compte créé mais jamais validé : on renvoie un code
          otpEmail = email.toLowerCase(); otpDemo = ""; setAuth("otp");
          try { const r = await DB.withTimeout(DB.resendOtp(otpEmail), 15000); otpSentAt = Date.now(); otpDemo = (r && r.demoCode) || ""; } catch (e2) {}
          return inPlaceAuth();
        }
        box.innerHTML = `<div class="alert bad" role="alert">${esc(err && err.code === "timeout" ? T("err_slow") : errMsg(err))}</div>`;
      }
    }
  });

  window.addEventListener("hashchange", route);
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; });
  window.addEventListener("appinstalled", () => { deferredInstall = null; });
  DB.onAuth(async () => { await refreshUser(); });

  /* ---------- API partagée avec admin.js ---------- */
  window.APP = {
    T, F, M, esc, safe, toast, sorted, digits, cleanPhone,
    get catalog() { return CATALOG; }, set catalog(v) { CATALOG = v; },
    get user() { return USER; }, get isAdmin() { return IS_ADMIN; },
    reload: async () => { CATALOG = await DB.catalog(); },
    rerender
  };

  (async function boot() {
    I18N.apply();
    try { await loadAll(); } catch (e) { console.error(e); CATALOG = null; }
    await route();
    if ("serviceWorker" in navigator && /^https:|^http:\/\/localhost/.test(location.href)) navigator.serviceWorker.register("sw.js?v=3").catch(() => {});
  })();
})();
