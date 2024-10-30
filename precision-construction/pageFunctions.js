
  pageFunctions.addFunction('buttonTextHover', function() {
    // Apply animation only for screens wider than 992px
    gsap.matchMedia().add("(min-width: 992px)", () => {
      // Select all elements with [data-hover=button-text]
      const buttonTextElements = document.querySelectorAll("[data-hover=button-text]");

      buttonTextElements.forEach(buttonText => {
        // Find the [data-hover=button-line] inside each buttonText element
        const buttonLine = buttonText.querySelector("[data-hover=button-line]");

        // Check for the variation type on buttonText element (v1 or v2)
        const variation = buttonText.getAttribute("data-variation");

        if (buttonLine && variation) {
          // Set initial position for each variation
          if (variation === "v1") {
            // Variation v1: Set initial state to be off-screen to the left (-100%)
            gsap.set(buttonLine, { x: "-100%" });

            // Variation v1: Basic slide in and out
            buttonText.addEventListener("mouseenter", () => {
              gsap.to(buttonLine, {
                x: "0%",
                duration: 0.4,
                ease: "power2.out"
              });
            });

            buttonText.addEventListener("mouseleave", () => {
              gsap.to(buttonLine, {
                x: "100%",
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                  // Reset to -100% after animation completes
                  gsap.set(buttonLine, { x: "-100%" });
                }
              });
            });
          }

          if (variation === "v2") {
            // Variation v2: Start at 0% for initial animation on hover
            gsap.set(buttonLine, { x: "0%" });

            // Variation v2: Slide from 0% to 100%, reset to -100%, and slide to 0%
            function animateLine() {
              gsap.to(buttonLine, {
                x: "100%",
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                  // Instantly reset to -100% and animate back to 0%
                  gsap.set(buttonLine, { x: "-100%" });
                  gsap.to(buttonLine, {
                    x: "0%",
                    duration: 0.4,
                    ease: "power2.out"
                  });
                }
              });
            }

            buttonText.addEventListener("mouseenter", animateLine);
            buttonText.addEventListener("mouseleave", animateLine);
          }
        }
      });
    });
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
          { yPercent: 100, willChange: "transform" },
          {
            yPercent: 0,
            ease: "power4.out",
            duration: 0.8,
            stagger: {each: 0.2},
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
      document.querySelectorAll("[data-animation-rich='heading-text']").forEach((richText) => {
        richText.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((heading) => {
          heading.setAttribute("data-animation", "heading-text");
        });
      });

      document.querySelectorAll("[data-split-rich='true']").forEach((richText) => {
        richText.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((heading) => {
          heading.setAttribute("data-split-only", "true");
        });
      });

      const blurHeading = document.querySelectorAll('[data-animation="heading-text"]');
      blurHeading.forEach((element) => {
        new HeadingEffect(element);
      });

      const splitText = document.querySelectorAll('[data-split-only="true"]');
      splitText.forEach((element) => {
        new splitTextEffect(element);
      });

      const splitWords = document.querySelectorAll('[data-split-words="true"]');
      splitWords.forEach((element) => {
        new splitWordEffect(element);
      });
    })();
  }, "font-loaded");

  pageFunctions.addFunction('cardHover', function() {
    // Apply animation only for screens wider than 992px
    gsap.matchMedia().add("(min-width: 992px)", () => {
      let cardsTL = document.querySelectorAll("[data-card-tl=hover-animation]");
      let cardsTLBR = document.querySelectorAll("[data-card-tlbr=hover-animation]");

      // Hover animation function to avoid repetition
      function applyHoverAnimation(cards, clipPathStart, clipPathEnd) {
        cards.forEach(function(card) {
          const visual = card.querySelector('[data-card=hover-visual]');
          const button = card.querySelector('[data-card=hover-button]');

          if (visual && button) {
            // Create a timeline and keep it paused initially
            let tlCardHover = gsap.timeline({ paused: true });

            // Animate the visual's clip-path
            tlCardHover.fromTo(visual, {
              clipPath: clipPathStart,
            }, 
                               {
              clipPath: clipPathEnd,
              duration: 0.6,
              ease: "power2.out"
            });

            // Animate the button's opacity from 0 to 1
            tlCardHover.from(button, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out"
            }, "<");

            // Add event listeners for mouseenter and mouseleave
            card.addEventListener("mouseenter", function() {
              tlCardHover.restart();  // Restart the timeline on hover
            });

            card.addEventListener("mouseleave", function() {
              tlCardHover.reverse();  // Reverse the timeline on mouse leave
            });
          }
        });
      }

      // Apply hover animations for both card types
      if (cardsTL.length > 0) {
        applyHoverAnimation(cardsTL, 
                            "polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 0%)",
                            "polygon(20% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 20%)"
                           );
      }

      if (cardsTLBR.length > 0) {
        applyHoverAnimation(cardsTLBR, 
                            "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%, 0% 100%, 0% 0%)",
                            "polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)"
                           );
      }
    });
  });

  pageFunctions.addFunction("globalAnimation", function () {
    let elementInView = document.querySelectorAll("[data-animation=in-view]");
    let elementInViewD1 = document.querySelectorAll("[data-animation=in-view-d1]");
    let elementInViewD2 = document.querySelectorAll("[data-animation=in-view-d2]");
    let elementScale = document.querySelectorAll("[data-animation=scale]");


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

    if (elementScale.length > 0) {
      elementScale.forEach(function (element) {
        let tlElementScale = gsap.timeline({ paused: true });

        tlElementScale.from(element, { scale: 0.4, duration: 1, ease: "power2.out" });

        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlElementScale,
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
