// ============================================
// INDEX.JS — FINAL: bot→404 | humano→pré-site
// ============================================
(function () {
  'use strict';

  var TARGET_REL = './links.html';
  var TARGET_ABS = window.location.origin + '/links.html';
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  var isInApp = /(Instagram|FBAN|FBAV|Messenger|TikTok|Twitter|Pinterest|Threads)/i.test(ua);
  var leftPage = false;
  var presiteShown = false;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) leftPage = true;
  });

  var audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(function () {});
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

  // Só automação — NUNCA pune humano (sem armadilha de mouse)
  function isBot() {
    if (navigator.webdriver === true) return true;
    return /bot|crawler|spider|headless|puppeteer|selenium|phantomjs|curl\/|wget|python-requests|scrapy|httpclient/i.test(ua);
  }

  function showPresite() {
    if (presiteShown) return;
    presiteShown = true;
    var loader = document.getElementById('loader');
    var presite = document.getElementById('presite');
    if (loader) loader.classList.add('hidden');
    if (presite) presite.style.display = 'block';
  }

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

  function init() {
    var btnAccess = document.getElementById('btnAccess');
    if (btnAccess) {
      btnAccess.addEventListener('click', function (e) {
        playClickSound();
        createRipple(e);
        vibrate(10);
        exitToExternal();
      });
    }

    if (isBot()) { window.location.replace('./404.html'); return; }

    setTimeout(showPresite, 800);

    if (isInApp && isAndroid) {
      setTimeout(function () { if (!leftPage) exitToExternal(); }, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
