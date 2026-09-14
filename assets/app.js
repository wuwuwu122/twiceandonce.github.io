/* ============================================================
   app.js —— 页面逻辑
   一般不需要改动这个文件。
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.COLLECTION || {};
  var CATEGORIES = CFG.categories || [];
  var MEDIA = CFG.media || [];
  var CONFIG_PLATFORMS = CFG.platforms || [];
  var ITEMS = CFG.items || [];

  var CAT_MAP = {};
  CATEGORIES.forEach(function (c) { CAT_MAP[c.key] = c; });
  var MEDIA_MAP = {};
  MEDIA.forEach(function (m) { MEDIA_MAP[m.key] = m; });

  var ICON = {
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="8.6" cy="10" r="1.7"/><path d="M4 16.5 9.2 12l3.6 2.9 3.1-2.3 4.1 3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4.5h9.5L19 8v11.5H6z" stroke-linejoin="round"/><path d="M15 4.5V8h4" stroke-linejoin="round"/><path d="M8.6 12h7M8.6 15h4.6" stroke-linecap="round"/></svg>'
  };

  /* ---------- 数据规整 ---------- */
  ITEMS.forEach(function (it) {
    it._cat = String(it.cat || "daily");
    if (!CAT_MAP[it._cat]) it._cat = CATEGORIES.length ? CATEGORIES[CATEGORIES.length - 1].key : "daily";
    it._media = MEDIA_MAP[it.media] ? it.media : "video";
    it._platform = String(it.platform || "其他");
    it._title = String(it.title || "未命名内容");
    it._date = String(it.date || "");
    it._tags = Object.prototype.toString.call(it.tags) === "[object Array]"
      ? it.tags.filter(Boolean) : [];
    it._hay = (it._title + " " + it._platform + " " + it._tags.join(" ") + " " + (it.note || "")).toLowerCase();
  });

  /* ---------- 状态 ---------- */
  var state = { q: "", year: "all", media: "all", platform: "all", asc: false, open: {} };
  if (CATEGORIES.length) state.open[CATEGORIES[0].key] = true;

  /* ---------- 派生：年份、平台 ---------- */
  function uniqueYears() {
    var set = {};
    ITEMS.forEach(function (i) { if (i._date) set[i._date.slice(0, 4)] = 1; });
    return Object.keys(set).sort().reverse();
  }
  function uniquePlatforms() {
    var list = CONFIG_PLATFORMS.slice();
    ITEMS.forEach(function (i) {
      if (i._platform && list.indexOf(i._platform) === -1) list.push(i._platform);
    });
    return list;
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function hi(text, q) {
    var t = String(text);
    if (!q) return esc(t);
    var idx = t.toLowerCase().indexOf(q);
    if (idx < 0) return esc(t);
    return esc(t.slice(0, idx)) + "<mark>" + esc(t.slice(idx, idx + q.length)) + "</mark>" + esc(t.slice(idx + q.length));
  }
  function catColor(k) { return "var(--" + (k === "music" ? "music" : k === "live" ? "live" : k === "show" ? "show" : "daily") + ")"; }
  function catName(k) { return CAT_MAP[k] ? CAT_MAP[k].name : ""; }
  function mediaName(k) { return MEDIA_MAP[k] ? MEDIA_MAP[k].name : ""; }

  function badgeOf(it) {
    if (it._media === "photo") return it.count ? it.count + " 张" : "图集";
    if (it._media === "text") return "长文";
    return it.duration || "";
  }

  function match(it, q) {
    if (q && it._hay.indexOf(q) === -1) return false;
    if (state.year !== "all" && it._date.slice(0, 4) !== state.year) return false;
    if (state.media !== "all" && it._media !== state.media) return false;
    if (state.platform !== "all" && it._platform !== state.platform) return false;
    return true;
  }
  function sortList(list) {
    return list.slice().sort(function (a, b) {
      var x = a._date || "", y = b._date || "";
      return state.asc ? (x < y ? -1 : x > y ? 1 : 0) : (x > y ? -1 : x < y ? 1 : 0);
    });
  }

  /* ---------- 缩略图 ---------- */
  function thumbHTML(it, extraClass) {
    var cls = "thumb" + (extraClass ? " " + extraClass : "");
    var color = catColor(it._cat);
    var ph = '<div class="ph"><span>' + (ICON[it._media] || ICON.video) + '</span></div>';
    var img = it.cover
      ? '<img src="' + esc(it.cover) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '';
    var mt = it._media !== "video" ? '<span class="mediatag">' + esc(mediaName(it._media)) + '</span>' : '';
    var badge = badgeOf(it);
    var bd = badge ? '<span class="badge">' + esc(badge) + '</span>' : '';
    return '<div class="' + cls + '" style="--c:' + color + '">' + ph + img + mt + bd + '</div>';
  }

  /* ---------- 卡片（抽屉内） ---------- */
  function cardHTML(it, q) {
    var tags = it._tags.slice(0, 3).map(function (t) {
      return '<span class="tagmini">' + esc(t) + '</span>';
    }).join("");
    return '<article class="card">' +
      '<a class="card-link" href="' + esc(it.url || "#") + '" target="_blank" rel="noopener noreferrer">' +
        thumbHTML(it) +
        '<h3 class="card-title">' + hi(it._title, q) + '</h3>' +
      '</a>' +
      '<div class="card-meta">' +
        '<span class="tagplat">' + esc(it._platform) + '</span>' +
        '<span class="card-date">' + esc(it._date.replace(/-/g, ".")) + '</span>' +
      '</div>' +
      (tags ? '<div class="card-tags">' + tags + '</div>' : '') +
    '</article>';
  }

  /* ---------- 行卡片（搜索结果） ---------- */
  function rowHTML(it, q) {
    var color = catColor(it._cat);
    var meta = '<span class="tagplat">' + esc(it._platform) + '</span>' +
      '<span>' + esc(mediaName(it._media)) + '</span>' +
      '<span>' + esc(it._date.replace(/-/g, ".")) + '</span>' +
      (it.duration ? '<span>' + esc(it.duration) + '</span>' : '') +
      (it._media === "photo" && it.count ? '<span>' + it.count + ' 张</span>' : '');
    return '<a class="res" href="' + esc(it.url || "#") + '" target="_blank" rel="noopener noreferrer">' +
      thumbHTML(it) +
      '<div class="res-body">' +
        '<h3 class="res-title">' + hi(it._title, q) + '</h3>' +
        '<div class="res-meta">' + meta + '</div>' +
        (it.note ? '<p class="res-desc">' + esc(it.note) + '</p>' : '') +
        '<div class="res-foot">' +
          '<span class="cat-pill" style="--cp:' + color + '">' + esc(catName(it._cat)) + '</span>' +
          '<span class="res-open">在原站打开 ↗</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  /* ---------- 渲染：筛选控件 ---------- */
  function renderFilters() {
    var yearsEl = document.getElementById("years");
    var ys = uniqueYears();
    yearsEl.innerHTML = '<button class="chip" data-year="all">全部</button>' +
      ys.map(function (y) {
        return '<button class="chip" data-year="' + y + '">' + y + '</button>';
      }).join("");

    var mediasEl = document.getElementById("medias");
    mediasEl.innerHTML = '<button class="chip" data-media="all">全部</button>' +
      MEDIA.map(function (m) {
        return '<button class="chip" data-media="' + m.key + '">' + m.name + '</button>';
      }).join("");

    var platsEl = document.getElementById("plats");
    platsEl.innerHTML = '<button class="chip" data-platform="all">全部</button>' +
      uniquePlatforms().map(function (p) {
        return '<button class="chip" data-platform="' + esc(p) + '">' + esc(p) + '</button>';
      }).join("");
  }

  function syncChips() {
    [["year", state.year], ["media", state.media], ["platform", state.platform]].forEach(function (pair) {
      var attr = "data-" + pair[0];
      var nodes = document.querySelectorAll(".chip[" + attr + "]");
      Array.prototype.forEach.call(nodes, function (n) {
        n.setAttribute("aria-pressed", n.getAttribute(attr) === pair[1] ? "true" : "false");
      });
    });
  }

  /* ---------- 渲染：主体 ---------- */
  function render() {
    var q = state.q.trim().toLowerCase();
    var searching = q !== "";
    var pool = ITEMS.filter(function (i) { return match(i, q); });
    var list = sortList(pool);

    var drawersEl = document.getElementById("drawers");
    var flatEl = document.getElementById("flat");
    var infoEl = document.getElementById("resultInfo");
    var emptyEl = document.getElementById("empty");

    if (searching) {
      drawersEl.hidden = true;
      flatEl.hidden = false;
      flatEl.innerHTML = list.length
        ? list.map(function (i) { return rowHTML(i, q); }).join("")
        : "";
      infoEl.innerHTML = "在全部 <b>" + ITEMS.length + "</b> 条内容中，找到 <b>" + list.length + "</b> 条与「" + esc(state.q.trim()) + "」相关的内容";
    } else {
      drawersEl.hidden = false;
      flatEl.hidden = true;
      flatEl.innerHTML = "";
      var parts = [];
      if (state.year !== "all") parts.push(state.year + " 年");
      if (state.media !== "all") parts.push(mediaName(state.media));
      if (state.platform !== "all") parts.push(state.platform);
      infoEl.innerHTML = parts.length
        ? "筛选条件：" + esc(parts.join(" · ")) + " — 共 <b>" + list.length + "</b> 条"
        : "共 <b>" + ITEMS.length + "</b> 条收藏内容，按分类展开查看";

      drawersEl.innerHTML = CATEGORIES.map(function (c) {
        var all = ITEMS.filter(function (i) { return i._cat === c.key; });
        var hit = list.filter(function (i) { return i._cat === c.key; });
        var open = state.open[c.key] === true;
        var count = (hit.length === all.length)
          ? String(all.length)
          : '<em>' + hit.length + '</em> / ' + all.length;
        var body = open
          ? (hit.length
            ? '<div class="grid">' + hit.map(function (i) { return cardHTML(i, q); }).join("") + '</div>'
            : '<p class="cat-empty">该条件下暂无内容</p>')
          : "";
        return '<section class="cat" data-open="' + (open ? "1" : "0") + '" style="--c:' + catColor(c.key) + '">' +
          '<button class="cat-head" data-cat="' + c.key + '" aria-expanded="' + (open ? "true" : "false") + '">' +
            '<span class="cat-bar"></span>' +
            '<span><span class="cat-title">' + esc(c.name) + '</span>' +
            (c.note ? '<br><span class="cat-note">' + esc(c.note) + '</span>' : '') + '</span>' +
            '<span class="cat-count">' + count + '</span>' +
            '<svg class="cat-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<div class="cat-body">' + body + '</div>' +
        '</section>';
      }).join("");
    }

    emptyEl.hidden = list.length !== 0;
    syncChips();
    bindCoverErrors();
    updateStats(list.length, searching);
  }

  function bindCoverErrors() {
    var imgs = document.querySelectorAll(".thumb img");
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.dataset.bound) return;
      img.dataset.bound = "1";
      img.addEventListener("error", function () { img.remove(); });
    });
  }

  function updateStats(shown, searching) {
    var el = document.getElementById("stats");
    var cats = CATEGORIES.length;
    el.innerHTML = '<span><b>' + ITEMS.length + '</b> 条内容</span><span>·</span>' +
      '<span><b>' + cats + '</b> 个分类</span>' +
      (searching ? '<span>·</span><span>显示 <b>' + shown + '</b> 条</span>' : "");

    var meta = document.getElementById("footMeta");
    var up = CFG.updatedAt ? ("数据最近更新：" + CFG.updatedAt + "　·　") : "";
    meta.textContent = up + "共收录 " + ITEMS.length + " 条内容";
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var qEl = document.getElementById("q");
    var clearEl = document.getElementById("clear");

    qEl.addEventListener("input", function () {
      state.q = qEl.value;
      clearEl.hidden = state.q === "";
      render();
    });
    clearEl.addEventListener("click", function () {
      state.q = "";
      qEl.value = "";
      clearEl.hidden = true;
      render();
    });

    document.getElementById("years").addEventListener("click", function (e) {
      var b = e.target.closest("[data-year]");
      if (!b) return;
      state.year = b.getAttribute("data-year");
      render();
    });
    document.getElementById("medias").addEventListener("click", function (e) {
      var b = e.target.closest("[data-media]");
      if (!b) return;
      state.media = b.getAttribute("data-media");
      render();
    });
    document.getElementById("plats").addEventListener("click", function (e) {
      var b = e.target.closest("[data-platform]");
      if (!b) return;
      state.platform = b.getAttribute("data-platform");
      render();
    });

    var sortEl = document.getElementById("sort");
    sortEl.addEventListener("click", function () {
      state.asc = !state.asc;
      sortEl.setAttribute("aria-pressed", state.asc ? "true" : "false");
      sortEl.innerHTML = state.asc ? '时间 <b>↑</b> 最早在前' : '时间 <b>↓</b> 最新在前';
      render();
    });

    document.getElementById("drawers").addEventListener("click", function (e) {
      var head = e.target.closest(".cat-head");
      if (!head) return;
      var key = head.getAttribute("data-cat");
      state.open[key] = state.open[key] !== true;
      render();
    });

    document.getElementById("reset").addEventListener("click", function () {
      state.q = ""; state.year = "all"; state.media = "all"; state.platform = "all";
      qEl.value = ""; clearEl.hidden = true;
      render();
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    renderFilters();
    bind();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
