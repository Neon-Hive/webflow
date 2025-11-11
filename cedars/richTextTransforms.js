// RICHTEXT HANDLING - Cta's and Provider cards and scroll section
document.addEventListener("DOMContentLoaded", () => {
  const richText = document.querySelector("[data-n4-rich-text='true']");
  if (!richText) return;

  handleRichTextColumns();
  handleCtaBlocks();

  let ctaState = window.innerWidth <= 991;
  let scrollTriggerInitialized = false;

  // Initial desktop setup
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

    // Handle desktop reinitialization (from mobile OR from desktop resize)
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
    } else {
      // On mobile, cleanup desktop stuff
      if (scrollTriggerInitialized) {
        cleanupScrollTrigger();
        scrollTriggerInitialized = false;
      }
    }

    handleRichTextColumns();
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
    const items = ctaListContainer.querySelectorAll("[data-cta-type='cta'], [data-cta-type='provider-list']");
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

  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();

    if (text === "{{cta-block}}") {
      const regularItem = regularCtaItems.find((item) => !item.hasAttribute("data-mobile-cloned"));

      if (regularItem) {
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
    if (text === "{{cta-block}}" || text === "{\{providers}}") {
      p.style.visibility = "hidden";
      p.style.marginBottom = "-2rem"
    }
  });
}

const providerScrollTriggers = [];

function initializeCtaScrollTrigger() {
  const ctaListContainer = document.querySelector("[data-cta-list]");
  if (!ctaListContainer) return;

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
      height: null, // Will be calculated dynamically
    });
  }

  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();

    if (text === "{{cta-block}}") {
      const regularItem = allItems.find((item) => item.type === "cta" && !item.marker);
      if (regularItem) {
        regularItem.marker = p;
      }
    }

    if (text === "{{providers}}") {
      const providerItem = allItems.find((item) => item.type === "provider-list" && !item.marker);
      if (providerItem) {
        providerItem.marker = p;
      }
    }
  });

  const itemsWithMarkers = allItems.filter((item) => item.marker);
  itemsWithMarkers.sort((a, b) => {
    const aTop = a.marker.getBoundingClientRect().top + window.pageYOffset;
    const bTop = b.marker.getBoundingClientRect().top + window.pageYOffset;
    return aTop - bTop;
  });

  if (itemsWithMarkers.length === 0) {
    return;
  }

  itemsWithMarkers.forEach((item) => {
    ctaListContainer.appendChild(item.element);
  });

  itemsWithMarkers.forEach((item, index) => {
    item.element.style.position = "absolute";
    item.element.style.left = "0";
    item.element.style.right = "0";
    item.element.style.zIndex = itemsWithMarkers.length - index;
  });

  // Calculate actual heights after elements are positioned
  setTimeout(() => {
    itemsWithMarkers.forEach((item) => {
      if (item.type === "provider-list") {
        item.height = item.element.offsetHeight;
      }
    });
    updateCtaPositions();
  }, 50);

  function updateCtaPositions() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const stickyTop = 56;

    const containerRect = ctaListContainer.getBoundingClientRect();
    const containerTop = containerRect.top + scrollTop;
    const gap = 32;

    itemsWithMarkers.forEach((item, index) => {
      const marker = item.marker;
      if (!marker) return;

      const markerRect = marker.getBoundingClientRect();
      const markerTop = markerRect.top + scrollTop;
      const markerRelativeToContainer = markerTop - containerTop;

      // Get actual height for this item
      const itemHeight = item.height || item.element.offsetHeight;

      if (scrollTop + stickyTop >= markerTop) {
        const nextItem = itemsWithMarkers[index + 1];

        if (nextItem && nextItem.marker) {
          const nextMarkerTop = nextItem.marker.getBoundingClientRect().top + scrollTop;
          const distanceToNext = nextMarkerTop - (scrollTop + stickyTop);

          if (distanceToNext <= itemHeight + gap) {
            const nextMarkerRelativeToContainer = nextMarkerTop - containerTop;
            item.element.style.position = "absolute";
            item.element.style.top = nextMarkerRelativeToContainer - itemHeight - gap + "px";
          } else {
            item.element.style.position = "sticky";
            item.element.style.top = stickyTop + "px";
          }
        } else {
          item.element.style.position = "sticky";
          item.element.style.top = stickyTop + "px";
        }
      } else {
        item.element.style.position = "absolute";
        item.element.style.top = markerRelativeToContainer + "px";
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
