
  pageFunctions.addFunction("gsapCustomEase", function () {
    // Register CustomEase plugin
    gsap.registerPlugin(CustomEase);

    // Create custom easing functions
    CustomEase.create("OutCirc", "0.23, 1, 0.32, 1");
    CustomEase.create("OutBackIn", "0.175, 0.885, 0.32, 1.275");
    CustomEase.create("InOutCirc", "0.785, 0.135, 0.15, 0.86");
    CustomEase.create("OutCubic", "0.215, 0.61, 0.355, 1");
  });



  pageFunctions.addFunction("splitHeadingAnimation", function () {
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
          console.warn("No lines found for wrapping.");
          return;
        }

        lines.forEach((line) => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('split-parent');
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

    class BlurEffectHeading {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }

        this.textElement = textElement;
        this.initializeEffect();
      }

      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "lines, words");
        this.scroll();
        this.initResizeObserver();
      }

      scroll() {
        const lines = this.splitter.getLines();
        if (lines.length === 0) {
          console.warn("No lines found for animation.");
          return;
        }

        // Create a timeline for staggering the lines
        let lineTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: this.textElement,
            start: "top 95%",
            end: "bottom 95%",
            toggleActions: "play none none none", // Only play once to avoid re-triggering
          },
        });

        lines.forEach((line, index) => {
          let wordTimeline = gsap.timeline();

          wordTimeline.fromTo(
            line,
            { filter: "blur(5px)", willChange: "filter" },
            { filter: "blur(0px)", duration: 1, stagger: { each: 0.2 } }
          );

          const words = Array.from(line.querySelectorAll(".word"));
          wordTimeline.fromTo(
            words,
            { yPercent: 100, opacity: 0, willChange: "transform, opacity" },
            { yPercent: 0, opacity: 1, duration: 0.8, ease: "OutCubic", stagger: { each: 0.2 } },
            "<"
          );

          lineTimeline.add(wordTimeline, index * 0.3);
        });
      }

      // Listen only for screen width changes
      initResizeObserver() {
        const resizeHandler = debounce(() => {
          // Check if only the width of the window has changed
          if (window.innerWidth !== this.lastWidth) {
            this.lastWidth = window.innerWidth; // Update last recorded width
            this.splitter.reSplit(); // Re-split text
            this.scroll(); // Re-run scroll animation setup
          }
        }, 300);

        // Add resize event listener to the window
        window.addEventListener('resize', resizeHandler);

        // Save the initial width to compare on future resizes
        this.lastWidth = window.innerWidth;
      }
    }

    class BlurEffectText {
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
          console.warn("No lines found for animation.");
          return;
        }

        gsap.fromTo(
          lines,
          { yPercent: 100, opacity: 0, willChange: "transform, opacity" },
          {
            yPercent: 0,
            opacity: 1,
            ease: "OutCubic",
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: this.textElement,
              start: "top 95%",
              end: "bottom 95%",
              toggleActions: "play none none none"
            },
          }
        );
      }

      // Listen only for screen width changes
      initResizeObserver() {
        const resizeHandler = debounce(() => {
          // Check if only the width of the window has changed
          if (window.innerWidth !== this.lastWidth) {
            this.lastWidth = window.innerWidth; // Update last recorded width
            this.splitter.reSplit(); // Re-split text
            this.scroll(); // Re-run scroll animation setup
          }
        }, 300);

        // Add resize event listener to the window
        window.addEventListener('resize', resizeHandler);

        // Save the initial width to compare on future resizes
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
        this.splitter = new TextSplitter(this.textElement, "lines, words");
        this.initResizeObserver();
      }

      // Listen only for screen width changes
      initResizeObserver() {
        const resizeHandler = debounce(() => {
          // Check if only the width of the window has changed
          if (window.innerWidth !== this.lastWidth) {
            this.lastWidth = window.innerWidth; // Update last recorded width
            this.splitter.reSplit(); // Re-split text
          }
        }, 300);

        // Add resize event listener to the window
        window.addEventListener('resize', resizeHandler);

        // Save the initial width to compare on future resizes
        this.lastWidth = window.innerWidth;
      }

    }


    gsap.registerPlugin(ScrollTrigger);

    (function () {
      document.querySelectorAll("[data-animation-rich='heading-blur']").forEach((richText) => {
        richText.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((heading) => {
          heading.setAttribute("data-animation", "heading-blur");
        });
      });

      document.querySelectorAll("[data-animation-rich='text-blur']").forEach((richText) => {
        richText.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((heading) => {
          heading.setAttribute("data-animation", "text-blur");
        });
      });

      document.querySelectorAll("[data-split-rich='true']").forEach((richText) => {
        richText.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((heading) => {
          heading.setAttribute("data-split-only", "true");
        });
      });

      const blurHeading = document.querySelectorAll('[data-animation="heading-blur"]');
      blurHeading.forEach((element) => {
        new BlurEffectHeading(element);
      });

      const splitText = document.querySelectorAll('[data-split-only="true"]');
      splitText.forEach((element) => {
        new splitTextEffect(element);
      });

      const blurText = document.querySelectorAll('[data-animation="text-blur"]');
      blurText.forEach((element) => {
        new BlurEffectText(element);
      });
    })();
  }, ["gsapCreateEase"], "font-loaded");

  pageFunctions.addFunction("globalAnimation", function () {
    let elementInView = document.querySelectorAll("[data-animation=in-view]");
    let elementInViewD1 = document.querySelectorAll("[data-animation=in-view-d1]");
    let elementInViewD2 = document.querySelectorAll("[data-animation=in-view-d2]");
    let elementScale = document.querySelectorAll("[data-animation=scale]");
    let elementFilter = document.querySelectorAll("[data-animation=filter]");
    let imageBlur = document.querySelectorAll("[data-animation=image-reveal]");
    let dividerInView = document.querySelectorAll("[data-animation=divider]");


    if (elementInView.length > 0) {
      elementInView.forEach(function (element) {
        let tlElementInView = gsap.timeline({ paused: true });

        tlElementInView.from(element, { opacity: 0, duration: 0.8, ease: "none", });

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

        tlElementInViewD1.from(element, { delay: 0.1, opacity: 0, duration: 0.8, ease: "none", });

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

        tlElementInViewD2.from(element, { delay: 0.2, opacity: 0, duration: 0.8, ease: "none", });

        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlElementInViewD2,
        });
      });
    }

    if (dividerInView.length > 0) {
      dividerInView.forEach(function (element) {
        let tlDividerInView = gsap.timeline({ paused: true });

        tlDividerInView.from(element, { width: "0", duration: 1.8, ease: "OutCubic", });

        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlDividerInView,
        });
      });
    }

    if (elementScale.length > 0) {
      elementScale.forEach(function (element) {
        let tlElementScale = gsap.timeline({ paused: true });

        tlElementScale.from(element, { scale: 0, duration: 0.6, ease: "OutBackIn" });

        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlElementScale,
        });
      });
    }

    if (elementFilter.length > 0) {
      elementFilter.forEach(function (element) {
        let tlElementFilter = gsap.timeline({ paused: true });

        tlElementFilter.from(element, { filter: "blur(15px)", duration: 1, ease: "none", });

        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlElementFilter,
        });
      });
    }

    // Set up media queries for different screen sizes
    gsap.matchMedia().add("(min-width: 992px)", () => {
      // Animation for screens 992px and above
      if (imageBlur.length > 0) {
        imageBlur.forEach(function (element) {
          let tlImageBlur = gsap.timeline();

          tlImageBlur.fromTo(
            element,
            { scale: 1.1, filter: "blur(15px)", willChange: "transform, filter" },
            { scale: 1, filter: "blur(0px)" }
          );

          ScrollTrigger.create({
            trigger: element,
            start: "top 95%",
            end: "top center",
            scrub: true,
            animation: tlImageBlur,
          });
        });
      }
    });

    gsap.matchMedia().add("(max-width: 991px)", () => {
      // Animation for screens below 992px
      if (imageBlur.length > 0) {
        imageBlur.forEach(function (element) {
          let tlImageBlur = gsap.timeline();

          tlImageBlur.fromTo(
            element,
            { scale: 1.1, willChange: "transform" },  // Only scaling, no blur
            { scale: 1 }
          );

          ScrollTrigger.create({
            trigger: element,
            start: "top 95%",
            end: "top center",
            scrub: true,
            animation: tlImageBlur,
          });
        });
      }
    });
  }, ["gsapCustomEase"]);

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
