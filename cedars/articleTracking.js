// Note: webflowCMSData comes from global var.

// Decode HTML entities ==============================
function decodeHtmlEntities(str) {
  if (!str) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

// Convert string to plain lower case ==============================
function toPlainLower(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9&.\-_, |]+/g, "");
}

// Get URL segment ==============================
function getUrlSegment(index) {
  const segments = location.pathname.split("/").filter(Boolean);
  const segment = segments[index - 1] || "";
  return segment.split(".")[0];
}

// Get User ECID ==============================
function getUserECID() {
  if (typeof Visitor !== "undefined" && Visitor.getInstance) {
    return Visitor.getInstance("cedarssinai")?.getMarketingCloudVisitorID?.();
  }
  return undefined;
}

// Wait for Visitor API to be ready and return ECID ==============================
function getUserECIDAsync(maxWaitMs = 5000, pollIntervalMs = 100) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkECID = () => {
      const ecid = getUserECID();
      if (ecid) {
        resolve(ecid);
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitMs) {
        // Timeout reached, resolve with undefined
        resolve(undefined);
        return;
      }

      // Continue polling
      setTimeout(checkECID, pollIntervalMs);
    };

    // Start checking immediately
    checkECID();
  });
}

// Get blog tags from page ==============================
function getBlogTags() {
  return Array.from(document.querySelectorAll("[data-adobe-tags-list] [data-component-title]"))
    .map((el) => toPlainLower(el.getAttribute("data-component-title")))
    .filter(Boolean)
    .join("|");
}

// Calculate blog length from rich text content ==============================
function getBlogLength() {
  const richTextContainer = document.querySelector("[data-n4-rich-text]");
  if (!richTextContainer) return 0;

  const combinedText = richTextContainer.textContent || "";
  const totalWords = combinedText.split(/\s+/).filter(Boolean).length;
  return totalWords > 0 ? Math.round(totalWords / 100) * 100 : 0;
}

// Set data-section values for CTA and provider elements ==============================
function setCtaSectionAttributes() {
  const ctaList = document.querySelector("[data-cta-list]");
  if (!ctaList) return;

  const allCtaItems = ctaList.querySelectorAll("[data-cta-type='provider'], [data-cta-type='cta']");
  const sectionLabels = ["first", "second", "third", "fourth", "fifth"];

  allCtaItems.forEach((el, index) => {
    if (index >= sectionLabels.length) return;

    const ctaType = el.getAttribute("data-cta-type");
    const sectionValue = sectionLabels[index];

    if (ctaType === "provider") {
      // For provider type, set data-section on the button inside
      const button = el.querySelector("[data-component-name='product ad']");
      if (button) {
        button.setAttribute("data-section", sectionValue);
      }
    } else if (ctaType === "cta") {
      // For CTA type, set data-section on the main link (the one with data-component-name="product ad")
      const mainLink = el.querySelector("a[data-component-name='product ad']");
      if (mainLink) {
        mainLink.setAttribute("data-section", sectionValue);
      }
    }
  });
}

// Get blog product ads list ==============================
function getBlogProductAds() {
  return Array.from(document.querySelectorAll("[data-cta-type='provider'], [data-cta-type='cta']"))
    .map((el) => toPlainLower(el.getAttribute("data-cta-name")?.trim()))
    .filter(Boolean)
    .join("|");
}

// Get page title ==============================
function getPageTitle() {
  const h1 = document.querySelector("h1");
  return h1 ? toPlainLower(h1.textContent) : toPlainLower(document.title);
}

// Create page view data object ==============================
function createPageViewData(userECID, blogTags, blogLength, blogProductAds) {
  return {
    event: "pageView",
    ecid: userECID || undefined,
    navigation: {
      domain: location.hostname,
      siteSection: getUrlSegment(1),
      siteSubsection1: getUrlSegment(2),
      siteSubsection2: getUrlSegment(3),
      siteSubsection3: getUrlSegment(4),
      siteSubsection4: getUrlSegment(5),
      pageURL: location.href,
      refURL: document.referrer || "",
    },
    pageName:
      "cs-org:cedars-sinai:" + location.pathname.substring(1).replaceAll("/", ":").split(".")[0],
    pageTitle: getPageTitle(),
    eventTimestamp: Date.now(),
    blog: {
      blogCategory: toPlainLower(decodeHtmlEntities(webflowCMSData.blogCategory)),
      blogPrimaryTopic: toPlainLower(decodeHtmlEntities(webflowCMSData.blogPrimaryTopic)),
      blogTags,
      blogPublishDate: toPlainLower(decodeHtmlEntities(webflowCMSData.blogPublishDate)),
      blogModifiedDate: toPlainLower(decodeHtmlEntities(webflowCMSData.blogModifiedDate)),
      blogAuthor: toPlainLower(decodeHtmlEntities(webflowCMSData.blogAuthor)),
      blogLength,
      blogProductAds,
    },
  };
}

// Track page view ==============================
function trackPageView(blogTags, blogLength, blogProductAds) {
  getUserECIDAsync().then((userECID) => {
    const pageViewData = createPageViewData(userECID, blogTags, blogLength, blogProductAds);

    adobeDataLayer.push(pageViewData);

    if (enableLogging) {
      console.log(`DataLayer for ${window.location.href}:`, JSON.stringify(pageViewData, null, 2));
    }
  });
}

// Determine link type based on parent text ==============================
function getLinkType(link) {
  const rawLinkText = link.textContent.trim() || link.getAttribute("aria-label") || "";
  const parentElement = link.parentElement;

  if (!parentElement) {
    return rawLinkText.trim() ? "secondary cta" : "cta";
  }

  const parentText = parentElement.textContent.trim();
  const normalizedParentText = parentText.toLowerCase();

  if (normalizedParentText.startsWith("read:")) {
    return "primary cta";
  }

  return rawLinkText.trim() ? "secondary cta" : "cta";
}

// Track richtext content block text links ==============================
function trackRichtextLinks() {
  const richtextContainer = document.querySelector("[data-n4-rich-text='true']");
  if (!richtextContainer) return;

  const articleTitleEl = document.querySelector("h1");
  const articleTitle = articleTitleEl
    ? articleTitleEl.textContent.trim()
    : document.title.split(" | ")[0] || document.title;

  richtextContainer.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const linkHref = (link.getAttribute("href") || "").trim();
    if (!linkHref) return;

    const rawLinkText = link.textContent.trim() || link.getAttribute("aria-label") || "";
    const linkText = toPlainLower(rawLinkText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim());

    const isTel = linkHref.startsWith("tel:");
    const isMailto = linkHref.startsWith("mailto:");
    const isHttp = /^https?:\/\//i.test(linkHref);
    const isExternalHost = isHttp && !linkHref.includes(location.hostname);
    const isExternalLink = isTel || isMailto || isExternalHost;

    const linkType = getLinkType(link);
    const articleTitleLower = toPlainLower(articleTitle);

    const eventData = {
      event: "click",
      componentName: "content block text",
      componentTitle: articleTitleLower,
      linkHref,
      isExternalLink,
      linkAction: "link",
      linkText,
      linkType,
      eventTimestamp: Date.now(),
    };

    adobeDataLayer.push(eventData);

    if (enableLogging) {
      console.log(`DataLayer for ${window.location.href}:`, JSON.stringify(eventData, null, 2));
    }
  });
}

// Track product ad impressions on scroll ==============================
function trackProductAdImpressions({
  selector = '[data-cta-type="product ad"], [data-cta-type="provider"]',
  placementAttr = "data-section",
  creativeAttr = "data-impression-creative",
  contentAttr = "data-impression-content",
} = {}) {
  const seen = new WeakSet();
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.intersectionRatio >= 0.75 && !seen.has(e.target)) {
          seen.add(e.target);
          const el = e.target;

          let placement = "";
          if (el.getAttribute("data-cta-type") === "provider") {
            const button = el.querySelector('[data-component-name="product ad"]');
            placement = button ? toPlainLower(button.getAttribute(placementAttr) || "") : "";
          } else {
            placement = toPlainLower(el.getAttribute(placementAttr) || "");
          }

          const creative = toPlainLower(el.getAttribute(creativeAttr) || "");
          const content = toPlainLower(el.getAttribute(contentAttr) || "");

          window.adobeDataLayer?.push({
            event: "impression",
            eventTimestamp: Date.now(),
            impression: "product ad",
            impressionPlacement: placement || "",
            impressionCreative: creative || "",
            impressionContent: content || "",
          });
        }
      });
    },
    { threshold: [0, 0.75, 1] },
  );

  document.querySelectorAll(selector).forEach((el) => obs.observe(el));
}

// Initialize article tracking ==============================
document.addEventListener("DOMContentLoaded", () => {
  const blogTags = getBlogTags();
  const blogLength = getBlogLength();
  const blogProductAds = getBlogProductAds();

  // Set data-section attributes after a delay to ensure richtext is loaded
  // Then set up impression tracking to ensure data-section values are available
  setTimeout(() => {
    setCtaSectionAttributes();
    trackProductAdImpressions();
  }, 1000);

  // Track page view
  trackPageView(blogTags, blogLength, blogProductAds);

  // Track richtext links
  trackRichtextLinks();
});
