/* SIGNATURE — espace de gestion (/#/admin) */
(function () {
  "use strict";
  const A = () => window.APP;
  const T = (k, v) => I18N.t(k, v), F = (o, b) => I18N.f(o, b), M = (n) => I18N.money(n);
  const esc = ICONS.esc, safe = ICONS.safeUrl;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  let tab = "orders", orders = [], filter = { q: "", st: "all" }, lastNew = null, pollTimer = null;
  const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];
  const TYPES = ["size", "material", "color"];

  const csvEsc = (s) => { s = String(s == null ? "" : s); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function download(name, text) {
    const b = new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  /* parseur CSV/TSV minimal (guillemets, ; , tab) */
  function parseTable(text) {
    text = String(text || "").replace(/^﻿/, "");
    const first = text.split(/\r?\n/).find(l => l.trim()) || "";
    const sep = first.includes("\t") ? "\t" : (first.split(";").length >= first.split(",").length ? ";" : ",");
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); if (row.some(x => x.trim())) rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    row.push(cur); if (row.some(x => x.trim())) rows.push(row);
    return rows.map(r => r.map(x => x.trim()));
  }
  const catKeyFrom = (s) => {
    const v = String(s || "").trim().toLowerCase(); if (!v) return "other";
    for (const k in I18N.categories) { const c = I18N.categories[k]; if (k === v || c.fr.toLowerCase() === v || c.ar === s.trim()) return k; }
    return "other";
  };
  const thumb = (img, cat) => `<div class="th">${safe(img) ? `<img src="${esc(safe(img))}" alt="" loading="lazy">` : ICONS.cat(cat || "other")}</div>`;

  /* ---------- vue ---------- */
  window.ADMIN_VIEW = async function () {
    if (!A().user) return `<div class="container page"><div class="alert info">${esc(T("adm_login_first"))}</div><p class="mt"><a class="btn btn-gold" href="#/account">${esc(T("nav_login"))}</a></p></div>`;
    if (!A().isAdmin) return `<div class="container page"><div class="alert bad">${esc(T("adm_denied"))}</div></div>`;
    orders = await DB.adminOrders();
    lastNew = orders.filter(o => o.status === "new").length;
    return `<div class="container page" id="adm-root"><h2 style="font-size:2.1rem;margin-bottom:14px">${esc(T("adm_title"))}</h2>
      <div class="adm-tabs" role="tablist" id="adm-tabs"></div><div id="adm-body"></div></div><div id="print-area"></div>`;
  };
  window.ADMIN_BIND = function () {
    const rootEl = $("#adm-root"); if (!rootEl) return;
    renderTabs(); renderBody();
    rootEl.addEventListener("click", onClick);
    rootEl.addEventListener("change", onChange);
    rootEl.addEventListener("input", onInput);
    rootEl.addEventListener("submit", onSubmit);
    clearInterval(pollTimer);
    pollTimer = setInterval(poll, 45000);
  };
  window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/admin")) clearInterval(pollTimer); });

  async function poll() {
    if (!$("#adm-root") || document.hidden || tab !== "orders" || $(".modal-bg")) return;
    try {
      const fresh = await DB.adminOrders(); const n = fresh.filter(o => o.status === "new").length;
      const open = $$(".o-row.open").map(x => x.dataset.id);
      orders = fresh;
      if (n > lastNew) { A().toast(T("new_order_alert")); try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} }
      lastNew = n; renderTabs();
      if (!document.activeElement || !document.activeElement.closest("#adm-body")) { renderBody(); open.forEach(id => { const r = $(`.o-row[data-id="${id}"]`); if (r) r.classList.add("open"); }); }
    } catch (e) {}
  }

  function renderTabs() {
    const n = orders.filter(o => o.status === "new").length;
    const tabs = [["orders", "adm_orders"], ["products", "adm_products"], ["options", "adm_options"], ["collections", "adm_collections"], ["settings", "adm_settings"]];
    $("#adm-tabs").innerHTML = tabs.map(([k, l]) => `<button type="button" role="tab" data-t="${k}" aria-selected="${tab === k}">${esc(T(l))}${k === "orders" && n ? `<span class="dot">${n}</span>` : ""}</button>`).join("");
  }
  function renderBody() {
    const b = $("#adm-body"); if (!b) return;
    b.innerHTML = ({ orders: ordersHTML, products: productsHTML, options: optionsHTML, collections: collectionsHTML, settings: settingsHTML })[tab]();
  }

  /* ---------- Commandes ---------- */
  function ordersHTML() {
    const q = filter.q.trim().toLowerCase();
    const list = orders.filter(o => (filter.st === "all" || o.status === filter.st) &&
      (!q || [o.customer_name, o.phone, o.number, o.address, o.email].join(" ").toLowerCase().includes(q)));
    return `<div class="toolbar"><input class="grow" type="search" id="o-q" placeholder="${esc(T("adm_search"))}" value="${esc(filter.q)}">
      <select id="o-st"><option value="all">${esc(T("adm_all"))}</option>${STATUSES.map(s => `<option value="${s}" ${filter.st === s ? "selected" : ""}>${esc(T("st_" + s))}</option>`).join("")}</select>
      <button class="btn btn-ghost btn-sm" type="button" data-a="export-orders">${esc(T("adm_export_csv"))}</button></div>
      <div class="list">${list.length ? list.map(orderRow).join("") : `<p class="muted">${esc(T("adm_none"))}</p>`}</div>`;
  }
  function orderRow(o) {
    const items = o.items || [], b = o.box || {}, ph = A().cleanPhone(o.phone || ""), wa = ph.replace(/^\+/, "").replace(/^00/, "").replace(/^0/, "213");
    const boxName = ["size", "material", "color"].map(k => b[k] && F(b[k], "name")).filter(Boolean).join(" · ");
    return `<div class="item o-row ${o.status === "new" ? "fresh" : ""}" data-id="${esc(o.id)}">
      <div class="tt" data-a="toggle" style="cursor:pointer"><b>SIG-${esc(o.number)} — ${esc(o.customer_name)}</b>
        <small>${esc(new Date(o.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }))} · ${esc(I18N.wilayaName(o.wilaya, "fr"))} · ${items.length} art. · <b>${M(o.total)}</b></small></div>
      <select data-a="status" data-id="${esc(o.id)}" aria-label="status">${STATUSES.map(s => `<option value="${s}" ${o.status === s ? "selected" : ""}>${esc(T("st_" + s))}</option>`).join("")}</select>
      <div class="o-det">
        <div><b>${esc(T("sum_box"))} :</b> ${esc(boxName)} (${M(b.price || 0)})${o.slots_used ? ` · ${o.slots_used} cases` : ""}</div>
        <div><b>${esc(T("sum_items"))} :</b><ul style="padding-inline-start:18px">${items.map(i => `<li>${esc(F(i, "name"))} — ${M(i.price)}${i.slots > 1 ? ` (${i.slots} cases)` : ""}</li>`).join("")}</ul></div>
        ${o.message ? `<div><b>${esc(T("o_message"))} :</b><div class="msg" dir="auto">${esc(o.message)}</div></div>` : ""}
        <div><b>${esc(T("o_customer"))} :</b> ${esc(o.customer_name)} · <a href="tel:${esc(ph)}">${esc(o.phone)}</a> · ${esc(o.email || "")}</div>
        <div><b>${esc(T("o_address"))} :</b> ${esc(o.address)}, ${esc(o.commune || "")} — ${esc(I18N.wilayaName(o.wilaya, "fr"))}${o.delivery_note ? `<br><i>${esc(o.delivery_note)}</i>` : ""}</div>
        <div><b>${esc(T("sum_delivery"))} :</b> ${Number(o.delivery_fee) > 0 ? M(o.delivery_fee) : esc(T("sum_delivery_tbc"))} · <b>${esc(T("o_total"))} :</b> ${M(o.total)}</div>
        <div class="fld"><label>${esc(T("adm_note_internal"))}</label><textarea data-a="adminnote" data-id="${esc(o.id)}" style="min-height:60px">${esc(o.admin_note || "")}</textarea></div>
        <div class="o-actions"><a class="btn btn-gold btn-sm" href="tel:${esc(ph)}">${ICONS.phone} ${esc(T("adm_call"))}</a>
          <a class="btn btn-line dark btn-sm" target="_blank" rel="noopener" href="https://wa.me/${A().digits(wa)}">${esc(T("adm_wa"))}</a>
          <button class="btn btn-ghost btn-sm" type="button" data-a="print" data-id="${esc(o.id)}">${esc(T("adm_print"))}</button>
          ${o.message ? `<button class="btn btn-ghost btn-sm" type="button" data-a="copymsg" data-id="${esc(o.id)}">${esc(T("adm_copy"))}</button>` : ""}</div>
      </div></div>`;
  }
  function printOrder(id) {
    const o = orders.find(x => x.id === id); if (!o) return; const b = o.box || {};
    $("#print-area").innerHTML = `<h1>Signature — ${esc(T("ph_title"))} SIG-${esc(o.number)}</h1>
      <p><b>${esc(o.customer_name)}</b> — ${esc(o.phone)}<br>${esc(o.address)}, ${esc(o.commune || "")} — ${esc(I18N.wilayaName(o.wilaya, "fr"))}<br>${esc(o.delivery_note || "")}</p>
      <p><b>Box :</b> ${esc(["size", "material", "color"].map(k => b[k] && b[k].name_fr).filter(Boolean).join(" / "))}</p>
      <table><tr><th>Article</th><th>Prix</th></tr>${(o.items || []).map(i => `<tr><td>☐ ${esc(i.name_fr)}</td><td>${esc(i.price)} DA</td></tr>`).join("")}
      <tr><td><b>Total à encaisser</b></td><td><b>${esc(o.total)} DA</b></td></tr></table>
      ${o.message ? `<div class="msg" dir="auto"><b>Petit mot :</b><br>${esc(o.message)}</div>` : ""}`;
    window.print();
  }
  function exportOrders() {
    const rows = [["N°", "Date", "Statut", "Client", "Téléphone", "Wilaya", "Commune", "Adresse", "Box", "Articles", "Petit mot", "Total DA"]];
    orders.forEach(o => { const b = o.box || {}; rows.push([o.number, o.created_at, T("st_" + o.status), o.customer_name, o.phone, I18N.wilayaName(o.wilaya, "fr"), o.commune, o.address,
      ["size", "material", "color"].map(k => b[k] && b[k].name_fr).filter(Boolean).join(" / "), (o.items || []).map(i => i.name_fr).join(" + "), o.message, o.total]); });
    download("commandes-signature.csv", rows.map(r => r.map(csvEsc).join(";")).join("\r\n"));
  }

  /* ---------- Produits ---------- */
  function productsHTML() {
    const cat = filter.cat || "all", q = (filter.pq || "").toLowerCase();
    const prods = A().sorted(A().catalog.products).filter(p => (cat === "all" || p.category === cat) && (!q || (p.name_fr + " " + p.name_ar).toLowerCase().includes(q)));
    return `<div class="toolbar"><input class="grow" type="search" id="p-q" placeholder="${esc(T("adm_search"))}" value="${esc(filter.pq || "")}">
      <select id="p-cat"><option value="all">${esc(T("adm_all"))}</option>${Object.keys(I18N.categories).map(k => `<option value="${k}" ${cat === k ? "selected" : ""}>${esc(I18N.cat(k))}</option>`).join("")}</select>
      <button class="btn btn-gold btn-sm" type="button" data-a="new-product">+ ${esc(T("adm_add"))}</button>
      <button class="btn btn-ghost btn-sm" type="button" data-a="import">${esc(T("adm_import_csv"))}</button>
      <button class="btn btn-ghost btn-sm" type="button" data-a="export-products">${esc(T("adm_export_csv"))}</button></div>
      <div class="list">${prods.length ? prods.map(p => `<div class="item ${p.active === false ? "off" : ""}" data-id="${esc(p.id)}">${thumb(p.image_url, p.category)}
        <div class="tt"><b>${esc(F(p, "name"))}</b><small>${esc(I18N.cat(p.category))} · ${esc(T(Number(p.slots) > 1 ? "slot_n" : "slot_1", { n: p.slots }))}</small></div>
        <div class="px"><span class="lbl">${esc(T("p_price"))}</span><input type="number" min="0" step="50" inputmode="numeric" value="${esc(p.price)}" data-a="price" data-id="${esc(p.id)}"></div>
        <div><span class="lbl">${esc(T("p_stock"))}</span><button class="tgl" type="button" data-a="stock" data-id="${esc(p.id)}" aria-pressed="${p.in_stock !== false}" aria-label="${esc(T("p_stock"))}"></button></div>
        <button class="btn btn-ghost btn-sm" type="button" data-a="edit-product" data-id="${esc(p.id)}">${esc(T("adm_edit"))}</button></div>`).join("") : `<p class="muted">${esc(T("adm_none"))}</p>`}</div>`;
  }
  function productModal(p) {
    p = p || { category: "perfume", name_fr: "", name_ar: "", price: 0, slots: 1, description_fr: "", description_ar: "", in_stock: true, active: true, image_url: "" };
    return `<div class="modal-bg" data-a="modal-bg"><form class="modal" id="m-form" data-kind="products" data-id="${esc(p.id || "")}" novalidate>
      <h3>${esc(T(p.id ? "adm_prod_edit" : "adm_prod_new"))}</h3><div class="form">
      <div class="fld"><label>${esc(T("p_category"))}</label><select name="category">${Object.keys(I18N.categories).map(k => `<option value="${k}" ${p.category === k ? "selected" : ""}>${esc(I18N.cat(k))}</option>`).join("")}</select></div>
      <div class="fld"><label>${esc(T("p_name_fr"))} *</label><input name="name_fr" value="${esc(p.name_fr)}" required maxlength="120"></div>
      <div class="fld"><label>${esc(T("p_name_ar"))}</label><input name="name_ar" value="${esc(p.name_ar)}" dir="rtl" maxlength="120"></div>
      <div class="row2"><div class="fld"><label>${esc(T("p_price"))} *</label><input name="price" type="number" min="0" step="50" inputmode="numeric" value="${esc(p.price)}" required></div>
        <div class="fld"><label>${esc(T("p_slots"))}</label><input name="slots" type="number" min="1" max="8" inputmode="numeric" value="${esc(p.slots || 1)}"></div></div>
      <div class="fld"><label>${esc(T("p_desc_fr"))}</label><textarea name="description_fr" style="min-height:90px" maxlength="900">${esc(p.description_fr || "")}</textarea></div>
      <div class="fld"><label>${esc(T("p_desc_ar"))}</label><textarea name="description_ar" dir="rtl" style="min-height:90px" maxlength="900">${esc(p.description_ar || "")}</textarea></div>
      ${imageField(p.image_url, p.category)}
      <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="in_stock" ${p.in_stock !== false ? "checked" : ""}> ${esc(T("p_stock"))}</label>
      <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="active" ${p.active !== false ? "checked" : ""}> ${esc(T("p_active"))}</label>
      <div id="m-err"></div></div>
      <div class="foot">${p.id ? `<button class="btn btn-danger btn-sm" type="button" data-a="del" data-kind="products" data-id="${esc(p.id)}">${esc(T("adm_delete"))}</button>` : "<span></span>"}
        <span><button class="btn btn-ghost btn-sm" type="button" data-a="close">${esc(T("adm_cancel"))}</button> <button class="btn btn-gold btn-sm" type="submit">${esc(T("adm_save"))}</button></span></div></form></div>`;
  }
  function imageField(url, cat) {
    return `<div class="fld"><label>${esc(T("p_image"))}</label><div class="thumb-up"><div class="th" id="img-prev">${safe(url) ? `<img src="${esc(safe(url))}" alt="">` : ICONS.cat(cat || "other")}</div>
      <label class="btn btn-ghost btn-sm" style="cursor:pointer">${esc(T("p_upload"))}<input type="file" accept="image/*" data-a="upload" class="sr"></label></div>
      <input name="image_url" value="${esc(url || "")}" placeholder="${esc(T("p_image_url"))} (https://…)" style="margin-top:8px"></div>`;
  }

  /* ---------- Options de box ---------- */
  function optionsHTML() {
    const opts = A().sorted(A().catalog.options);
    return `<div class="toolbar"><button class="btn btn-gold btn-sm" type="button" data-a="new-option">+ ${esc(T("adm_add"))}</button></div>
      ${TYPES.map(t => { const l = opts.filter(o => o.type === t); return `<h3 style="font-size:1.35rem;margin:16px 0 8px">${esc(T("type_" + t))}</h3><div class="list">${l.length ? l.map(o => `
        <div class="item ${o.active === false ? "off" : ""}"><div class="th" style="background:${esc(/^#[0-9a-f]{3,8}$/i.test(o.hex || "") ? o.hex : "#241c16")}"></div>
        <div class="tt"><b>${esc(F(o, "name"))}${F(o, "description") ? " — " + esc(F(o, "description")) : ""}</b><small>${o.capacity ? esc(T("opt_capacity", { n: o.capacity })) + " · " : ""}${M(o.price)}</small></div>
        <button class="btn btn-ghost btn-sm" type="button" data-a="edit-option" data-id="${esc(o.id)}">${esc(T("adm_edit"))}</button></div>`).join("") : `<p class="muted">${esc(T("adm_none"))}</p>`}</div>`; }).join("")}`;
  }
  function optionModal(o) {
    o = o || { type: "size", name_fr: "", name_ar: "", description_fr: "", description_ar: "", price: 0, capacity: "", hex: "", material_id: null, active: true };
    const mats = A().sorted(A().catalog.options.filter(x => x.type === "material"));
    return `<div class="modal-bg" data-a="modal-bg"><form class="modal" id="m-form" data-kind="options" data-id="${esc(o.id || "")}" novalidate>
      <h3>${esc(T("adm_options"))}</h3><div class="form">
      <div class="fld"><label>${esc(T("o_type"))}</label><select name="type">${TYPES.map(t => `<option value="${t}" ${o.type === t ? "selected" : ""}>${esc(T("type_" + t))}</option>`).join("")}</select></div>
      <div class="fld"><label>${esc(T("p_name_fr"))} *</label><input name="name_fr" value="${esc(o.name_fr)}" required maxlength="80"></div>
      <div class="fld"><label>${esc(T("p_name_ar"))}</label><input name="name_ar" value="${esc(o.name_ar)}" dir="rtl" maxlength="80"></div>
      <div class="row2"><div class="fld"><label>${esc(T("o_name_hint"))}</label><input name="description_fr" value="${esc(o.description_fr || "")}" maxlength="80"></div>
        <div class="fld"><label>${esc(T("o_name_hint"))} (AR)</label><input name="description_ar" value="${esc(o.description_ar || "")}" dir="rtl" maxlength="80"></div></div>
      <div class="fld"><label>${esc(T("o_material"))}</label><select name="material_id"><option value="">—</option>${mats.map(m => `<option value="${esc(m.id)}" ${o.material_id === m.id ? "selected" : ""}>${esc(F(m, "name"))}</option>`).join("")}</select></div>
      <div class="row2"><div class="fld"><label>${esc(T("o_price"))}</label><input name="price" type="number" min="0" step="50" inputmode="numeric" value="${esc(o.price)}"></div>
        <div class="fld"><label>${esc(T("o_capacity"))}</label><input name="capacity" type="number" min="1" inputmode="numeric" value="${esc(o.capacity == null ? "" : o.capacity)}"></div></div>
      <div class="row2"><div class="fld"><label>${esc(T("o_hex"))}</label><input name="hex" value="${esc(o.hex || "")}" placeholder="#17120f" maxlength="9"></div>
        <div class="fld"><label>${esc(T("o_sort"))}</label><input name="sort" type="number" inputmode="numeric" value="${esc(o.sort == null ? "" : o.sort)}"></div></div>
      <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="active" ${o.active !== false ? "checked" : ""}> ${esc(T("p_active"))}</label>
      <div id="m-err"></div></div>
      <div class="foot">${o.id ? `<button class="btn btn-danger btn-sm" type="button" data-a="del" data-kind="options" data-id="${esc(o.id)}">${esc(T("adm_delete"))}</button>` : "<span></span>"}
        <span><button class="btn btn-ghost btn-sm" type="button" data-a="close">${esc(T("adm_cancel"))}</button> <button class="btn btn-gold btn-sm" type="submit">${esc(T("adm_save"))}</button></span></div></form></div>`;
  }

  /* ---------- Collections ---------- */
  function collectionsHTML() {
    const cols = A().sorted(A().catalog.collections);
    return `<div class="toolbar"><button class="btn btn-gold btn-sm" type="button" data-a="new-col">+ ${esc(T("adm_add"))}</button></div>
      <div class="list">${cols.length ? cols.map(c => `<div class="item ${c.active === false ? "off" : ""}">${thumb(c.image_url, "other")}
        <div class="tt"><b>${esc(F(c, "name"))}</b><small>${esc(F(c, "tagline"))}</small></div>
        <button class="btn btn-ghost btn-sm" type="button" data-a="edit-col" data-id="${esc(c.id)}">${esc(T("adm_edit"))}</button></div>`).join("") : `<p class="muted">${esc(T("adm_none"))}</p>`}</div>`;
  }
  function colModal(c) {
    c = c || { name_fr: "", name_ar: "", tagline_fr: "", tagline_ar: "", image_url: "", kind: "size", ref: "small", active: true };
    const sizes = A().sorted(A().catalog.options.filter(x => x.type === "size"));
    return `<div class="modal-bg" data-a="modal-bg"><form class="modal" id="m-form" data-kind="collections" data-id="${esc(c.id || "")}" novalidate>
      <h3>${esc(T("adm_collections"))}</h3><div class="form">
      <div class="fld"><label>${esc(T("p_name_fr"))} *</label><input name="name_fr" value="${esc(c.name_fr)}" required></div>
      <div class="fld"><label>${esc(T("p_name_ar"))}</label><input name="name_ar" value="${esc(c.name_ar)}" dir="rtl"></div>
      <div class="fld"><label>${esc(T("c_tagline_fr"))}</label><input name="tagline_fr" value="${esc(c.tagline_fr)}"></div>
      <div class="fld"><label>${esc(T("c_tagline_ar"))}</label><input name="tagline_ar" value="${esc(c.tagline_ar)}" dir="rtl"></div>
      ${imageField(c.image_url, "other")}
      <div class="row2"><div class="fld"><label>${esc(T("c_kind"))}</label><select name="kind"><option value="size" ${c.kind !== "quote" ? "selected" : ""}>${esc(T("c_kind_size"))}</option><option value="quote" ${c.kind === "quote" ? "selected" : ""}>${esc(T("c_kind_quote"))}</option></select></div>
        <div class="fld"><label>${esc(T("c_ref"))}</label><input name="ref" list="ref-list" value="${esc(c.ref || "")}" maxlength="40"><datalist id="ref-list">${sizes.map(z => `<option value="${esc(z.code || z.id)}">${esc(F(z, "name"))}</option>`).join("")}<option value="vip-man"></option><option value="vip-woman"></option><option value="bespoke"></option></datalist></div></div>
      <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="active" ${c.active !== false ? "checked" : ""}> ${esc(T("p_active"))}</label>
      <div id="m-err"></div></div>
      <div class="foot">${c.id ? `<button class="btn btn-danger btn-sm" type="button" data-a="del" data-kind="collections" data-id="${esc(c.id)}">${esc(T("adm_delete"))}</button>` : "<span></span>"}
        <span><button class="btn btn-ghost btn-sm" type="button" data-a="close">${esc(T("adm_cancel"))}</button> <button class="btn btn-gold btn-sm" type="submit">${esc(T("adm_save"))}</button></span></div></form></div>`;
  }

  /* ---------- Réglages ---------- */
  function settingsHTML() {
    const s = A().catalog.settings;
    const f = (k, lab, type) => `<div class="fld"><label>${esc(T(lab))}</label><input name="${k}" type="${type || "text"}" value="${esc(s[k] || "")}"></div>`;
    return `<form id="s-form" class="form panel" style="max-width:560px" novalidate>${f("delivery_fee", "s_delivery", "number")}${f("phone", "s_phone")}${f("whatsapp", "s_whatsapp")}${f("instagram", "s_instagram")}${f("email", "s_email")}${f("announce_fr", "s_announce_fr")}${f("announce_ar", "s_announce_ar")}
      <div id="s-msg"></div><button class="btn btn-gold" type="submit">${esc(T("adm_save"))}</button></form>`;
  }

  /* ---------- Import ---------- */
  function importModal() {
    return `<div class="modal-bg" data-a="modal-bg"><div class="modal"><h3>${esc(T("imp_title"))}</h3><p class="muted" style="margin-bottom:10px;font-size:.92rem">${esc(T("imp_help"))}</p>
      <div class="fld"><textarea id="imp-text" style="min-height:150px" placeholder="Parfums;Parfum homme boisé;عطر رجالي;6500;1"></textarea></div>
      <div class="fld mt"><label>${esc(T("imp_file"))}</label><input type="file" accept=".csv,.tsv,.txt,text/csv" id="imp-file"></div><div id="m-err"></div>
      <div class="foot"><span></span><span><button class="btn btn-ghost btn-sm" type="button" data-a="close">${esc(T("adm_cancel"))}</button> <button class="btn btn-gold btn-sm" type="button" data-a="run-import">${esc(T("imp_run"))}</button></span></div></div></div>`;
  }

  const modal = (html) => { closeModal(); const d = document.createElement("div"); d.id = "modal-host"; d.innerHTML = html; $("#adm-root").appendChild(d); };
  const closeModal = () => { const m = $("#modal-host"); if (m) m.remove(); };
  async function refresh(keepTab) { await A().reload(); if (!keepTab) tab = tab; renderTabs(); renderBody(); }
  const fail = (msg) => { const b = $("#m-err"); if (b) b.innerHTML = `<div class="alert bad" role="alert">${esc(msg)}</div>`; };

  /* ---------- événements ---------- */
  async function onClick(e) {
    const el = e.target.closest("[data-a],[data-t]"); if (!el) return;
    if (el.dataset.t) { tab = el.dataset.t; renderTabs(); renderBody(); return; }
    const a = el.dataset.a, cat = A().catalog;
    if (a === "modal-bg") { if (e.target === el) closeModal(); return; }
    if (a === "close") return closeModal();
    if (a === "toggle") { el.closest(".o-row").classList.toggle("open"); return; }
    if (a === "print") return printOrder(el.dataset.id);
    if (a === "copymsg") { const o = orders.find(x => x.id === el.dataset.id); try { await navigator.clipboard.writeText(o.message); A().toast(T("adm_copied")); } catch (er) {} return; }
    if (a === "export-orders") return exportOrders();
    if (a === "export-products") {
      const rows = [["Catégorie", "Nom FR", "Nom AR", "Prix", "Stock"]]; cat.products.forEach(p => rows.push([I18N.categories[p.category] ? I18N.categories[p.category].fr : p.category, p.name_fr, p.name_ar, p.price, p.in_stock !== false ? 1 : 0]));
      return download("produits-signature.csv", rows.map(r => r.map(csvEsc).join(";")).join("\r\n"));
    }
    if (a === "stock") { const p = cat.products.find(x => x.id === el.dataset.id); if (!p) return; const v = p.in_stock === false; try { await DB.saveRow("products", { id: p.id, in_stock: v }); p.in_stock = v; el.setAttribute("aria-pressed", String(v)); A().toast(T("adm_saved")); } catch (er) { A().toast(T("err_generic")); } return; }
    if (a === "new-product") return modal(productModal());
    if (a === "edit-product") return modal(productModal(cat.products.find(x => x.id === el.dataset.id)));
    if (a === "new-option") return modal(optionModal());
    if (a === "edit-option") return modal(optionModal(cat.options.find(x => x.id === el.dataset.id)));
    if (a === "new-col") return modal(colModal());
    if (a === "edit-col") return modal(colModal(cat.collections.find(x => x.id === el.dataset.id)));
    if (a === "import") return modal(importModal());
    if (a === "del") {
      if (!confirm(T("adm_confirm_delete"))) return;
      try { await DB.deleteRow(el.dataset.kind, el.dataset.id); closeModal(); await refresh(); } catch (er) { fail(T("err_generic")); } return;
    }
    if (a === "run-import") {
      const rows = parseTable($("#imp-text").value);
      const data = rows.filter(r => r.length >= 4 && !/^(cat|catégorie|الفئة)/i.test(r[0])).map(r => ({ category: catKeyFrom(r[0]), name_fr: r[1], name_ar: r[2], price: Math.max(0, parseInt(String(r[3]).replace(/[^\d]/g, ""), 10) || 0), in_stock: r[4] === undefined || r[4] === "" ? true : !/^(0|non|no|false|لا)$/i.test(r[4]) })).filter(r => r.name_fr);
      if (!data.length) return fail(T("err_required"));
      el.disabled = true;
      try { const n = await DB.importProducts(data); closeModal(); await refresh(); A().toast(T("imp_done", { n })); } catch (er) { el.disabled = false; fail(T("err_generic")); }
    }
  }

  async function onChange(e) {
    const el = e.target;
    if (el.id === "o-st") { filter.st = el.value; return renderBody(); }
    if (el.id === "p-cat") { filter.cat = el.value; return renderBody(); }
    if (el.id === "imp-file" && el.files[0]) { $("#imp-text").value = await el.files[0].text(); return; }
    const a = el.dataset.a;
    if (a === "status") { try { await DB.updateOrder(el.dataset.id, { status: el.value }); const o = orders.find(x => x.id === el.dataset.id); if (o) o.status = el.value; renderTabs(); el.closest(".o-row").classList.toggle("fresh", el.value === "new"); A().toast(T("adm_saved")); } catch (er) { A().toast(T("err_generic")); } return; }
    if (a === "adminnote") { try { await DB.updateOrder(el.dataset.id, { admin_note: el.value.slice(0, 500) }); A().toast(T("adm_saved")); } catch (er) { A().toast(T("err_generic")); } return; }
    if (a === "price") {
      const v = Math.max(0, parseInt(el.value, 10) || 0); const p = A().catalog.products.find(x => x.id === el.dataset.id);
      try { await DB.saveRow("products", { id: p.id, price: v }); p.price = v; el.value = v; A().toast(T("adm_saved")); } catch (er) { A().toast(T("err_generic")); } return;
    }
    if (a === "upload" && el.files[0]) {
      try { const url = await DB.uploadImage(el.files[0]); const f = el.closest("form"); f.elements.image_url.value = url; $("#img-prev").innerHTML = `<img src="${esc(safe(url))}" alt="">`; }
      catch (er) { fail(er && er.message === "storage_full" ? "Stockage plein" : T("err_generic")); }
    }
  }
  function onInput(e) {
    const el = e.target;
    if (el.id === "o-q") { filter.q = el.value; const pos = el.selectionStart; renderBody(); const n = $("#o-q"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    if (el.id === "p-q") { filter.pq = el.value; const pos = el.selectionStart; renderBody(); const n = $("#p-q"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
  }

  async function onSubmit(e) {
    e.preventDefault(); const form = e.target;
    if (form.id === "s-form") {
      const d = Object.fromEntries(new FormData(form).entries());
      try { await DB.saveSettings(d); await A().reload(); $("#s-msg").innerHTML = `<div class="alert ok">${esc(T("adm_saved"))}</div>`; } catch (er) { $("#s-msg").innerHTML = `<div class="alert bad">${esc(T("err_generic"))}</div>`; }
      return;
    }
    if (form.id !== "m-form") return;
    const kind = form.dataset.kind, id = form.dataset.id, fd = new FormData(form), g = (k) => String(fd.get(k) || "").trim();
    let row;
    if (kind === "products") {
      if (!g("name_fr")) return fail(T("err_required"));
      row = { category: g("category"), name_fr: g("name_fr"), name_ar: g("name_ar"), price: Math.max(0, parseInt(g("price"), 10) || 0), slots: Math.min(8, Math.max(1, parseInt(g("slots"), 10) || 1)), description_fr: g("description_fr"), description_ar: g("description_ar"), image_url: safe(g("image_url")), in_stock: fd.has("in_stock"), active: fd.has("active") };
    } else if (kind === "options") {
      if (!g("name_fr")) return fail(T("err_required"));
      const hex = g("hex");
      row = { type: g("type"), name_fr: g("name_fr"), name_ar: g("name_ar"), price: Math.max(0, parseInt(g("price"), 10) || 0), capacity: g("capacity") ? Math.max(1, parseInt(g("capacity"), 10) || 1) : null, hex: /^#[0-9a-f]{3,8}$/i.test(hex) ? hex : "", description_fr: g("description_fr"), description_ar: g("description_ar"), material_id: g("type") === "color" && g("material_id") ? g("material_id") : null, active: fd.has("active") };
      if (g("sort") !== "") row.sort = parseInt(g("sort"), 10) || 0;
    } else {
      if (!g("name_fr")) return fail(T("err_required"));
      row = { name_fr: g("name_fr"), name_ar: g("name_ar"), tagline_fr: g("tagline_fr"), tagline_ar: g("tagline_ar"), image_url: safe(g("image_url")), kind: g("kind") === "quote" ? "quote" : "size", ref: g("ref"), active: fd.has("active") };
    }
    if (id) row.id = id;
    try { await DB.saveRow(kind, row); closeModal(); await refresh(); A().toast(T("adm_saved")); }
    catch (er) { fail(er && er.message === "storage_full" ? "Stockage plein : utilisez une adresse d'image plutôt qu'un fichier." : T("err_generic")); }
  }
})();
