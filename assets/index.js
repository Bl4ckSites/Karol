// ============================================
// INDEX.JS — Gate anti-robô + saída do WebView
// Tudo automático; pop-up apenas como fallback
// ============================================
(function () {
  'use strict';

  var TURNSTILE_SITEKEY = 'COLE_AQUI_SUA_SITE_KEY';
  var TARGET_REL = './links.html';
  var TARGET_ABS = window.location.origin + '/links.html';

  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  var isInApp = /(Instagram|FBAN|FBAV|Messenger|TikTok|Twitter|Pinterest|Threads)/i.test(ua);

  var leftPage = false;
  var modalShown = false;
  var proceeded = false;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) leftPage = true;
  });

  function isDevHost() {
    return /github\.io$|localhost|127\.0\.0\.1/.test(window.location.hostname);
  }

  // ============================================
  // ÁUDIO (Web Audio API)
  // ============================================
  var audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playClickSound() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    osc.connect(gain);
    gain.connect(ctx.destination);
    var now = ctx.currentTime;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
    osc.onended = function () { osc.disconnect(); gain.disconnect(); };
  }

  function playModalSound() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    [660, 880, 1100].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      var start = now + i * 0.08;
      var end = start + 0.2;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, end);
      osc.start(start);
      osc.stop(end);
      osc.onended = function () { osc.disconnect(); gain.disconnect(); };
    });
  }

  // ============================================
  // RIPPLE + VIBRAÇÃO
  // ============================================
  function createRipple(e) {
    var target = e.currentTarget;
    if (!target) return;
    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 0.8;
    var cx = (e.clientX != null) ? e.clientX : rect.left + rect.width / 2;
    var cy = (e.clientY != null) ? e.clientY : rect.top + rect.height / 2;
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (cx - rect.left - size / 2) + 'px';
    ripple.style.top = (cy - rect.top - size / 2) + 'px';
    target.appendChild(ripple);
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 600);
  }

  function vibrate(p) {
    if (navigator.vibrate) navigator.vibrate(p);
  }

  function bindFeedback() {
    document.querySelectorAll('.btn, .link-btn, .icon-btn').forEach(function (el) {
      el.addEventListener('click', function (e) {
        playClickSound();
        createRipple(e);
        vibrate(10);
      });
    });
  }

  // ============================================
  // DETECÇÃO DE AUTOMAÇÃO (segura p/ mobile)
  // ============================================
  function isSuspiciousBot() {
    if (navigator.webdriver === true) return true;
    if (/headlesschrome|puppeteer|selenium|phantomjs|crawler|spider/i.test(ua)) return true;
    if (/python-requests|scrapy|curl\/|wget|httpclient|java\//i.test(ua)) return true;
    return false;
  }

  // ============================================
  // UI
  // ============================================
  function showModal() {
    if (leftPage || modalShown) return;
    modalShown = true;
    document.getElementById('loader').classList.add('hidden');
    var modal = document.getElementById('modal');
    modal.classList.add('show');
    playModalSound();
    vibrate(20);
    modal.querySelectorAll('.btn').forEach(function (b, i) {
      b.style.opacity = '0';
      b.style.transform = 'translateY(10px)';
      setTimeout(function () {
        b.style.transition = 'opacity .3s ease, transform .3s ease';
        b.style.opacity = '1';
        b.style.transform = 'none';
      }, 100 + i * 100);
    });
  }

  function showBlock() {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('blockModal').classList.add('show');
  }

  // ============================================
  // SAÍDA DO WEBVIEW
  // ============================================
  function exitToExternal() {
    if (isAndroid) {
      window.location.href =
        'intent://' + window.location.host + '/links.html#Intent;' +
        'scheme=https;' +
        'action=android.intent.action.VIEW;' +
        'S.browser_fallback=' + encodeURIComponent(TARGET_ABS) + ';' +
        'end';
      setTimeout(function () {
        if (!leftPage) window.location.href = TARGET_ABS;
      }, 900);
    } else if (isIOS) {
      var w = window.open(TARGET_ABS, '_blank');
      if (!w) window.location.href = TARGET_ABS;
    } else {
      window.location.href = TARGET_REL;
    }
  }

  // ============================================
  // TURNSTILE + VALIDAÇÃO SERVER-SIDE
  // ============================================
  function verifyHuman(token) {
    return fetch('/api/human', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ turnstile: token })
    }).then(function (r) {
      if (r.status === 404) return 'dev';   // GitHub Pages (sem functions)
      if (r.status === 403) return 'bot';   // Turnstile reprovou
      return 'ok';
    }).catch(function () { return 'ok'; }); // falha de rede não pune usuário real
  }

  function proceed() {
    if (proceeded) return;
    proceeded = true;

    if (isAndroid) {
      setTimeout(function () { if (!leftPage) exitToExternal(); }, 400);
      setTimeout(showModal, 1600);
    } else if (isIOS) {
      setTimeout(showModal, 700);
    } else {
      // PC / navegador comum: vai DIRETO, sem pop-up
      window.location.replace(TARGET_REL);
    }
  }

  function startGate() {
    var settled = false;
    function settle(fn) {
      if (!settled) { settled = true; fn(); }
    }

    function waitTurnstile(cb, tries) {
      if (window.turnstile) return cb(true);
      if ((tries || 0) > 40) return cb(false); // ~4s sem script = modo degradado
      setTimeout(function () { waitTurnstile(cb, (tries || 0) + 1); }, 100);
    }

    waitTurnstile(function (loaded) {
      if (!loaded) { settle(proceed); return; }
      try {
        window.turnstile.render(document.getElementById('turnstileBox'), {
          sitekey: TURNSTILE_SITEKEY,
          callback: function (token) {
            verifyHuman(token).then(function (res) {
              if (res === 'bot' && !isDevHost()) settle(showBlock);
              else settle(proceed);
            });
          },
          'error-callback': function () {
            if (isDevHost()) settle(proceed); // github.io/localhost não bloqueia
            else settle(showBlock);
          },
          'expired-callback': function () { settle(proceed); }
        });
      } catch (e) {
        settle(proceed);
      }
    });
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  function init() {
    bindFeedback();

    document.getElementById('btnYes').addEventListener('click', function () {
      exitToExternal();
    });

    document.getElementById('btnNo').addEventListener('click', function () {
      this.textContent = 'Redirecionando...';
      this.disabled = true;
      setTimeout(exitToExternal, 250);
    });

    document.getElementById('btnRetry').addEventListener('click', function () {
      window.location.reload();
    });

    // Robô óbvio → bloqueia na hora
    if (isSuspiciousBot()) { showBlock(); return; }

    // Fora de app (PC/navegador comum) → redirect direto, SEM pop-up
    if (!isInApp) { window.location.replace(TARGET_REL); return; }

    // Dentro de app → gate Turnstile + fluxo automático
    startGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
