// =============================================================================
// PUSH HELPER + LOGGING
// =============================================================================
// window.enableLogging set in global header script.
// Adobe Launch loads ACDL (Adobe Client Data Layer) and replaces
// window.adobeDataLayer with its own object — wrapping push directly is
// fragile because the wrap gets clobbered. Use a helper that pushes,
// then logs against whatever adobeDataLayer is at call time.
window.adobeDataLayer = window.adobeDataLayer || [];

function pushAdobeEvent(payload) {
  try {
    window.adobeDataLayer.push(payload);
    if (window.enableLogging) {
      console.log(
        `DataLayer for ${window.location.href}:`,
        JSON.stringify(window.adobeDataLayer, null, 2),
      );
    }
  } catch (err) {
    console.error("[wiley-tracking] adobeDataLayer.push threw:", err, payload);
  }
}

// =============================================================================
// SHARED HELPERS
// =============================================================================
function toLowerStr(value) {
  return String(value ?? "").toLowerCase();
}

function getUrlSegments() {
  return location.pathname.split("/").filter(Boolean);
}

// Locale: first URL segment if it matches xx-yy or yy-xx pattern (e.g. en-us, us-en)
function getLocale() {
  const first = getUrlSegments()[0] || "";
  return /^[a-z]{2}-[a-z]{2}$/i.test(first) ? first.toLowerCase() : "";
}

// Strip locale segment when present, return remaining path segments
function getContentSegments() {
  const segments = getUrlSegments();
  return getLocale() ? segments.slice(1) : segments;
}

// =============================================================================
// EVENT: pageView
// =============================================================================
// Fires on every page load. Per spec, all values String, English, lowercase.
// Empty string when not applicable.

// Ancestor folder segments (strip locale + leaf pageName)
function getAncestorSegments() {
  return getContentSegments().slice(0, -1);
}

function getPageName() {
  const segments = getContentSegments();
  const last = segments[segments.length - 1] || "";
  return toLowerStr(last.split(".")[0]);
}

function getSection() {
  return toLowerStr(getAncestorSegments()[0] || "");
}

function getSubSection() {
  return toLowerStr(getAncestorSegments()[1] || "");
}

function getSubSubSection() {
  // Spec: "rest of the path" after sub-section (folders only, not pageName)
  const rest = getAncestorSegments().slice(2);
  return toLowerStr(rest.join("/"));
}

function getPageLanguage() {
  const locale = getLocale();
  if (!locale) return "";
  // Locale formats: country-language (us-en) or language-country (en-us)
  const [a, b] = locale.split("-");
  const langs = new Set(["en", "fr", "es", "de", "it", "pt", "zh", "ja", "ko"]);
  if (langs.has(a)) return a;
  if (langs.has(b)) return b;
  return "";
}

function getPageNumber() {
  const params = new URLSearchParams(location.search);
  const candidates = ["page", "pageNumber", "p"];
  for (const key of candidates) {
    const value = params.get(key);
    if (value && /^\d+$/.test(value)) return value;
  }
  return "";
}

// cspell:ignore itemprop
function getBreadcrumb() {
  // Wiley breadcrumb markup: nav[aria-label="Breadcrumb"] > [data-breadcrumb-wrap]
  // > [data-breadcrumb-item] (per crumb) with [itemprop="name"] (.bc_text) holding label.
  const nav = document.querySelector(
    "nav[aria-label='Breadcrumb' i], [data-breadcrumb-wrap]",
  );
  if (!nav) return "";

  const labels = nav.querySelectorAll("[itemprop='name'], .bc_text");
  if (!labels.length) return "";

  return toLowerStr(
    Array.from(labels)
      .map((el) => (el.textContent || "").trim())
      .filter(Boolean)
      .join(" > "),
  );
}

// User data placeholders. Wiley auth not wired yet - empty strings until source available.
function getUserData() {
  return {
    loginStatus: toLowerStr(window.wileyUser?.loginStatus || "not-logged-in"),
    loginType: toLowerStr(window.wileyUser?.loginType || ""),
    adminType: toLowerStr(window.wileyUser?.adminType || "not-admin"),
    almId: toLowerStr(window.wileyUser?.almId || ""),
    connectId: toLowerStr(window.wileyUser?.connectId || ""),
  };
}

function buildPageViewPayload() {
  return {
    event: "pageView",
    site: {
      name: toLowerStr(location.hostname),
      platform: "web",
      locale: getLocale(),
    },
    page: {
      pageName: getPageName(),
      section: getSection(),
      subSection: getSubSection(),
      subSubSection: getSubSubSection(),
      pageLanguage: getPageLanguage(),
      pageCategory: toLowerStr(window.wileyPageCategory || "others"),
      pageTemplate: toLowerStr(document.body?.getAttribute("data-page-template") || ""),
      pageBuild: "webflow",
      pageNumber: getPageNumber(),
      breadcrumb: getBreadcrumb(),
    },
    user: getUserData(),
  };
}

// =============================================================================
// EVENT: server error
// =============================================================================
// Pushed BEFORE pageView when the current page is a server error page.
// Webflow has no native error signal - probe URL, title, and h1 for known
// status codes / messages.

function getServerError() {
  const errorMap = {
    400: "bad request",
    401: "unauthorized",
    403: "forbidden",
    404: "page not found",
    500: "internal server error",
    502: "bad gateway",
    503: "service unavailable",
    504: "gateway timeout",
  };

  const patterns = [
    { regex: /\b404\b|not[\s-]?found/i, code: "404" },
    { regex: /\b403\b|forbidden/i, code: "403" },
    { regex: /\b401\b|unauthorized/i, code: "401" },
    { regex: /\b400\b|bad[\s-]?request/i, code: "400" },
    { regex: /\b500\b|internal[\s-]?server[\s-]?error/i, code: "500" },
    { regex: /\b502\b|bad[\s-]?gateway/i, code: "502" },
    { regex: /\b503\b|service[\s-]?unavailable/i, code: "503" },
    { regex: /\b504\b|gateway[\s-]?timeout/i, code: "504" },
  ];

  const haystack = [
    location.pathname,
    document.title || "",
    document.querySelector("h1")?.textContent || "",
  ].join(" ");

  for (const { regex, code } of patterns) {
    if (regex.test(haystack)) {
      const h1 = (document.querySelector("h1")?.textContent || "").trim();
      return {
        serverErrorCode: code,
        errorMessage: toLowerStr(h1 || errorMap[Number(code)] || `error ${code}`),
      };
    }
  }
  return null;
}

// =============================================================================
// EVENT: click
// =============================================================================
// Fires on clicks against links, buttons, images, and any element flagged
// with [data-track-click]. Per spec: componentType is one of link/button/image,
// values String/English/lowercase, empty string when not applicable.

const CLICK_SELECTOR = "a, button, img, [data-track-click]";

// --- Field extractors ---------------------------------------------------------

function getComponentType(el) {
  if (el.tagName === "BUTTON" || el.getAttribute("role") === "button") return "button";
  if (el.tagName === "A" || el.hasAttribute("href")) return "link";
  if (el.tagName === "IMG") return "image";
  return "link";
}

function getComponentText(el) {
  if (el.tagName === "IMG") {
    return toLowerStr(el.getAttribute("alt") || "");
  }
  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return toLowerStr(text);
  return toLowerStr(el.getAttribute("aria-label") || "");
}

function getComponentPosition(el) {
  const explicit = el.getAttribute("data-component-position");
  if (explicit) return toLowerStr(explicit);

  const group = el.closest(
    "[data-carousel], .w-slider, .w-dyn-list, [role='list'], [data-component-group]",
  );
  if (!group) return "";

  const itemSelector =
    "[data-carousel-item], .w-slide, .w-dyn-item, [role='listitem'], [data-component-item]";
  const items = group.querySelectorAll(itemSelector);
  const item = el.closest(itemSelector);
  if (!item || !items.length) return "";

  const index = Array.from(items).indexOf(item);
  return index >= 0 ? String(index + 1) : "";
}

function getClickCategory(el) {
  const explicit =
    el.getAttribute("data-click-category") ||
    el.closest("[data-click-category]")?.getAttribute("data-click-category");
  if (explicit) return toLowerStr(explicit);

  if (el.closest("[data-component='bottom-footer'], .bottom-footer")) return "bottom footer";
  // cspell:ignore contentinfo
  if (el.closest("footer, [role='contentinfo'], [data-component='footer']")) return "footer";
  if (el.closest("[data-component='hamburger'], .hamburger, [data-nav='hamburger']"))
    return "hamburger";
  if (el.closest("[data-component='pill-nav'], .pill-nav")) return "pill nav item";
  if (el.closest("[data-component='global-nav'], header nav, [role='banner'] nav"))
    return "global navigation item";
  if (el.closest("[data-component='search-results'], .search-results")) return "search result";
  if (el.closest("nav[aria-label='Breadcrumb' i], [data-breadcrumb-wrap]")) return "breadcrumb";
  return "cta";
}

function getParentComponent(el) {
  const parent = el.closest("[data-component-name], [data-parent-component]");
  if (!parent || parent === el) return { type: "", text: "" };

  const type = toLowerStr(
    parent.getAttribute("data-component-name") ||
    parent.getAttribute("data-parent-component") ||
    "",
  );

  const explicit = parent.getAttribute("data-component-title");
  if (explicit) return { type, text: toLowerStr(explicit) };

  const heading = parent.querySelector("h1, h2, h3, h4, h5, h6, [data-component-title]");
  const headingText = (heading?.textContent || "").replace(/\s+/g, " ").trim();
  return { type, text: toLowerStr(headingText) };
}

function getProductCode(el) {
  return toLowerStr(
    el.getAttribute("data-product-code") ||
    el.closest("[data-product-code]")?.getAttribute("data-product-code") ||
    "",
  );
}

function getLinkURL(el) {
  if (el.tagName === "A" || el.hasAttribute("href")) {
    return toLowerStr(el.getAttribute("href") || "");
  }
  return "";
}

// --- Shared context -----------------------------------------------------------
// Extract every field once, hand to per-component builders.

function collectClickContext(el) {
  return {
    componentType: getComponentType(el),
    componentText: getComponentText(el),
    componentProductCode: getProductCode(el),
    componentPosition: getComponentPosition(el),
    linkURL: getLinkURL(el),
    clickCategory: getClickCategory(el),
    parent: getParentComponent(el),
  };
}

function handleClick(event) {
  if (event._adobeProcessed) return;
  event._adobeProcessed = true;

  const target = event.target;
  const el = target.closest ? target.closest(CLICK_SELECTOR) : null;
  if (!el) return;
  if (el.closest("[data-track-click='false']")) return;

  // Breadcrumb routing relies on markup (no data-component-name needed)
  const isBreadcrumb = !!el.closest("nav[aria-label='Breadcrumb' i], [data-breadcrumb-wrap]");

  let payload;
  try {
    const ctx = collectClickContext(el);
    payload = {
      event: "click",
      component: {
        componentType: ctx.componentType,
        componentText: ctx.componentText,
        componentProductCode: ctx.componentProductCode,
        componentPosition: ctx.componentPosition,
        linkURL: ctx.linkURL,
        clickCategory: ctx.clickCategory,
        parentComponentType: ctx.parent.type,
        parentComponentText: ctx.parent.text,
      },
    };

    if (isBreadcrumb) {
      payload.component.componentProductCode = "";
      payload.component.clickCategory = "breadcrumb";
      payload.component.parentComponentType = "breadcrumb";
      payload.component.parentComponentText = getBreadcrumb();
    }
  } catch (err) {
    console.error("[wiley-tracking] click payload build threw:", err, el);
    return;
  }

  pushAdobeEvent(payload);

  if (el.tagName !== "A") return;
  if (event.button !== 0) return;
  if (event.metaKey) return;
  if (event.ctrlKey) return;
  if (event.shiftKey) return;
  if (event.altKey) return;

  const href = el.getAttribute("href");
  if (!href) return;
  if (href.charAt(0) === "#") return;
  if (el.getAttribute("target") === "_blank") return;

  event.preventDefault();
  window.setTimeout(() => {
    window.location.assign(el.href);
  }, 150);
}

// =============================================================================
// INIT
// =============================================================================
function initTracking() {
  // 1. Server error push (before pageView per spec)
  const serverError = getServerError();
  if (serverError) {
    pushAdobeEvent({ error: serverError });
  }

  // 2. Page view push
  pushAdobeEvent(buildPageViewPayload());

  // 3. Click listener (capture phase + document level so stopPropagation
  //    on inner Webflow components doesn't swallow the event)
  document.addEventListener("click", handleClick, true);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTracking);
} else {
  initTracking();
}
