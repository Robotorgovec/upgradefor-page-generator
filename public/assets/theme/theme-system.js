(function () {
  "use strict";

  const STORAGE_KEY = "userTheme";
  const DEBUG_DATE_KEY = "upgrThemeDebugDate";
  const DEBUG_WEEKDAY_KEY = "upgrThemeDebugWeekday";
  const MODE_COOKIE = "upgr_theme_mode";
  const DEBUG_DATE_COOKIE = "upgr_theme_debug_date";
  const DEBUG_WEEKDAY_COOKIE = "upgr_theme_debug_weekday";
  const SITE_TIME_ZONE = "Europe/Moscow";
  const BRAND_LOGO_BLUE = "#12AFF0";
  const FALLBACK_THEME_KEY = "brand-blue";

  const WEEKDAY_META = [
    { index: 0, key: "sunday", label: "Sunday", labelRu: "Воскресенье" },
    { index: 1, key: "monday", label: "Monday", labelRu: "Понедельник" },
    { index: 2, key: "tuesday", label: "Tuesday", labelRu: "Вторник" },
    { index: 3, key: "wednesday", label: "Wednesday", labelRu: "Среда" },
    { index: 4, key: "thursday", label: "Thursday", labelRu: "Четверг" },
    { index: 5, key: "friday", label: "Friday", labelRu: "Пятница" },
    { index: 6, key: "saturday", label: "Saturday", labelRu: "Суббота" },
  ];

  const THEMES = [
    {
      key: "red",
      weekdayIndex: 0,
      weekdayKey: "sunday",
      weekdayLabel: "Sunday",
      weekdayLabelRu: "Воскресенье",
      label: "Пастельный красный",
      primary: "#E77A72",
      contrast: "#311412",
    },
    {
      key: "orange",
      weekdayIndex: 1,
      weekdayKey: "monday",
      weekdayLabel: "Monday",
      weekdayLabelRu: "Понедельник",
      label: "Пастельный оранжевый",
      primary: "#F2A65E",
      contrast: "#36200C",
    },
    {
      key: "yellow",
      weekdayIndex: 2,
      weekdayKey: "tuesday",
      weekdayLabel: "Tuesday",
      weekdayLabelRu: "Вторник",
      label: "Пастельный жёлтый",
      primary: "#E6C85C",
      contrast: "#352807",
    },
    {
      key: "green",
      weekdayIndex: 3,
      weekdayKey: "wednesday",
      weekdayLabel: "Wednesday",
      weekdayLabelRu: "Среда",
      label: "Пастельный зелёный",
      primary: "#79C98F",
      contrast: "#153021",
    },
    {
      key: "brand-blue",
      weekdayIndex: 4,
      weekdayKey: "thursday",
      weekdayLabel: "Thursday",
      weekdayLabelRu: "Четверг",
      label: "Голубой логотипа",
      primary: BRAND_LOGO_BLUE,
      contrast: "#05283A",
    },
    {
      key: "indigo",
      weekdayIndex: 5,
      weekdayKey: "friday",
      weekdayLabel: "Friday",
      weekdayLabelRu: "Пятница",
      label: "Пастельный индиго",
      primary: "#7F95EE",
      contrast: "#16223B",
    },
    {
      key: "violet",
      weekdayIndex: 6,
      weekdayKey: "saturday",
      weekdayLabel: "Saturday",
      weekdayLabelRu: "Суббота",
      label: "Пастельный лиловый",
      primary: "#A78BDE",
      contrast: "#24153B",
    },
  ];

  const THEME_INDEX = THEMES.reduce((acc, theme) => {
    acc[theme.key] = theme;
    return acc;
  }, {});

  const WEEKDAY_THEME_INDEX = THEMES.reduce((acc, theme) => {
    acc[theme.weekdayIndex] = theme;
    return acc;
  }, {});

  const WEEKDAY_NAME_INDEX = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    sunday: 0,
    sun: 0,
    воскресенье: 0,
    monday: 1,
    mon: 1,
    понедельник: 1,
    tuesday: 2,
    tue: 2,
    tues: 2,
    вторник: 2,
    wednesday: 3,
    wed: 3,
    среда: 3,
    thursday: 4,
    thu: 4,
    thur: 4,
    thurs: 4,
    четверг: 4,
    friday: 5,
    fri: 5,
    пятница: 5,
    saturday: 6,
    sat: 6,
    суббота: 6,
  };

  const NEUTRALS = {
    white: "#FFFFFF",
    paper: "#F6F8FB",
    warm: "#FAF6F0",
    ink: "#0F172A",
    slate: "#334155",
    muted: "#475569",
  };

  let currentState = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
    return new Date(Date.parse(`${dateStamp}T00:00:00Z`));
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

  function getWeekdayIndex(dateStamp) {
    return parseDateStamp(dateStamp).getUTCDay();
  }

  function normalizeWeekday(value) {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6) {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (Object.prototype.hasOwnProperty.call(WEEKDAY_NAME_INDEX, normalized)) {
        return WEEKDAY_NAME_INDEX[normalized];
      }
    }

    return null;
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

  function readDebugWeekday() {
    const stored = getStoredValue(DEBUG_WEEKDAY_KEY);
    return normalizeWeekday(stored);
  }

  function deriveTokens(theme) {
    const primary = theme.primary;
    const primaryHover = mixColors(primary, NEUTRALS.ink, 0.08);
    const primaryActive = mixColors(primary, NEUTRALS.ink, 0.16);
    const secondaryAccent = mixColors(primary, NEUTRALS.ink, 0.24);
    const softBg = mixColors(primary, NEUTRALS.white, 0.9);
    const softBgStrong = mixColors(primary, NEUTRALS.white, 0.84);
    const border = mixColors(primary, NEUTRALS.white, 0.72);
    const borderStrong = mixColors(primary, NEUTRALS.white, 0.58);
    const chipBg = mixColors(primary, NEUTRALS.white, 0.86);
    const chipBorder = mixColors(primary, NEUTRALS.white, 0.68);
    const chipText = mixColors(primary, NEUTRALS.ink, 0.62);
    const link = mixColors(primary, NEUTRALS.ink, 0.48);
    const linkHover = mixColors(primary, NEUTRALS.ink, 0.62);

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
      "--theme-focus-ring": withAlpha(primary, 0.28),
      "--theme-section-tint": `linear-gradient(140deg, ${mixColors(primary, NEUTRALS.white, 0.95)} 0%, ${mixColors(primary, NEUTRALS.paper, 0.92)} 100%)`,
      "--theme-section-tint-strong": `linear-gradient(136deg, ${mixColors(primary, NEUTRALS.white, 0.91)} 0%, ${mixColors(primary, NEUTRALS.warm, 0.9)} 100%)`,
      "--theme-card-accent": mixColors(primary, NEUTRALS.white, 0.74),
      "--theme-page-title": NEUTRALS.ink,
      "--theme-page-copy": NEUTRALS.slate,
      "--theme-page-muted": NEUTRALS.muted,
      "--theme-hero-bg": `linear-gradient(142deg, ${mixColors(primary, NEUTRALS.white, 0.97)} 0%, ${mixColors(primary, NEUTRALS.paper, 0.94)} 48%, ${mixColors(primary, NEUTRALS.warm, 0.95)} 100%)`,
      "--theme-hero-border": withAlpha(mixColors(primary, NEUTRALS.ink, 0.38), 0.12),
      "--theme-hero-orb": `radial-gradient(circle, ${withAlpha(primary, 0.16)}, ${withAlpha(primary, 0)})`,
      "--theme-hero-grid": withAlpha(mixColors(primary, NEUTRALS.ink, 0.34), 0.09),
      "--theme-hero-visual-bg": `linear-gradient(130deg, rgba(255, 255, 255, 0.95) 0%, ${withAlpha(mixColors(primary, NEUTRALS.white, 0.86), 0.96)} 48%, ${withAlpha(mixColors(primary, NEUTRALS.warm, 0.9), 0.92)} 100%)`,
      "--theme-surface-strong": "rgba(255, 255, 255, 0.92)",
      "--theme-surface-soft": "rgba(255, 255, 255, 0.86)",
      "--theme-surface-muted": "rgba(255, 255, 255, 0.78)",
      "--theme-sticky-surface": "rgba(255, 255, 255, 0.96)",
    };
  }

  function resolveThemeState(options = {}) {
    const requestedMode = options.mode && THEME_INDEX[options.mode] ? options.mode : "auto";
    const debugDate = isValidDateStamp(options.debugDate) ? options.debugDate : null;
    const debugWeekday = normalizeWeekday(options.debugWeekday);
    const activeDate = debugDate || getZonedDateStamp(new Date(), SITE_TIME_ZONE);
    const activeWeekdayIndex = debugWeekday === null ? getWeekdayIndex(activeDate) : debugWeekday;
    const autoTheme = WEEKDAY_THEME_INDEX[activeWeekdayIndex] || THEME_INDEX[FALLBACK_THEME_KEY];
    const theme = requestedMode === "auto" ? autoTheme : THEME_INDEX[requestedMode] || autoTheme;
    const weekdayMeta = WEEKDAY_META[activeWeekdayIndex] || WEEKDAY_META[4];
    const source =
      requestedMode === "auto"
        ? debugWeekday !== null
          ? "debug-weekday"
          : debugDate
            ? "debug-date"
            : "weekday"
        : "manual";

    return {
      mode: requestedMode,
      source,
      dateStamp: activeDate,
      timeZone: SITE_TIME_ZONE,
      fallbackThemeKey: FALLBACK_THEME_KEY,
      brandLogoBlue: BRAND_LOGO_BLUE,
      weekdayIndex: activeWeekdayIndex,
      weekdayKey: weekdayMeta.key,
      weekdayLabel: weekdayMeta.label,
      weekdayLabelRu: weekdayMeta.labelRu,
      themeKey: theme.key,
      theme: { ...theme },
      tokens: deriveTokens(theme),
      debugDate,
      debugWeekday,
    };
  }

  function cloneState(state) {
    return {
      mode: state.mode,
      source: state.source,
      dateStamp: state.dateStamp,
      timeZone: state.timeZone,
      fallbackThemeKey: state.fallbackThemeKey,
      brandLogoBlue: state.brandLogoBlue,
      weekdayIndex: state.weekdayIndex,
      weekdayKey: state.weekdayKey,
      weekdayLabel: state.weekdayLabel,
      weekdayLabelRu: state.weekdayLabelRu,
      themeKey: state.themeKey,
      debugDate: state.debugDate,
      debugWeekday: state.debugWeekday,
      theme: { ...state.theme },
      tokens: { ...state.tokens },
    };
  }

  function setRootVariables(tokens) {
    const root = document.documentElement;
    Object.keys(tokens).forEach((name) => {
      root.style.setProperty(name, tokens[name]);
    });
    root.style.setProperty("--brand-logo-blue", BRAND_LOGO_BLUE);
    root.style.setProperty("--brand-logo-blue-strong", mixColors(BRAND_LOGO_BLUE, NEUTRALS.ink, 0.12));
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
    root.setAttribute("data-theme-weekday", currentState.weekdayKey);
    root.setAttribute("data-theme-weekday-index", String(currentState.weekdayIndex));
    updateMetaThemeColor(currentState.tokens["--theme-primary"]);
    broadcastThemeChange();

    return cloneState(currentState);
  }

  function applyInitialTheme() {
    return applyResolvedState(
      resolveThemeState({
        mode: readThemeMode(),
        debugDate: readDebugDate(),
        debugWeekday: readDebugWeekday(),
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

    clearStoredValue(DEBUG_WEEKDAY_KEY);
    clearCookie(DEBUG_WEEKDAY_COOKIE);
    setStoredValue(DEBUG_DATE_KEY, dateStamp);
    setCookie(DEBUG_DATE_COOKIE, dateStamp, 31536000);
    return applyInitialTheme();
  }

  function clearDebugDate() {
    clearStoredValue(DEBUG_DATE_KEY);
    clearCookie(DEBUG_DATE_COOKIE);
    return applyInitialTheme();
  }

  function setDebugWeekday(weekday) {
    const normalizedWeekday = normalizeWeekday(weekday);
    if (normalizedWeekday === null) {
      throw new Error("Theme debug weekday must be a number 0-6 or a weekday name.");
    }

    clearStoredValue(DEBUG_DATE_KEY);
    clearCookie(DEBUG_DATE_COOKIE);
    setStoredValue(DEBUG_WEEKDAY_KEY, String(normalizedWeekday));
    setCookie(DEBUG_WEEKDAY_COOKIE, String(normalizedWeekday), 31536000);
    return applyInitialTheme();
  }

  function clearDebugWeekday() {
    clearStoredValue(DEBUG_WEEKDAY_KEY);
    clearCookie(DEBUG_WEEKDAY_COOKIE);
    return applyInitialTheme();
  }

  function resetThemeState() {
    clearStoredValue(STORAGE_KEY);
    clearStoredValue(DEBUG_DATE_KEY);
    clearStoredValue(DEBUG_WEEKDAY_KEY);
    clearCookie(MODE_COOKIE);
    clearCookie(DEBUG_DATE_COOKIE);
    clearCookie(DEBUG_WEEKDAY_COOKIE);
    return applyInitialTheme();
  }

  function getThemeOptions() {
    return THEMES.map((theme) => ({ ...theme }));
  }

  function getSelectableModes() {
    return [{ key: "auto", label: "Авто (по дню недели)", primary: null, contrast: null }].concat(getThemeOptions());
  }

  function getState() {
    if (!currentState) {
      currentState = resolveThemeState({
        mode: readThemeMode(),
        debugDate: readDebugDate(),
        debugWeekday: readDebugWeekday(),
      });
    }

    return cloneState(currentState);
  }

  window.UPGR_THEME_SYSTEM = {
    storageKey: STORAGE_KEY,
    debugDateKey: DEBUG_DATE_KEY,
    debugWeekdayKey: DEBUG_WEEKDAY_KEY,
    timeZone: SITE_TIME_ZONE,
    brandLogoBlue: BRAND_LOGO_BLUE,
    fallbackThemeKey: FALLBACK_THEME_KEY,
    getState,
    getThemeOptions,
    getSelectableModes,
    resolveThemeState,
    applyInitialTheme,
    setThemeMode,
    setDebugDate,
    clearDebugDate,
    setDebugWeekday,
    clearDebugWeekday,
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
    setWeekday: setDebugWeekday,
    clearWeekday: clearDebugWeekday,
    reset: resetThemeState,
  };

  applyInitialTheme();

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY && event.key !== DEBUG_DATE_KEY && event.key !== DEBUG_WEEKDAY_KEY) return;
    applyInitialTheme();
  });
})();
