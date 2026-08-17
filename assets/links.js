// ============================================
// LINKS.JS — Modal +18 + links (MODO DEV: 404/405)
// ============================================
(function () {
  'use strict';

  var authToken = null;
  try { authToken = localStorage.getItem('authToken') || null; } catch (e) {}

  // GitHub Pages responde 404 ou 405 quando não tem API → modo teste
  function isNoApi(status) {
    return status === 404 || status === 405;
  }

  var DEV_LINKS = [
    { id: '1', titulo: 'Privacy 50% OFF', url: 'https://privacy.com.br/checkout/soykarolinareal' },
    { id: '2', titulo: 'Grupo VIP', url: 'https://t.me/Soykarolinareal_bot?start=biositesoykarolinareal' },
    { id: '3', titulo: 'Packs e Chamada de Vídeo', url: 'https://serverflow.dad/c/whatsapp-karol' },
    { id: '4', titulo: 'OnlyFans', url: 'https://onlyfans.com/karolinaofc/c2' }
  ];

  var SVG_PRIVACY = '<svg viewBox="0 0 48 48"><defs><linearGradient id="pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8A3C"/><stop offset="1" stop-color="#F4442E"/></linearGradient></defs><circle cx="24" cy="24" r="24" fill="url(#pv)"/><path fill="#fff" fill-rule="evenodd" d="M24 11c-7.2 0-13 5.8-13 13s5.8 13 13 13 13-5.8 13-13-5.8-13-13-13zm0 5.2a7.8 7.8 0 1 1 0 15.6 7.8 7.8 0 0 1 0-15.6z"/><circle cx="24" cy="21.6" r="3.1" fill="#fff"/><path d="M24 24.2l-2.4 6.6h4.8z" fill="#fff"/></svg>';
  var SVG_TELEGRAM = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#2AABEE"/><path fill="#fff" transform="translate(7,5) scale(1.2)" d="M2 21l21-9-9 21-4-8-8-4z"/></svg>';
  var SVG_WHATS = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#25D366"/><path fill="#fff" d="M24 10c-7.7 0-14 6.1-14 13.7 0 3 .9 5.7 2.6 8L11 38l6.5-1.7c2 1 4.2 1.5 6.5 1.5 7.7 0 14-6.1 14-13.7S31.7 10 24 10z"/><path fill="#25D366" d="M19.2 17.4c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.4 6.9 6 3.4 1.3 4.1 1 4.8 1 .7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5s-2.3-1.1-2.6-1.2c-.4-.1-.6-.2-.9.2-.3.4-1 1.2-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.2-1.7-3.1z"/></svg>';
  var SVG_OF = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#ffffff"/><circle cx="17.5" cy="24" r="5.5" fill="none" stroke="#00AFF0" stroke-width="4"/><path fill="none" stroke="#00AFF0" stroke-width="4" stroke-linecap="round" d="M29 30V18h9M29 24h7"/></svg>';
  var SVG_DEFAULT = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#2f80d0"/><path fill="#fff" d="M24 14a7 7 0 0 1 7 7c0 5-7 13-7 13s-7-8-7-13a7 7 0 0 1 7-7zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>';
  var SVG_CHEVRON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

  function iconFor(url) {
    if (/privacy\.com\.br/.test(url)) return SVG_PRIVACY;
    if (/t\.me\//.test(url)) return SVG_TELEGRAM;
    if (/whatsapp|serverflow/.test(url)) return SVG_WHATS;
    if (/onlyfans/.test(url)) return SVG_OF;
    return SVG_DEFAULT;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function show18() { document.getElementById('ageModal').classList.add('show'); }
  function hide18() { document.getElementById('ageModal').classList.remove('show'); }

  function checkAge() {
    if (authToken) {
      fetch('/api/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + authToken, 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin'
      })
        .then(function (r) {
          if (isNoApi(r.status)) { renderLinks(DEV_LINKS); return; } // MODO DEV
          if (r.ok) loadLinks();
          else { authToken = null; show18(); }
        })
        .catch(function () { show18(); });
    } else {
      show18();
    }
  }

  function handleConfirmAge() {
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
      body: JSON.stringify({ ts: Date.now() })
    })
      .then(function (r) {
        if (isNoApi(r.status)) { hide18(); renderLinks(DEV_LINKS); return null; } // MODO DEV
        if (!r.ok) throw new Error('fail');
        return r.json();
      })
      .then(function (d) {
        if (!d) return;
        authToken = d.token;
        try { localStorage.setItem('authToken', authToken); } catch (e) {}
        hide18();
        sendEvent('age_confirmed');
        loadLinks();
      })
      .catch(function () { alert('Erro ao verificar. Tente novamente.'); });
  }

  function handleDenyAge() {
    window.location.href = 'https://www.google.com';
  }

  function loadLinks() {
    var c = document.getElementById('linksContainer');
    c.innerHTML = '<p class="loading">Carregando links...</p>';
    fetch('/api/links', {
      headers: { 'Authorization': 'Bearer ' + authToken, 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin'
    })
      .then(function (r) {
        if (isNoApi(r.status)) { renderLinks(DEV_LINKS); return null; } // MODO DEV
        if (r.status === 401) { authToken = null; throw new Error('expired'); }
        if (!r.ok) throw new Error('http');
        return r.json();
      })
      .then(function (d) {
        if (!d) return;
        renderLinks(d.links);
        sendEvent('links_loaded');
      })
      .catch(function () {
        c.innerHTML = '<p class="error">Erro ao carregar. Recarregue a página.</p>';
        if (!authToken) setTimeout(show18, 800);
      });
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
        '<span class="link-icon" aria-hidden="true">' + iconFor(l.url) + '</span>' +
        '<span class="link-label">' + escapeHtml(l.titulo) + '</span>' +
        '<span class="link-chevron" aria-hidden="true">' + SVG_CHEVRON + '</span>';
      a.addEventListener('click', function () {
        sendEvent('link_clicked', { linkId: l.id });
      });
      c.appendChild(a);
    });
  }

  function sendEvent(name, extra) {
    try {
      var q = JSON.parse(localStorage.getItem('evq') || '[]');
      var ev = { event: name, ua: navigator.userAgent, ts: Date.now(), page: 'links' };
      if (extra) Object.keys(extra).forEach(function (k) { ev[k] = extra[k]; });
      q.push(ev);
      localStorage.setItem('evq', JSON.stringify(q.slice(-50)));
      flushEvents();
    } catch (e) {}
  }

  function flushEvents() {
    try {
      var q = JSON.parse(localStorage.getItem('evq') || '[]');
      if (!q.length) return;
      fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(q[0]),
        credentials: 'same-origin'
      })
        .then(function (r) {
          if (r.ok) {
            q.shift();
            localStorage.setItem('evq', JSON.stringify(q));
            if (q.length) setTimeout(flushEvents, 100);
          }
        })
        .catch(function () { setTimeout(flushEvents, 5000); });
    } catch (e) {}
  }

  function init() {
    var img = document.getElementById('profileImg');
    if (img) {
      img.addEventListener('error', function () {
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#dceeff"/><circle cx="60" cy="46" r="22" fill="#7fb5e6"/><ellipse cx="60" cy="98" rx="34" ry="26" fill="#7fb5e6"/></svg>'
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

    document.getElementById('confirmAge').addEventListener('click', handleConfirmAge);
    document.getElementById('denyAge').addEventListener('click', handleDenyAge);

    checkAge();
    flushEvents();
    setInterval(flushEvents, 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
