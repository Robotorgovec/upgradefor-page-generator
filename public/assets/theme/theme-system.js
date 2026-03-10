(function () {
  "use strict";

  const STORAGE_KEY = "userTheme";
  const DEBUG_DATE_KEY = "upgrThemeDebugDate";
  const MODE_COOKIE = "upgr_theme_mode";
  const DEBUG_DATE_COOKIE = "upgr_theme_debug_date";
  const SITE_TIME_ZONE = "Europe/Moscow";
  const ROTATION_START = "2026-01-01";
  const FALLBACK_THEME_KEY = "brand-cyan";

  const THEMES = [
    { key: "brand-cyan", label: "Брендовый", primary: "#12AFF0", contrast: "#05283A" },
    { key: "cobalt", label: "Кобальт", primary: "#2563EB", contrast: "#FFFFFF" },
    { key: "indigo", label: "Индиго", primary: "#4F46E5", contrast: "#FFFFFF" },
    { key: "teal", label: "Тил", primary: "#0F766E", contrast: "#FFFFFF" },
    { key: "emerald", label: "Изумруд", primary: "#15803D", contrast: "#FFFFFF" },
    { key: "terracotta", label: "Терракота", primary: "#C2410C", contrast: "#FFFFFF" },
    { key: "rose", label: "Роза", primary: "#BE185D", contrast: "#FFFFFF" },
    { key: "amber", label: "Янтарь", primary: "#B45309", contrast: "#FFFFFF" },
  ];

  const THEME_INDEX = THEMES.reduce((acc, theme) => {
    acc[theme.key] = theme;
    return acc;
  }, {});

  const NEUTRALS = {
    white: "#FFFFFF",
    paper: "#F6F8FB",
    warm: "#F8F4EA",
    ink: "#0F172A",
    slate: "#334155",
    muted: "#475569",
  };

  let currentState = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function positiveMod(value, base) {
    return ((value % base) + base) % base;
  }

  function normalizeHex(hex) {
    if (typeof hex !== "string") return null;
    const trimmed = hex.trim().replace(/^#/, "");

    if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
      return trimmed
        .split("")
        .map((char) => char + char)
        .join("")
        .toUpperCase();
    }

    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    return null;
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;

    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  function rgbToHex(rgb) {
    const channels = [rgb.r, rgb.g, rgb.b].map((channel) =>
      clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0")
    );

    return `#${channels.join("").toUpperCase()}`;
  }

  function mixColors(fromHex, toHex, amountToSecond) {
    const from = hexToRgb(fromHex);
    const to = hexToRgb(toHex);
    const mix = clamp(amountToSecond, 0, 1);

    if (!from || !to) return fromHex;

    return rgbToHex({
      r: from.r + (to.r - from.r) * mix,
      g: from.g + (to.g - from.g) * mix,
      b: from.b + (to.b - from.b) * mix,
    });
  }

  function withAlpha(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const normalizedAlpha = clamp(alpha, 0, 1);
    const alphaString = Number(normalizedAlpha.toFixed(3)).toString();

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaString})`;
  }

  function isValidDateStamp(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map((part) => Number(part));
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  function parseDateStamp(dateStamp) {
    return Date.parse(`${dateStamp}T00:00:00Z`);
  }

  function getZonedDateStamp(date, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date).reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function getStoredValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // noop
    }
  }

  function clearStoredValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
  }

  function setCookie(name, value, maxAge) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }

  function clearCookie(name) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  function readThemeMode() {
    const stored = getStoredValue(STORAGE_KEY);
    return stored && THEME_INDEX[stored] ? stored : "auto";
  }

  function readDebugDate() {
    const stored = getStoredValue(DEBUG_DATE_KEY);
    return isValidDateStamp(stored) ? stored : null;
  }

  function deriveTokens(theme) {
    const primary = theme.primary;
    const primaryHover = mixColors(primary, NEUTRALS.ink, 0.16);
    const primaryActive = mixColors(primary, NEUTRALS.ink, 0.28);
    const secondaryAccent = mixColors(primary, NEUTRALS.ink, 0.4);
    const softBg = mixColors(primary, NEUTRALS.white, 0.93);
    const softBgStrong = mixColors(primary, NEUTRALS.white, 0.87);
    const border = mixColors(primary, NEUTRALS.white, 0.74);
    const borderStrong = mixColors(primary, NEUTRALS.white, 0.58);
    const chipBg = mixColors(primary, NEUTRALS.white, 0.89);
    const chipBorder = mixColors(primary, NEUTRALS.white, 0.7);
    const chipText = mixColors(primary, NEUTRALS.ink, 0.48);
    const link = mixColors(primary, NEUTRALS.ink, 0.42);
    const linkHover = mixColors(primary, NEUTRALS.ink, 0.56);
    const pageTitle = mixColors(primary, NEUTRALS.ink, 0.82);
    const pageCopy = mixColors(primary, NEUTRALS.slate, 0.76);
    const pageMuted = mixColors(primary, NEUTRALS.muted, 0.72);

    return {
      "--theme-primary": primary,
      "--theme-primary-hover": primaryHover,
      "--theme-primary-active": primaryActive,
      "--theme-primary-contrast": theme.contrast,
      "--theme-secondary-accent": secondaryAccent,
      "--theme-soft-bg": softBg,
      "--theme-soft-bg-strong": softBgStrong,
      "--theme-border": border,
      "--theme-border-strong": borderStrong,
      "--theme-chip-bg": chipBg,
      "--theme-chip-border": chipBorder,
      "--theme-chip-text": chipText,
      "--theme-link": link,
      "--theme-link-hover": linkHover,
      "--theme-focus-ring": withAlpha(primary, 0.38),
      "--theme-section-tint": `linear-gradient(140deg, ${mixColors(primary, NEUTRALS.white, 0.96)} 0%, ${mixColors(primary, NEUTRALS.paper, 0.93)} 100%)`,
      "--theme-section-tint-strong": `linear-gradient(136deg, ${mixColors(primary, NEUTRALS.white, 0.9)} 0%, ${mixColors(primary, NEUTRALS.warm, 0.92)} 100%)`,
      "--theme-card-accent": mixColors(primary, NEUTRALS.white, 0.78),
      "--theme-page-title": pageTitle,
      "--theme-page-copy": pageCopy,
      "--theme-page-muted": pageMuted,
      "--theme-hero-bg": `linear-gradient(142deg, ${mixColors(primary, NEUTRALS.white, 0.97)} 0%, ${mixColors(primary, NEUTRALS.paper, 0.94)} 48%, ${mixColors(primary, NEUTRALS.warm, 0.95)} 100%)`,
      "--theme-hero-border": withAlpha(mixColors(primary, NEUTRALS.ink, 0.35), 0.16),
      "--theme-hero-orb": `radial-gradient(circle, ${withAlpha(primary, 0.22)}, ${withAlpha(primary, 0)})`,
      "--theme-hero-grid": withAlpha(mixColors(primary, NEUTRALS.ink, 0.28), 0.12),
      "--theme-hero-visual-bg": `linear-gradient(130deg, rgba(255, 255, 255, 0.94) 0%, ${withAlpha(mixColors(primary, NEUTRALS.white, 0.82), 0.96)} 48%, ${withAlpha(mixColors(primary, NEUTRALS.warm, 0.9), 0.92)} 100%)`,
      "--theme-surface-strong": "rgba(255, 255, 255, 0.92)",
      "--theme-surface-soft": "rgba(255, 255, 255, 0.84)",
      "--theme-surface-muted": "rgba(255, 255, 255, 0.76)",
      "--theme-sticky-surface": "rgba(255, 255, 255, 0.96)",
    };
  }

  function resolveThemeState(options = {}) {
    const requestedMode = options.mode && THEME_INDEX[options.mode] ? options.mode : "auto";
    const debugDate = isValidDateStamp(options.debugDate) ? options.debugDate : null;
    const activeDate = debugDate || getZonedDateStamp(new Date(), SITE_TIME_ZONE);
    const rotationIndex = positiveMod(
      Math.floor((parseDateStamp(activeDate) - parseDateStamp(ROTATION_START)) / 86400000),
      THEMES.length
    );
    const autoTheme = THEMES[rotationIndex] || THEME_INDEX[FALLBACK_THEME_KEY];
    const theme = requestedMode === "auto" ? autoTheme : THEME_INDEX[requestedMode] || autoTheme;
    const source = requestedMode === "auto" ? (debugDate ? "debug-date" : "daily") : "manual";

    return {
      mode: requestedMode,
      source,
      dateStamp: activeDate,
      timeZone: SITE_TIME_ZONE,
      rotationStart: ROTATION_START,
      themeKey: theme.key,
      theme: { ...theme },
      tokens: deriveTokens(theme),
      debugDate,
    };
  }

  function cloneState(state) {
    return {
      mode: state.mode,
      source: state.source,
      dateStamp: state.dateStamp,
      timeZone: state.timeZone,
      rotationStart: state.rotationStart,
      themeKey: state.themeKey,
      debugDate: state.debugDate,
      theme: { ...state.theme },
      tokens: { ...state.tokens },
    };
  }

  function setRootVariables(tokens) {
    const root = document.documentElement;
    Object.keys(tokens).forEach((name) => {
      root.style.setProperty(name, tokens[name]);
    });
  }

  function updateMetaThemeColor(value) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", value);
  }

  function broadcastThemeChange() {
    window.dispatchEvent(
      new CustomEvent("upgr:theme-change", {
        detail: cloneState(currentState),
      })
    );
  }

  function applyResolvedState(nextState) {
    currentState = cloneState(nextState);
    setRootVariables(currentState.tokens);

    const root = document.documentElement;
    root.setAttribute("data-theme", currentState.themeKey);
    root.setAttribute("data-theme-mode", currentState.mode);
    root.setAttribute("data-theme-source", currentState.source);
    root.setAttribute("data-theme-date", currentState.dateStamp);
    updateMetaThemeColor(currentState.tokens["--theme-primary"]);
    broadcastThemeChange();

    return cloneState(currentState);
  }

  function applyInitialTheme() {
    return applyResolvedState(
      resolveThemeState({
        mode: readThemeMode(),
        debugDate: readDebugDate(),
      })
    );
  }

  function setThemeMode(mode) {
    const nextMode = mode === "auto" ? "auto" : THEME_INDEX[mode] ? mode : "auto";

    if (nextMode === "auto") {
      clearStoredValue(STORAGE_KEY);
      clearCookie(MODE_COOKIE);
    } else {
      setStoredValue(STORAGE_KEY, nextMode);
      setCookie(MODE_COOKIE, nextMode, 31536000);
    }

    return applyInitialTheme();
  }

  function setDebugDate(dateStamp) {
    if (!isValidDateStamp(dateStamp)) {
      throw new Error("Theme debug date must use YYYY-MM-DD format.");
    }

    setStoredValue(DEBUG_DATE_KEY, dateStamp);
    setCookie(DEBUG_DATE_COOKIE, dateStamp, 31536000);
    return applyInitialTheme();
  }

  function clearDebugDate() {
    clearStoredValue(DEBUG_DATE_KEY);
    clearCookie(DEBUG_DATE_COOKIE);
    return applyInitialTheme();
  }

  function resetThemeState() {
    clearStoredValue(STORAGE_KEY);
    clearStoredValue(DEBUG_DATE_KEY);
    clearCookie(MODE_COOKIE);
    clearCookie(DEBUG_DATE_COOKIE);
    return applyInitialTheme();
  }

  function getThemeOptions() {
    return THEMES.map((theme) => ({ ...theme }));
  }

  function getSelectableModes() {
    return [{ key: "auto", label: "Авто (тема дня)", primary: null, contrast: null }].concat(getThemeOptions());
  }

  function getState() {
    if (!currentState) {
      currentState = resolveThemeState({
        mode: readThemeMode(),
        debugDate: readDebugDate(),
      });
    }

    return cloneState(currentState);
  }

  window.UPGR_THEME_SYSTEM = {
    storageKey: STORAGE_KEY,
    debugDateKey: DEBUG_DATE_KEY,
    timeZone: SITE_TIME_ZONE,
    rotationStart: ROTATION_START,
    fallbackThemeKey: FALLBACK_THEME_KEY,
    getState,
    getThemeOptions,
    getSelectableModes,
    resolveThemeState,
    applyInitialTheme,
    setThemeMode,
    setDebugDate,
    clearDebugDate,
    reset: resetThemeState,
    reapply: applyInitialTheme,
  };

  window.UPGR_THEME_DEBUG = {
    getState,
    listThemes: getThemeOptions,
    setTheme: setThemeMode,
    clearTheme: function () {
      return setThemeMode("auto");
    },
    setDate: setDebugDate,
    clearDate: clearDebugDate,
    reset: resetThemeState,
  };

  applyInitialTheme();

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY && event.key !== DEBUG_DATE_KEY) return;
    applyInitialTheme();
  });
})();