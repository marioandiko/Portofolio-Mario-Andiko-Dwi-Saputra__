// Portofolio Kucing: interaksi kecil
(function () {
  'use strict';

  // 1) Mata kucing mengikuti kursor / sentuhan
  var pupils = Array.prototype.slice.call(document.querySelectorAll('.pupil'));
  var pending = false;
  var lastX = 0;
  var lastY = 0;

  function look() {
    pending = false;
    pupils.forEach(function (p) {
      var svg = p.ownerSVGElement;
      if (!svg) return;
      var box = svg.getBoundingClientRect();
      var cx = box.left + box.width / 2;
      var cy = box.top + box.height / 2;
      var dx = lastX - cx;
      var dy = lastY - cy;
      var dist = Math.hypot(dx, dy) || 1;
      var range = parseFloat(p.getAttribute('data-range')) || 6;
      var strength = Math.min(1, dist / 220);
      var x = (dx / dist) * range * strength;
      var y = (dy / dist) * range * strength;
      p.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
    });
  }

  function onMove(e) {
    var point = e.touches && e.touches[0] ? e.touches[0] : e;
    lastX = point.clientX;
    lastY = point.clientY;
    if (!pending) {
      pending = true;
      window.requestAnimationFrame(look);
    }
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  // 2) Klik kucing untuk menyapa
  var catButton = document.querySelector('.cat-btn');
  var bubble = document.querySelector('.bubble');
  var words = ['Meow!', 'Prrr...', 'Miau~', 'Halo!', 'Mrrp?'];
  var count = 0;
  var timer;

  if (catButton && bubble) {
    catButton.addEventListener('click', function () {
      bubble.textContent = words[count % words.length];
      count += 1;
      bubble.classList.add('is-on');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        bubble.classList.remove('is-on');
      }, 1400);
    });
  }

  // 3) Tahun di footer
  var year = document.getElementById('tahun');
  if (year) year.textContent = new Date().getFullYear();
})();

// 4) Saring proyek + jendela perbesar
(function () {
  'use strict';

  var TOOLS = {
    figma: 'Figma', photoshop: 'Photoshop', illustrator: 'Illustrator', premiere: 'Premiere Pro',
    canva: 'Canva', ibispaint: 'ibisPaint X', pixellab: 'PixelLab', capcut: 'CapCut'
  };

  // Saring (per kelompok proyek)
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.tgroup'));
  function applyFilter(f) {
    groups.forEach(function (g) {
      var open = g.classList.contains('is-open');
      var any = false;
      Array.prototype.forEach.call(g.querySelectorAll('.tgrid > li'), function (li) {
        var okCat = f === 'all' || li.getAttribute('data-cat') === f;
        var show = okCat;
        li.hidden = !show;
        if (show) any = true;
      });
      g.hidden = !any;
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFilter(f);
    });
  });
  // Jendela perbesar
  var dlg = document.getElementById('lb');
  if (!dlg) return;
  var box = dlg.querySelector('.lb__box');
  var media = document.getElementById('lb-media');
  var title = document.getElementById('lb-title');
  var meta = document.getElementById('lb-meta');
  var desc = document.getElementById('lb-desc');
  var tools = document.getElementById('lb-tools');
  var link = document.getElementById('lb-link');
  var count = document.getElementById('lb-count');
  var nav = document.getElementById('lb-nav');
  var list = [];
  var index = 0;

  function show(btn) {
    var imgs = (btn.getAttribute('data-images') || '').split(',').filter(Boolean);
    var names = (btn.getAttribute('data-tools') || '').split(',').filter(Boolean);
    var url = btn.getAttribute('data-link');
    var solo = btn.getAttribute('data-solo') === '1';

    box.classList.toggle('is-solo', solo);
    title.textContent = btn.getAttribute('data-title') || '';
    meta.textContent = btn.getAttribute('data-meta') || '';
    desc.textContent = btn.getAttribute('data-desc') || '';

    media.textContent = '';
    imgs.forEach(function (src, i) {
      var im = document.createElement('img');
      im.src = src;
      im.alt = (btn.getAttribute('data-title') || '') + (imgs.length > 1 ? ' (' + (i + 1) + ')' : '');
      media.appendChild(im);
    });
    media.scrollTop = 0;

    tools.textContent = '';
    names.forEach(function (n) {
      var li = document.createElement('li');
      var im = document.createElement('img');
      im.src = 'logos/' + n + '.png';
      im.alt = '';
      li.appendChild(im);
      li.appendChild(document.createTextNode(TOOLS[n] || n));
      tools.appendChild(li);
    });
    tools.hidden = names.length === 0;

    if (url) { link.href = url; link.hidden = false; } else { link.hidden = true; }
    nav.hidden = solo || list.length < 2;
    count.textContent = (index + 1) + ' / ' + list.length;
  }

  function open(btn) {
    var kind = btn.getAttribute('data-lb');
    list = Array.prototype.slice.call(document.querySelectorAll('[data-lb="' + kind + '"]')).filter(function (b) {
      return !b.closest('li[hidden], .tgroup[hidden]');
    });
    index = Math.max(0, list.indexOf(btn));
    show(btn);
    if (!dlg.open) dlg.showModal();
  }

  function step(d) {
    if (!list.length) return;
    index = (index + d + list.length) % list.length;
    show(list[index]);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-lb]') : null;
    if (b) { open(b); return; }
    var z = e.target.closest ? e.target.closest('.tile__img[data-zoom]') : null;
    if (z) { var zb = z.closest('.tile').querySelector('[data-lb]'); if (zb) open(zb); }
  });
  dlg.querySelector('.lb__close').addEventListener('click', function () { dlg.close(); });
  document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { step(1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();

// 5) Tautan tanpa tujuan (LinkedIn): klik tidak berpindah halaman
Array.prototype.forEach.call(document.querySelectorAll('a[data-noop]'), function (a) {
  a.addEventListener('click', function (e) { e.preventDefault(); });
});

// 6) Penyaring prestasi per tingkat
(function () {
  'use strict';
  var btns = Array.prototype.slice.call(document.querySelectorAll('.level'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.award-group'));
  var box = document.getElementById('awards-scroll');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-level');
      btns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      groups.forEach(function (g) { g.hidden = !(f === 'all' || g.getAttribute('data-level') === f); });
      if (box) box.scrollTop = 0;
    });
  });
})();

// 7) Penyaring galeri sertifikat
(function () {
  'use strict';
  var btns = Array.prototype.slice.call(document.querySelectorAll('[data-clevel].clevel'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.certs__grid > li'));
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-clevel');
      btns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      items.forEach(function (li) { li.hidden = !(f === 'all' || li.getAttribute('data-clevel') === f); });
    });
  });
})();

// 8) Tautan gambar: isi dari links.js (boleh satu tautan, boleh beberapa)
(function () {
  'use strict';
  var L = window.LINKS || {};
  var ICON = { instagram: 'social/instagram.png', youtube: 'social/youtube.png', facebook: 'social/facebook.png' };
  function icon(u) {
    for (var k in ICON) { if (u.indexOf(k) > -1) return ICON[k]; }
    return '';
  }
  Array.prototype.forEach.call(document.querySelectorAll('.tile'), function (tile) {
    var img = tile.querySelector('.tile__img');
    var btn = tile.querySelector('.tbtn--link');
    var zoom = tile.querySelector('[data-lb]');
    var raw = L[img.getAttribute('data-key')] || '';
    var urls = (Array.isArray(raw) ? raw : [raw]).map(function (u) { return String(u).trim(); }).filter(Boolean);
    var url = urls[0];
    if (url) {
      img.href = url;
      btn.href = url;
      btn.hidden = false;
      tile.classList.add('has-link');
      if (zoom) zoom.setAttribute('data-link', url);
      if (urls.length > 1) {
        // beberapa tautan: tombol diganti deretan chip bernomor
        var group = document.createElement('div');
        group.className = 'tlinks';
        var lab = document.createElement('span');
        lab.textContent = 'Postingan';
        group.appendChild(lab);
        urls.forEach(function (u, i) {
          var a = document.createElement('a');
          a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.setAttribute('aria-label', 'Buka postingan ' + (i + 1));
          var ic = icon(u);
          if (ic) { var im = document.createElement('img'); im.src = ic; im.alt = ''; im.width = 16; im.height = 16; a.appendChild(im); }
          a.appendChild(document.createTextNode(String(i + 1)));
          group.appendChild(a);
        });
        btn.parentNode.replaceChild(group, btn);
      }
    } else {
      img.removeAttribute('target');
      img.setAttribute('data-zoom', '1');
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.setAttribute('aria-label', 'Perbesar gambar');
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); img.click(); }
      });
    }
  });
})();
