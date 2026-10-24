/* Couche de données : mode DÉMO (localStorage) ou Supabase (gratuit) */
(function () {
  const C = window.SIGNATURE_CONFIG || {};
  const REAL = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  const sb = REAL ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

  /* ---------- Catalogue initial (js/seed.js) : 20 articles, tailles, matières/couleurs, 6 collections ---------- */
  const SD = window.SEED || { products: [], options: [], collections: [], settings: {} };
  const SETTINGS = Object.assign({ delivery_fee: "0", phone: "", whatsapp: "", instagram: "", email: "", announce_fr: "", announce_ar: "" }, SD.settings);

  /* ---------- Stockage démo ---------- */
  const KEY = "sig_demo_db_v2";
  function demoLoad() {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    const db = { products: JSON.parse(JSON.stringify(SD.products)), options: JSON.parse(JSON.stringify(SD.options)), collections: JSON.parse(JSON.stringify(SD.collections)), settings: Object.assign({}, SETTINGS), orders: [], users: [], pending: {}, counter: 1000, session: null };
    demoSave(db); return db;
  }
  function demoSave(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { throw new Error("storage_full"); } }
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  async function sha(s) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("sig:" + s));
    return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
  }
  const lc = (s) => String(s || "").trim().toLowerCase();
  const fail = (code) => { const e = new Error(code); e.code = code; return e; };
  function mapErr(e) {
    const m = String((e && (e.message || e.code)) || "");
    for (const c of ["not_authenticated", "missing_fields", "invalid_options", "invalid_product", "empty_box", "over_capacity", "invalid_color"]) if (m.includes(c)) return fail(c);
    return e instanceof Error ? e : new Error(m);
  }

  /* ---------- Redimensionnement d'image côté client ---------- */
  async function resizeImage(file, max, quality) {
    const bmp = await createImageBitmap(file);
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * r); cv.height = Math.round(bmp.height * r);
    cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise(res => cv.toBlob(res, "image/jpeg", quality || 0.82));
  }
  const blobToDataUrl = (b) => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });

  /* ---------- API ---------- */
  const DB = {
    demo: !REAL,
    resizeImage,

    async catalog() {
      if (!REAL) { const d = demoLoad(); return { products: d.products, options: d.options, collections: d.collections, settings: d.settings }; }
      const [p, o, c, s] = await Promise.all([
        sb.from("products").select("*").order("sort").order("name_fr"),
        sb.from("box_options").select("*").order("sort"),
        sb.from("collections").select("*").order("sort"),
        sb.from("settings").select("*")
      ]);
      for (const r of [p, o, c, s]) if (r.error) throw r.error;
      const settings = Object.assign({}, SETTINGS); (s.data || []).forEach(r => { settings[r.key] = r.value; });
      return { products: p.data || [], options: o.data || [], collections: c.data || [], settings };
    },

    /* --- authentification --- */
    async user() {
      if (!REAL) { const d = demoLoad(); return d.session ? { id: d.session.id, email: d.session.email } : null; }
      const { data } = await sb.auth.getSession();
      const u = data && data.session && data.session.user;
      return u ? { id: u.id, email: u.email } : null;
    },
    async signIn(email, password) {
      if (!REAL) {
        const d = demoLoad(); const h = await sha(password);
        const u = d.users.find(x => x.email === lc(email) && x.hash === h);
        if (!u) throw fail("auth");
        if (!u.verified) throw fail("unconfirmed");
        d.session = { id: u.id, email: u.email }; demoSave(d); return d.session;
      }
      const { data, error } = await sb.auth.signInWithPassword({ email: lc(email), password });
      if (error) throw fail(/confirm/i.test(error.message) ? "unconfirmed" : "auth");
      return { id: data.user.id, email: data.user.email };
    },
    /* Inscription : un code à 6 chiffres est envoyé par e-mail (OTP). Le compte n'est actif qu'après validation. */
    async signUp(email, password) {
      email = lc(email);
      if (!REAL) {
        const d = demoLoad();
        if (d.users.some(x => x.email === email && x.verified)) throw fail("exists");
        const code = String(Math.floor(100000 + Math.random() * 900000));
        d.users = d.users.filter(x => x.email !== email);
        d.users.push({ id: rid(), email, hash: await sha(password), verified: false });
        d.pending = d.pending || {}; d.pending[email] = code; demoSave(d);
        return { needsOtp: true, demoCode: code };
      }
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw fail(/registered|exists/i.test(error.message) ? "exists" : /password/i.test(error.message) ? "weak" : /rate|limit|seconds/i.test(error.message) ? "rate" : "generic");
      if (data.user && data.user.identities && data.user.identities.length === 0) throw fail("exists");
      if (data.session) return { needsOtp: false, session: { id: data.user.id, email: data.user.email } };
      return { needsOtp: true };
    },
    async verifyOtp(email, code) {
      email = lc(email); code = String(code || "").replace(/\D/g, "");
      if (!REAL) {
        const d = demoLoad(); const u = d.users.find(x => x.email === email);
        if (!u || !d.pending || d.pending[email] !== code) throw fail("otp");
        u.verified = true; delete d.pending[email]; d.session = { id: u.id, email }; demoSave(d);
        return d.session;
      }
      const { data, error } = await sb.auth.verifyOtp({ email, token: code, type: "signup" });
      if (error || !data || !data.user) throw fail("otp");
      return { id: data.user.id, email: data.user.email };
    },
    async resendOtp(email) {
      email = lc(email);
      if (!REAL) {
        const d = demoLoad(); if (!d.users.some(x => x.email === email)) throw fail("generic");
        const code = String(Math.floor(100000 + Math.random() * 900000)); d.pending = d.pending || {}; d.pending[email] = code; demoSave(d);
        return { demoCode: code };
      }
      const { error } = await sb.auth.resend({ type: "signup", email });
      if (error) throw fail(/rate|limit|seconds/i.test(error.message) ? "rate" : "generic");
      return {};
    },
    async signOut() {
      if (!REAL) { const d = demoLoad(); d.session = null; demoSave(d); return; }
      await sb.auth.signOut();
    },
    /* IMPORTANT : le callback doit être synchrone et différé, sinon Supabase se bloque (deadlock) pour les visiteurs déjà connectés */
    onAuth(cb) { if (REAL) sb.auth.onAuthStateChange(() => { setTimeout(() => { try { cb(); } catch (e) {} }, 0); }); },
    async withTimeout(promise, ms) { let t; return Promise.race([promise, new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'timeout' })), ms); })]).finally(() => clearTimeout(t)); },
    /* purge locale de la session (secours) */
    clearLocal() { try { Object.keys(localStorage).filter(k => /^sb-.*-auth-token/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {} },
    async isAdmin() {
      const u = await DB.user(); if (!u) return false;
      if (!REAL) return lc(u.email) === lc(C.ADMIN_EMAIL);
      const { data, error } = await sb.rpc("is_admin"); return !error && data === true;
    },

    /* --- profil (préremplissage) --- */
    async profile() {
      const u = await DB.user(); if (!u) return null;
      if (!REAL) { const d = demoLoad(); return (d.profiles && d.profiles[u.id]) || null; }
      const { data } = await sb.from("profiles").select("*").eq("user_id", u.id).maybeSingle(); return data || null;
    },
    async saveProfile(p) {
      const u = await DB.user(); if (!u) return;
      if (!REAL) { const d = demoLoad(); d.profiles = d.profiles || {}; d.profiles[u.id] = p; demoSave(d); return; }
      await sb.from("profiles").upsert(Object.assign({ user_id: u.id }, p));
    },

    /* --- commande --- */
    async placeOrder(p) {
      const u = await DB.user(); if (!u) throw fail("not_authenticated");
      let res;
      if (!REAL) {
        const d = demoLoad();
        const need = (s) => String(s || "").trim().length > 0;
        if (!need(p.name) || !need(p.phone) || !need(p.wilaya) || !need(p.address)) throw fail("missing_fields");
        const pick = (type, id) => d.options.find(o => o.id === id && o.type === type && o.active !== false);
        const types = ["size", "material", "color"], sel = {};
        for (const t of types) {
          const has = d.options.some(o => o.type === t && o.active !== false);
          const o = pick(t, p[t + "_id"]);
          if (has && !o) throw fail("invalid_options");
          sel[t] = o || null;
        }
        if (sel.color && sel.color.material_id && sel.material && sel.color.material_id !== sel.material.id) throw fail("invalid_color");
        const items = []; let sub = 0, used = 0;
        for (const it of (p.items || [])) {
          const pr = d.products.find(x => x.id === it.id && x.active !== false && x.in_stock !== false);
          if (!pr) throw fail("invalid_product");
          const q = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 1));
          const sl = Math.max(1, Number(pr.slots) || 1);
          items.push({ id: pr.id, name_fr: pr.name_fr, name_ar: pr.name_ar, category: pr.category, price: pr.price, slots: sl, qty: q });
          sub += pr.price * q; used += sl * q;
        }
        if (!used) throw fail("empty_box");
        if (sel.size && sel.size.capacity && used > sel.size.capacity) throw fail("over_capacity");
        const boxPrice = types.reduce((a, t) => a + (sel[t] ? Number(sel[t].price) || 0 : 0), 0);
        const fee = Number(d.settings.delivery_fee) || 0;
        const snap = (o) => o ? { id: o.id, name_fr: o.name_fr, name_ar: o.name_ar, price: o.price, hex: o.hex || "" } : null;
        const order = {
          id: rid(), number: ++d.counter, user_id: u.id, email: u.email,
          customer_name: p.name.trim().slice(0, 120), phone: p.phone.trim().slice(0, 30), wilaya: String(p.wilaya), commune: String(p.commune || "").trim().slice(0, 100),
          address: p.address.trim().slice(0, 300), delivery_note: String(p.delivery_note || "").trim().slice(0, 300),
          box: { size: snap(sel.size), material: snap(sel.material), color: snap(sel.color), price: boxPrice },
          items, slots_used: used, message: String(p.message || "").slice(0, 300), subtotal: sub + boxPrice, delivery_fee: fee, total: sub + boxPrice + fee,
          status: "new", lang: p.lang || "fr", admin_note: "", created_at: new Date().toISOString()
        };
        d.orders.unshift(order); demoSave(d);
        res = { order_id: order.id, order_number: order.number, total: order.total };
      } else {
        const { data, error } = await sb.rpc("place_order", { p });
        if (error) throw mapErr(error);
        const row = Array.isArray(data) ? data[0] : data; res = row;
      }
      if (C.NOTIFY_EMAIL) {
        try {
          fetch("https://formsubmit.co/ajax/" + encodeURIComponent(C.NOTIFY_EMAIL), {
            method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ _subject: "Signature — nouvelle commande n° " + res.order_number, commande: res.order_number, client: p.name, telephone: p.phone, wilaya: I18N.wilayaName(p.wilaya, "fr"), total: res.total + " DA" })
          }).catch(() => {});
        } catch (e) {}
      }
      return res;
    },
    async myOrders() {
      const u = await DB.user(); if (!u) return [];
      if (!REAL) return demoLoad().orders.filter(o => o.user_id === u.id);
      const { data, error } = await sb.from("orders").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
      if (error) throw error; return data || [];
    },

    /* --- administration --- */
    async adminOrders() {
      if (!REAL) return demoLoad().orders;
      const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error; return data || [];
    },
    async updateOrder(id, patch) {
      if (!REAL) { const d = demoLoad(); const o = d.orders.find(x => x.id === id); if (o) Object.assign(o, patch); demoSave(d); return; }
      const { error } = await sb.from("orders").update(patch).eq("id", id); if (error) throw error;
    },
    async saveRow(table, row) {
      const map = { products: "products", options: "box_options", collections: "collections" };
      row = Object.assign({}, row);
      if (!REAL) {
        const d = demoLoad(); const list = d[table];
        if (row.id) { const i = list.findIndex(x => x.id === row.id); if (i >= 0) list[i] = Object.assign(list[i], row); else list.push(row); }
        else { row.id = rid(); if (row.sort == null) row.sort = list.length; list.push(row); }
        demoSave(d); return row;
      }
      if (!row.id) delete row.id;
      const { data, error } = await sb.from(map[table]).upsert(row).select().single();
      if (error) throw error; return data;
    },
    async deleteRow(table, id) {
      const map = { products: "products", options: "box_options", collections: "collections" };
      if (!REAL) { const d = demoLoad(); d[table] = d[table].filter(x => x.id !== id); demoSave(d); return; }
      const { error } = await sb.from(map[table]).delete().eq("id", id); if (error) throw error;
    },
    async saveSettings(obj) {
      if (!REAL) { const d = demoLoad(); d.settings = Object.assign({}, d.settings, obj); demoSave(d); return; }
      const rows = Object.keys(obj).map(k => ({ key: k, value: String(obj[k] == null ? "" : obj[k]) }));
      const { error } = await sb.from("settings").upsert(rows); if (error) throw error;
    },
    async uploadImage(file) {
      if (!REAL) { const b = await resizeImage(file, 600, 0.78); return await blobToDataUrl(b); }
      const b = await resizeImage(file, 1000, 0.82);
      const path = Date.now() + "-" + rid() + ".jpg";
      const { error } = await sb.storage.from("products").upload(path, b, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      return sb.storage.from("products").getPublicUrl(path).data.publicUrl;
    },
    async importProducts(rows) {
      const { products } = await DB.catalog();
      const key = (r) => lc(r.name_fr);
      const existing = new Map(products.map(p => [key(p), p]));
      let n = 0;
      for (const r of rows) {
        const prev = existing.get(key(r));
        const row = { category: r.category, name_fr: r.name_fr, name_ar: r.name_ar || (prev && prev.name_ar) || "", price: r.price, in_stock: r.in_stock, active: true };
        if (prev) row.id = prev.id;
        await DB.saveRow("products", row); n++;
      }
      return n;
    },
    async reset() { localStorage.removeItem(KEY); }
  };
  window.DB = DB;
})();
