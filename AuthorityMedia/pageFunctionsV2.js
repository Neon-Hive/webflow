gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);

pageFunctions.addFunction("gsapCreateEase", function () {
// Create custom easing functions
CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
CustomEase.create("inQuad", "0.55, 0.085, 0.68, 0.53");
CustomEase.create("inOutExpo", "1, 0, 0, 1");
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

  class HeadingEffectWords {
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
      this.initResizeObserver();
    }
    scroll() {
      const words = this.splitter.getWords();
      if (words.length === 0) {
        return;
      }
      gsap.fromTo(
        words,
        { x: "1em", willChange: "transform", opacity: 0 },
        {
          x: "0em",
          opacity: 1,
          ease: "inOutCubic",
          duration: 0.8,
          stagger: { amount: 0.2 },
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

  class HeadingEffectLines {
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
        { x: "1em", willChange: "transform", opacity: 0 },
        {
          x: "0em",
          opacity: 1,
          ease: "inOutCubic",
          duration: 0.8,
          stagger: { amount: 0.2 },
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

  class splitLinesEffect {
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

  class splitWordsEffect {
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
      .querySelectorAll("[data-animation-rich='heading-text-lines']")
      .forEach((richText) => {
        richText
          .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
          .forEach((heading) => {
            heading.setAttribute("data-animation", "heading-text-lines");
          });
      });
    document
      .querySelectorAll("[data-split-rich='true-lines']")
      .forEach((richText) => {
        richText
          .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
          .forEach((heading) => {
            heading.setAttribute("data-split-only", "true");
          });
      });
    document
      .querySelectorAll("[data-split-rich='true-words']")
      .forEach((richText) => {
        richText
          .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
          .forEach((heading) => {
            heading.setAttribute("data-split-words", "true");
          });
      });
    const headingAnimationWords = document.querySelectorAll(
      "[data-animation='heading-text']"
    );
    headingAnimationWords.forEach((element) => {
      new HeadingEffectWords(element);
    });

    const headingAnimationLines = document.querySelectorAll(
      "[data-animation='heading-text-lines']"
    );
    headingAnimationLines.forEach((element) => {
      new HeadingEffectLines(element);
    });

    const splitLines = document.querySelectorAll("[data-split-only='true']");
    splitLines.forEach((element) => {
      new splitLinesEffect(element);
    });

    const splitWordsText = document.querySelectorAll(
      "[data-split-only='true-words']"
    );
    splitWordsText.forEach((element) => {
      new splitWordsEffect(element);
    });

    const splitWords = document.querySelectorAll("[data-split-words='true']");
    splitWords.forEach((element) => {
      new splitWordsEffect(element);
    });
  })();
},
"gsapCreateEase",
"font-loaded"
);

pageFunctions.addFunction("responsiveScrollTrigger", function () {
function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

let lastWidth = document.documentElement.clientWidth;
let lastHeight = document.documentElement.clientHeight;

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

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

// Refresh on search input with debounce
const searchInput = document.querySelector("[data-attribute=search]");
if (searchInput) {
  searchInput.addEventListener("input", debounce(refreshScrollTrigger, 200));
}

// Refresh on filter change immediately for radio buttons and .w-radio-input elements
const filterElements = document.querySelectorAll("[data-attribute=filter], .w-radio-input");

filterElements.forEach((filterElement) => {
filterElement.addEventListener("change", refreshScrollTrigger);
});
});

pageFunctions.addFunction("navigationScrolled", function () {
function hasScrolled() {
  return window.scrollY > 30;
}

function toggleScrolledClass() {
  const navComponent = document.querySelector(".nav_component");
  if (hasScrolled()) {
    navComponent.classList.remove("scrolled");
  } else {
    navComponent.classList.add("scrolled");
  }
}
toggleScrolledClass();
window.addEventListener("scroll", toggleScrolledClass);
});

pageFunctions.addFunction("navigationOpenState", function () {
const navMenuButton = document.querySelector(
  '[data-attribute="navigation-menu-button"]'
);
const navComponent = document.querySelector(".nav_component");
const body = document.body;

if (navMenuButton && navComponent) {
  navMenuButton.addEventListener("click", function () {
    if (navComponent.classList.contains("open")) {
      setTimeout(() => {
        navComponent.classList.remove("open");
        body.style.overflow = "";
      }, 700);
    } else {
      navComponent.classList.add("open");
      body.style.overflow = "hidden";
    }
  });
}
});

pageFunctions.addFunction("navigationNavColorChange", function () {
  $("[data-attribute=dark-nav]").each(function () {
    ScrollTrigger.create({
      trigger: $(this),
      start: "top 40px",
      end: "bottom 40px",
      onEnter: () => {
        $(".nav_component").addClass("dark");
        $(".nav_component").removeClass("light");
        $(".nav_component").removeClass("grey");
      },
      onEnterBack: () => {
        $(".nav_component").addClass("dark");
        $(".nav_component").removeClass("light");
        $(".nav_component").removeClass("grey");
      },
    });
  });

  $("[data-attribute=light-nav]").each(function () {
    ScrollTrigger.create({
      trigger: $(this),
      start: "top 40px",
      end: "bottom 40px",
      onEnter: () => {
        $(".nav_component").addClass("light");
        $(".nav_component").removeClass("dark");
        $(".nav_component").removeClass("grey");
      },
      onEnterBack: () => {
        $(".nav_component").addClass("light");
        $(".nav_component").removeClass("dark");
        $(".nav_component").removeClass("grey");
      },
    });
  });

  $("[data-attribute=grey-nav]").each(function () {
    ScrollTrigger.create({
      trigger: $(this),
      start: "top 40px",
      end: "bottom 40px",
      onEnter: () => {
        $(".nav_component").addClass("grey");
        $(".nav_component").removeClass("dark");
        $(".nav_component").removeClass("light");
      },
      onEnterBack: () => {
        $(".nav_component").addClass("grey");
        $(".nav_component").removeClass("dark");
        $(".nav_component").removeClass("light");
      },
    });
  });
});

pageFunctions.addFunction("copyrightYear", function () {
const currentYear = new Date().getFullYear();
const copyrightYearElements = document.querySelectorAll(".copyright-year");
copyrightYearElements.forEach(function (element) {
  element.textContent = currentYear;
});
});

pageFunctions.addFunction("customCursor", function () {
function deviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

function nhCursor() {
  const nh_cursor = document.getElementById("cursor-wrap");
  const cursor_dot = document.getElementById("cursor-dot");
  const cursor_text = document.getElementById("cursor-text"); // check if this exists
  const targetElements = document.querySelectorAll("[data-cursor='true']");

  window.addEventListener("pointermove", (event) => {
    gsap.to(nh_cursor, {
      x: event.clientX,
      y: event.clientY,
      duration: 0.4,
      ease: "power1.out",
      scale: 1,
    });
  });

  targetElements.forEach((e) => {
    e.addEventListener("mouseenter", () => {
      if (cursor_text) {
        // only run if cursor_text exists
        const customText = e.getAttribute("data-cursor-text");
        cursor_text.textContent = customText || "";
        cursor_text.classList.add("show");
      }
      if (cursor_dot) cursor_dot.classList.add("is-active");
    });

    e.addEventListener("mouseleave", () => {
      if (cursor_text) {
        cursor_text.classList.remove("show");
        cursor_text.textContent = "";
      }
      if (cursor_dot) cursor_dot.classList.remove("is-active");
    });
  });

  document.addEventListener("pointermove", (event) => {
    if (nh_cursor)
      gsap.set(nh_cursor, { x: event.clientX, y: event.clientY });
  });

  document.addEventListener("mouseleave", () => {
    if (nh_cursor) {
      gsap.to(nh_cursor, { duration: 0.4, ease: "power1.in", scale: 0 });
    }
  });
}

if (deviceType() === "desktop") {
  nhCursor();
} else {
  const cursorWrap = document.getElementById("cursor-wrap");
  if (cursorWrap) cursorWrap.style.display = "none";
}
});

pageFunctions.addFunction(
"globalAnimation",
function () {
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
  let elementInViewStaggerCenter = document.querySelectorAll(
    "[data-animation=in-view-stagger-center]"
  );
  let elementInViewLine = document.querySelectorAll(
    "[data-animation=in-view-line]"
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
        start: "top 94%",
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
        ease: "power1.out",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewD2,
      });
    });
  }
  if (elementInViewLine.length > 0) {
    elementInViewLine.forEach(function (element) {
      let tlElementInViewLine = gsap.timeline({ paused: true });
      tlElementInViewLine.fromTo(
        element,
        {
          width: "0%",
        },
        {
          delay: 0.2,
          width: "100%",
          duration: 1.2,
          ease: "inOutCubic",
        }
      );
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewLine,
      });
    });
  }

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
        ease: "power1.out",
        stagger: 0.2,
      });
    });
  }

  if (elementInViewStaggerCenter.length > 0) {
    elementInViewStaggerCenter.forEach(function (parentElement) {
      let children = parentElement.children;
      let tlElementInViewStaggerCenter = gsap.timeline({
        scrollTrigger: {
          trigger: parentElement,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
      tlElementInViewStaggerCenter.from(children, {
        opacity: 0,
        duration: 0.8,
        y: "1rem",
        ease: "power1.out",
        stagger: {
          each: 0.2,
          from: "center",
        },
      });
    });
  }
},
"gsapCreateEase"
);

pageFunctions.addFunction(
  "buttonTextHover",
  function () {
    gsap.matchMedia().add("(min-width: 992px)", () => {
      const buttonTextElements = document.querySelectorAll(
        "[data-hover=button-text]"
      );

      buttonTextElements.forEach((buttonText) => {
        const buttonLine = buttonText.querySelector("[data-hover=button-line]");
        const variation = buttonText.getAttribute("data-variation");

        if (buttonLine && variation === "v1") {
          // Create a timeline for the button line
          const timeline = gsap.timeline({ paused: true });

          // Initial state
          gsap.set(buttonLine, { x: "-101%" });

          function enterAnimation() {
            timeline.clear(); // Clear the timeline to queue new animations
            timeline.to(buttonLine, {
              x: "0%",
              duration: 0.6,
              ease: "inOutCubic",
            });
          }

          function leaveAnimation() {
            timeline.to(buttonLine, {
              x: "100%",
              duration: 0.4,
              ease: "inQuad",
              onComplete: () => {
                gsap.set(buttonLine, { x: "-101%" }); // Reset to the initial state
              },
            });
          }

          buttonText.addEventListener("mouseenter", () => {
            enterAnimation();
            timeline.play(); // Play the timeline on hover
          });

          buttonText.addEventListener("mouseleave", () => {
            leaveAnimation();
            timeline.play(); // Ensure leave animation plays even during rapid hover
          });
        }

        if (buttonLine && variation === "v2") {
          gsap.set(buttonLine, { x: "0%" });

          function animateLine() {
            gsap.to(buttonLine, {
              x: "100%",
              duration: 0.6,
              ease: "inOutCubic",
              onComplete: () => {
                gsap.set(buttonLine, { x: "-101%" });
                gsap.to(buttonLine, {
                  x: "0%",
                  duration: 0.4,
                  ease: "inQuad",
                });
              },
            });
          }

          buttonText.addEventListener("mouseenter", animateLine);
          buttonText.addEventListener("mouseleave", animateLine);
        }
      });
    });
  },
  "gsapCreateEase"
);

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
