/* EXTRA: tombol "tampilkan lebih", gerak saat digulir, hitung angka, miring kartu */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Tampilkan sebagian dulu, sisanya lewat tombol
  // [pemilih daftar, jumlah awal, kata benda]. Ubah angkanya sesuka hati.
  var RULES = [
    ['.tgroup:not([data-group="poster"]) .tgrid', 6, 'karya'],
    ['.certs__grid', 6, 'sertifikat'],
    ['.moments__grid', 6, 'bukti kegiatan']
  ];
  function setup(list, limit, noun) {
    var wrap = document.createElement('div');
    wrap.className = 'xmore-wrap';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'xmore'; btn.setAttribute('aria-expanded', 'false');
    wrap.appendChild(btn);
    list.parentNode.insertBefore(wrap, list.nextSibling);
    var open = false;
    function refresh() {
      var vis = $$(':scope > li', list).filter(function (li) { return !li.hidden; });
      var extra = vis.length - limit;
      wrap.hidden = extra <= 0;
      vis.forEach(function (li, i) { li.classList.toggle('is-over', !open && i >= limit); });
      btn.innerHTML = open
        ? 'Tampilkan lebih sedikit<i class="xmore__chev"></i>'
        : 'Tampilkan ' + noun + ' lainnya<span class="xmore__n">+' + Math.max(extra, 0) + '</span><i class="xmore__chev"></i>';
    }
    btn.addEventListener('click', function () {
      var top = list.getBoundingClientRect().top;
      open = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      refresh();
      if (open) {
        var vis = $$(':scope > li', list).filter(function (li) { return !li.hidden; }).slice(limit);
        vis.forEach(function (li, i) {
          li.style.setProperty('--i', Math.min(i, 8));
          li.classList.remove('is-fresh'); void li.offsetWidth; li.classList.add('is-fresh');
        });
      } else if (top < 0) {
        list.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      }
    });
    new MutationObserver(refresh).observe(list, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    refresh();
  }
  RULES.forEach(function (r) { $$(r[0]).forEach(function (l) { setup(l, r[1], r[2]); }); });

  // 2) Gambar yang gagal dimuat diberi penanda yang jelas
  $$('img').forEach(function (img) {
    function fail() { img.classList.add('is-broken'); var p = img.closest('.tile__img'); if (p) p.classList.add('img-fail'); }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) { if (img.loading !== 'lazy') fail(); }
    img.addEventListener('error', fail);
  });

  if (calm || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-anim');

  // 3) Muncul saat digulir (bagian dan kartu)
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  $$('.panel, .cta, .contact').forEach(function (p) { p.classList.add('rv'); io.observe(p); });
  $$('.tgrid > li, .certs__grid > li, .moments__grid > li, .path > li, .awards__list > li').forEach(function (el, i) {
    el.classList.add('rv-item'); el.style.setProperty('--i', i % 6); io.observe(el);
  });

  // 4) Hitung naik pada angka penyaring
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, to = parseInt(el.textContent, 10), t0 = performance.now();
      if (!to) return;
      (function tick(t) {
        var p = Math.min((t - t0) / 900, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  });
  $$('.clevel b, .levels b').forEach(function (b) { cio.observe(b); });

  // 5) Kartu miring mengikuti kursor
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.tile').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty('--ry', (((e.clientX - r.left) / r.width) - .5) * 7 + 'deg');
        t.style.setProperty('--rx', (.5 - ((e.clientY - r.top) / r.height)) * 7 + 'deg');
      });
      t.addEventListener('pointerleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
    });
  }

  // 6) Bilah kemajuan di atas halaman
  var bar = document.createElement('div'); bar.className = 'xprog'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function prog() { var h = document.documentElement; bar.style.transform = 'scaleX(' + (h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1)) + ')'; }
  addEventListener('scroll', prog, { passive: true }); prog();
})();
