// Controlled in global header
const enableLogging = window.enableLogging;

// Helper functions
function toPlainLower(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9&.\-_, |]+/g, "");
}

function getUrlSegment(index) {
  const segments = location.pathname.split("/").filter(Boolean);
  const segment = segments[index - 1] || "";
  return segment.split(".")[0];
}

function getErrorInfo() {
  const errorCodeMap = {
    400: "bad request",
    401: "unauthorized",
    403: "forbidden",
    404: "not found",
    500: "internal server error",
    502: "bad gateway",
    503: "service unavailable",
    504: "gateway timeout",
  };

  const pageTitle = document.title.toLowerCase();
  const titleErrorPatterns = [
    { pattern: /404|not found/, code: 404 },
    { pattern: /403|forbidden/, code: 403 },
    { pattern: /401|unauthorized/, code: 401 },
    { pattern: /400|bad request/, code: 400 },
    { pattern: /500|internal server error/, code: 500 },
    { pattern: /502|bad gateway/, code: 502 },
    { pattern: /503|service unavailable/, code: 503 },
    { pattern: /504|gateway timeout/, code: 504 },
  ];

  for (const { pattern, code } of titleErrorPatterns) {
    if (pattern.test(pageTitle)) {
      return {
        code: code.toString(),
        label: errorCodeMap[code] || `error ${code}`,
      };
    }
  }

  return null;
}

// Categories that represent article verticals - we don't want to double track
const ARTICLE_CATEGORIES = new Set([
  "expert-advice",
  "healthy-living",
  "research-innovations",
  "community-impact",
  "international",
]);

// Identify article-detail URLs only (keep tracking on category/landing pages)
function isArticleDetail(url = location) {
  const parts = url.pathname
    .replace(/(^\/+|\/+$)/g, "")
    .split("/")
    .filter(Boolean);
  if (parts[0] !== "stories-and-insights") return false;
  const category = parts[1] || "";
  if (!ARTICLE_CATEGORIES.has(category)) return false;

  // slug exists -> likely a detail page
  const slug = parts[2];
  if (!slug) return false;

  // ignore common non-detail segments
  const NON_DETAIL = new Set(["page", "tag", "category", "topics", "author", "archive"]);
  return !NON_DETAIL.has(slug);
}

function getUserECID() {
  if (typeof Visitor !== "undefined" && Visitor.getInstance) {
    return Visitor.getInstance("cedarssinai")?.getMarketingCloudVisitorID?.();
  }
  return undefined;
}

// Track page views for non-article detail pages
if (!isArticleDetail()) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const errorInfo = getErrorInfo();
  const pageViewData = {
    event: "pageView",
    userECID: getUserECID(),
    navigation: {
      domain: location.hostname,
      // section = first segment (e.g. "stories-and-insights")
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
    pageTitle: (() => {
      const h1 = document.querySelector("h1");
      return h1 ? toPlainLower(h1.textContent) : toPlainLower(document.title);
    })(),
    eventTimestamp: Date.now(),
  };

  if (errorInfo) {
    pageViewData.errors = errorInfo;
  }

  adobeDataLayer.push(pageViewData);

  if (enableLogging) {
    console.log(`DataLayer for ${window.location.href}:`, JSON.stringify(pageViewData, null, 2));
  }
}

// Track clicks on links, buttons, and elements with [data-track-click] =============================
function handleAnalyticsClick(event) {
  // Prevent duplicate processing of the same event
  if (event._adobeProcessed) {
    return;
  }
  event._adobeProcessed = true;

  const clickedElement = event.target.closest("a, button, [data-track-click]");

  if (!clickedElement) {
    return;
  }

  // --- Dynamic Data Collection Basics ---
  const linkHref = clickedElement.getAttribute("href") || "";
  const rawLinkText = clickedElement.innerText || clickedElement.getAttribute("aria-label") || "";
  const linkText = toPlainLower(rawLinkText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim());
  const isTel = linkHref.startsWith("tel:");
  const isMailto = linkHref.startsWith("mailto:");
  const isHttp = linkHref.startsWith("http");
  const isExternalHost = isHttp && !linkHref.includes(window.location.hostname);
  const isExternal = isTel || isMailto || isExternalHost;
  const componentName = (
    clickedElement.closest("[data-component-name]")?.getAttribute("data-component-name") || ""
  ).toLowerCase();
  const componentTitle = toPlainLower(
    clickedElement.closest("[data-component-title]")?.getAttribute("data-component-title") || "",
  );
  const linkAction = (clickedElement.getAttribute("data-link-action") || "link").toLowerCase();
  const linkType = (clickedElement.getAttribute("data-link-type") || "cta").toLowerCase();
  //TODO: Add section tag back in if client needs it
  // const sectionTag = clickedElement.getAttribute("data-section") || ""; // For Article/Related tags
  let eventData = {};

  // --- Component-Specific Tracking Logic ---
  if (componentName === "article grid") {
    eventData = {
      event: "click",
      componentName: "article grid",
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: "link",
      linkText: linkText,
      // section: sectionTag,
      linkType: linkType,
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'article grid':", eventData);
    }
  } else if (componentName === "related articles") {
    eventData = {
      event: "click",
      componentName: "related articles",
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: "link",
      linkText: linkText,
      // section: sectionTag,
      linkType: "cta",
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'related articles':", eventData);
    }
  } else if (componentName === "product ad") {
    eventData = {
      event: "click",
      componentName: "product ad",
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: "link",
      linkText: linkText,
      // section: sectionTag,
      linkType: "cta",
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'product ad':", eventData);
    }
  } else if (componentName === "color card") {
    eventData = {
      event: "click",
      componentName: "color card",
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: "link",
      linkText: linkText,
      linkType: "cta",
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'color card':", eventData);
    }
  } else if (componentName === "subscribe") {
    eventData = {
      event: "click",
      componentName: "subscribe",
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: "link",
      linkText: linkText,
      linkType: "cta",
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'subscribe':", eventData);
    }
  } else if (componentName === "topics menu") {
    eventData = {
      event: "click",
      componentName: "topics menu",
      componentTitle: componentTitle,
      clickHref: linkHref, // clickHref instead as per docs
      isExternalLink: isExternal,
      linkAction: linkAction,
      linkText: linkText,
      linkType: "cta",
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'topics menu':", eventData);
    }
  } else if (componentName === "pagination") {
    const paginationLinkText = clickedElement.getAttribute("data-link-text") || "";
    eventData = {
      event: "click",
      componentName: "pagination",
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: "link",
      linkText: paginationLinkText
        ? toPlainLower(paginationLinkText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
        : linkText,
      linkType: "cta",
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'pagination':", eventData);
    }
  }
  // --- GENERIC/FALLBACK CLICK TRACKING ---
  else if (componentName) {
    // If it has a componentName but no specific template, use the generic format
    eventData = {
      event: "click",
      componentName: componentName,
      componentTitle: componentTitle,
      linkHref: linkHref,
      isExternalLink: isExternal,
      linkAction: linkAction,
      linkText: linkText,
      linkType: linkType,
      eventTimestamp: Date.now(),
    };
    if (enableLogging) {
      console.log("Tracking event 'generic':", eventData);
    }
  }

  // Push the determined event data if an event object was created
  if (eventData.event) {
    adobeDataLayer.push(eventData);
    if (enableLogging) {
      console.log(
        `DataLayer for ${window.location.href}:`,
        JSON.stringify(adobeDataLayer, null, 2),
      );
    }
  }
}

// Track product ad impressions ==============================
function trackProductAdImpressions({
  selector = '[data-component-name="product ad"]',
  placementAttr = "data-impression-placement", // e.g. "first"|"second"|"third"
  creativeAttr = "data-impression-creative", // e.g. "sign-up for email"
  contentAttr = "data-impression-content", // optional variant
} = {}) {
  const seen = new WeakSet();
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.intersectionRatio >= 0.75 && !seen.has(e.target)) {
          seen.add(e.target);
          const el = e.target;
          const placement = toPlainLower(el.getAttribute(placementAttr) || "");
          const creative = toPlainLower(el.getAttribute(creativeAttr) || "");
          const content = toPlainLower(el.getAttribute(contentAttr) || "");

          window.adobeDataLayer?.push({
            event: "impression",
            eventTimestamp: Date.now(),
            impression: "product ad",
            impressionPlacement: placement || "", // "first"/"second"/"third"
            impressionCreative: creative || "",
            impressionContent: content || undefined,
          });
        }
      });
    },
    { threshold: [0, 0.75, 1] },
  );

  // TODO: is this needed? Also support legacy attribute from temp.js implementation
  // document.querySelectorAll('[data-track-impression="product ad"]').forEach((el) => obs.observe(el));
  document.querySelectorAll(selector).forEach((el) => obs.observe(el));
}

// Track form loads ==============================
function trackFormLoadsOnView(selector = "form[data-form-name]") {
  const seen = new WeakSet();
  const io = new IntersectionObserver(
    (ents) => {
      ents.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting || seen.has(target)) return;
        seen.add(target);

        const name =
          target.getAttribute("data-form-name") || target.name || target.id || "unnamed-form";
        const app = target.getAttribute("data-app") || "stories-and-insights";

        window.adobeDataLayer?.push({
          event: "form",
          eventTimestamp: Date.now(),
          form: { action: "load", application: app, name },
        });
      });
    },
    { threshold: 0.01 },
  );

  document.querySelectorAll(selector).forEach((f) => io.observe(f));
}

// Form interaction tracking ==============================
function pushAdobeFormEvent({
  eventType, // "input" | "submit" | "focus" | "blur" | "error" | etc
  application, // e.g. "stories-and-insights"
  action = "interaction", // your taxonomy
  formName, // e.g. "subscribe"
  fieldName, // input name/id
  fieldValue, // captured value (masked if enabled)
  extra = {}, // any extra fields you want to add
}) {
  const payload = {
    event: "form",
    eventTimestamp: Date.now(),
    form: {
      action,
      application,
      name: formName,
    },
    eventType,
    fieldName,
    fieldValue,
    ...extra,
  };

  window.adobeDataLayer.push(payload);
}

// Simple PII masking based on field name/type heuristics ==============================
function maskValueIfPII(name, type, value, maskPII) {
  if (!maskPII) return value;

  const n = (name || "").toLowerCase();
  const t = (type || "").toLowerCase();

  const looksEmail = /email/.test(n) || t === "email" || /\S+@\S+\.\S+/.test(value);
  const looksPhone = /phone|mobile|tel/.test(n) || t === "tel";
  const looksName = /name|firstname|lastname|first_name|last_name/.test(n);

  if (looksEmail) return "[email]";
  if (looksPhone) return "[phone]";
  if (looksName) return "[name]";
  return value;
}

// Read a field's current value in a normalized way ==============================
function readFieldValue(input) {
  if (!input) return undefined;

  const tag = input.tagName.toLowerCase();
  const type = (input.type || "").toLowerCase();

  if (tag === "select") {
    if (input.multiple) {
      return Array.from(input.selectedOptions).map((o) => o.value);
    }
    return input.value;
  }

  if (type === "checkbox") {
    // If a group (same name) -> collect all checked
    const group = input.form
      ? input.form.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(input.name)}"]`)
      : [input];
    const checked = Array.from(group)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value || true);
    return input.name && group.length > 1 ? checked : input.checked;
  }

  if (type === "radio") {
    // Selected radio value in the group
    const checked = input.form?.querySelector(
      `input[type="radio"][name="${CSS.escape(input.name)}"]:checked`,
    );
    return checked ? checked.value : null;
  }

  if (type === "file") {
    // Do NOT send file names
    return input.files?.length ? "[file-selected]" : "[no-file]";
  }

  // Text-like inputs & textarea
  return input.value;
}

// Attach listeners to one form (or all, if root provided) ==============================

/**
 * Options:
 *  - application: default application name
 *  - maskPII: boolean (default true)
 *  - formNameAttr: attribute that overrides form name (default: data-form-name)
 *  - appAttr: attribute that overrides application (default: data-app)
 *  - selector: custom form selector (default: 'form')
 *  - sendValues: boolean (default false) - whether to send field values on input/change
 */
function attachFormTracking(
  root = document,
  {
    application = "stories-and-insights",
    maskPII = true,
    formNameAttr = "data-form-name",
    appAttr = "data-app",
    selector = "form",
    sendValues = false,
  } = {},
) {
  const forms = root.querySelectorAll(selector);
  forms.forEach((form) => {
    const derivedFormName =
      form.getAttribute(formNameAttr) || form.getAttribute("name") || form.id || "unnamed-form";

    const derivedApp = form.getAttribute(appAttr) || application;

    // Focus/Blur + Input/Change on fields
    const fields = form.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      const fieldName =
        field.name || field.id || field.getAttribute("data-field") || "unnamed-field";
      const fieldType = (field.type || field.tagName).toLowerCase();

      field.addEventListener("focus", () => {
        pushAdobeFormEvent({
          eventType: "focus",
          application: derivedApp,
          action: "interaction",
          formName: derivedFormName,
          fieldName,
        });
      });

      field.addEventListener("blur", () => {
        pushAdobeFormEvent({
          eventType: "blur",
          application: derivedApp,
          action: "interaction",
          formName: derivedFormName,
          fieldName,
        });
      });

      // focus/blur (already below), "open" for selects, "toggle" for checkboxes/radios.
      if (field.tagName.toLowerCase() === "select") {
        const openEvent = () => {
          pushAdobeFormEvent({
            eventType: "open",
            application: derivedApp,
            action: "interaction",
            formName: derivedFormName,
            fieldName,
          });
        };
        // Use mousedown/pointerdown instead of click to catch before the native open
        field.addEventListener("mousedown", openEvent, { passive: true });
        field.addEventListener("pointerdown", openEvent, { passive: true });
        field.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
            openEvent();
          }
        });
      }
      if (/^(checkbox|radio)$/i.test(fieldType)) {
        field.addEventListener("change", () => {
          pushAdobeFormEvent({
            eventType: "toggle",
            application: derivedApp,
            action: "interaction",
            formName: derivedFormName,
            fieldName,
          });
        });
      }
    });
  });
}

// Helpers for uniform payloads ==================================
function pushFormOutcome({ application, name, submitStatus, errors }) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const payload = {
    event: "form",
    eventTimestamp: Date.now(),
    form: {
      action: "submit",
      application,
      name, // e.g subscribe
      submitStatus, // true or false
    },
  };
  if (errors) payload.form.errors = errors;
  window.adobeDataLayer.push(payload);
}

// Extract errors from a jQuery Validate validator instance
function collectClientErrorsFromValidator(validator) {
  const labels = validator.errorList.map((e) => {
    const el = e.element;
    const raw = e.message || "This field is required.";
    return raw.trim();
  });
  return { label: labels, location: "form" };
}

// Outcome tracking attach ===================================
function attachFormOutcomeTracking(
  form,
  { application = "stories-and-insights", formNameAttr = "data-form-name" } = {},
) {
  const name =
    form.getAttribute(formNameAttr) || form.getAttribute("name") || form.id || "unnamed-form";

  // A small flag so our global AJAX hooks know which form triggered the call.
  let awaitingAjaxForThisForm = false; // cleared out when we see success/fail

  // First Hook into jQuery Validate (client-side error + submit start)
  if (window.jQuery && jQuery.fn.validate) {
    const $form = jQuery(form);

    // Extend the existing validator on this form (or create one if missing)
    const validator = $form.data("validator") || $form.validate({});

    // Client-side invalid (your existing invalidHandler will still run)
    const originalInvalid = validator.settings.invalidHandler;
    validator.settings.invalidHandler = function (event, v) {
      try {
        const errors = collectClientErrorsFromValidator(v);
        pushFormOutcome({
          application,
          name,
          submitStatus: false,
          errors,
        });
      } finally {
        if (typeof originalInvalid === "function") {
          originalInvalid.call(this, event, v);
        }
      }
    };

    // When the form is valid and is about to submit
    const originalSubmitHandler = validator.settings.submitHandler;
    validator.settings.submitHandler = (f) => {
      // Mark that we expect one AJAX round-trip for this form
      awaitingAjaxForThisForm = true;

      // Push a submit attempt event
      window.adobeDataLayer.push({
        event: "form",
        eventTimestamp: Date.now(),
        form: { action: "submit-start", application, name },
      });

      // Let the form actually submit (Webflow/jQuery will AJAX it)
      if (typeof originalSubmitHandler === "function") {
        return originalSubmitHandler(f);
      } else {
        f.submit(); // default behavior if you didn't override submitHandler
      }
    };
  } else {
    // No jQuery Validate present — at least mark that a submit happened
    form.addEventListener(
      "submit",
      () => {
        awaitingAjaxForThisForm = true;
      },
      { capture: true },
    );
  }

  // Fallback: observe Webflow success/fail toggles
  const observer = new MutationObserver((_mutations) => {
    // Success element
    const done = form.parentElement?.querySelector(".w-form-done");
    const fail = form.parentElement?.querySelector(".w-form-fail");

    // If either has become visible, record an outcome.
    if (awaitingAjaxForThisForm) {
      const doneVisible = done && isShown(done);
      const failVisible = fail && isShown(fail);

      if (doneVisible) {
        awaitingAjaxForThisForm = false;
        pushFormOutcome({ application, name, submitStatus: true });
      } else if (failVisible) {
        awaitingAjaxForThisForm = false;
        // Try to read any error text
        const txt = (fail.textContent || "").trim();
        pushFormOutcome({
          application,
          name,
          submitStatus: false,
          errors: {
            label: txt ? [txt] : ["Submission failed"],
            location: "form",
          },
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function isShown(el) {
    const s = window.getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden";
  }
}

// Keep track of forms we've already bound to avoid double-binding
const __outcomeBound = new WeakSet();
function initOutcomeTrackingOnAllForms({
  defaultApplication = "stories-and-insights",
  formNameAttr = "data-form-name",
  appAttr = "data-app",
} = {}) {
  const bind = (form) => {
    if (!(form instanceof HTMLFormElement)) return;
    if (__outcomeBound.has(form)) return;
    const hasNameAttr = form.hasAttribute(formNameAttr);

    if (!hasNameAttr) return; // Only bind forms that declare a form name

    // Per-form app override
    const application = form.getAttribute(appAttr) || defaultApplication;

    attachFormOutcomeTracking(form, {
      application,
      formNameAttr,
    });

    __outcomeBound.add(form);
  };

  // Bind existing
  document.querySelectorAll(`form[${formNameAttr}]`).forEach(bind);

  // Bind future Webflow often injects forms late in its lifecycle
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(`form[${formNameAttr}]`)) bind(node);
        node.querySelectorAll?.(`form[${formNameAttr}]`).forEach(bind);
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

// On DOM ready, initialise all tracking
document.addEventListener("DOMContentLoaded", () => {
  // Attach click listener for link/button/component tracking
  document.body.addEventListener("click", handleAnalyticsClick);

  // Track form loads when they come into view
  trackFormLoadsOnView();

  // Initialise general form tracking (all forms on page) - no values
  attachFormTracking(document, {
    application: "stories-and-insights",
    sendValues: false,
  });

  // Track ad impressions in product ad components
  trackProductAdImpressions();

  // Outcome tracking for all declared forms
  initOutcomeTrackingOnAllForms({
    defaultApplication: "stories-and-insights",
    formNameAttr: "data-form-name",
    appAttr: "data-app",
  });
});
