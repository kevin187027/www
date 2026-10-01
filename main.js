/* ================================================================
   山水雲林股份有限公司 — 互動腳本 (純原生 JavaScript)
   ================================================================ */
(function () {
  'use strict';

  /* ---------- 導覽列滾動效果 ---------- */
  var navbar = document.getElementById('navbar');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var links = navLinks.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* ---------- 行動版選單開關 ---------- */
  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', isOpen ? '關閉選單' : '開啟選單');
  });

  /* 點選連結後自動收合 */
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 滾動浮現 (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 數字計數動畫 ---------- */
  var counters = document.querySelectorAll('.stat-num');
  var counterRan = false;

  function animateCounters() {
    if (counterRan) return;
    counterRan = true;
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(step);
    });
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    if (counters.length) counterObserver.observe(counters[0].closest('.about-stats'));
  } else {
    animateCounters();
  }

  /* ---------- 導覽連結高亮 (scroll spy) ---------- */
  var sections = document.querySelectorAll('section[id]');
  var spyLinks = Array.prototype.slice.call(links);

  function updateActiveLink() {
    var scrollPos = window.scrollY + 120;
    var currentId = '';

    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) {
        currentId = sec.getAttribute('id');
      }
    });

    spyLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  /* ---------- 聯絡表單驗證 ---------- */
  var form = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formNote.className = 'form-note';
    formNote.textContent = '';

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    if (!name || !email || !message) {
      formNote.classList.add('error');
      formNote.textContent = '請填寫所有必填欄位。';
      return;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formNote.classList.add('error');
      formNote.textContent = '請輸入有效的電子郵件地址。';
      return;
    }

    /* 無後端環境 — 顯示成功訊息並重置表單 */
    formNote.classList.add('success');
    formNote.textContent = '感謝您的來信！我們將儘快與您聯繫。';
    form.reset();

    setTimeout(function () {
      formNote.className = 'form-note';
      formNote.textContent = '';
    }, 5000);
  });

})();
