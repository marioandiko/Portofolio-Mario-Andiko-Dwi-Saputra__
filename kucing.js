(function () {
  'use strict';
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var NS = 'http://www.w3.org/2000/svg';
  function svg(cls, vb, inner) { var d = document.createElement('div'); d.innerHTML = '<svg class="' + cls + '" viewBox="' + vb + '" aria-hidden="true">' + inner + '</svg>'; return d.firstChild; }
  var B = '#514240';

  // kucing duduk (tampak depan, ekor bergoyang)
  function sitter(fur) {
    return svg('sitter', '0 0 100 100',
      '<g class="tail"><path d="M76 88 C98 84 98 56 86 52" fill="none" stroke="' + fur + '" stroke-width="9" stroke-linecap="round"/></g>' +
      '<ellipse cx="46" cy="76" rx="26" ry="22" fill="' + fur + '"/>' +
      '<path d="M22 44 L26 14 L46 30Z M70 44 L66 14 L46 30Z" fill="' + fur + '"/>' +
      '<circle cx="46" cy="50" r="26" fill="' + fur + '"/>' +
      '<g class="blink"><ellipse cx="36" cy="48" rx="3.6" ry="5.4" fill="' + B + '"/><ellipse cx="56" cy="48" rx="3.6" ry="5.4" fill="' + B + '"/></g>' +
      '<path d="M42 57 Q46 54 50 57 Q48 62 46 62 Q44 62 42 57Z" fill="' + B + '"/>' +
      '<path d="M46 62 Q41 67 36 63 M46 62 Q51 67 56 63" fill="none" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="34" cy="94" rx="9" ry="5" fill="' + fur + '"/><ellipse cx="58" cy="94" rx="9" ry="5" fill="' + fur + '"/>');
  }
  // telinga + kucing duduk di panel
  var furs = ['#CFC5B4', '#E8B77A', '#8d7b73', '#F1ECE2'];
  $$('.wrap > .panel, .wrap > .duo > .panel').forEach(function (p, i) {
    var e = document.createElement('i'); e.className = 'ears' + (i % 2 ? ' ears--r' : ''); e.setAttribute('aria-hidden', 'true');
    p.insertBefore(e, p.firstChild);
    if (i % 3 === 1) {
      var s = sitter(furs[(i / 3 | 0) % furs.length]);
      s.style[i % 2 ? 'left' : 'right'] = '24px';
      if (i % 2 === 0) s.style.right = '24px';
      p.appendChild(s);
    }
  });
  // jejak kaki antar bagian
  ['.works', '.about', '.sci', '.langs', '.awards', '.moments', '.train'].forEach(function (q) {
    var el = document.querySelector(q); if (!el) return;
    var d = document.createElement('div'); d.className = 'pawtrail'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = new Array(6).join('<svg viewBox="0 0 24 24"><use href="#paw"/></svg>');
    el.parentNode.insertBefore(d, el);
  });
  // kucing berjalan
  var w = svg('walker', '0 0 112 62',
    '<g class="wtail"><path d="M14 30 C0 26 2 8 12 6" fill="none" stroke="#8d7b73" stroke-width="7" stroke-linecap="round"/></g>' +
    '<rect class="leg" x="26" y="38" width="7" height="20" rx="3.5" fill="#6f5f58"/><rect class="leg" x="62" y="38" width="7" height="20" rx="3.5" fill="#6f5f58"/>' +
    '<ellipse cx="50" cy="34" rx="38" ry="17" fill="#8d7b73"/>' +
    '<rect class="leg" x="38" y="38" width="7" height="20" rx="3.5" fill="#8d7b73"/><rect class="leg" x="74" y="38" width="7" height="20" rx="3.5" fill="#8d7b73"/>' +
    '<path d="M70 26 L72 6 L84 18Z M94 26 L98 8 L104 22Z" fill="#8d7b73"/><circle cx="90" cy="28" r="16" fill="#8d7b73"/>' +
    '<circle cx="95" cy="26" r="2.6" fill="' + B + '"/><circle cx="104" cy="31" r="2.2" fill="' + B + '"/>');
  document.body.appendChild(w);
  // kucing tidur di kaki halaman
  var f = document.querySelector('.foot');
  if (f) {
    f.appendChild(svg('sleeper', '0 0 140 60',
      '<path d="M16 54 C0 52 4 30 20 34" fill="none" stroke="#CFC5B4" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M14 56 C14 22 118 22 126 56Z" fill="#CFC5B4"/><path d="M104 34 L106 16 L118 26Z M122 36 L130 20 L134 38Z" fill="#CFC5B4"/>' +
      '<path d="M98 44 Q106 49 113 44 M116 46 Q122 50 128 46" fill="none" stroke="' + B + '" stroke-width="2.4" stroke-linecap="round"/>'));
    var z = document.createElement('span'); z.className = 'zzz'; z.setAttribute('aria-hidden', 'true'); z.innerHTML = '<i>z</i><i>z</i><i>Z</i>'; f.appendChild(z);
  }
  // tandai menu aktif
  var links = $$('.jump a'), map = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var i = map.indexOf(e.target); links.forEach(function (a, j) { a.style.background = j === i ? 'var(--sand)' : ''; }); } }); }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach(function (m) { if (m) io.observe(m); });
  }
})();
