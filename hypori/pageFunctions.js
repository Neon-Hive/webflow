gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);

pageFunctions.addFunction("gsapCreateEase", function () {
  // Create custom easing functions
  CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
  CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
  CustomEase.create("circOut", "0.23, 1, 0.32, 1");
});

pageFunctions.addFunction(
  "splitHeadingAnimation",
  function () {
    function debounce(func, delay) {
      let timer;
      return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
      };
    }

    class TextSplitter {
      constructor(textElement, splitType) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.splitType = splitType;
        this.splitText = new SplitType(this.textElement, { types: splitType });
        if (this.splitType.includes("lines")) {
          this.wrapLinesInParent();
        }
      }
      reSplit() {
        this.splitText.split({ types: this.splitType });
        if (this.splitType.includes("lines")) {
          this.wrapLinesInParent();
        }
      }
      wrapLinesInParent() {
        const lines = this.getLines();
        if (!lines || lines.length === 0) {
          return;
        }
        lines.forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("split-parent");
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });
      }
      getChars() {
        return this.splitText.chars;
      }
      getWords() {
        return this.splitText.words;
      }
      getLines() {
        return this.splitText.lines;
      }
    }

    class HeadingEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }
      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "lines");
        this.scroll();
        this.initResizeObserver();
      }
      scroll() {
        const lines = this.splitter.getLines();
        if (lines.length === 0) {
          return;
        }
        gsap.fromTo(
          lines,
          { yPercent: 101, willChange: "transform" },
          {
            yPercent: 0,
            ease: "inOutCubic",
            duration: 0.8,
            stagger: { each: 0.2 },
            scrollTrigger: {
              trigger: this.textElement,
              start: "top 95%",
              end: "bottom 95%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      initResizeObserver() {
        const resizeHandler = debounce(() => {
          if (window.innerWidth !== this.lastWidth) {
            this.lastWidth = window.innerWidth;
            this.splitter.reSplit();
            this.scroll();
          }
        }, 300);
        window.addEventListener("resize", resizeHandler);
        this.lastWidth = window.innerWidth;
      }
    }

    class WordEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }
      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "words");
        this.scroll();
      }
      scroll() {
        const words = this.splitter.getWords();
        if (words.length === 0) return;
        gsap.fromTo(
          words,
          { opacity: 0.1 },
          {
            opacity: 1,
            ease: "power1.out",
            duration: 1,
            stagger: { each: 0.1 },
            scrollTrigger: {
              trigger: this.textElement,
              start: "top 80%",
              end: "bottom center",
              scrub: true,
            },
          }
        );
      }
    }

    class splitTextEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }
      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "lines");
      }
    }

    class splitWordEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }
      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "words");
      }
    }

    (function () {
      document
        .querySelectorAll("[data-animation-rich='heading-text']")
        .forEach((richText) => {
          richText
            .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
            .forEach((heading) => {
              heading.setAttribute("data-animation", "heading-text");
            });
        });
      document
        .querySelectorAll("[data-split-rich='true']")
        .forEach((richText) => {
          richText
            .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
            .forEach((heading) => {
              heading.setAttribute("data-split-only", "true");
            });
        });

      document
        .querySelectorAll("[data-animation-rich='word-text']")
        .forEach((richText) => {
          richText
            .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
            .forEach((heading) => {
              heading.setAttribute("data-animation", "word-text");
            });
        });

      const headingAnimation = document.querySelectorAll(
        "[data-animation='heading-text']"
      );
      headingAnimation.forEach((element) => {
        new HeadingEffect(element);
      });

      const splitText = document.querySelectorAll("[data-split-only='true']");
      splitText.forEach((element) => {
        new splitTextEffect(element);
      });

      const splitWords = document.querySelectorAll("[data-split-words='true']");
      splitWords.forEach((element) => {
        new splitWordEffect(element);
      });

      const wordEffectElements = document.querySelectorAll(
        "[data-animation='word-text']"
      );
      wordEffectElements.forEach((element) => {
        new WordEffect(element);
      });
    })();
  },
  "font-loaded"
);

pageFunctions.addFunction("gsapSeparateAnimation", function () {
  let elements = document.querySelectorAll("[data-separate]");

  elements.forEach(function (mainElement) {
    let item1 = mainElement.querySelector("[data-separate=item1]");
    let item2 = mainElement.querySelector("[data-separate=item2]");
    let direction = mainElement.getAttribute("data-separate");
    let size = mainElement.getAttribute("data-separate-size");

    // Determine the duration based on data-separate-size
    let duration = size === "long" ? 3 : 1.5;

    let tlSeparate = gsap.timeline({ ease: "inOutCubic" });

    if (direction === "left" && item1) {
      tlSeparate.from(item1, { width: "5%", duration: duration });
    } else if (direction === "right" && item2) {
      tlSeparate.from(item2, { width: "5%", duration: duration });
    }

    ScrollTrigger.create({
      trigger: mainElement,
      start: "top 95%",
      animation: tlSeparate,
    });
  });
});

pageFunctions.addFunction("navDropdownClose", function () {
  // Select all dropdown containers
  const navDropdowns = document.querySelectorAll(".nav_dropdown");

  navDropdowns.forEach((dropdown) => {
    const toggleButton = dropdown.querySelector(".nav_dropdown-toggle");
    const dropdownList = dropdown.querySelector(".nav_dropdown-list");
    const backButton = dropdown.querySelector(".nav_dropdown-back-button");

    // Add click event to the back button to close the dropdown
    if (backButton) {
      backButton.addEventListener("click", () => {
        if (
          dropdownList.classList.contains("w--open") &&
          toggleButton.classList.contains("w--open")
        ) {
          // Trigger the Webflow 'w-close' event on the toggle button
          const closeEvent = new Event("w-close", {
            bubbles: true,
            cancelable: true,
          });
          toggleButton.dispatchEvent(closeEvent);

          // Remove the open classes
          dropdownList.classList.remove("w--open");
          toggleButton.classList.remove("w--open");
          toggleButton.setAttribute("aria-expanded", "false");

          // Reset any custom styles if needed
          dropdown.style.zIndex = null;
        }
      });
    }
  });
});

pageFunctions.addFunction("navigationScrolled", function () {
  // Function to check if the page has been scrolled down
  function hasScrolled() {
    return window.scrollY > 30;
  }

  // Function to toggle the 'scrolled' class based on the scroll position
  function toggleScrolledClass() {
    const navComponent = document.querySelector(".nav_component");
    if (hasScrolled()) {
      navComponent.classList.add("scrolled");
    } else {
      navComponent.classList.remove("scrolled");
    }
  }

  // Initial check to set the class when the page loads
  toggleScrolledClass();

  // Add an event listener to check and update the class on scroll
  window.addEventListener("scroll", toggleScrolledClass);
});

pageFunctions.addFunction("navigationOpenState", function () {
  // Select the navigation menu button using the data attribute
  const navMenuButton = document.querySelector(
    '[data-attribute="navigation-menu-button"]'
  );
  // Select the navigation component
  const navComponent = document.querySelector(".nav_component");
  const body = document.body; // Select the body element

  // Add an event listener to the menu button to toggle the 'open' class on the nav component
  if (navMenuButton && navComponent) {
    navMenuButton.addEventListener("click", function () {
      // Check if the nav component currently has the 'open' class
      if (navComponent.classList.contains("open")) {
        // If the class exists, remove it after 750ms and reset body overflow
        setTimeout(() => {
          navComponent.classList.remove("open");
          body.style.overflow = ""; // Reset the overflow
        }, 750); // Adjust this based on your closing animation time
      } else {
        // Add the 'open' class and set overflow to hidden immediately
        navComponent.classList.add("open");
        body.style.overflow = "hidden"; // Disable scroll
      }
    });
  }
});

pageFunctions.addFunction("pixelBurst", function () {
  let burst = document.querySelectorAll("[data-attribute=burst]");
  burst.forEach(function (mainElement) {
    let burstType = mainElement.getAttribute("data-burst");
    let opacityDuration = burstType === "v1" ? 4.5 : 3;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: mainElement,
        start: "top 95%",
      },
    });

    tl.fromTo(
      mainElement,
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(100% at 50% 50%)", duration: 15, ease: "power4.out" }
    );

    tl.fromTo(
      mainElement,
      { opacity: 0 },
      { opacity: 1, duration: opacityDuration, ease: "power2.inOut" },
      "<"
    );
  });
});

pageFunctions.addFunction("globalAnimation", function () {
  let elementInView = document.querySelectorAll("[data-animation=in-view]");
  let elementInViewD1 = document.querySelectorAll(
    "[data-animation=in-view-d1]"
  );
  let elementInViewD2 = document.querySelectorAll(
    "[data-animation=in-view-d2]"
  );
  let elementInViewStagger = document.querySelectorAll(
    "[data-animation=in-view-stagger]"
  );
  let elementInViewMove = document.querySelectorAll(
    "[data-animation=in-view-move]"
  );

  if (elementInView.length > 0) {
    elementInView.forEach(function (element) {
      let tlElementInView = gsap.timeline({ paused: true });
      tlElementInView.from(element, {
        opacity: 0,
        duration: 0.8,
        ease: "power1.out",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInView,
      });
    });
  }

  if (elementInViewD1.length > 0) {
    elementInViewD1.forEach(function (element) {
      let tlElementInViewD1 = gsap.timeline({ paused: true });
      tlElementInViewD1.from(element, {
        delay: 0.1,
        opacity: 0,
        duration: 0.8,
        ease: "power1.out",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewD1,
      });
    });
  }

  if (elementInViewD2.length > 0) {
    elementInViewD2.forEach(function (element) {
      let tlElementInViewD2 = gsap.timeline({ paused: true });
      tlElementInViewD2.from(element, {
        delay: 0.2,
        opacity: 0,
        duration: 0.8,
        ease: "power4.out",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewD2,
      });
    });
  }

  if (elementInViewMove.length > 0) {
    elementInViewMove.forEach(function (element) {
      let tlElementInViewMove = gsap.timeline({ paused: true });
      tlElementInViewMove.from(element, {
        delay: 0.2,
        opacity: 0,
        y: "1rem",
        duration: 0.8,
        ease: "power4.out",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewMove,
      });
    });
  }

  // New variation for staggered child animations
  if (elementInViewStagger.length > 0) {
    elementInViewStagger.forEach(function (parentElement) {
      let children = parentElement.children;
      let tlElementInViewStagger = gsap.timeline({
        scrollTrigger: {
          trigger: parentElement,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });

      tlElementInViewStagger.from(children, {
        opacity: 0,
        duration: 0.8,
        y: "1rem",
        ease: "power4.out",
        stagger: 0.2, // Apply stagger effect to children
      });
    });
  }
});

pageFunctions.addFunction("setAria", function () {
  const mm = gsap.matchMedia();

  // Option 1: Add attributes on desktop only
  mm.add("(min-width: 992px)", () => {
    document.querySelectorAll("[data-aria='desktop']").forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("tabindex", "-1");
    });
  });

  // Option 2: Add attributes on Tablet and smaller screens
  mm.add("(max-width: 991px)", () => {
    document.querySelectorAll("[data-aria='tablet']").forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("tabindex", "-1");
    });
  });
});

  pageFunctions.addFunction('copyrightYear', function() {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Select all elements with the class 'copyright-year'
    const copyrightYearElements = document.querySelectorAll('.copyright-year');

    // Update the text content of each selected element to the current year
    copyrightYearElements.forEach(function (element) {
      element.textContent = currentYear;
    });
  });

function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

// Initialize lastWidth and lastHeight
let lastWidth = document.documentElement.clientWidth;
let lastHeight = document.documentElement.clientHeight;

// Debounce function
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Check dimensions
function checkDimensions() {
  let newWidth = document.documentElement.clientWidth;
  let newHeight = document.documentElement.clientHeight;

  if (newWidth !== lastWidth || newHeight !== lastHeight) {
    refreshScrollTrigger();
    lastWidth = newWidth;
    lastHeight = newHeight;
  }
}

const debouncedCheck = debounce(checkDimensions, 300);
setInterval(debouncedCheck, 300);

const searchInput = document.querySelector(".g-filters_search-secondary");

if (searchInput) {
  searchInput.addEventListener("input", debounce(refreshScrollTrigger, 200));
}
