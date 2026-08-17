// ============================================
// LINKS.JS — Links liberados só após Turnstile
// ============================================
(function () {
  'use strict';

  var TURNSTILE_SITEKEY = '0x4AAAAAAETGQQDnmnyVj3A0';

  var DEV_LINKS = [
    { id: '1', titulo: 'Privacy 50% OFF', url: 'https://privacy.com.br/checkout/soykarolinareal', icone: 'icone-privacy.png' },
    { id: '2', titulo: 'Grupo VIP', url: 'https://t.me/Soykarolinareal_bot?start=biositesoykarolinareal', icone: 'icone-telegram.png' },
    { id: '3', titulo: 'Packs e Chamada de Vídeo', url: 'https://serverflow.dad/c/whatsapp-karol', icone: 'icone-whatsapp.png' },
    { id: '4', titulo: 'OnlyFans', url: 'https://onlyfans.com/karolinaofc/c2', icone: 'icone-onlyfans.png' }
  ];

  var SVG_CHEVRON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function isDevHost() {
    return /github\.io$|localhost|127\.0\.0\.1/.test(window.location.hostname);
  }

  function renderLinks(links) {
    var c = document.getElementById('linksContainer');
    if (!c) return;
    c.innerHTML = '';
    (links || []).forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.url;
      a.className = 'link-btn';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML =
        '<span class="link-icon" aria-hidden="true"><img src="' + l.icone + '" alt=""></span>' +
        '<span class="link-label">' + escapeHtml(l.titulo) + '</span>' +
        '<span class="link-chevron" aria-hidden="true">' + SVG_CHEVRON + '</span>';
      c.appendChild(a);
    });
  }

  function showError() {
    var c = document.getElementById('linksContainer');
    c.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'error';
    p.textContent = 'Falha na verificação.';
    var b = document.createElement('button');
    b.className = 'btn btn-ghost';
    b.textContent = 'Tentar novamente';
    b.addEventListener('click', function () { window.location.reload(); });
    p.appendChild(b);
    c.appendChild(p);
  }

  function fetchLinks(token) {
    return fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ turnstile: token })
    }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    });
  }

  function startGate() {
    function wait(cb, tries) {
      if (window.turnstile) return cb(true);
      if ((tries || 0) > 40) return cb(false);
      setTimeout(function () { wait(cb, (tries || 0) + 1); }, 100);
    }
    wait(function (ok) {
      if (!ok) { showError(); return; }
      try {
        window.turnstile.render(document.getElementById('turnstileBoxLinks'), {
          sitekey: TURNSTILE_SITEKEY,
          callback: function (token) {
            fetchLinks(token).then(function (d) { renderLinks(d.links); }).catch(showError);
          },
          'error-callback': showError,
          'expired-callback': showError
        });
      } catch (e) { showError(); }
    });
  }

  function init() {
    var img = document.getElementById('profileImg');
    if (img) {
      img.addEventListener('error', function () {
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#1a1a1a"/><circle cx="60" cy="46" r="22" fill="#444"/><ellipse cx="60" cy="98" rx="34" ry="26" fill="#444"/></svg>'
        );
      });
    }

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

    if (isDevHost()) renderLinks(DEV_LINKS);
    else startGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
