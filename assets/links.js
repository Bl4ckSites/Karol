// ============================================
// LINKS.JS — Interações leves (sem API, sem modal)
// ============================================
(function () {
  'use strict';

  function init() {
    // Fallback da foto de perfil
    var img = document.getElementById('profileImg');
    if (img) {
      img.addEventListener('error', function () {
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#dceeff"/><circle cx="60" cy="46" r="22" fill="#7fb5e6"/><ellipse cx="60" cy="98" rx="34" ry="26" fill="#7fb5e6"/></svg>'
        );
      });
    }

    // Ripple nos botões de link
    var container = document.getElementById('linksContainer');
    if (container) {
      container.addEventListener('pointerdown', function (e) {
        var btn = e.target.closest('.link-btn');
        if (!btn) return;
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var s = document.createElement('span');
        s.className = 'ripple';
        s.style.width = s.style.height = size + 'px';
        s.style.left = (e.clientX - rect.left - size / 2) + 'px';
        s.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(s);
        setTimeout(function () { s.remove(); }, 650);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
