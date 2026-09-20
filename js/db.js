/* Okulos Edu Suite yerel DB */
(function (global) {
  const DB_KEY = 'okulos_edu_suite_db';
  const LEGACY_KEYS = ['zkayit_v2', 'ziyaretci_kayitlari_v1'];
  const empty = () => ({ version: 3, kurum: { ad: 'Okulos Edu Suite', birim: 'Guvenlik / Kutuphane' }, kayitlar: [] });
  function loadRaw() { try { return JSON.parse(localStorage.getItem(DB_KEY) || 'null'); } catch { return null; } }
  function save(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); return db; }
  function migrateRecord(r, i) {
    return { id: r.id || Date.now() + i, adSoyad: r.adSoyad || '', tcNo: r.tcNo || '', telefon: r.telefon || '', kartNo: r.kartNo || '', kimi: r.kimi || r.kimiGorecek || '', sebep: r.sebep || 'Gorusme', notlar: r.notlar || '', tarih: r.tarih || '', giris: r.giris || '', cikis: r.cikis || null, aktif: r.aktif !== false && !r.cikis, kaynak: r.kaynak || 'manuel', modul: r.modul || 'guvenlik' };
  }
  function migrate(db) {
    let v = db && typeof db.version === 'number' ? db.version : 0;
    if (!db || typeof db !== 'object') db = empty();
    if (v < 1) { db.kayitlar = Array.isArray(db.kayitlar) ? db.kayitlar.map(migrateRecord) : []; v = 1; }
    if (v < 2) { db.kurum = db.kurum || { ad: 'Okulos Edu Suite', birim: 'Guvenlik / Kutuphane' }; v = 2; }
    if (v < 3) { db.kayitlar = (db.kayitlar || []).map((r, i) => migrateRecord(r, i)); v = 3; }
    db.version = 3; return db;
  }
  function importLegacy() {
    const all = [];
    LEGACY_KEYS.forEach((k) => { try { const arr = JSON.parse(localStorage.getItem(k) || '[]'); if (Array.isArray(arr)) arr.forEach((r) => all.push(r)); } catch (e) {} });
    return all;
  }
  function open() {
    let db = loadRaw();
    if (!db) { db = empty(); const legacy = importLegacy(); if (legacy.length) db.kayitlar = legacy.map(migrateRecord); }
    return save(migrate(db));
  }
  function list() { return open().kayitlar.slice(); }
  function add(rec) { const db = open(); db.kayitlar.unshift(migrateRecord(rec, 0)); save(db); return db.kayitlar[0]; }
  function update(id, patch) {
    const db = open(); const i = db.kayitlar.findIndex((x) => x.id === id); if (i < 0) return null;
    db.kayitlar[i] = migrateRecord(Object.assign({}, db.kayitlar[i], patch), i); save(db); return db.kayitlar[i];
  }
  global.OkulosDB = { open, list, add, update, DB_KEY, migrate };
})(window);
