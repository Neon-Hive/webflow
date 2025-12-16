document.addEventListener("DOMContentLoaded", () => {
  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) return;

  handleRichTextColumns();
  ensureCtaMarker();
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
    ensureCtaMarker();
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
  ensureCtaMarker();
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
  // Clean up any existing mobile clones first
  const existingMobileCtas = document.querySelectorAll(".is-mobile-cta");
  existingMobileCtas.forEach((cta) => cta.remove());
  document.querySelectorAll("[data-mobile-cloned]").forEach((item) => {
    item.removeAttribute("data-mobile-cloned");
  });

  const regularCtaItems = Array.from(document.querySelectorAll("[data-cta-type='cta']"));
  const providerListWrapper = document.querySelector("[data-cta-type='provider-list']");
  const ctaBlockMarkers = Array.from(document.querySelectorAll("p")).filter(
    (p) => p.textContent.trim() === "{{cta-block}}",
  );

  // Display one CTA per marker (1:1 mapping)
  ctaBlockMarkers.forEach((marker, index) => {
    if (index < regularCtaItems.length) {
      const regularItem = regularCtaItems[index];
      if (regularItem) {
        const clonedCta = regularItem.cloneNode(true);
        clonedCta.classList.add("is-mobile-cta");
        clonedCta.removeAttribute("data-cta-type");

        clonedCta.style.position = "";
        clonedCta.style.left = "";
        clonedCta.style.right = "";
        clonedCta.style.top = "";
        clonedCta.style.zIndex = "";

        marker.parentNode.insertBefore(clonedCta, marker.nextSibling);
        regularItem.setAttribute("data-mobile-cloned", "true");
      }
    }
  });

  // Remove all CTAs that weren't cloned (when there are fewer markers than CTAs)
  // This prevents them from coming back on resize
  regularCtaItems.forEach((item, index) => {
    if (index >= ctaBlockMarkers.length) {
      item.remove();
    }
  });

  // Handle providers (only if valid)
  if (hasValidProviders(providerListWrapper)) {
    document.querySelectorAll("p").forEach((p) => {
      const text = p.textContent.trim();
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

  // Hide all markers
  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();
    if (text === "{{cta-block}}" || text === "{{providers}}") {
      p.style.visibility = "hidden";
      p.style.marginBottom = "-2rem";
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

function hasValidProviders(providerListWrapper) {
  if (!providerListWrapper) return false;
  // Check if provider list has actual items (not empty state)
  const emptyState = providerListWrapper.querySelector(".w-dyn-empty, .provider_empty-state");
  const hasItems = providerListWrapper.querySelector(".provider-cta_item");
  return !emptyState && hasItems;
}

function ensureCtaMarker() {
  const regularCtaItems = document.querySelectorAll("[data-cta-type='cta']");
  if (!regularCtaItems.length) return;

  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) return;

  // Check if marker already exists (including hidden ones)
  const hasMarker = Array.from(richText.querySelectorAll("p")).some(
    (p) => p.textContent.trim() === "{{cta-block}}",
  );
  if (hasMarker) return;

  // Insert single marker at the very top - ensures only first CTA shows (1:1 mapping)
  const marker = document.createElement("p");
  marker.textContent = "{{cta-block}}";
  marker.setAttribute("data-generated-cta-marker", "true");
  richText.insertBefore(marker, richText.firstChild);
}

function ensureProviderMarker() {
  const providerList = document.querySelector("[data-cta-type='provider-list']");
  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) return;

  // Remove existing provider markers if providers are empty or don't exist
  if (!providerList || !hasValidProviders(providerList)) {
    richText.querySelectorAll("p").forEach((p) => {
      if (p.textContent.trim() === "{{providers}}") {
        p.remove();
      }
    });
    return;
  }

  const hasMarker = Array.from(richText.querySelectorAll("p")).some(
    (p) => p.textContent.trim() === "{{providers}}",
  );
  if (hasMarker) return;

  const paragraphs = Array.from(richText.querySelectorAll("p"));
  if (!paragraphs.length) return;

  const firstCtaMarker = paragraphs.find((p) => p.textContent.trim() === "{{cta-block}}");
  if (!firstCtaMarker) return;

  // Insert provider marker at the very top of the articles
  // Both providers and CTAs will stack properly via the scroll positioning logic
  const marker = document.createElement("p");
  marker.textContent = "{{providers}}";
  marker.setAttribute("data-generated-provider-marker", "true");
  richText.insertBefore(marker, richText.firstChild);
}

function initializeCtaScrollTrigger() {
  const ctaListContainer = document.querySelector("[data-cta-list]");
  if (!ctaListContainer) return;
  ensureCtaMarker();
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

  if (providerListWrapper && hasValidProviders(providerListWrapper)) {
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

  // Remove all CTAs that don't have markers assigned - This prevents them from coming back on resize
  ctaItems.forEach((item) => {
    if (!item.marker) {
      item.element.remove();
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

  // Clean up container first - remove all existing items
  while (ctaListContainer.firstChild) {
    ctaListContainer.removeChild(ctaListContainer.firstChild);
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

          const stickyPositionInContainer = scrollTop + stickyTop - containerTop;
          if (distanceToNext <= itemHeight + gap) {
            const nextMarkerRelativeToContainer = nextMarkerTop - containerTop;
            const positionAboveNext = nextMarkerRelativeToContainer - itemHeight - gap;
            // When making room for next item, scroll this item back to its marker
            desiredTop = Math.max(positionAboveNext, markerRelativeToContainer);
            shouldBeSticky = false;
          } else {
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
