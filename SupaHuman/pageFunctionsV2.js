pageFunctions.addFunction(
  "splitHeadingAnimationLines",
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
            ease: "power4.out",
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
    gsap.registerPlugin(ScrollTrigger);
    (function () {
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
        .querySelectorAll("[data-split-rich='true']")
        .forEach((richText) => {
          richText
            .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
            .forEach((heading) => {
              heading.setAttribute("data-split-only", "true");
            });
        });
      const headingAnimation = document.querySelectorAll(
        "[data-animation='heading-text-lines']"
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
    })();
  },
  "font-loaded"
);

pageFunctions.addFunction("globalAnimation", function () {
  let elementInView = document.querySelectorAll("[data-animation='in-view']");
  let elementInViewD1 = document.querySelectorAll(
    "[data-animation='in-view-d1']"
  );
  let elementInViewD2 = document.querySelectorAll(
    "[data-animation='in-view-d2']"
  );
  let elementInViewStagger = document.querySelectorAll(
    "[data-animation='in-view-stagger']"
  );
  if (elementInView.length > 0) {
    elementInView.forEach(function (element) {
      let tlElementInView = gsap.timeline({ paused: true });
      tlElementInView.from(element, {
        opacity: 0,
        duration: 0.8,
        y: "1rem",
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
        y: "1rem",
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
        y: "1rem",
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
        ease: "power1.out",
        stagger: 0.2, // Apply stagger effect to children
      });
    });
  }
});

pageFunctions.addFunction("footerLinkHover", function () {
  $("[data-link='hover']").each(function (index) {
    const text1 = $(this).find("[data-link='text1']");
    const text2 = $(this).find("[data-link='text2']");
    // Create the timeline but pause it initially
    const tlHover = gsap.timeline({ paused: true });
    // Define animation for text1
    tlHover.fromTo(
      text1,
      { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" },
      {
        clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
        duration: 0.5,
        ease: "power2.out",
      }
    );
    // Define animation for text2
    tlHover.fromTo(
      text2,
      { clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" },
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 0.5,
        ease: "power2.out",
      },
      "<" // Start text2 animation at the same time as text1
    );
    // Play animation on hover
    $(this).on("mouseenter", function () {
      tlHover.restart();
    });
    // Reverse animation on mouse leave
    $(this).on("mouseleave", function () {
      tlHover.reverse();
    });
  });
});

pageFunctions.addFunction("copyrightYear", function () {
  // Get the current year
  const currentYear = new Date().getFullYear();

  // Select all elements with the class 'copyright-year'
  const copyrightYearElements = document.querySelectorAll(".copyright-year");

  // Update the text content of each selected element to the current year
  copyrightYearElements.forEach(function (element) {
    element.textContent = currentYear;
  });
});
