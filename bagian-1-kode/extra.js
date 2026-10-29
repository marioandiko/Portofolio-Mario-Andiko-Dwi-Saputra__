/* EXTRA: tombol "tampilkan lebih", gerak saat digulir, hitung angka, miring kartu */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Tampilkan sebagian dulu, sisanya lewat tombol
  // [pemilih daftar, jumlah awal, kata benda]. Angka 'row' = tepat satu baris (otomatis mengikuti lebar layar).
  var RULES = [
    ['.tgroup .tgrid', 'row', 'karya'],
    ['.certs__grid', 6, 'sertifikat'],
    ['.moments__grid', 8, 'bukti kegiatan']
  ];
  function setup(list, limit, noun) {
    var wrap = document.createElement('div');
    wrap.className = 'xmore-wrap';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'xmore'; btn.setAttribute('aria-expanded', 'false');
    wrap.appendChild(btn);
    list.parentNode.insertBefore(wrap, list.nextSibling);
    var open = false;
    function rowCount() {
      var vis = $$(':scope > li', list).filter(function (li) { return !li.hidden; });
      vis.forEach(function (li) { li.classList.remove('is-over'); });
      if (!vis.length || !list.offsetParent) return vis.length;
      var t0 = vis[0].offsetTop, n = 0;
      for (var i = 0; i < vis.length; i++) { if (Math.abs(vis[i].offsetTop - t0) < 4) n++; else break; }
      return Math.max(n, 1);
    }
    function refresh() {
      var vis = $$(':scope > li', list).filter(function (li) { return !li.hidden; });
      var lim = limit === 'row' ? rowCount() : limit;
      var extra = vis.length - lim;
      wrap.hidden = extra <= 0;
      vis.forEach(function (li, i) { li.classList.toggle('is-over', !open && i >= lim); });
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
        var lim2 = limit === 'row' ? rowCount() : limit;
        var vis = $$(':scope > li', list).filter(function (li) { return !li.hidden; }).slice(lim2);
        vis.forEach(function (li, i) {
          li.style.setProperty('--i', Math.min(i, 8));
          li.classList.remove('is-fresh'); void li.offsetWidth; li.classList.add('is-fresh');
        });
      } else if (top < 0) {
        list.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      }
    });
    new MutationObserver(refresh).observe(list, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    var grp = list.closest('.tgroup');
    if (grp) new MutationObserver(refresh).observe(grp, { attributes: true, attributeFilter: ['hidden'] });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(refresh, 150); });
    addEventListener('load', refresh);
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
    es.forEach(function (e) { e.target.classList.toggle('in', e.isIntersecting); });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  $$('.panel, .cta, .contact').forEach(function (p) { p.classList.add('rv'); io.observe(p); });
  $$('.tgrid > li, .certs__grid > li, .moments__grid > li, .path > li, .awards__list > li').forEach(function (el, i) {
    el.classList.add('rv-item'); el.style.setProperty('--i', i % 6); io.observe(el);
  });

  // 4) Hitung naik pada angka penyaring
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target;
      if (!el.hasAttribute('data-to')) el.setAttribute('data-to', parseInt(el.textContent, 10) || 0);
      var to = +el.getAttribute('data-to');
      cancelAnimationFrame(el._raf);
      if (!e.isIntersecting) { el.textContent = '0'; return; }
      if (!to) return;
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min((t - t0) / 900, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) el._raf = requestAnimationFrame(tick);
      })(t0);
    });
  });
  $$('.clevel b, .levels b, .stats b').forEach(function (b) { cio.observe(b); });

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

/* ==========================================================
   V4: dock alat, mode gelap, cari prestasi, kontak cepat, geser di jendela perbesar
   ========================================================== */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- notifikasi kecil
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }
  function copy(text, ok) {
    function done() { toast(ok || 'Tersalin'); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Gagal menyalin, salin manual ya'); }
      document.body.removeChild(t);
    }
  }

  // ---- dock: naik, tema, bagikan, cetak
  var topBtn = $('#dk-top');
  function onScroll() { if (topBtn) topBtn.classList.toggle('is-on', (window.pageYOffset || root.scrollTop) > 700); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }); });

  function setTheme(dark, silent) {
    root.classList.add('is-themeing');
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('tema', dark ? 'gelap' : 'terang'); } catch (e) {}
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#1d1817' : '#514240');
    setTimeout(function () { root.classList.remove('is-themeing'); }, 600);
    if (!silent) toast(dark ? 'Mode gelap aktif' : 'Mode terang aktif');
  }
  var themeBtn = $('#dk-theme');
  if (themeBtn) themeBtn.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') !== 'dark'); });
  try {
    if (!localStorage.getItem('tema') && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(true, true);
  } catch (e) {}

  var shareBtn = $('#dk-share');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    var data = { title: document.title, text: 'Portofolio Mario Andiko Dwi Saputra: UI/UX, desain grafis, dan web development.', url: location.href.split('#')[0] };
    if (navigator.share) { navigator.share(data).catch(function () {}); } else { copy(data.url, 'Tautan halaman disalin'); }
  });
  var printBtn = $('#dk-print');
  if (printBtn) printBtn.addEventListener('click', function () { toast('Pilih "Simpan sebagai PDF" di jendela cetak'); setTimeout(function () { window.print(); }, 700); });

  // ---- kontak cepat
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), 'Email disalin: ' + b.getAttribute('data-copy')); });
  });
  var vb = $('#vcard');
  if (vb) vb.addEventListener('click', function () {
    var v = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Saputra;Mario Andiko Dwi;;;', 'FN:Mario Andiko Dwi Saputra',
      'TITLE:Mahasiswa Informatika, UI/UX dan Desain Grafis', 'TEL;TYPE=CELL:+6282178345420', 'EMAIL:dikodikod94@gmail.com',
      'URL:https://www.instagram.com/mariorioio__/', 'ADR;TYPE=HOME:;;;Kota Bengkulu;Bengkulu;;Indonesia', 'END:VCARD'].join('\r\n');
    var blob = new Blob([v], { type: 'text/vcard' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Mario-Andiko-Dwi-Saputra.vcf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Kartu kontak diunduh');
  });

  // ---- prestasi: cari + tingkat + klik baris membuka sertifikat
  var box = $('#awards-scroll'), input = $('#asearch'), info = $('#asearch-info');
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function applyAwards() {
    if (!box) return;
    var q = norm(input ? input.value.trim() : '');
    var on = $('.level.is-on'), lv = on ? on.getAttribute('data-level') : 'all', shown = 0;
    $$('.award-group', box).forEach(function (g) {
      var lvOk = q ? true : (lv === 'all' || g.getAttribute('data-level') === lv), any = 0;
      $$('li', g).forEach(function (li) {
        var ok = !q || norm(li.textContent).indexOf(q) > -1;
        li.hidden = !ok; if (ok) any++;
      });
      g.hidden = !(lvOk && any);
      if (lvOk) shown += any;
    });
    if (info) info.textContent = q ? (shown ? shown + ' prestasi cocok' : 'Belum ada yang cocok, coba kata lain') : '';
  }
  if (input) {
    input.addEventListener('input', applyAwards);
    $$('.level').forEach(function (b) { b.addEventListener('click', function () { input.value = ''; applyAwards(); }); });
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); input.focus(); var p = $('#prestasi'); if (p) p.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }
  function openRef(li) {
    var key = li.getAttribute('data-ref'), a = $('.tile__img[data-key="' + key + '"]');
    if (!a) return;
    if (key.indexOf('sertifikat:') === 0) { var all = $('.clevel[data-clevel="all"]'); if (all && !all.classList.contains('is-on')) all.click(); }
    var btn = a.closest('.tile').querySelector('[data-lb]');
    if (btn) btn.click();
  }
  $$('.awards__list li.has-ref').forEach(function (li) {
    li.addEventListener('click', function () { openRef(li); });
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRef(li); } });
  });

  // ---- jendela perbesar: geser di layar sentuh
  var dlg = $('#lb');
  if (dlg) {
    var sx = 0, sy = 0;
    dlg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      var nav = $('#lb-nav'); if (!nav || nav.hidden) return;
      var b = $(dx < 0 ? '#lb-next' : '#lb-prev'); if (b) b.click();
    }, { passive: true });
  }
})();
