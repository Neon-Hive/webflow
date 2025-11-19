function decodeHtmlEntities(str) {
  if (!str) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

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

function getUserECID() {
  if (typeof Visitor !== "undefined" && Visitor.getInstance) {
    return Visitor.getInstance("cedarssinai")?.getMarketingCloudVisitorID?.();
  }
  return undefined;
}

// Wait for Visitor API to be ready and return ECID
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

document.addEventListener("DOMContentLoaded", () => {
  const blogTags = Array.from(
    document.querySelectorAll("[data-adobe-tags-list] [data-component-title]"),
  )
    .map((el) => toPlainLower(el.getAttribute("data-component-title")))
    .filter(Boolean)
    .join("|");

  let totalWords = 0;
  const richTextContainer = document.querySelector("[data-n4-rich-text]");

  if (richTextContainer) {
    const combinedText = richTextContainer.textContent || "";
    totalWords = combinedText.split(/\s+/).filter(Boolean).length;
  }

  const blogLength = totalWords > 0 ? Math.round(totalWords / 100) * 100 : 0;

  // This include the Providers and the CTAs cards
  const blogProductAds = Array.from(
    document.querySelectorAll("[data-cta-type='provider'], [data-cta-type='cta']"),
  )
    .map((el) => {
      return toPlainLower(el.getAttribute("data-cta-name")?.trim());
    })
    .filter(Boolean)
    .join("|");

  // // Webflow CMS Data
  // const webflowCMSData = {
  //   blogCategory:
  //     "{{wf {&quot;path&quot;:&quot;new-collection&quot;,&quot;type&quot;:&quot;Option&quot;} }}",
  //   blogPrimaryTopic:
  //     "{{wf {&quot;path&quot;:&quot;topic:name&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}",
  //   blogPublishDate:
  //     "{{wf {&quot;path&quot;:&quot;datefirstpubished&quot;,&quot;transformers&quot;:[{&quot;name&quot;:&quot;date&quot;,&quot;arguments&quot;:[&quot;MMM DD, YYYY&quot;]}],&quot;type&quot;:&quot;Date&quot;} }}",
  //   blogModifiedDate:
  //     "{{wf {&quot;path&quot;:&quot;updated-on&quot;,&quot;transformers&quot;:[{&quot;name&quot;:&quot;date&quot;,&quot;arguments&quot;:[&quot;MMM DD, YYYY&quot;]}],&quot;type&quot;:&quot;Date&quot;} }}",
  //   blogAuthor:
  //     "{{wf {&quot;path&quot;:&quot;lead-author:name&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}",
  // };

  // Track page views for article pages - wait for ECID
  getUserECIDAsync().then((userECID) => {
    const pageViewData = {
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
      pageTitle: (() => {
        const h1 = document.querySelector("h1");
        return h1 ? toPlainLower(h1.textContent) : toPlainLower(document.title);
      })(),
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

    adobeDataLayer.push(pageViewData);

    if (enableLogging) {
      console.log(`DataLayer for ${window.location.href}:`, JSON.stringify(pageViewData, null, 2));
    }
  });

  // Track richtext content block text links
  const richtextContainer = document.querySelector("[data-n4-rich-text='true']");
  if (richtextContainer) {
    // Get article title - try h1 first
    const articleTitleEl = document.querySelector("h1");
    const articleTitle = articleTitleEl
      ? articleTitleEl.textContent.trim()
      : document.title.split(" | ")[0] || document.title;

    // Track all links within the richtext content area
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

      // Determine linkType based on parent element text like "Read:" in parent <p> tag
      let linkType = "cta";
      const parentElement = link.parentElement;
      if (parentElement) {
        // Get the text content of the parent element includes "Read:" if present
        const parentText = parentElement.textContent.trim();
        const normalizedParentText = parentText.toLowerCase();
        if (normalizedParentText.startsWith("read:")) {
          linkType = "primary cta";
        } else if (rawLinkText.trim()) {
          linkType = "secondary cta";
        }
      } else if (rawLinkText.trim()) {
        linkType = "secondary cta";
      }

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
});
