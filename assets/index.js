// ============================================
// INDEX.JS — Saída do WebView (sem Turnstile)
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
  var modalShown = false;

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
    document.querySelectorAll('.btn').forEach(function (el) {
      el.addEventListener('click', function (e) {
        playClickSound();
        createRipple(e);
        vibrate(10);
      });
    });
  }

  function isSuspiciousBot() {
    if (navigator.webdriver === true) return true;
    if (/headlesschrome|puppeteer|selenium|phantomjs|crawler|spider/i.test(ua)) return true;
    if (/python-requests|scrapy|curl\/|wget/i.test(ua)) return true;
    return false;
  }

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
    bindFeedback();

    document.getElementById('btnYes').addEventListener('click', exitToExternal);
    document.getElementById('btnNo').addEventListener('click', function () {
      this.textContent = 'Redirecionando...';
      this.disabled = true;
      setTimeout(exitToExternal, 250);
    });

    if (isSuspiciousBot()) {
      window.location.href = 'https://www.google.com';
      return;
    }

    if (!isInApp) {
      window.location.replace(TARGET_REL);
      return;
    }

    if (isAndroid) {
      setTimeout(function () { if (!leftPage) exitToExternal(); }, 400);
      setTimeout(showModal, 1600);
    } else if (isIOS) {
      setTimeout(showModal, 700);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
