/* Pencari gambar otomatis. Dimuat paling awal di <head> supaya tidak ada kegagalan yang terlewat.
   Kalau sebuah gambar gagal dimuat, dicoba berurutan: lokasi lain (akar repo <-> folder assets),
   coba ulang tanpa cache, lalu versi penuh bila miniatur (-t) hilang. Kalau tetap gagal, diberi penanda. */
(function () {
  'use strict';
  function markFail(img) { img.classList.add('is-broken'); var p = img.closest && img.closest('.tile__img'); if (p) p.classList.add('img-fail'); }
  function markOk(img) { img.classList.remove('is-broken'); var p = img.closest && img.closest('.tile__img'); if (p) p.classList.remove('img-fail'); }
  function candidates(src) {
    var base = src.replace(/[?#].*$/, '');
    if (!base || /^(https?:|data:|blob:|\/\/)/i.test(base)) return [];
    var alt = /^assets\//.test(base) ? base.slice(7) : 'assets/' + base;
    var t = Date.now();
    var list = [alt, base + '?r=' + t, alt + '?r=' + t];
    if (/-t\.(jpe?g|png)$/i.test(base)) { list.push(base.replace(/-t\./i, '.')); list.push(alt.replace(/-t\./i, '.')); }
    return list;
  }
  function onError(img) {
    if (!img._cand) img._cand = candidates(img.getAttribute('src') || '');
    var next = img._cand.shift();
    if (next) img.src = next; else markFail(img);
  }
  document.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') onError(e.target); }, true);
  document.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') markOk(e.target); }, true);
  window.__fixImg = onError;
})();
