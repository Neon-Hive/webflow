window.fsAttributes = window.fsAttributes || [];

window.fsAttributes.push([
  "cmsload",
  (listInstances) => {
    console.log("cmsload successfully loaded!");

    listInstances.forEach((listInstance) => {
      listInstance.on("loaded", () => {
        combineItems();
      });
    });

    setTimeout(() => {
      combineItems();
    }, 100);
  },
]);

function combineItems() {
  const targets = document.querySelectorAll("[n4-combine-target]");

  targets.forEach((target) => {
    const targetName = target.getAttribute("n4-combine-target");
    const maxItems = Number.parseInt(target.getAttribute("n4-combine-max") || "999", 10);

    const sources = document.querySelectorAll(`[n4-combine-source="${targetName}"]`);

    if (sources.length === 0) return;

    const existingItems = Array.from(target.querySelectorAll(".w-dyn-item")).map((item) =>
      item.cloneNode(true),
    );

    const sourceItems = [];
    sources.forEach((source) => {
      const items = Array.from(source.querySelectorAll(".w-dyn-item"));
      items.forEach((item) => {
        sourceItems.push(item.cloneNode(true));
      });
    });

    const allItems = [...existingItems, ...sourceItems];

    const uniqueItems = [];
    const seenHrefs = new Set();
    allItems.forEach((item) => {
      const link = item.querySelector("a");
      const href = link ? link.getAttribute("href") : null;
      if (href && seenHrefs.has(href)) {
        return;
      }
      if (href) seenHrefs.add(href);
      uniqueItems.push(item);
    });

    target._allCombinedItems = uniqueItems;

    const targetList = target.querySelector(".w-dyn-items") || target;
    targetList.innerHTML = "";

    const itemsToShow = uniqueItems.slice(0, maxItems);
    itemsToShow.forEach((item) => {
      targetList.appendChild(item.cloneNode(true));
    });

    const paginationWrapper = document.querySelector(`[n4-combine-pagination="${targetName}"]`);

    if (paginationWrapper) {
      const updatePaginationVisibility = () => {
        if (uniqueItems.length > maxItems) {
          setupPagination(target, uniqueItems, maxItems, paginationWrapper);
          paginationWrapper.style.display = "";
        } else {
          paginationWrapper.innerHTML = "";
          paginationWrapper.style.display = "none";
        }
      };

      updatePaginationVisibility();

      setTimeout(updatePaginationVisibility, 3000);
    }

    console.log(
      `Combined ${itemsToShow.length} items into target "${targetName}" (${uniqueItems.length} total, max: ${maxItems})`,
    );
  });
}

function setupPagination(target, allItems, itemsPerPage, paginationWrapper) {
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const currentPage = 1;

  target._paginationData = {
    allItems,
    itemsPerPage,
    totalPages,
    currentPage,
    paginationWrapper,
  };

  updatePaginationButtons(target, currentPage, totalPages);
}

function updatePaginationButtons(target, currentPage, totalPages) {
  const { paginationWrapper } = target._paginationData;

  const pagesToShow = getPagesToShow(currentPage, totalPages);

  paginationWrapper.innerHTML = "";

  pagesToShow.forEach((pageNum, index) => {
    if (pageNum === "dots") {
      const dotsDiv = document.createElement("div");
      dotsDiv.setAttribute("n4-load", "page-dots");
      dotsDiv.className = "g_pagination_btn_number";
      dotsDiv.textContent = "...";
      paginationWrapper.appendChild(dotsDiv);
    } else {
      const button = document.createElement("a");
      button.setAttribute("n4-load", "page-button");
      button.href = "#";
      button.className = "g_pagination_btn_number w-inline-block";
      if (pageNum === currentPage) {
        button.classList.add("w--current");
        button.setAttribute("aria-current", "page");
      }
      button.textContent = pageNum;

      button.addEventListener("click", (e) => {
        e.preventDefault();
        showPage(target, pageNum);
      });

      paginationWrapper.appendChild(button);
    }
  });
}

function getPagesToShow(currentPage, totalPages) {
  const pages = [];

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("dots");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push("dots");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push("dots");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("dots");
      pages.push(totalPages);
    }
  }

  return pages;
}

function showPage(target, pageNumber) {
  const { allItems, itemsPerPage, totalPages, paginationWrapper } = target._paginationData;

  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = allItems.slice(startIndex, endIndex);

  const targetList = target.querySelector(".w-dyn-items") || target;
  targetList.innerHTML = "";

  itemsToShow.forEach((item) => {
    targetList.appendChild(item.cloneNode(true));
  });

  target._paginationData.currentPage = pageNumber;

  updatePaginationButtons(target, pageNumber, totalPages);
}
