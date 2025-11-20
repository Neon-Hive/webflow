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

  document.querySelectorAll("p").forEach((p) => {
    const text = p.textContent.trim();

    if (text === "{{cta-block}}") {
      if (ctaBlockMarkers.length === 1 && regularCtaItems.length >= 2) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "2rem";
        wrapper.classList.add("is-mobile-cta");

        regularCtaItems.forEach((item) => {
          if (!item.hasAttribute("data-mobile-cloned")) {
            const clonedCta = item.cloneNode(true);
            clonedCta.removeAttribute("data-cta-type");
            clonedCta.style.position = "";
            clonedCta.style.left = "";
            clonedCta.style.right = "";
            clonedCta.style.top = "";
            clonedCta.style.zIndex = "";

            wrapper.appendChild(clonedCta);
            item.setAttribute("data-mobile-cloned", "true");
          }
        });

        if (wrapper.children.length > 0) {
          p.parentNode.insertBefore(wrapper, p.nextSibling);
        }
      } else {
        const regularItem = regularCtaItems.find(
          (item) => !item.hasAttribute("data-mobile-cloned"),
        );

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

  const fallbackIndex = Math.min(2, paragraphs.length - 1); // TODO: control the count of how deep the marker should be inserted
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
  const providerListItems = allItems.filter((item) => item.type === "provider-list");

  let ctaWrapper = null;
  let shouldWrapCtas = false;

  if (ctaBlockMarkers.length === 1 && ctaItems.length >= 2) {
    shouldWrapCtas = true;
    const wrapperElement = document.createElement("div");
    wrapperElement.style.display = "flex";
    wrapperElement.style.flexDirection = "column";
    wrapperElement.style.gap = "2rem";

    ctaWrapper = {
      element: wrapperElement,
      type: "cta-wrapper",
      marker: ctaBlockMarkers[0],
      height: null,
    };
  } else if (ctaBlockMarkers.length === 1) {
    ctaItems.forEach((item) => {
      item.marker = ctaBlockMarkers[0];
    });
  } else if (ctaBlockMarkers.length > 1) {
    ctaItems.forEach((item, index) => {
      if (index < ctaBlockMarkers.length) {
        item.marker = ctaBlockMarkers[index];
      } else {
        item.marker = ctaBlockMarkers[0];
      }
    });
  }

  let itemsWithMarkers = allItems.filter((item) => item.marker);
  let itemsWithoutMarkers = allItems.filter((item) => !item.marker);

  if (shouldWrapCtas && ctaWrapper) {
    itemsWithMarkers = itemsWithMarkers.filter((item) => item.type !== "cta");
    itemsWithoutMarkers = itemsWithoutMarkers.filter((item) => item.type !== "cta");
    itemsWithMarkers.push(ctaWrapper);
  }

  itemsWithMarkers.sort((a, b) => {
    const aTop = a.marker.getBoundingClientRect().top + window.pageYOffset;
    const bTop = b.marker.getBoundingClientRect().top + window.pageYOffset;
    return aTop - bTop;
  });

  const allItemsToMove = [...itemsWithMarkers, ...itemsWithoutMarkers];

  if (allItemsToMove.length === 0) {
    return;
  }

  allItemsToMove.forEach((item) => {
    if (item.type === "cta-wrapper" && ctaWrapper) {
      ctaItems.forEach((ctaItem) => {
        ctaWrapper.element.appendChild(ctaItem.element);
        ctaItem.element.style.position = "";
        ctaItem.element.style.left = "";
        ctaItem.element.style.right = "";
        ctaItem.element.style.top = "";
        ctaItem.element.style.zIndex = "";
      });
      ctaListContainer.appendChild(ctaWrapper.element);
    } else {
      ctaListContainer.appendChild(item.element);
    }
  });

  allItemsToMove.forEach((item, index) => {
    if (item.type === "cta-wrapper") {
      item.element.style.position = "absolute";
      item.element.style.left = "0";
      item.element.style.right = "0";
      item.element.style.zIndex = allItemsToMove.length - index;
    } else {
      item.element.style.position = "absolute";
      item.element.style.left = "0";
      item.element.style.right = "0";
      item.element.style.zIndex = allItemsToMove.length - index;
    }
  });

  setTimeout(() => {
    allItemsToMove.forEach((item) => {
      if (item.type === "provider-list" || item.type === "cta-wrapper") {
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

    const itemsByMarker = new Map();
    itemsWithMarkers.forEach((item) => {
      const markerKey = item.marker;
      if (!itemsByMarker.has(markerKey)) {
        itemsByMarker.set(markerKey, []);
      }
      itemsByMarker.get(markerKey).push(item);
    });

    const markerGroups = Array.from(itemsByMarker.entries()).sort((a, b) => {
      const aTop = a[0].getBoundingClientRect().top + window.pageYOffset;
      const bTop = b[0].getBoundingClientRect().top + window.pageYOffset;
      return aTop - bTop;
    });

    markerGroups.forEach(([marker, items], groupIndex) => {
      const markerRect = marker.getBoundingClientRect();
      const markerTop = markerRect.top + scrollTop;
      const markerRelativeToContainer = markerTop - containerTop;

      const wrapperItem = items.find((item) => item.type === "cta-wrapper");

      if (wrapperItem) {
        const wrapperHeight = wrapperItem.height || wrapperItem.element.offsetHeight;

        wrapperItem.element.style.left = "0";
        wrapperItem.element.style.right = "0";

        if (scrollTop + stickyTop >= markerTop) {
          const nextGroup = markerGroups[groupIndex + 1];
          if (nextGroup) {
            const nextMarkerTop = nextGroup[0].getBoundingClientRect().top + scrollTop;
            const distanceToNext = nextMarkerTop - (scrollTop + stickyTop);

            if (distanceToNext <= wrapperHeight + gap) {
              const nextMarkerRelativeToContainer = nextMarkerTop - containerTop;
              wrapperItem.element.style.position = "absolute";
              wrapperItem.element.style.top =
                nextMarkerRelativeToContainer - wrapperHeight - gap + "px";
            } else {
              wrapperItem.element.style.position = "sticky";
              wrapperItem.element.style.top = stickyTop + "px";
            }
          } else {
            wrapperItem.element.style.position = "sticky";
            wrapperItem.element.style.top = stickyTop + "px";
          }
        } else {
          wrapperItem.element.style.position = "absolute";
          wrapperItem.element.style.top = Math.max(0, markerRelativeToContainer) + "px";
        }
      } else {
        let stackTop = markerRelativeToContainer;
        items.forEach((item, itemIndex) => {
          const itemHeight = item.height || item.element.offsetHeight;
          const isFirstInStack = itemIndex === 0;

          if (scrollTop + stickyTop >= markerTop) {
            const nextGroup = markerGroups[groupIndex + 1];
            if (nextGroup && isFirstInStack) {
              const nextMarkerTop = nextGroup[0].getBoundingClientRect().top + scrollTop;
              const distanceToNext = nextMarkerTop - (scrollTop + stickyTop);
              const totalStackHeight =
                items.reduce((sum, i) => sum + (i.height || i.element.offsetHeight), 0) +
                (items.length - 1) * gap;

              if (distanceToNext <= totalStackHeight + gap) {
                const nextMarkerRelativeToContainer = nextMarkerTop - containerTop;
                item.element.style.position = "absolute";
                item.element.style.top =
                  nextMarkerRelativeToContainer -
                  totalStackHeight -
                  gap +
                  (stackTop - markerRelativeToContainer) +
                  "px";
              } else {
                item.element.style.position = isFirstInStack ? "sticky" : "absolute";
                item.element.style.top = isFirstInStack ? stickyTop + "px" : stackTop + "px";
              }
            } else {
              item.element.style.position = isFirstInStack ? "sticky" : "absolute";
              item.element.style.top = isFirstInStack ? stickyTop + "px" : stackTop + "px";
            }
          } else {
            item.element.style.position = "absolute";
            item.element.style.top = stackTop + "px";
          }

          stackTop += itemHeight + gap;
        });
      }
    });

    if (itemsWithoutMarkers.length > 0 && markerGroups.length > 0) {
      const firstMarker = markerGroups[0][0];
      const firstMarkerItems = markerGroups[0][1];
      const firstMarkerRect = firstMarker.getBoundingClientRect();
      const firstMarkerTop = firstMarkerRect.top + scrollTop;
      const firstMarkerRelativeToContainer = firstMarkerTop - containerTop;

      let stackTop = firstMarkerRelativeToContainer;
      firstMarkerItems.forEach((item) => {
        stackTop += (item.height || item.element.offsetHeight) + gap;
      });

      itemsWithoutMarkers.forEach((item) => {
        const itemHeight = item.height || item.element.offsetHeight;
        item.element.style.position = "absolute";
        item.element.style.top = stackTop + "px";
        stackTop += itemHeight + gap;
      });
    } else if (itemsWithoutMarkers.length > 0) {
      let stackTop = 0;
      itemsWithoutMarkers.forEach((item) => {
        const itemHeight = item.height || item.element.offsetHeight;
        item.element.style.position = "absolute";
        item.element.style.top = stackTop + "px";
        stackTop += itemHeight + gap;
      });
    }
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
