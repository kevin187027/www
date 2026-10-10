(function () {
  'use strict';

  /* ===== State ===== */
  var allStores = [];
  var filteredStores = [];
  var currentCategory = 'all';
  var currentSearch = '';
  var currentPage = 1;
  var itemsPerPage = 12;

  /* ===== DOM Elements ===== */
  var storeGrid = document.getElementById('storeGrid');
  var paginationEl = document.getElementById('pagination');
  var noResultsEl = document.getElementById('noResults');
  var resultTitleEl = document.getElementById('resultTitle');
  var resultCountEl = document.getElementById('resultCount');
  var searchInput = document.getElementById('searchInput');
  var heroSearchInput = document.getElementById('heroSearchInput');
  var heroSearchBtn = document.getElementById('heroSearchBtn');
  var filterBar = document.getElementById('filterBar');

  /* ===== Category Colors ===== */
  var categoryColors = {
    '餐飲美食': '#EA4335',
    '零售購物': '#1a73e8',
    '美容美髮': '#E91E63',
    '生活服務': '#00897B',
    '醫療保健': '#34A853',
    '教育學習': '#7B1FA2',
    '休閒娛樂': '#FF6F00',
    '電子科技': '#5C6BC0',
    '家居裝潢': '#8D6E63',
    '交通旅遊': '#0288D1'
  };

  function getColorForCategory(category) {
    return categoryColors[category] || '#1a73e8';
  }

  function getColorForStore(name, category) {
    var baseColors = ['#1a73e8','#EA4335','#34A853','#FBBC04','#FF6D00','#E91E63','#7B1FA2','#00897B','#5C6BC0','#8D6E63'];
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return baseColors[Math.abs(hash) % baseColors.length];
  }

  /* ===== Load Stores from JSON ===== */
  function loadStores() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/stores.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
          try {
            var data = JSON.parse(xhr.responseText);
            allStores = data.stores || [];
            updateStats();
            applyFilters();
          } catch (e) {
            storeGrid.innerHTML = '<div class="loading-message">資料載入失敗，請重新整理頁面。</div>';
          }
        } else {
          storeGrid.innerHTML = '<div class="loading-message">無法載入店家資料（HTTP ' + xhr.status + '）。</div>';
        }
      }
    };
    xhr.send();
  }

  /* ===== Stats ===== */
  function updateStats() {
    var categories = {};
    var cities = {};
    allStores.forEach(function (s) {
      categories[s.category] = true;
      var city = s.address.substring(0, 3);
      cities[city] = true;
    });

    document.getElementById('statTotal').textContent = allStores.length;
    document.getElementById('statCategories').textContent = Object.keys(categories).length;
    document.getElementById('statCities').textContent = Object.keys(cities).length;
  }

  /* ===== Filter & Search ===== */
  function applyFilters() {
    filteredStores = allStores.filter(function (store) {
      var matchCategory = currentCategory === 'all' || store.category === currentCategory;
      var searchLower = currentSearch.toLowerCase().trim();
      var matchSearch = !searchLower ||
        store.name.toLowerCase().indexOf(searchLower) !== -1 ||
        store.category.toLowerCase().indexOf(searchLower) !== -1 ||
        store.address.toLowerCase().indexOf(searchLower) !== -1 ||
        store.description.toLowerCase().indexOf(searchLower) !== -1;
      return matchCategory && matchSearch;
    });

    currentPage = 1;
    renderStores();
    renderPagination();
    updateResultHeader();
  }

  function updateResultHeader() {
    var count = filteredStores.length;
    resultCountEl.textContent = '共 ' + count + ' 家店家';

    if (currentCategory === 'all' && !currentSearch) {
      resultTitleEl.textContent = '所有店家';
    } else if (currentCategory !== 'all' && !currentSearch) {
      resultTitleEl.textContent = currentCategory;
    } else if (currentSearch) {
      resultTitleEl.textContent = '搜尋：' + currentSearch;
    } else {
      resultTitleEl.textContent = '搜尋結果';
    }
  }

  /* ===== Render Stores ===== */
  function renderStores() {
    if (filteredStores.length === 0) {
      storeGrid.innerHTML = '';
      noResultsEl.style.display = 'block';
      paginationEl.innerHTML = '';
      return;
    }

    noResultsEl.style.display = 'none';

    var start = (currentPage - 1) * itemsPerPage;
    var end = start + itemsPerPage;
    var pageStores = filteredStores.slice(start, end);

    var html = '';
    pageStores.forEach(function (store) {
      var color = getColorForStore(store.name, store.category);
      html += '<div class="store-card fade-in" data-store-id="' + store.id + '">';
      html += '  <div class="store-card-header">';
      html += '    <div class="store-logo" style="background:' + color + ';">' + escapeHtml(store.logo) + '</div>';
      html += '    <div class="store-card-info">';
      html += '      <div class="store-name">' + escapeHtml(store.name) + '</div>';
      html += '      <span class="store-category-tag">' + escapeHtml(store.category) + '</span>';
      html += '    </div>';
      html += '  </div>';
      html += '  <div class="store-card-body">';
      html += '    <p class="store-desc">' + escapeHtml(store.description) + '</p>';
      html += '    <div class="store-meta">&#128205; ' + escapeHtml(store.address) + '</div>';
      html += '    <div class="store-meta">&#128222; ' + escapeHtml(store.phone) + '</div>';
      html += '  </div>';
      html += '  <div class="store-card-footer">';
      html += '    <a href="' + store.lineUrl + '" target="_blank" rel="noopener" class="store-social-btn social-btn-line" onclick="event.stopPropagation()" aria-label="LINE@">L</a>';
      html += '    <a href="' + store.fbUrl + '" target="_blank" rel="noopener" class="store-social-btn social-btn-fb" onclick="event.stopPropagation()" aria-label="Facebook">f</a>';
      html += '    <a href="' + store.igUrl + '" target="_blank" rel="noopener" class="store-social-btn social-btn-ig" onclick="event.stopPropagation()" aria-label="Instagram">IG</a>';
      html += '    <a href="' + store.website + '" target="_blank" rel="noopener" class="store-social-btn social-btn-web" onclick="event.stopPropagation()" aria-label="網站">&#127760;</a>';
      html += '  </div>';
      html += '</div>';
    });

    storeGrid.innerHTML = html;

    /* Observe new cards for fade-in */
    var cards = storeGrid.querySelectorAll('.store-card');
    if ('IntersectionObserver' in window) {
      var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      cards.forEach(function (card) { cardObserver.observe(card); });
    } else {
      cards.forEach(function (card) { card.classList.add('visible'); });
    }

    /* Bind click to open modal */
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var id = parseInt(this.getAttribute('data-store-id'), 10);
        var store = allStores.filter(function (s) { return s.id === id; })[0];
        if (store) openModal(store);
      });
    });
  }

  /* ===== Pagination ===== */
  function renderPagination() {
    var totalPages = Math.ceil(filteredStores.length / itemsPerPage);
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    var html = '';

    /* Prev */
    html += '<button class="page-btn" data-page="' + (currentPage - 1) + '" ' + (currentPage === 1 ? 'disabled' : '') + '>&#8249;</button>';

    /* Page numbers with ellipsis */
    var maxVisible = 5;
    var startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    var endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      html += '<button class="page-btn" data-page="1">1</button>';
      if (startPage > 2) html += '<span class="page-ellipsis">...</span>';
    }

    for (var p = startPage; p <= endPage; p++) {
      html += '<button class="page-btn ' + (p === currentPage ? 'active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += '<span class="page-ellipsis">...</span>';
      html += '<button class="page-btn" data-page="' + totalPages + '">' + totalPages + '</button>';
    }

    /* Next */
    html += '<button class="page-btn" data-page="' + (currentPage + 1) + '" ' + (currentPage === totalPages ? 'disabled' : '') + '>&#8250;</button>';

    paginationEl.innerHTML = html;

    /* Bind events */
    paginationEl.querySelectorAll('.page-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        var page = parseInt(this.getAttribute('data-page'), 10);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          renderStores();
          renderPagination();
          updateResultHeader();
          /* Scroll to content top */
          var contentTop = document.querySelector('.main-content').offsetTop - 120;
          window.scrollTo({ top: contentTop, behavior: 'smooth' });
        }
      });
    });
  }

  /* ===== Modal ===== */
  var modalOverlay = document.getElementById('modalOverlay');
  var modalClose = document.getElementById('modalClose');
  var modalBody = document.getElementById('modalBody');

  function openModal(store) {
    var color = getColorForStore(store.name, store.category);

    var html = '';
    html += '<div class="modal-header">';
    html += '  <div class="modal-logo" style="background:' + color + ';">' + escapeHtml(store.logo) + '</div>';
    html += '  <h3 class="modal-name">' + escapeHtml(store.name) + '</h3>';
    html += '  <span class="modal-category">' + escapeHtml(store.category) + '</span>';
    html += '  <div class="modal-rating">&#9733; ' + store.rating + ' / 5.0</div>';
    html += '</div>';
    html += '<div class="modal-info">';
    html += '  <div class="modal-info-item"><span class="modal-info-icon">&#128205;</span><div><span class="modal-info-label">地址</span><span class="modal-info-value">' + escapeHtml(store.address) + '</span></div></div>';
    html += '  <div class="modal-info-item"><span class="modal-info-icon">&#128222;</span><div><span class="modal-info-label">電話</span><span class="modal-info-value"><a href="tel:' + store.phone + '">' + escapeHtml(store.phone) + '</a></span></div></div>';
    html += '  <div class="modal-info-item"><span class="modal-info-icon">&#9993;</span><div><span class="modal-info-label">信箱</span><span class="modal-info-value"><a href="mailto:' + store.email + '">' + escapeHtml(store.email) + '</a></span></div></div>';
    html += '  <div class="modal-info-item"><span class="modal-info-icon">&#127760;</span><div><span class="modal-info-label">網站</span><span class="modal-info-value"><a href="' + store.website + '" target="_blank" rel="noopener">' + escapeHtml(store.website) + '</a></span></div></div>';
    html += '  <div class="modal-info-item"><span class="modal-info-icon">&#128172;</span><div><span class="modal-info-label">店家介紹</span><span class="modal-info-value">' + escapeHtml(store.description) + '</span></div></div>';
    html += '</div>';
    html += '<div class="modal-social">';
    html += '  <a href="' + store.lineUrl + '" target="_blank" rel="noopener" class="modal-social-btn" style="background:#06C755;">LINE@</a>';
    html += '  <a href="' + store.fbUrl + '" target="_blank" rel="noopener" class="modal-social-btn" style="background:#1877F2;">Facebook</a>';
    html += '  <a href="' + store.igUrl + '" target="_blank" rel="noopener" class="modal-social-btn" style="background:linear-gradient(45deg,#F09433,#DC2743,#BC1888);">Instagram</a>';
    html += '</div>';

    modalBody.innerHTML = html;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
  });

  /* ===== Utility ===== */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ===== Search ===== */
  var searchTimer = null;

  function handleSearch(value) {
    currentSearch = value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      applyFilters();
    }, 250);
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      handleSearch(this.value);
    });
  }

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', function () {
      handleSearch(this.value);
      if (searchInput) searchInput.value = this.value;
    });
    heroSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        scrollToContent();
      }
    });
  }

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', function () {
      if (heroSearchInput) handleSearch(heroSearchInput.value);
      scrollToContent();
    });
  }

  function scrollToContent() {
    var target = document.querySelector('.main-content');
    if (target) {
      var offset = target.offsetTop - 120;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }

  /* ===== Category Filter ===== */
  var filterChips = filterBar.querySelectorAll('.filter-chip');
  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      currentCategory = this.getAttribute('data-category');
      applyFilters();
      scrollToContent();
    });
  });

  /* ===== Navbar ===== */
  var navbar = document.getElementById('navbar');
  var backToTop = document.getElementById('backToTop');
  var socialQuickLinks = document.getElementById('socialQuickLinks');
  var toolsContainer = document.getElementById('floatingTools');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    if (scrollY > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  }, { passive: true });

  backToTop.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Social links: hover on desktop, tap on mobile */
  var socialsVisible = false;

  function showSocials() {
    socialQuickLinks.classList.add('show');
    socialsVisible = true;
  }

  function hideSocials() {
    socialQuickLinks.classList.remove('show');
    socialsVisible = false;
  }

  toolsContainer.addEventListener('mouseenter', showSocials);
  toolsContainer.addEventListener('mouseleave', function () {
    setTimeout(function () { if (socialsVisible) hideSocials(); }, 300);
  });

  backToTop.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (socialQuickLinks.classList.contains('show')) hideSocials();
    else showSocials();
  }, { passive: false });

  /* ===== Init ===== */
  loadStores();

})();
