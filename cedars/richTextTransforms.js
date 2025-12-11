document.addEventListener("DOMContentLoaded", () => {
  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) return;

  handleRichTextColumns();
  ensureProviderMarker();
  handleCtaBlocks();

  let ctaState = window.innerWidth <= 991;
  let scrollTriggerInitialized = false;

  if (window.innerWidth > 991) {
    gsap.registerPlugin(ScrollTrigger);
    initializeCtaScrollTrigger();
    scrollTriggerInitialized = true;
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    const shouldShowCtas = window.innerWidth <= 991;

    clearTimeout(resizeTimeout);

    if (shouldShowCtas !== ctaState) {
      ctaState = shouldShowCtas;
      handleCtaBlocks();
    }

    if (!shouldShowCtas) {
      resizeTimeout = setTimeout(() => {
        if (scrollTriggerInitialized) {
          cleanupScrollTrigger();
        }
        hideCtaBlocks();
        gsap.registerPlugin(ScrollTrigger);
        initializeCtaScrollTrigger();
        scrollTriggerInitialized = true;
      }, 100);
    } else if (scrollTriggerInitialized) {
      cleanupScrollTrigger();
      scrollTriggerInitialized = false;
    }

    handleRichTextColumns();
    ensureProviderMarker();
  });
});

function cleanupScrollTrigger() {
  providerScrollTriggers.forEach((trigger) => {
    if (trigger && trigger.kill) {
      trigger.kill();
    }
  });
  providerScrollTriggers.length = 0;

  const ctaListContainer = document.querySelector("[data-cta-list]");
  if (ctaListContainer) {
    const items = ctaListContainer.querySelectorAll(
      "[data-cta-type='cta'], [data-cta-type='provider-list']",
    );
    items.forEach((item) => {
      item.style.position = "";
      item.style.left = "";
      item.style.right = "";
      item.style.top = "";
      item.style.zIndex = "";
    });

    ctaListContainer.style.position = "";
  }
}

function handleRichTextColumns() {
  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) {
    return;
  }

  const html = richText.innerHTML;
  const columnBlockRegex = /<p>\{\{column-start\}\}<\/p>([\s\S]*?)<p>\{\{column-end\}\}<\/p>/g;

  columnBlockRegex.lastIndex = 0;

  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = columnBlockRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "regular",
        content: html.slice(lastIndex, match.index),
      });
    }
    blocks.push({
      type: "column",
      content: match[1].trim(),
    });
    lastIndex = columnBlockRegex.lastIndex;
  }
  if (lastIndex < html.length) {
    blocks.push({
      type: "regular",
      content: html.slice(lastIndex),
    });
  }

  let output = "";
  let columnGroup = [];
  blocks.forEach((block) => {
    if (block.type === "column") {
      columnGroup.push(`<div class="richtext-col">${block.content}</div>`);
    } else {
      const cleaned = block.content
        .replace(/<p>(\s|&nbsp;|&zwj;|<br\s*\/?>)*<\/p>/gi, "")
        .replace(/<br\s*\/?>/gi, "")
        .replace(/&nbsp;/gi, "")
        .replace(/&zwj;/gi, "")
        .replace(/\s+/g, "");

      if (cleaned.length > 0) {
        if (columnGroup.length) {
          output += `<div class="richtext-grid">${columnGroup.join("")}</div>`;
          columnGroup = [];
        }
        output += block.content;
      }
    }
  });
  if (columnGroup.length) {
    output += `<div class="richtext-grid">${columnGroup.join("")}</div>`;
  }

  richText.innerHTML = output;
}

function handleCtaBlocks() {
  ensureProviderMarker();
  // Mobile: show CTAs inline; Desktop: use sticky positioning
  const isMobile = window.innerWidth <= 991;

  if (isMobile) {
    showCtaBlocks();
  } else {
    hideCtaBlocks();
  }
}

function showCtaBlocks() {
  const regularCtaItems = Array.from(document.querySelectorAll("[data-cta-type='cta']"));
  const providerListWrapper = document.querySelector("[data-cta-type='provider-list']");
  const ctaBlockMarkers = Array.from(document.querySelectorAll("p")).filter(
    (p) => p.textContent.trim() === "{{cta-block}}",
  );

  // Display one CTA per marker (1:1 mapping)
  let ctaIndex = 0;

  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();

    if (text === "{{cta-block}}") {
      const markerIndex = ctaBlockMarkers.indexOf(p);
      if (markerIndex >= 0 && ctaIndex < regularCtaItems.length) {
        const regularItem = regularCtaItems[ctaIndex];
        if (regularItem && !regularItem.hasAttribute("data-mobile-cloned")) {
          const clonedCta = regularItem.cloneNode(true);
          clonedCta.classList.add("is-mobile-cta");
          clonedCta.removeAttribute("data-cta-type");

          clonedCta.style.position = "";
          clonedCta.style.left = "";
          clonedCta.style.right = "";
          clonedCta.style.top = "";
          clonedCta.style.zIndex = "";

          p.parentNode.insertBefore(clonedCta, p.nextSibling);
          regularItem.setAttribute("data-mobile-cloned", "true");
          ctaIndex++;
        }
      }
    }

    if (text === "{{providers}}") {
      if (providerListWrapper && !providerListWrapper.hasAttribute("data-mobile-cloned")) {
        const clonedProviders = providerListWrapper.cloneNode(true);
        clonedProviders.classList.add("is-mobile-cta");
        clonedProviders.removeAttribute("data-cta-type");

        clonedProviders.style.position = "";
        clonedProviders.style.left = "";
        clonedProviders.style.right = "";
        clonedProviders.style.top = "";
        clonedProviders.style.zIndex = "";

        p.parentNode.insertBefore(clonedProviders, p.nextSibling);
        providerListWrapper.setAttribute("data-mobile-cloned", "true");
      }
    }
  });
}

function hideCtaBlocks() {
  const mobileCtas = document.querySelectorAll(".is-mobile-cta");
  mobileCtas.forEach((cta) => {
    cta.remove();
  });

  document.querySelectorAll("[data-mobile-cloned]").forEach((item) => {
    item.removeAttribute("data-mobile-cloned");
  });

  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();
    if (text === "{{cta-block}}" || text === "{{providers}}") {
      p.style.visibility = "hidden";
      p.style.marginBottom = "-2rem";
    }
  });
}

const providerScrollTriggers = [];

function ensureProviderMarker() {
  const providerList = document.querySelector("[data-cta-type='provider-list']");
  if (!providerList) return;

  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) return;

  const hasMarker = Array.from(richText.querySelectorAll("p")).some(
    (p) => p.textContent.trim() === "{{providers}}",
  );
  if (hasMarker) return;

  const paragraphs = Array.from(richText.querySelectorAll("p"));
  if (!paragraphs.length) return;

  const firstCtaMarker = paragraphs.find((p) => p.textContent.trim() === "{{cta-block}}");
  if (!firstCtaMarker) return;

  // Insert marker at least 3 paragraphs deep to avoid overlap with first CTA
  const fallbackIndex = Math.min(4, paragraphs.length - 1);
  const fallbackParagraph = paragraphs[fallbackIndex];
  const insertionTarget =
    paragraphs.indexOf(firstCtaMarker) >= fallbackIndex ? firstCtaMarker : fallbackParagraph;

  const marker = document.createElement("p");
  marker.textContent = "{{providers}}";
  marker.setAttribute("data-generated-provider-marker", "true");
  insertionTarget.parentNode.insertBefore(marker, insertionTarget.nextSibling);
}

function initializeCtaScrollTrigger() {
  const ctaListContainer = document.querySelector("[data-cta-list]");
  if (!ctaListContainer) return;
  ensureProviderMarker();

  const regularCtaItems = Array.from(document.querySelectorAll("[data-cta-type='cta']"));
  const providerListWrapper = document.querySelector("[data-cta-type='provider-list']");

  const allItems = [];

  regularCtaItems.forEach((item) => {
    allItems.push({
      element: item,
      type: "cta",
      marker: null,
      height: 280,
    });
  });

  if (providerListWrapper) {
    allItems.push({
      element: providerListWrapper,
      type: "provider-list",
      marker: null,
      height: null,
    });
  }

  const ctaBlockMarkers = [];
  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();

    if (text === "{{cta-block}}") {
      ctaBlockMarkers.push(p);
    }

    if (text === "{{providers}}") {
      const providerItem = allItems.find((item) => item.type === "provider-list" && !item.marker);
      if (providerItem) {
        providerItem.marker = p;
      }
    }
  });

  const ctaItems = allItems.filter((item) => item.type === "cta");

  // Assign one CTA per marker (1:1 mapping)
  ctaItems.forEach((item, index) => {
    if (index < ctaBlockMarkers.length) {
      item.marker = ctaBlockMarkers[index];
    }
  });

  const itemsWithMarkers = allItems.filter((item) => item.marker);

  itemsWithMarkers.sort((a, b) => {
    const aTop = a.marker.getBoundingClientRect().top + window.pageYOffset;
    const bTop = b.marker.getBoundingClientRect().top + window.pageYOffset;
    return aTop - bTop;
  });

  const allItemsToMove = itemsWithMarkers;

  if (allItemsToMove.length === 0) {
    return;
  }

  allItemsToMove.forEach((item) => {
    ctaListContainer.appendChild(item.element);
  });

  allItemsToMove.forEach((item, index) => {
    item.element.style.position = "absolute";
    item.element.style.left = "0";
    item.element.style.right = "0";
    item.element.style.zIndex = allItemsToMove.length - index;
  });

  setTimeout(() => {
    allItemsToMove.forEach((item) => {
      if (item.type === "provider-list") {
        item.height = item.element.offsetHeight;
      }
    });
    updateCtaPositions();
  }, 50);

  function updateCtaPositions() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const stickyTop = 56;
    const gap = 32;

    const containerRect = ctaListContainer.getBoundingClientRect();
    const containerTop = containerRect.top + scrollTop;

    // Group items by their marker
    const itemsByMarker = new Map();
    itemsWithMarkers.forEach((item) => {
      const markerKey = item.marker;
      if (!itemsByMarker.has(markerKey)) {
        itemsByMarker.set(markerKey, []);
      }
      itemsByMarker.get(markerKey).push(item);
    });

    // Sort markers by position in document
    const markerGroups = Array.from(itemsByMarker.entries()).sort((a, b) => {
      const aTop = a[0].getBoundingClientRect().top + window.pageYOffset;
      const bTop = b[0].getBoundingClientRect().top + window.pageYOffset;
      return aTop - bTop;
    });

    // Track bottom of previous item to prevent overlap
    let previousBottom = Number.NEGATIVE_INFINITY;

    markerGroups.forEach(([marker, items], groupIndex) => {
      const markerRect = marker.getBoundingClientRect();
      const markerTop = markerRect.top + scrollTop;
      const markerRelativeToContainer = markerTop - containerTop;

      const item = items[0];
      if (!item) return;

      const itemHeight = item.height || item.element.offsetHeight;
      let desiredTop = markerRelativeToContainer;
      let shouldBeSticky = false;

      if (scrollTop + stickyTop >= markerTop) {
        const nextGroup = markerGroups[groupIndex + 1];
        if (nextGroup) {
          const nextMarkerTop = nextGroup[0].getBoundingClientRect().top + scrollTop;
          const distanceToNext = nextMarkerTop - (scrollTop + stickyTop);

          if (distanceToNext <= itemHeight + gap) {
            const nextMarkerRelativeToContainer = nextMarkerTop - containerTop;
            desiredTop = nextMarkerRelativeToContainer - itemHeight - gap;
            shouldBeSticky = false;
          } else {
            const stickyPositionInContainer = scrollTop + stickyTop - containerTop;
            desiredTop = stickyPositionInContainer;
            shouldBeSticky = true;
          }
        } else {
          const stickyPositionInContainer = scrollTop + stickyTop - containerTop;
          desiredTop = stickyPositionInContainer;
          shouldBeSticky = true;
        }
      }

      // Prevent overlap: push item down if it would overlap with previous item
      const minTop = previousBottom + gap;
      const wouldOverlap = desiredTop < minTop;
      const finalTop = Math.max(desiredTop, minTop, 0);

      if (shouldBeSticky && !wouldOverlap) {
        item.element.style.position = "sticky";
        item.element.style.top = stickyTop + "px";
        previousBottom = scrollTop + stickyTop + itemHeight - containerTop;
      } else {
        item.element.style.position = "absolute";
        item.element.style.top = finalTop + "px";
        previousBottom = finalTop + itemHeight;
      }
    });
  }

  window.currentUpdateFunction = updateCtaPositions;

  let ticking = false;
  function handleScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateCtaPositions();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", handleScroll);

  providerScrollTriggers.push({
    kill: () => {
      window.removeEventListener("scroll", handleScroll);
      window.currentUpdateFunction = null;
      itemsWithMarkers.forEach((item) => {
        item.element.style.position = "";
        item.element.style.left = "";
        item.element.style.right = "";
        item.element.style.top = "";
        item.element.style.zIndex = "";
      });
      ctaListContainer.style.position = "";
    },
  });
}
