const STORAGE_KEY = "my_tools_hub_v22";

const DEFAULT_DATA = {
  tools: [],
  categories: [
    { id: "work", name: "Work", color: "#4f46e5", icon: "💼", sortOrder: 1, pinned: true, updatedAt: "" },
    { id: "ai", name: "AI", color: "#7c3aed", icon: "🤖", sortOrder: 2, pinned: true, updatedAt: "" },
    { id: "admin", name: "Admin", color: "#f59e0b", icon: "🗂️", sortOrder: 3, pinned: true, updatedAt: "" },
    { id: "reference", name: "Reference", color: "#10b981", icon: "📚", sortOrder: 4, pinned: true, updatedAt: "" },
    { id: "personal", name: "Personal", color: "#ef4444", icon: "🏠", sortOrder: 5, pinned: true, updatedAt: "" }
  ],
  appSettings: {
    gasWebAppUrl: "",
    syncToken: "",
    deviceName: "",
    openLinksDefault: "new_tab",
    checkRemoteOnLoad: true,
    previewAutofillDescription: true,
    previewAutofillImage: false
  },
  uiState: {
    showDescriptions: true,
    pinnedOnlyQuickFilter: false,
    editMode: false
  },
  syncMeta: {
    lastLocalSaveAt: "",
    lastLocalChangeAt: "",
    lastRemoteCheckAt: "",
    lastRemoteSyncAt: "",
    lastRemoteVersion: "",
    lastSyncStatus: "idle",
    schemaVersion: 22
  },
  linkPreviewCache: {}
};

let state = loadState();
let activeTab = "all";
let editingToolId = null;
let fabOpen = false;
let pinnedSortable = null;
let toolsSortable = null;
let categorySortable = null;
let diffActionContext = null;
let urlFetchTimer = null;
let linkPreviewCache = {};
let activePreviewRequestId = 0;

const els = {
  searchToggleBtn: document.getElementById("searchToggleBtn"),
  searchPanel: document.getElementById("searchPanel"),
  searchInput: document.getElementById("searchInput"),
  searchClearBtn: document.getElementById("searchClearBtn"),
  categoryTabs: document.getElementById("categoryTabs"),
  pinnedGrid: document.getElementById("pinnedGrid"),
  toolsGrid: document.getElementById("toolsGrid"),
  pinnedCount: document.getElementById("pinnedCount"),
  allCount: document.getElementById("allCount"),
  overlay: document.getElementById("overlay"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIconSun: document.getElementById("themeIconSun"),
  themeIconMoon: document.getElementById("themeIconMoon"),

  drawer: document.getElementById("drawer"),
  closeDrawerBtn: document.getElementById("closeDrawerBtn"),
  drawerTabs: [...document.querySelectorAll(".drawer-tab")],
  panels: [...document.querySelectorAll(".panel")],

  toolModal: document.getElementById("toolModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  saveToolBtn: document.getElementById("saveToolBtn"),
  deleteToolBtn: document.getElementById("deleteToolBtn"),
  toolModalTitle: document.getElementById("toolModalTitle"),

  toolIdInput: document.getElementById("toolIdInput"),
  toolTitleInput: document.getElementById("toolTitleInput"),
  toolUrlInput: document.getElementById("toolUrlInput"),
  urlFetchStatus: document.getElementById("urlFetchStatus"),
  previewRefreshBtn: document.getElementById("previewRefreshBtn"),
  linkPreviewCard: document.getElementById("linkPreviewCard"),
  linkPreviewImage: document.getElementById("linkPreviewImage"),
  linkPreviewFallback: document.getElementById("linkPreviewFallback"),
  linkPreviewSite: document.getElementById("linkPreviewSite"),
  linkPreviewTitle: document.getElementById("linkPreviewTitle"),
  linkPreviewDesc: document.getElementById("linkPreviewDesc"),
  linkPreviewUrl: document.getElementById("linkPreviewUrl"),
  toolCategoryInput: document.getElementById("toolCategoryInput"),
  toolIconInput: document.getElementById("toolIconInput"),
  toolColorInput: document.getElementById("toolColorInput"),
  toolOpenModeInput: document.getElementById("toolOpenModeInput"),
  toolDescInput: document.getElementById("toolDescInput"),
  toolTagsInput: document.getElementById("toolTagsInput"),
  toolPinnedInput: document.getElementById("toolPinnedInput"),
  toolArchivedInput: document.getElementById("toolArchivedInput"),

  toolsManageList: document.getElementById("toolsManageList"),
  categoriesManageList: document.getElementById("categoriesManageList"),

  deviceNameInput: document.getElementById("deviceNameInput"),
  openModeInput: document.getElementById("openModeInput"),
  remoteCheckInput: document.getElementById("remoteCheckInput"),
  saveGeneralBtn: document.getElementById("saveGeneralBtn"),

  newCategoryName: document.getElementById("newCategoryName"),
  newCategoryIcon: document.getElementById("newCategoryIcon"),
  newCategoryColor: document.getElementById("newCategoryColor"),
  addCategoryBtn: document.getElementById("addCategoryBtn"),

  gasUrlInput: document.getElementById("gasUrlInput"),
  syncTokenInput: document.getElementById("syncTokenInput"),
  testConnectionBtn: document.getElementById("testConnectionBtn"),
  saveSyncConfigBtn: document.getElementById("saveSyncConfigBtn"),
  pullBtn: document.getElementById("pullBtn"),
  pushBtn: document.getElementById("pushBtn"),

  exportJsonBtn: document.getElementById("exportJsonBtn"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  importJsonFile: document.getElementById("importJsonFile"),

  diffModal: document.getElementById("diffModal"),
  diffTitle: document.getElementById("diffTitle"),
  diffSubtitle: document.getElementById("diffSubtitle"),
  diffWarning: document.getElementById("diffWarning"),
  diffSummary: document.getElementById("diffSummary"),
  diffTables: document.getElementById("diffTables"),
  closeDiffBtn: document.getElementById("closeDiffBtn"),
  cancelDiffBtn: document.getElementById("cancelDiffBtn"),
  confirmDiffBtn: document.getElementById("confirmDiffBtn"),

  fabMainBtn: document.getElementById("fabMainBtn"),
  fabMenu: document.getElementById("fabMenu"),
  fabAddBtn: document.getElementById("fabAddBtn"),
  fabEditModeBtn: document.getElementById("fabEditModeBtn"),
  fabDescBtn: document.getElementById("fabDescBtn"),
  fabPinOnlyBtn: document.getElementById("fabPinOnlyBtn"),
  fabSyncBtn: document.getElementById("fabSyncBtn"),
  fabSettingsBtn: document.getElementById("fabSettingsBtn")
};

init();
function getSyncBadgeLabel() {
  const status = state.syncMeta.lastSyncStatus || "idle";
  const labels = {
    idle: "Sync",
    checking: "Sync • Checking",
    pulling: "Sync • Pulling",
    pushing: "Sync • Pushing",
    pulled: "Sync ✓ Pulled",
    pushed: "Sync ✓ Synced",
    failed: "Sync ✕ Failed"
  };
  return labels[status] || "Sync";
}

function showSyncToast(message, type = "info") {
  let toast = document.getElementById("syncToastBadge");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "syncToastBadge";
    document.body.appendChild(toast);
  }

  const colors = {
    info: "#334155",
    success: "#16a34a",
    error: "#dc2626"
  };

  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.right = "18px";
  toast.style.bottom = "92px";
  toast.style.zIndex = "9999";
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "999px";
  toast.style.color = "#fff";
  toast.style.fontSize = "13px";
  toast.style.fontWeight = "700";
  toast.style.background = colors[type] || colors.info;
  toast.style.boxShadow = "0 8px 24px rgba(0,0,0,.18)";
  toast.style.opacity = "1";
  toast.style.transition = "opacity .2s ease";

  clearTimeout(showSyncToast._timer);
  showSyncToast._timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

function setSyncBadge(status, message = "") {
  state.syncMeta.lastSyncStatus = status;
  saveState(false);
  renderFabLabels();

  if (message) {
    const type =
      status === "failed" ? "error" :
      status === "pulled" || status === "pushed" ? "success" :
      "info";
    showSyncToast(message, type);
  }
}

async function runFloatingSync() {
  const base = state.appSettings.gasWebAppUrl || "";
  const token = (state.appSettings.syncToken || "").trim();

  if (!base) {
    setSyncBadge("failed", "Please save the Apps Script Web App URL first.");
    return;
  }

  try {
    setSyncBadge("checking", "Checking remote data...");
    const remote = await fetchRemoteBundle();
    if (!remote) throw new Error("Unable to fetch remote bundle.");

    const remoteVersion =
      remote.meta?.version ||
      remote.version ||
      "";

    const localVersion =
      state.syncMeta.lastLocalChangeAt ||
      state.syncMeta.lastLocalSaveAt ||
      "";

    state.syncMeta.lastRemoteCheckAt = nowIso();
    state.syncMeta.lastRemoteVersion = remoteVersion || state.syncMeta.lastRemoteVersion || "";
    saveState(false);

    if (remoteVersion && (!localVersion || remoteVersion > localVersion)) {
      setSyncBadge("pulling", "Remote is newer. Pulling data...");
      applyPull(remote);
      state.syncMeta.lastRemoteSyncAt = nowIso();
      state.syncMeta.lastSyncStatus = "pulled";
      saveState();
      renderFabLabels();
      showSyncToast("Remote data pulled.", "success");
    } else {
      if (!token) throw new Error("Sync Token is missing.");

      setSyncBadge("pushing", "Local is newer. Pushing data...");
      await performPush();
      state.syncMeta.lastRemoteSyncAt = nowIso();
      state.syncMeta.lastSyncStatus = "pushed";
      saveState();
      renderFabLabels();
      showSyncToast("Local data pushed.", "success");
    }
  } catch (err) {
    state.syncMeta.lastSyncStatus = "failed";
    saveState();
    renderFabLabels();
    showSyncToast(err.message || "Sync failed.", "error");
  }

  setTimeout(() => {
    state.syncMeta.lastSyncStatus = "idle";
    saveState(false);
    renderFabLabels();
  }, 2400);
}

function showSyncToast(message, type = "info") {
  let toast = document.getElementById("syncToastBadge");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "syncToastBadge";
    document.body.appendChild(toast);
  }

  const palette = {
    info: "#334155",
    success: "#16a34a",
    error: "#dc2626"
  };

  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.right = "18px";
  toast.style.bottom = "96px";
  toast.style.zIndex = "9999";
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "999px";
  toast.style.color = "#fff";
  toast.style.fontSize = "13px";
  toast.style.fontWeight = "700";
  toast.style.boxShadow = "0 8px 24px rgba(0,0,0,.18)";
  toast.style.background = palette[type] || palette.info;
  toast.style.opacity = "1";
  toast.style.transition = "opacity .2s ease";

  clearTimeout(showSyncToast._timer);
  showSyncToast._timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

function setSyncBadge(status, message = "") {
  state.syncMeta.lastSyncStatus = status;
  state.syncMeta.lastSyncMessage = message;
  saveState(false);
  renderFabLabels();

  if (message) {
    const toastType =
      status === "failed" ? "error" :
      status === "pulled" || status === "pushed" ? "success" :
      "info";

    showSyncToast(message, toastType);
  }
}

async function runFloatingSync() {
  const base = state.appSettings.gasWebAppUrl;
  const token = (state.appSettings.syncToken || "").trim();

  if (!base) {
    setSyncBadge("failed", "Please save the Apps Script Web App URL first.");
    return;
  }

  setSyncBadge("checking", "Checking remote...");

  const remote = await fetchRemoteBundle();
  if (!remote) {
    setSyncBadge("failed", "Unable to reach remote.");
    return;
  }

  const remoteVersion = remote.meta?.version || "";
  const localVersion =
    state.syncMeta.lastLocalChangeAt || state.syncMeta.lastLocalSaveAt || "";

  if (remoteVersion && localVersion && remoteVersion > localVersion) {
    setSyncBadge("pulling", "Remote is newer. Pulling latest data...");
    applyPull(remote);
    setSyncBadge("pulled", "Latest data pulled.");
  } else {
    if (!token) {
      setSyncBadge("failed", "Sync Token is missing.");
      return;
    }

    setSyncBadge("pushing", "Pushing local changes...");
    await performPush();
    setSyncBadge("pushed", "Sync completed.");
  }

  setTimeout(() => {
    state.syncMeta.lastSyncStatus = "idle";
    saveState(false);
    renderFabLabels();
  }, 2400);
}
function init() {
  ensureStateShape();
  linkPreviewCache = state.linkPreviewCache || {};
  initTheme();
  bindEvents();
  fillSettings();
  renderAll();
  if (state.appSettings.checkRemoteOnLoad && state.appSettings.gasWebAppUrl) {
    lightweightRemoteCheck();
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const isDark = theme === "dark";
  els.themeIconSun.style.display = isDark ? "none" : "block";
  els.themeIconMoon.style.display = isDark ? "block" : "none";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

async function fetchAndRenderLinkPreview(url, { autofill = false, force = false } = {}) {
  if (!url || !isProbablyUrl(url)) return;

  const requestId = ++activePreviewRequestId;
  const cacheKey = normalizeUrlForCache(url);

  if (!force && linkPreviewCache[cacheKey]) {
    renderLinkPreview(linkPreviewCache[cacheKey]);
    if (autofill) autofillFromPreview(linkPreviewCache[cacheKey]);
    return;
  }

  setPreviewStatus("⏳ Fetching preview...", "fetching");

  try {
    const html = await fetchRemoteHtml(url);
    if (requestId !== activePreviewRequestId) return;

    const preview = extractLinkMetadata(html, url);
    linkPreviewCache[cacheKey] = preview;
    state.linkPreviewCache = linkPreviewCache;
    saveState(false);

    renderLinkPreview(preview);
    if (autofill) autofillFromPreview(preview);
    setPreviewStatus(preview._limited ? "✓ Limited preview loaded" : "✓ Preview loaded", "success");
    clearPreviewStatusLater();
  } catch (err) {
    if (requestId !== activePreviewRequestId) return;
    const fallback = buildFallbackPreview(url);
    renderLinkPreview(fallback);
    setPreviewStatus("— Site blocked preview; using fallback", "error");
    clearPreviewStatusLater();
  }
}

async function fetchRemoteHtml(url) {
  const endpoints = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      if (endpoint.includes("/get?")) {
        const data = await res.json();
        if (data && data.contents) return data.contents;
        throw new Error("Empty contents");
      } else {
        const text = await res.text();
        if (text) return text;
        throw new Error("Empty text");
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Unable to fetch page");
}

function extractLinkMetadata(html, originalUrl) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const pick = (...selectors) => {
    for (const selector of selectors) {
      const el = doc.querySelector(selector);
      if (!el) continue;
      const value =
        el.getAttribute("content") ||
        el.getAttribute("href") ||
        el.textContent ||
        "";
      if (value && value.trim()) return value.trim();
    }
    return "";
  };

  const resolveUrl = (value) => {
    if (!value) return "";
    try {
      return new URL(value, originalUrl).href;
    } catch (e) {
      return value;
    }
  };

  const title = pick(
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'meta[name="title"]',
    "title"
  );

  const description = pick(
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
    'meta[name="description"]'
  );

  const image = resolveUrl(pick(
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="og:image:url"]'
  ));

  const siteName = pick(
    'meta[property="og:site_name"]',
    'meta[name="application-name"]'
  );

  const canonicalUrl = resolveUrl(pick(
    'meta[property="og:url"]',
    'link[rel="canonical"]'
  )) || originalUrl;

  const favicon = resolveUrl(
    pick('link[rel="icon"]', 'link[rel="shortcut icon"]', 'link[rel="apple-touch-icon"]')
  ) || buildFaviconUrl(originalUrl);

  return {
    title: cleanText(title) || hostLabel(originalUrl),
    description: cleanText(description),
    image,
    siteName: cleanText(siteName) || hostLabel(originalUrl),
    canonicalUrl,
    favicon,
    sourceUrl: originalUrl,
    _limited: !(title || description || image || siteName)
  };
}

function autofillFromPreview(preview) {
  if (!els.toolTitleInput.value.trim() && preview.title) {
    els.toolTitleInput.value = preview.title;
  }
  if (!els.toolDescInput.value.trim() && preview.description) {
    els.toolDescInput.value = preview.description;
  }
}

function renderLinkPreview(preview) {
  els.linkPreviewCard.classList.remove("hidden");

  els.linkPreviewSite.textContent = preview.siteName || "";
  els.linkPreviewTitle.textContent = preview.title || "Untitled link";
  els.linkPreviewDesc.textContent = preview.description || "No description available.";
  els.linkPreviewUrl.textContent = safeHost(preview.canonicalUrl || preview.sourceUrl || "");

  const imageUrl = preview.image || preview.favicon || "";
  if (imageUrl) {
    els.linkPreviewImage.src = imageUrl;
    els.linkPreviewImage.classList.remove("hidden");
    els.linkPreviewFallback.classList.add("hidden");
    els.linkPreviewImage.onerror = () => {
      els.linkPreviewImage.classList.add("hidden");
      els.linkPreviewFallback.classList.remove("hidden");
    };
  } else {
    els.linkPreviewImage.removeAttribute("src");
    els.linkPreviewImage.classList.add("hidden");
    els.linkPreviewFallback.classList.remove("hidden");
  }
}

function clearPreview() {
  els.linkPreviewCard.classList.add("hidden");
  els.linkPreviewImage.removeAttribute("src");
  els.linkPreviewImage.classList.add("hidden");
  els.linkPreviewFallback.classList.remove("hidden");
  els.linkPreviewSite.textContent = "";
  els.linkPreviewTitle.textContent = "";
  els.linkPreviewDesc.textContent = "";
  els.linkPreviewUrl.textContent = "";
  setPreviewStatus("", "");
}

function setPreviewStatus(text, type = "") {
  els.urlFetchStatus.textContent = text;
  els.urlFetchStatus.className = `url-fetch-status ${type}`.trim();
}

function clearPreviewStatusLater() {
  setTimeout(() => {
    els.urlFetchStatus.textContent = "";
    els.urlFetchStatus.className = "url-fetch-status";
  }, 2600);
}

function buildFallbackPreview(url) {
  return {
    title: hostLabel(url),
    description: "",
    image: "",
    siteName: hostLabel(url),
    canonicalUrl: url,
    favicon: buildFaviconUrl(url),
    sourceUrl: url,
    _limited: true
  };
}

function buildFaviconUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}/favicon.ico`;
  } catch (e) {
    return "";
  }
}

function normalizeUrlForCache(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href;
  } catch (e) {
    return url.trim();
  }
}

function hostLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    return url;
  }
}

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function openPanel(panelId) {
  els.drawerTabs.forEach(x => x.classList.remove("active"));
  els.panels.forEach(x => x.classList.remove("active"));

  const tab = els.drawerTabs.find(x => x.dataset.panel === panelId);
  if (tab) tab.classList.add("active");

  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
}

function bindEvents() {
  els.themeToggleBtn.onclick = toggleTheme;

  els.searchToggleBtn.onclick = () => {
    els.searchPanel.classList.toggle("hidden");
    if (!els.searchPanel.classList.contains("hidden")) {
      els.searchInput.focus();
    } else {
      els.searchInput.value = "";
      els.searchClearBtn.classList.add("hidden");
      renderAll();
    }
  };

  els.searchInput.oninput = () => {
    const hasValue = els.searchInput.value.length > 0;
    els.searchClearBtn.classList.toggle("hidden", !hasValue);
    renderAll();
  };

  els.searchClearBtn.onclick = () => {
    els.searchInput.value = "";
    els.searchClearBtn.classList.add("hidden");
    els.searchInput.focus();
    renderAll();
  };

  els.toolUrlInput.addEventListener("input", () => {
    clearTimeout(urlFetchTimer);
    const url = els.toolUrlInput.value.trim();
    clearPreview();
    if (isProbablyUrl(url)) {
      urlFetchTimer = setTimeout(() => fetchAndRenderLinkPreview(url, { autofill: true }), 700);
    }
  });

  els.toolUrlInput.addEventListener("paste", () => {
    clearTimeout(urlFetchTimer);
    setTimeout(() => {
      const url = els.toolUrlInput.value.trim();
      clearPreview();
      if (isProbablyUrl(url)) {
        fetchAndRenderLinkPreview(url, { autofill: true });
      }
    }, 120);
  });

  els.previewRefreshBtn.onclick = () => {
    const url = els.toolUrlInput.value.trim();
    if (isProbablyUrl(url)) {
      fetchAndRenderLinkPreview(url, { autofill: true, force: true });
    }
  };

  els.overlay.onclick = () => {
    closeDrawer();
    closeModal();
    closeDiffModal();
    closeFabMenu();
  };

  els.closeDrawerBtn.onclick = closeDrawer;

  els.closeModalBtn.onclick = closeModal;
  els.cancelModalBtn.onclick = closeModal;
  els.saveToolBtn.onclick = saveToolFromModal;
  els.deleteToolBtn.onclick = deleteCurrentTool;

  els.closeDiffBtn.onclick = closeDiffModal;
  els.cancelDiffBtn.onclick = closeDiffModal;
  els.confirmDiffBtn.onclick = confirmDiffAction;

  els.saveGeneralBtn.onclick = saveGeneralSettings;
  els.addCategoryBtn.onclick = addCategory;
  els.saveSyncConfigBtn.onclick = saveSyncConfig;
  els.testConnectionBtn.onclick = async () => {
    openSyncPanel();
    await lightweightRemoteCheck();
  };
  els.pullBtn.onclick = previewPullFromRemote;
  els.pushBtn.onclick = previewPushToRemote;

  els.exportJsonBtn.onclick = exportJson;
  els.importJsonBtn.onclick = () => els.importJsonFile.click();
  els.importJsonFile.onchange = importJson;

  els.drawerTabs.forEach(btn => {
    btn.onclick = () => {
      els.drawerTabs.forEach(x => x.classList.remove("active"));
      els.panels.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.panel).classList.add("active");
    };
  });

  els.fabMainBtn.onclick = toggleFabMenu;
els.fabAddBtn.onclick = () => { closeFabMenu(); openToolModal(); };
els.fabSettingsBtn.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeFabMenu();

  requestAnimationFrame(() => {
    openDrawer();
    openPanel("generalPanel");
  });
};
els.fabSyncBtn.onclick = async () => {
  closeFabMenu();
  await runFloatingSync();
};
  els.fabEditModeBtn.onclick = () => {
    state.uiState.editMode = !state.uiState.editMode;
    saveState();
    renderAll();
  };
  els.fabDescBtn.onclick = () => {
    state.uiState.showDescriptions = !state.uiState.showDescriptions;
    saveState();
    renderAll();
  };
  els.fabPinOnlyBtn.onclick = () => {
    state.uiState.pinnedOnlyQuickFilter = !state.uiState.pinnedOnlyQuickFilter;
    saveState();
    renderAll();
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    return deepMerge(structuredClone(DEFAULT_DATA), JSON.parse(raw));
  } catch (e) {
    return structuredClone(DEFAULT_DATA);
  }
}

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function ensureStateShape() {
  state.tools ||= [];
  state.categories ||= structuredClone(DEFAULT_DATA.categories);
  state.appSettings ||= {};
  state.uiState ||= {};
  state.syncMeta ||= {};
  state.linkPreviewCache ||= {};

  state.appSettings.openLinksDefault ||= "new_tab";
  state.appSettings.syncToken ||= "";
  state.appSettings.checkRemoteOnLoad = state.appSettings.checkRemoteOnLoad !== false;
  state.appSettings.previewAutofillDescription = state.appSettings.previewAutofillDescription !== false;
  state.appSettings.previewAutofillImage = !!state.appSettings.previewAutofillImage;

  state.uiState.showDescriptions = state.uiState.showDescriptions !== false;
  state.uiState.pinnedOnlyQuickFilter = !!state.uiState.pinnedOnlyQuickFilter;
  state.uiState.editMode = !!state.uiState.editMode;

  state.tools = state.tools.map((t, idx) => ({
    id: t.id || uid("tool"),
    title: t.title || "",
    url: t.url || "",
    categoryId: t.categoryId || "work",
    pinned: !!t.pinned,
    sortOrder: Number.isFinite(+t.sortOrder) ? +t.sortOrder : idx + 1,
    description: t.description || "",
    iconType: t.iconType || "emoji",
    iconValue: t.iconValue || "🌐",
    tags: Array.isArray(t.tags) ? t.tags : splitTags(t.tags || ""),
    color: t.color || "#5b6cff",
    openMode: t.openMode || state.appSettings.openLinksDefault,
    isArchived: !!t.isArchived,
    createdAt: t.createdAt || nowIso(),
    updatedAt: t.updatedAt || nowIso(),
    lastUsedAt: t.lastUsedAt || "",
    useCount: Number.isFinite(+t.useCount) ? +t.useCount : 0,
    deviceUpdatedBy: t.deviceUpdatedBy || ""
  }));

  saveState(false);
}

function renderAll() {
  renderCategoryTabs();
  renderToolCategoryOptions();
  renderPinned();
  renderTools();
  renderToolsManage();
  renderCategoriesManage();
  fillSettings();
  renderFabLabels();
  initSortables();
}

function renderFabLabels() {
  els.fabEditModeBtn.textContent = `Edit Mode: ${state.uiState.editMode ? "On" : "Off"}`;
  els.fabDescBtn.textContent = `Descriptions: ${state.uiState.showDescriptions ? "On" : "Off"}`;
  els.fabPinOnlyBtn.textContent = `Pinned Only: ${state.uiState.pinnedOnlyQuickFilter ? "On" : "Off"}`;
  els.fabSyncBtn.textContent = getSyncBadgeLabel();
  els.fabSyncBtn.disabled = ["checking", "pulling", "pushing"].includes(state.syncMeta.lastSyncStatus);
}

function renderCategoryTabs() {
  const counts = getViewCounts();
  const tabs = [
    { id: "all", label: `All (${counts.all})` },
    { id: "pinned", label: `Pinned (${counts.pinned})` },
    ...state.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder).map(c => ({
      id: c.id,
      label: `${c.icon || "📁"} ${c.name} (${counts.byCategory[c.id] || 0})`
    })),
    { id: "archived", label: `Archived (${counts.archived})` }
  ];

  els.categoryTabs.innerHTML = tabs.map(tab => `
    <button class="category-pill ${activeTab === tab.id ? "active" : ""}" data-id="${escapeHtml(tab.id)}">
      ${escapeHtml(tab.label)}
    </button>
  `).join("");

  els.categoryTabs.querySelectorAll(".category-pill").forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.dataset.id;
      renderAll();
    };
  });
}

function renderPinned() {
  const keyword = (els.searchInput.value || "").trim().toLowerCase();
  const list = getFilteredTools()
    .filter(t => t.pinned && !t.isArchived)
    .sort(sortTools);

  els.pinnedCount.textContent = list.length;
  els.pinnedGrid.innerHTML = list.length
    ? list.map(t => renderTile(t, true, keyword)).join("")
    : `<div class="empty-state">No pinned tools in this view.</div>`;
  bindTileEvents(els.pinnedGrid);
}

function renderTools() {
  const keyword = (els.searchInput.value || "").trim().toLowerCase();
  const list = getFilteredTools()
    .filter(t => !(t.pinned && !t.isArchived))
    .sort(sortTools);

  els.allCount.textContent = list.length;
  els.toolsGrid.innerHTML = list.length
    ? list.map(t => renderTile(t, false, keyword)).join("")
    : `<div class="empty-state">No tools found.</div>`;
  bindTileEvents(els.toolsGrid);
}

function highlightText(text, keyword) {
  if (!keyword) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${escapedKeyword})`, "gi"), '<mark class="search-highlight">$1</mark>');
}

function renderTile(tool, pinned = false, keyword = "") {
  const cat = getCategory(tool.categoryId);
  const [a, b] = gradientPair(tool.color || cat?.color || "#5b6cff");
  const showDesc = state.uiState.showDescriptions && tool.description;
  const hasUrl = !!tool.url;
  const editMode = state.uiState.editMode;
  const targetAttr = (hasUrl && tool.openMode !== "same_tab")
    ? ` target="_blank" rel="noopener noreferrer"`
    : "";
  const hrefAttr = hasUrl ? ` href="${escapeHtml(tool.url)}"` : "";

  return `
    <a
      class="tile ${pinned ? "pinned" : "compact"} ${editMode ? "edit-mode" : ""}"
      data-id="${escapeHtml(tool.id)}"
      style="--tile-a:${escapeHtml(a)};--tile-b:${escapeHtml(b)}"
      ${hrefAttr}${targetAttr}
    >
      <div class="tile-edit-hint">✎</div>
      <div class="tile-top">
        <div class="tile-icon">${escapeHtml(tool.iconValue || cat?.icon || "🌐")}</div>
        ${tool.pinned ? `<div class="tile-pin">📌 Pin</div>` : ``}
      </div>

      <div class="tile-body">
        <div class="tile-title">${highlightText(tool.title || "Untitled", keyword)}</div>
        <div class="tile-meta">
          <span class="tile-chip">${escapeHtml(cat?.name || "Uncategorized")}</span>
          ${(tool.tags || []).slice(0, 2).map(tag => `<span class="tile-chip">#${escapeHtml(tag)}</span>`).join("")}
        </div>
        ${showDesc ? `<div class="tile-desc">${highlightText(tool.description, keyword)}</div>` : ``}
      </div>
    </a>
  `;
}

function bindTileEvents(container) {
  container.querySelectorAll(".tile").forEach(tile => {
    const id = tile.dataset.id;
    tile.onclick = (e) => {
      if (state.uiState.editMode) {
        e.preventDefault();
        openToolModal(id);
      } else {
        trackToolUsage(id);
      }
    };
  });
}

function renderToolsManage() {
  const list = state.tools.slice().sort(sortTools);
  els.toolsManageList.innerHTML = list.length ? list.map(tool => {
    const cat = getCategory(tool.categoryId);
    return `
      <div class="manage-item">
        <div class="manage-title">${escapeHtml(tool.title)}</div>
        <div class="manage-sub">${escapeHtml(cat?.name || "Uncategorized")} · ${escapeHtml(tool.url || "")}</div>
        <div class="manage-actions">
          <button data-action="edit" data-id="${escapeHtml(tool.id)}">Edit</button>
          <button data-action="pin" data-id="${escapeHtml(tool.id)}">${tool.pinned ? "Unpin" : "Pin"}</button>
          <button data-action="archive" data-id="${escapeHtml(tool.id)}">${tool.isArchived ? "Unarchive" : "Archive"}</button>
        </div>
      </div>
    `;
  }).join("") : `<div class="empty-state">No tools yet.</div>`;

  els.toolsManageList.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "edit") openToolModal(id);
      if (action === "pin") togglePin(id);
      if (action === "archive") toggleArchive(id);
    };
  });
}

function renderCategoriesManage() {
  const list = state.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  els.categoriesManageList.innerHTML = list.map(cat => `
    <div class="manage-item" data-id="${escapeHtml(cat.id)}">
      <div class="manage-title">${escapeHtml(cat.icon || "📁")} ${escapeHtml(cat.name)}</div>
      <div class="manage-sub">${escapeHtml(cat.id)} · ${escapeHtml(cat.color)}</div>
      <div class="manage-actions">
        <button data-action="rename" data-id="${escapeHtml(cat.id)}">Rename</button>
        <button data-action="recolor" data-id="${escapeHtml(cat.id)}">Color</button>
        <button data-action="delete" data-id="${escapeHtml(cat.id)}">Delete</button>
      </div>
    </div>
  `).join("");

  els.categoriesManageList.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "rename") renameCategory(id);
      if (action === "recolor") recolorCategory(id);
      if (action === "delete") deleteCategory(id);
    };
  });
}

function initSortables() {
  if (pinnedSortable) pinnedSortable.destroy();
  if (toolsSortable) toolsSortable.destroy();
  if (categorySortable) categorySortable.destroy();

  if (!state.uiState.editMode) return;

  if (window.Sortable && els.pinnedGrid.querySelectorAll(".tile").length > 1) {
    pinnedSortable = new Sortable(els.pinnedGrid, {
      animation: 150,
      ghostClass: "drag-ghost",
      draggable: ".tile",
      onEnd: persistVisibleToolOrder
    });
  }

  if (window.Sortable && els.toolsGrid.querySelectorAll(".tile").length > 1) {
    toolsSortable = new Sortable(els.toolsGrid, {
      animation: 150,
      ghostClass: "drag-ghost",
      draggable: ".tile",
      onEnd: persistVisibleToolOrder
    });
  }

  if (window.Sortable && els.categoriesManageList.querySelectorAll(".manage-item").length > 1) {
    categorySortable = new Sortable(els.categoriesManageList, {
      animation: 150,
      ghostClass: "drag-ghost",
      draggable: ".manage-item",
      onEnd: persistCategoryOrder
    });
  }
}

function persistVisibleToolOrder() {
  const ids = [
    ...[...els.pinnedGrid.querySelectorAll(".tile")].map(x => x.dataset.id),
    ...[...els.toolsGrid.querySelectorAll(".tile")].map(x => x.dataset.id)
  ];

  ids.forEach((id, idx) => {
    const t = state.tools.find(x => x.id === id);
    if (t) {
      t.sortOrder = (idx + 1) * 10;
      t.updatedAt = nowIso();
    }
  });

  touchLocalChange();
  saveState();
  renderAll();
}

function persistCategoryOrder() {
  [...els.categoriesManageList.querySelectorAll(".manage-item")].forEach((item, idx) => {
    const cat = getCategory(item.dataset.id);
    if (cat) {
      cat.sortOrder = idx + 1;
      cat.updatedAt = nowIso();
    }
  });

  touchLocalChange();
  saveState();
  renderAll();
}

function renderToolCategoryOptions() {
  els.toolCategoryInput.innerHTML = state.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.icon || "📁")} ${escapeHtml(c.name)}</option>`)
    .join("");
}

function fillSettings() {
  els.deviceNameInput.value = state.appSettings.deviceName || "";
  els.openModeInput.value = state.appSettings.openLinksDefault || "new_tab";
  els.remoteCheckInput.checked = state.appSettings.checkRemoteOnLoad !== false;
  els.gasUrlInput.value = state.appSettings.gasWebAppUrl || "";
  els.syncTokenInput.value = state.appSettings.syncToken || "";
}

function getFilteredTools() {
  const keyword = (els.searchInput.value || "").trim().toLowerCase();
  let list = state.tools.slice();

  if (activeTab === "pinned") list = list.filter(t => t.pinned && !t.isArchived);
  else if (activeTab === "archived") list = list.filter(t => t.isArchived);
  else if (activeTab !== "all") list = list.filter(t => t.categoryId === activeTab && !t.isArchived);
  else list = list.filter(t => !t.isArchived);

  if (state.uiState.pinnedOnlyQuickFilter) {
    list = list.filter(t => t.pinned && !t.isArchived);
  }

  if (keyword) {
    list = list.filter(t => {
      const hay = [
        t.title, t.url, t.description,
        ...(t.tags || []),
        getCategory(t.categoryId)?.name || ""
      ].join(" ").toLowerCase();
      return hay.includes(keyword);
    });
  }

  return list;
}

function getViewCounts() {
  const byCategory = {};
  state.categories.forEach(c => {
    byCategory[c.id] = state.tools.filter(t => t.categoryId === c.id && !t.isArchived).length;
  });

  return {
    all: state.tools.filter(t => !t.isArchived).length,
    pinned: state.tools.filter(t => t.pinned && !t.isArchived).length,
    archived: state.tools.filter(t => t.isArchived).length,
    byCategory
  };
}

function toggleFabMenu() {
  fabOpen = !fabOpen;
  els.fabMenu.classList.toggle("hidden", !fabOpen);
}

function closeFabMenu() {
  fabOpen = false;
  els.fabMenu.classList.add("hidden");
}

function openDrawer() {
  els.drawer.classList.add("open");
  els.overlay.classList.add("show");
}


function openPanel(panelId) {
  els.drawerTabs.forEach(x => x.classList.remove("active"));
  els.panels.forEach(x => x.classList.remove("active"));

  const tab = els.drawerTabs.find(x => x.dataset.panel === panelId);
  if (tab) tab.classList.add("active");

  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
}

function openSyncPanel() {
  openDrawer();
  openPanel("syncPanel");
}

function ensureSyncStatusBox() {
  if (els.syncStatusBox && document.body.contains(els.syncStatusBox)) return els.syncStatusBox;

  const panel = document.getElementById("syncPanel");
  if (!panel) return null;

  let box = panel.querySelector("#syncStatusBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "syncStatusBox";
    box.className = "panel-note top-gap";
    box.textContent = "Status: Idle.";

    const warning = [...panel.querySelectorAll(".panel-note")]
      .find(el => (el.textContent || "").includes("Push is blocked"));

    if (warning && warning.parentNode) {
      warning.parentNode.insertBefore(box, warning);
    } else {
      panel.appendChild(box);
    }
  }

  els.syncStatusBox = box;
  return box;
}

function setSyncStatus(message, type = "") {
  const box = ensureSyncStatusBox();
  if (!box) return;
  box.textContent = `Status: ${message}`;
  box.className = `panel-note top-gap ${type}`.trim();
}

function closeDrawer() {
  els.drawer.classList.remove("open");
  maybeHideOverlay();
}

function openToolModal(id = null) {
  editingToolId = id;
  renderToolCategoryOptions();
  els.urlFetchStatus.textContent = "";
  els.urlFetchStatus.className = "url-fetch-status";
  clearPreview();

  if (id) {
    const t = state.tools.find(x => x.id === id);
    if (!t) return;

    els.toolModalTitle.textContent = "Edit Tool";
    els.deleteToolBtn.classList.remove("hidden");
    els.toolIdInput.value = t.id;
    els.toolTitleInput.value = t.title || "";
    els.toolUrlInput.value = t.url || "";
    els.toolCategoryInput.value = t.categoryId || "work";
    els.toolIconInput.value = t.iconValue || "🌐";
    els.toolColorInput.value = t.color || "#5b6cff";
    els.toolOpenModeInput.value = t.openMode || "new_tab";
    els.toolDescInput.value = t.description || "";
    els.toolTagsInput.value = (t.tags || []).join(", ");
    els.toolPinnedInput.checked = !!t.pinned;
    els.toolArchivedInput.checked = !!t.isArchived;

    if (t.url && isProbablyUrl(t.url)) {
      fetchAndRenderLinkPreview(t.url, { autofill: false });
    }
  } else {
    els.toolModalTitle.textContent = "Add Tool";
    els.deleteToolBtn.classList.add("hidden");
    els.toolIdInput.value = "";
    els.toolTitleInput.value = "";
    els.toolUrlInput.value = "";
    els.toolCategoryInput.value = state.categories[0]?.id || "work";
    els.toolIconInput.value = "🌐";
    els.toolColorInput.value = "#5b6cff";
    els.toolOpenModeInput.value = state.appSettings.openLinksDefault || "new_tab";
    els.toolDescInput.value = "";
    els.toolTagsInput.value = "";
    els.toolPinnedInput.checked = false;
    els.toolArchivedInput.checked = false;
  }

  els.toolModal.classList.add("show");
  els.overlay.classList.add("show");
}

function closeModal() {
  els.toolModal.classList.remove("show");
  maybeHideOverlay();
}

function closeDiffModal() {
  els.diffModal.classList.remove("show");
  diffActionContext = null;
  maybeHideOverlay();
}

function maybeHideOverlay() {
  if (
    !els.drawer.classList.contains("open") &&
    !els.toolModal.classList.contains("show") &&
    !els.diffModal.classList.contains("show")
  ) {
    els.overlay.classList.remove("show");
  }
}

function saveToolFromModal() {
  const title = els.toolTitleInput.value.trim();
  const url = els.toolUrlInput.value.trim();
  if (!title) { alert("Please enter title."); return; }
  if (url && !isProbablyUrl(url)) { alert("Please enter a valid URL starting with http:// or https://"); return; }

  const payload = {
    title,
    url,
    categoryId: els.toolCategoryInput.value,
    iconValue: els.toolIconInput.value.trim() || "🌐",
    color: els.toolColorInput.value,
    openMode: els.toolOpenModeInput.value,
    description: els.toolDescInput.value.trim(),
    tags: splitTags(els.toolTagsInput.value),
    pinned: els.toolPinnedInput.checked,
    isArchived: els.toolArchivedInput.checked
  };

  if (editingToolId) {
    const idx = state.tools.findIndex(t => t.id === editingToolId);
    if (idx >= 0) {
      state.tools[idx] = {
        ...state.tools[idx],
        ...payload,
        updatedAt: nowIso(),
        deviceUpdatedBy: state.appSettings.deviceName || ""
      };
    }
  } else {
    state.tools.push({
      id: uid("tool"),
      sortOrder: nextSortOrder(),
      iconType: "emoji",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      lastUsedAt: "",
      useCount: 0,
      deviceUpdatedBy: state.appSettings.deviceName || "",
      ...payload
    });
  }

  touchLocalChange();
  saveState();
  closeModal();
  renderAll();
}

function deleteCurrentTool() {
  if (!editingToolId) return;
  const tool = state.tools.find(t => t.id === editingToolId);
  if (!tool) return;
  if (!confirm(`Delete "${tool.title}"?`)) return;

  state.tools = state.tools.filter(t => t.id !== editingToolId);
  touchLocalChange();
  saveState();
  closeModal();
  renderAll();
}

function trackToolUsage(id) {
  const tool = state.tools.find(t => t.id === id);
  if (!tool || !tool.url) return;

  tool.useCount = (tool.useCount || 0) + 1;
  tool.lastUsedAt = nowIso();
  tool.updatedAt = nowIso();
  saveState();
}

function togglePin(id) {
  const tool = state.tools.find(t => t.id === id);
  if (!tool) return;
  tool.pinned = !tool.pinned;
  tool.updatedAt = nowIso();
  touchLocalChange();
  saveState();
  renderAll();
}

function toggleArchive(id) {
  const tool = state.tools.find(t => t.id === id);
  if (!tool) return;
  tool.isArchived = !tool.isArchived;
  tool.updatedAt = nowIso();
  touchLocalChange();
  saveState();
  renderAll();
}

function addCategory() {
  const name = els.newCategoryName.value.trim();
  if (!name) { alert("Please enter category name."); return; }

  const id = slugify(name);
  if (state.categories.some(c => c.id === id)) { alert("Category already exists."); return; }

  state.categories.push({
    id,
    name,
    icon: els.newCategoryIcon.value.trim() || "📁",
    color: els.newCategoryColor.value || "#5b6cff",
    sortOrder: nextCategorySortOrder(),
    pinned: true,
    updatedAt: nowIso()
  });

  els.newCategoryName.value = "";
  els.newCategoryIcon.value = "";
  els.newCategoryColor.value = "#5b6cff";
  touchLocalChange();
  saveState();
  renderAll();
}

function renameCategory(id) {
  const cat = getCategory(id);
  if (!cat) return;
  const newName = prompt("New category name:", cat.name);
  if (!newName || !newName.trim()) return;
  cat.name = newName.trim();
  cat.updatedAt = nowIso();
  touchLocalChange();
  saveState();
  renderAll();
}

function recolorCategory(id) {
  const cat = getCategory(id);
  if (!cat) return;
  const newColor = prompt("New color hex:", cat.color || "#5b6cff");
  if (!newColor || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(newColor.trim())) {
    alert("Invalid hex color.");
    return;
  }
  cat.color = newColor.trim();
  cat.updatedAt = nowIso();
  touchLocalChange();
  saveState();
  renderAll();
}

function deleteCategory(id) {
  const cat = getCategory(id);
  if (!cat) return;
  const used = state.tools.filter(t => t.categoryId === id).length;
  if (used > 0) {
    alert(`Category is used by ${used} tool(s). Reassign or delete those tools first.`);
    return;
  }
  if (!confirm(`Delete category "${cat.name}"?`)) return;
  state.categories = state.categories.filter(c => c.id !== id);
  touchLocalChange();
  saveState();
  renderAll();
}

function saveGeneralSettings() {
  state.appSettings.deviceName = els.deviceNameInput.value.trim();
  state.appSettings.openLinksDefault = els.openModeInput.value;
  state.appSettings.checkRemoteOnLoad = els.remoteCheckInput.checked;
  saveState();
  renderAll();
  alert("General settings saved.");
}

function saveSyncConfig() {
  state.appSettings.gasWebAppUrl = els.gasUrlInput.value.trim();
  state.appSettings.syncToken = els.syncTokenInput.value.trim();
  saveState();
  alert("Sync config saved.");
}

async function lightweightRemoteCheck() {
  const base = state.appSettings.gasWebAppUrl || els.gasUrlInput.value.trim();
  if (!base) {
    setSyncStatus("Please set the Apps Script Web App URL first.", "error");
    alert("Please set the Apps Script Web App URL first.");
    return;
  }

  try {
    setSyncStatus("Checking remote connection...", "fetching");

    const url = `${base}${base.includes("?") ? "&" : "?"}action=meta`;
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Remote check failed.");

    state.syncMeta.lastRemoteCheckAt = nowIso();
    state.syncMeta.lastRemoteVersion = data.meta?.version || "";
    state.syncMeta.lastSyncStatus = "checked";
    saveState();

    const versionText = data.meta?.version ? ` Remote version: ${data.meta.version}.` : "";
    setSyncStatus(`Connection OK.${versionText}`, "success");
  } catch (err) {
    state.syncMeta.lastSyncStatus = "failed";
    saveState();
    setSyncStatus(`Remote check failed: ${err.message}`, "error");
    alert(`Remote check failed: ${err.message}`);
  }
}

async function previewPullFromRemote() {
  const remote = await fetchRemoteBundle();
  if (!remote) return;

  const toolDiff = compareCollections(state.tools, remote.tools, "tool");
  const categoryDiff = compareCollections(state.categories, remote.categories, "category");

  showDiffModal({
    action: "pull",
    title: "Preview Pull from Sheet",
    subtitle: "Remote data will replace local tools and categories.",
    warning: "",
    canConfirm: true,
    remoteBundle: remote,
    toolDiff,
    categoryDiff
  });
}

async function previewPushToRemote() {
  const remote = await fetchRemoteBundle();
  if (!remote) return;

  const remoteVersion = remote.meta?.version || "";
  const localVersion = state.syncMeta.lastLocalChangeAt || state.syncMeta.lastLocalSaveAt || "";
  const blockedByVersion = !!(remoteVersion && localVersion && remoteVersion > localVersion);
  const blockedByToken = !((state.appSettings.syncToken || "").trim());

  const toolDiff = compareCollections(remote.tools, state.tools, "tool");
  const categoryDiff = compareCollections(remote.categories, state.categories, "category");

  let warning = "";
  if (blockedByToken) {
    warning = "Sync Token is empty. Please save the same SYNC_TOKEN as your Apps Script Script Properties before push.";
  } else if (blockedByVersion) {
    warning = `Remote version (${remoteVersion}) is newer than local version (${localVersion || "n/a"}). Please pull latest data first.`;
  }

  showDiffModal({
    action: "push",
    title: "Preview Push to Sheet",
    subtitle: blockedByVersion || blockedByToken ? "Push is currently blocked." : "Local data will be written to remote sheet after confirmation.",
    warning,
    canConfirm: !blockedByVersion && !blockedByToken,
    remoteBundle: remote,
    toolDiff,
    categoryDiff
  });
}

async function fetchRemoteBundle() {
  const base = state.appSettings.gasWebAppUrl || els.gasUrlInput.value.trim();
  if (!base) {
    alert("Please set the Apps Script Web App URL first.");
    return null;
  }

  try {
    const url = `${base}${base.includes("?") ? "&" : "?"}action=pull`;
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Failed to load remote data.");
    return {
      tools: Array.isArray(data.tools) ? data.tools : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      meta: data.meta || {}
    };
  } catch (err) {
    alert(`Remote load failed: ${err.message}`);
    return null;
  }
}

function compareCollections(sourceList, targetList, kind) {
  const sourceMap = new Map(sourceList.map(item => [item.id, item]));
  const targetMap = new Map(targetList.map(item => [item.id, item]));
  const added = [];
  const changed = [];
  const removed = [];
  const same = [];

  for (const [id, target] of targetMap) {
    const source = sourceMap.get(id);
    if (!source) {
      added.push({ id, after: target });
    } else {
      const beforeSig = signature(source, kind);
      const afterSig = signature(target, kind);
      if (beforeSig === afterSig) same.push({ id, before: source, after: target });
      else changed.push({ id, before: source, after: target });
    }
  }

  for (const [id, source] of sourceMap) {
    if (!targetMap.has(id)) removed.push({ id, before: source });
  }

  return { added, changed, removed, same, totalTarget: targetList.length };
}

function signature(item, kind) {
  if (kind === "category") {
    return JSON.stringify({
      id: item.id || "",
      name: item.name || "",
      color: item.color || "",
      icon: item.icon || "",
      sortOrder: +item.sortOrder || 0
    });
  }

  return JSON.stringify({
    id: item.id || "",
    title: item.title || "",
    url: item.url || "",
    categoryId: item.categoryId || "",
    pinned: !!item.pinned,
    sortOrder: +item.sortOrder || 0,
    description: item.description || "",
    iconValue: item.iconValue || "",
    color: item.color || "",
    openMode: item.openMode || "",
    isArchived: !!item.isArchived,
    tags: Array.isArray(item.tags) ? item.tags.join("|") : String(item.tags || "")
  });
}

function showDiffModal(ctx) {
  diffActionContext = ctx;
  els.diffTitle.textContent = ctx.title;
  els.diffSubtitle.textContent = ctx.subtitle;
  els.diffWarning.textContent = ctx.warning || "";
  els.diffWarning.classList.toggle("hidden", !ctx.warning);

  const toolSummary = summarizeDiff(ctx.toolDiff, "Tools");
  const categorySummary = summarizeDiff(ctx.categoryDiff, "Categories");

  els.diffSummary.innerHTML = `
    ${summaryChip("Tools total", ctx.toolDiff.totalTarget)}
    ${summaryChip("Add / change", ctx.toolDiff.added.length + ctx.toolDiff.changed.length)}
    ${summaryChip("Remove", ctx.toolDiff.removed.length)}
    ${summaryChip("Categories", ctx.categoryDiff.totalTarget)}
  `;

  els.diffTables.innerHTML = `
    ${renderDiffTable("Tools", toolSummary)}
    ${renderDiffTable("Categories", categorySummary)}
  `;

  els.confirmDiffBtn.textContent = ctx.action === "pull" ? "Confirm Pull" : "Confirm Push";
  els.confirmDiffBtn.disabled = !ctx.canConfirm;
  els.confirmDiffBtn.style.opacity = ctx.canConfirm ? "1" : ".45";

  els.diffModal.classList.add("show");
  els.overlay.classList.add("show");
}

async function confirmDiffAction() {
  if (!diffActionContext) return;
  if (diffActionContext.action === "pull") {
    applyPull(diffActionContext.remoteBundle);
    closeDiffModal();
    alert("Pull completed.");
  } else {
    await performPush();
    closeDiffModal();
  }
}

function applyPull(bundle) {
  state.tools = Array.isArray(bundle.tools) ? bundle.tools : [];
  state.categories = Array.isArray(bundle.categories) && bundle.categories.length
    ? bundle.categories
    : structuredClone(DEFAULT_DATA.categories);
  state.syncMeta.lastRemoteCheckAt = nowIso();
  state.syncMeta.lastRemoteSyncAt = nowIso();
  state.syncMeta.lastRemoteVersion = bundle.meta?.version || nowIso();
  state.syncMeta.lastSyncStatus = "pulled";
  ensureStateShape();
  saveState();
  renderAll();
}

async function performPush() {
  const base = state.appSettings.gasWebAppUrl || els.gasUrlInput.value.trim();
  if (!base) {
    alert("Please set the Apps Script Web App URL first.");
    return;
  }
  if (!(state.appSettings.syncToken || "").trim()) {
    alert("Please save Sync Token first.");
    return;
  }

  try {
    const payload = {
      action: "push",
      token: state.appSettings.syncToken || "",
      tools: state.tools,
      categories: state.categories,
      clientMeta: {
        deviceName: state.appSettings.deviceName || "",
        localVersion: nowIso()
      }
    };

    const res = await fetch(base, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Push failed.");

    state.syncMeta.lastRemoteCheckAt = nowIso();
    state.syncMeta.lastRemoteSyncAt = nowIso();
    state.syncMeta.lastRemoteVersion = data.meta?.version || nowIso();
    state.syncMeta.lastSyncStatus = "pushed";
    saveState();
    renderAll();
    alert("Push completed.");
  } catch (err) {
    alert(`Push failed: ${err.message}`);
  }
}

function summarizeDiff(diff, label) {
  const rows = [];
  diff.added.slice(0, 10).forEach(x => rows.push({ type: "add", id: x.id, before: "—", after: getRowLabel(x.after, label) }));
  diff.changed.slice(0, 10).forEach(x => rows.push({ type: "change", id: x.id, before: getRowLabel(x.before, label), after: getRowLabel(x.after, label) }));
  diff.removed.slice(0, 10).forEach(x => rows.push({ type: "remove", id: x.id, before: getRowLabel(x.before, label), after: "—" }));
  return rows;
}

function getRowLabel(item, label) {
  if (label === "Categories") return `${item.icon || "📁"} ${item.name || ""} · ${item.color || ""}`;
  const tags = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  return `${item.title || ""} · ${safeHost(item.url || "")} · ${item.categoryId || ""}${tags ? " · " + tags : ""}`;
}

function renderDiffTable(label, rows) {
  return `
    <div style="margin-top:12px">
      <div style="font-size:15px;font-weight:900;margin-bottom:8px">${escapeHtml(label)}</div>
      <table class="diff-table">
        <thead>
          <tr>
            <th style="width:90px">Type</th>
            <th style="width:120px">ID</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(r => `
            <tr>
              <td>${diffTypeBadge(r.type)}</td>
              <td>${escapeHtml(r.id)}</td>
              <td>${escapeHtml(r.before)}</td>
              <td>${escapeHtml(r.after)}</td>
            </tr>
          `).join("") : `<tr><td colspan="4">No differences detected.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function diffTypeBadge(type) {
  if (type === "add") return `<span class="diff-badge diff-add">Add</span>`;
  if (type === "change") return `<span class="diff-badge diff-change">Change</span>`;
  if (type === "remove") return `<span class="diff-badge diff-remove">Remove</span>`;
  return `<span class="diff-badge diff-same">Same</span>`;
}

function summaryChip(k, v) {
  return `<div class="summary-chip"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(String(v))}</div></div>`;
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `my-tools-hub-v22-backup-${dateStamp()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = deepMerge(structuredClone(DEFAULT_DATA), JSON.parse(reader.result));
      ensureStateShape();
      saveState();
      renderAll();
      alert("Import completed.");
    } catch (err) {
      alert("Invalid JSON file.");
    } finally {
      els.importJsonFile.value = "";
    }
  };
  reader.readAsText(file);
}

function saveState(markSaved = true) {
  if (markSaved) state.syncMeta.lastLocalSaveAt = nowIso();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function touchLocalChange() {
  state.syncMeta.lastLocalChangeAt = nowIso();
}

function getCategory(id) {
  return state.categories.find(c => c.id === id);
}

function nextSortOrder() {
  return Math.max(0, ...state.tools.map(t => +t.sortOrder || 0)) + 10;
}

function nextCategorySortOrder() {
  return Math.max(0, ...state.categories.map(c => +c.sortOrder || 0)) + 1;
}

function sortTools(a, b) {
  if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
  return (+a.sortOrder || 0) - (+b.sortOrder || 0) || a.title.localeCompare(b.title);
}

function splitTags(s) {
  if (Array.isArray(s)) return s;
  return String(s).split(",").map(x => x.trim()).filter(Boolean);
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || uid("cat");
}

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch (e) {
    return url || "";
  }
}

function isProbablyUrl(url) {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch (e) {
    return false;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function dateStamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function gradientPair(base) {
  const map = {
    "#4f46e5": ["#5b6cff", "#7c4dff"],
    "#7c3aed": ["#8b5cf6", "#c026d3"],
    "#10b981": ["#18b875", "#2b7fff"],
    "#ef4444": ["#f46b45", "#ee0979"],
    "#f59e0b": ["#ff9f43", "#ee5253"]
  };
  const key = String(base || "").toLowerCase();
  return map[key] || [lighten(base, 12), shiftHue(base, 28)];
}

function lighten(hex, amt = 10) {
  const { r, g, b } = hexToRgb(hex || "#5b6cff");
  return rgbToHex(
    clamp(r + amt * 2.2),
    clamp(g + amt * 2.2),
    clamp(b + amt * 2.2)
  );
}

function shiftHue(hex, delta = 20) {
  const { r, g, b } = hexToRgb(hex || "#5b6cff");
  const hsl = rgbToHsl(r, g, b);
  hsl.h = (hsl.h + delta + 360) % 360;
  const rgb = hslToRgb(hsl.h, hsl.s, Math.min(72, hsl.l + 6));
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map(x => x + x).join("")
    : clean.padEnd(6, "0").slice(0, 6);

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => clamp(Math.round(x)).toString(16).padStart(2, "0")).join("");
}

function clamp(n) {
  return Math.max(0, Math.min(255, n));
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255
  };
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}