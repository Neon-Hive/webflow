// Custom Ease
gsap.registerPlugin(ScrollTrigger, CustomEase, ScrambleTextPlugin, Flip);
pageFunctions.addFunction("globalEase", function () {
  // Create custom easing functions

  // Headings split movement, page transition
  CustomEase.create("inOutQuart", "0.77, 0, 0.175, 1");
  CustomEase.create("inCubic", "0.55, 0.055, 0.675, 0.19");
  // Flip
  CustomEase.create("CubicOut", "0.32, 0.94, 0.60, 1.00");
  CustomEase.create("inOutCirc", "1, 0, 0, 1");
  CustomEase.create("inOutsine", "0.445, 0.05, 0.55, 0.95");
  // Opacity 
  CustomEase.create("easeOut", "0.00, 0.00, 0.67, 1.00");
  // Accordion
  CustomEase.create("accordionHeight", "999.5, 760.0");
  CustomEase.create("accordionVisual", "0.68, -0.55, 0.27, 1.55");
  // Random
  CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
  CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
  CustomEase.create("inQuad", "0.55, 0.085, 0.68, 0.53");
  CustomEase.create("inOutExpo", "1, 0, 0, 1");
});

// Split Animation
pageFunctions.addFunction('globalSplit', function () {
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
          wrapper.classList.add("lines-wrap");
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

    window.TextEffectLines = class TextEffectLines {
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
          lines, { yPercent: 110, willChange: "transform" },
          {
            yPercent: 0,
            ease: "inOutQuart",
            duration: 1.2,
            stagger: { each: 0.1 },
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
        const debounce = (func, delay) => {
          let timer;
          return function (...args) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(context, args), delay);
          };
        };

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
    };

    window.ScrambleTextEffect = class ScrambleTextEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }

      initializeEffect() {
        // Use TextSplitter to split text into characters
        this.splitter = new TextSplitter(this.textElement, "chars");
        this.animate();
      }

      animate() {
        const chars = this.splitter.getChars(); // Get the individual characters
        if (chars.length === 0) {
          return;
        }

        // Animate opacity fast
        gsap.fromTo(
          chars, { opacity: 0 }, // Initial opacity for each character
          {
            opacity: 1, // Final opacity
            ease: "easeOut",
            duration: 0.2, // Fast duration for opacity
            stagger: { each: 0.1 }, // Sequential animation
            scrollTrigger: {
              trigger: this.textElement,
              start: "top 95%",
              end: "bottom 95%",
              toggleActions: "play none none none",
            },
          }
        );

        // Animate scrambleText effect with a longer duration
        gsap.to(
          chars,
          {
            scrambleText: {
              chars: "upperCase", // Random uppercase characters for scrambling
              speed: 0.5, // Moderate scrambling speed
              text: "{original}", // Use the original text for unscrambling
              delimiter: "", // Reveal character by character
            },
            duration: 1.2, // Longer duration for scrambling
            stagger: { each: 0.1 }, // Sequential animation
            scrollTrigger: {
              trigger: this.textElement,
              start: "top 95%",
              end: "bottom 95%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    };

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

    class splitCharsEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }
      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "chars");
      }
    }

    class splitHeaderEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }
      initializeEffect() {
        this.splitter = new TextSplitter(this.textElement, "chars, words");
      }
    }

    (function () {
      document
        .querySelectorAll("[data-animation-rich='text-lines']")
        .forEach((richText) => {
          richText
            .querySelectorAll("h1, h2, h3, h4, h5, h6, p")
            .forEach((heading) => {
              heading.setAttribute("data-animation", "text-lines");
            });
        });

      const TextLines = document.querySelectorAll(
        "[data-animation='text-lines']"
      );
      TextLines.forEach((element) => {
        new TextEffectLines(element);
      });

      const scrambleText = document.querySelectorAll(
        "[data-animation='scramble']"
      );
      scrambleText.forEach((element) => {
        new ScrambleTextEffect(element);
      });

      const splitLines = document.querySelectorAll("[data-split-lines]");
      splitLines.forEach((element) => {
        new splitLinesEffect(element);
      });

      const splitCharsOnly = document.querySelectorAll("[data-split-chars]");
      splitCharsOnly.forEach((element) => {
        new splitCharsEffect(element);
      });

      const splitHeader = document.querySelectorAll("[data-animation=header-word]");
      splitHeader.forEach((element) => {
        new splitHeaderEffect(element);
      });

    })();
  },
  "globalEase",
  "font-loaded"
);

pageFunctions.addFunction("Navigation", function () {
  // Get DOM elements
  const navButton = document.querySelector('.nav_button_wrap');
  const navMenu = document.querySelector('.nav_menu_wrapper');
  const navButtonText = document.querySelector('.nav_button_text');
  const navMenuVisual = document.querySelector('.nav_menu_visual_inner');
  const navLinks = document.querySelectorAll('.nav_menu_link_wrap');
  const navFade = document.querySelectorAll('[data-animation=nav-fade]');
  const pageMain = document.querySelector('.page_main');
  let isOpen = false;
  let isAnimating = false;

  // Create an array of elements that exist for fading
  const fadeElements = [
    ...(navMenuVisual ? [navMenuVisual] : []),
    ...(navFade.length ? Array.from(navFade) : [])
  ].filter(Boolean);

  // Set initial styles
  gsap.set(navMenu, {
    display: 'none',
    height: 0
  });

  // Set initial states for animations
  navLinks.forEach(link => {
    const chars = link.querySelectorAll('.char');
    const icon = link.querySelector('.nav_menu_link_icon');
    gsap.set(chars, { yPercent: 110 });
    gsap.set(icon, { opacity: 0 });
    gsap.set(link, { opacity: 0 });
  });

  // Text scramble effect setup
  const scrambleText = {
    original: navButtonText.textContent,
    target: 'CLOSE'
  };

  // Animation settings
  const animSettings = {
    openDuration: 1.2,
    closeDuration: 0.6,
    ease: 'inOutQuart'
  };

  // Create responsive context
  const mm = gsap.matchMedia();

  // Function to handle scroll control
  function toggleScroll(disable) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (disable) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (window.lenis) {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (window.lenis) {
        window.lenis.start();
      }
    }
  }

  // Add public method to close navigation
  window.closeNavigation = () => {
    return new Promise((resolve) => {
      if (!isOpen) {
        resolve();
        return;
      }

      isAnimating = true;

      gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            resolve();
          }
        })
        .to(navLinks, {
          opacity: 0,
          duration: 0.2,
          ease: 'easeOut',
          onComplete: () => {
            navLinks.forEach(link => {
              const chars = link.querySelectorAll('.char');
              const icon = link.querySelector('.nav_menu_link_icon');
              gsap.set(chars, { yPercent: 110 });
              gsap.set(icon, { opacity: 0 });
              gsap.set(link, { opacity: 0 });
            });
          }
        })
        .to(navMenu, {
          height: 0,
          duration: animSettings.closeDuration,
          ease: animSettings.ease
        }, 0)
        .to(pageMain, {
          marginTop: 0,
          duration: animSettings.closeDuration,
          ease: animSettings.ease
        }, 0)
        .add(() => {
          gsap.to(navButtonText, {
            duration: 0.6,
            scrambleText: {
              text: scrambleText.original,
              chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
              speed: 0.3,
              ease: 'power2.inOut'
            }
          });
        }, 0)
        .to(fadeElements, {
          opacity: 0,
          duration: 0.2,
          ease: 'easeOut'
        }, 0)
        .set(navMenu, { display: 'none' })
        .call(() => {
          ScrollTrigger.refresh();
          isOpen = false;
          navButton.setAttribute('aria-expanded', false);
          navMenu.setAttribute('aria-hidden', true);
          toggleScroll(false);
        });
    });
  };

  // Handle menu animations
  function toggleMenu() {
    if (isAnimating) return;

    isAnimating = true;
    isOpen = !isOpen;

    // Update accessibility
    navButton.setAttribute('aria-expanded', isOpen);
    navMenu.setAttribute('aria-hidden', !isOpen);

    // Toggle scroll based on menu state
    toggleScroll(isOpen);

    // Get height based on screen size
    const navHeight = window.innerWidth < 768 ? '100dvh' : '80vh';

    if (isOpen) {
      gsap.timeline({
          onComplete: () => {
            isAnimating = false;
          }
        })
        .set(navMenu, { display: 'block' })
        .set(fadeElements, { opacity: 0 })
        // Animate nav height and page margin simultaneously
        .to(navMenu, {
          height: navHeight,
          duration: animSettings.openDuration,
          ease: animSettings.ease
        }, 0)
        .to(pageMain, {
          marginTop: navHeight,
          duration: animSettings.openDuration,
          ease: animSettings.ease
        }, 0)
        // Scramble text effect
        .add(() => {
          gsap.to(navButtonText, {
            duration: 0.6,
            scrambleText: {
              text: scrambleText.target,
              chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
              speed: 0.3,
              ease: 'power2.inOut'
            }
          });
        }, 0)
        // Visual element fade in
        .to(fadeElements, {
          opacity: 1,
          duration: 0.6,
          ease: 'easeOut'
        }, '-=0.6')
        // Staggered link animations
        .add(() => {
          navLinks.forEach((link, index) => {
            const chars = link.querySelectorAll('.char');
            const icon = link.querySelector('.nav_menu_link_icon');
            const delay = index * 0.1;

            gsap.to(link, {
              opacity: 1,
              duration: 0.2,
              ease: 'easeOut',
              delay: delay
            });

            gsap.to(icon, {
              opacity: 1,
              duration: 0.3,
              ease: 'easeOut',
              delay: delay
            });

            gsap.to(chars, {
              yPercent: 0,
              duration: 0.5,
              stagger: 0.02,
              ease: 'inOutQuart',
              delay: delay
            });
          });
        }, '<');
    } else {
      gsap.timeline({
          onComplete: () => {
            isAnimating = false;
          }
        })
        .to(navLinks, {
          opacity: 0,
          duration: 0.2,
          ease: 'easeOut',
          onComplete: () => {
            navLinks.forEach(link => {
              const chars = link.querySelectorAll('.char');
              const icon = link.querySelector('.nav_menu_link_icon');
              gsap.set(chars, { yPercent: 110 });
              gsap.set(icon, { opacity: 0 });
              gsap.set(link, { opacity: 0 });
            });
          }
        })
        .to(navMenu, {
          height: 0,
          duration: animSettings.closeDuration,
          ease: animSettings.ease
        }, 0)
        .to(pageMain, {
          marginTop: 0,
          duration: animSettings.closeDuration,
          ease: animSettings.ease
        }, 0)
        .add(() => {
          gsap.to(navButtonText, {
            duration: 0.6,
            scrambleText: {
              text: scrambleText.original,
              chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
              speed: 0.3,
              ease: 'power2.inOut'
            }
          });
        }, 0)
        .to(fadeElements, {
          opacity: 0,
          duration: 0.2,
          ease: 'easeOut'
        }, 0)
        .set(navMenu, { display: 'none' })
        .call(() => {
          ScrollTrigger.refresh();
        });
    }
  }

  // Close menu if clicking outside
  function handleClickOutside(event) {
    if (isOpen && !isAnimating && !navMenu.contains(event.target) && !navButton.contains(event
        .target)) {
      toggleMenu();
    }
  }

  // Handle keyboard navigation
  function handleKeyboard(event) {
    if (event.key === 'Escape' && isOpen && !isAnimating) {
      toggleMenu();
    }
  }

  // Handle resize events
  window.addEventListener('resize', () => {
    if (isOpen && !isAnimating) {
      const navHeight = window.innerWidth < 768 ? '100vh' : '80vh';
      gsap.set(navMenu, { height: navHeight });
      gsap.set(pageMain, { marginTop: navHeight });
    }
  });

  // Set up event listeners
  navButton.addEventListener('click', toggleMenu);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyboard);

  function updateTime() {
    const timeElement = document.querySelector('[data-attribute="time"]');
    if (timeElement) {
      const now = new Date();

      // Convert to London timezone
      const options = {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const londonTime = new Intl.DateTimeFormat('en-GB', options).format(now);

      timeElement.textContent = londonTime;
    }
  }

  // Update time immediately
  updateTime();

  // Optionally, keep updating the time every second
  setInterval(updateTime, 1000);

  // Select all navigation projects
  const navHover = document.querySelectorAll(".nav_menu_wrapper");

  navHover.forEach(nav => {
    // Select all links and visuals inside the current project
    const links = nav.querySelectorAll(".nav_menu_link_wrap");
    const visuals = nav.querySelectorAll(".nav_menu_visual");

    links.forEach((link, index) => {
      link.addEventListener("mouseenter", () => {
        // Remove is-active class from all visuals and links
        links.forEach(otherLink => otherLink.classList.remove("is-active"));
        visuals.forEach(visual => visual.classList.remove("is-active"));

        // Add is-active class to the hovered link and corresponding visual
        link.classList.add("is-active");
        if (visuals[index]) {
          visuals[index].classList.add("is-active");
        }
      });

      link.addEventListener("mouseleave", () => {
        // Remove is-active class from ALL links and visuals
        links.forEach(otherLink => otherLink.classList.remove("is-active"));
        visuals.forEach(visual => visual.classList.remove("is-active"));

      });
    });
  });

}, "globalEase", "globalSplit");

// PageTransition
pageFunctions.addFunction("pageTransition", function () {

  // Define reusable variables for elements
  const headerText = document.querySelectorAll("[data-animation='header-text']");
  const navComponent = document.querySelectorAll("[data-animation='header-nav']");
  const headerChar = document.querySelectorAll("[data-animation='header-word']");
  const headerButtons = document.querySelectorAll("[data-animation='header-button']");
  const headerFade = document.querySelectorAll("[data-animation='header-fade']");
  const headerMove = document.querySelectorAll("[data-animation='header-move']");
  const headerBg = document.querySelectorAll("[data-animation='header-bg']");
  const headerBgScale = document.querySelectorAll("[data-animation='header-bg-scale']");
  const headerSubtitle = document.querySelector("[data-animation='header-subtitle']");
  const headerNext = document.querySelector("[data-animation='header-next']");

  // Page Reveal vars with Flip
  const logoContainer = document.querySelector('[data-attribute="logo-container"]');
  const logoElement = document.querySelector('[data-attribute="logo-element"]');
  const logoTarget = document.querySelector('[data-attribute="logo-target"]');

  // Function to handle Flip animations
  function createFlipAnimation() {
    if (logoElement && logoTarget) {
      // Capture initial state
      const state = Flip.getState(logoElement);

      // Move element to target
      logoTarget.appendChild(logoElement);

      // Create flip animation
      return Flip.from(state, {
        duration: 1.2,
        ease: "inOutQuart",
        absolute: true,
        onComplete: () => {
          // Cleanup after flip completes
          gsap.set(logoElement, { clearProps: "all" });
        }
      });
    }
    return null;
  }

  // Function to create reverse flip animation
  function createReverseFlipAnimation() {
    if (logoElement && logoContainer) {
      // Capture current state before moving
      const state = Flip.getState(logoElement);
      // Move back to original container
      logoContainer.appendChild(logoElement);
      // Create reverse flip animation
      return Flip.from(state, {
        duration: 1.2,
        ease: "inOutQuart",
        absolute: true,
        onComplete: () => {
          gsap.set(logoElement, { clearProps: "all" });
        }
      });
    }
    return null;
  }

  // General page load transition with Flip integration
  let tlPageReveal = gsap.timeline({
    onComplete: () => {
      gsap.set(".transition_wrap", { display: "none" });
    },
  });

  tlPageReveal
    .set(".transition_wrap", {
      display: "flex",
      willChange: "clip-path",
    })
    .fromTo(
      ".transition_wrap",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        delay: 0.2,
        duration: 1.2,
        ease: "inOutQuart",
      }
    )
    .add(() => {
      const flipAnim = createFlipAnimation();
      if (flipAnim) {
        tlPageReveal.add(flipAnim, "-=0.6");
      }
      runAnimation();
    }, "-=0.6");

  // Function to determine which animation to run
  function runAnimation() {
    const pageName = $("body").data("page");

    if (!pageName) {
      runGlobalAnimation();
    } else {
      switch (pageName) {
      case "home":
        runHomePageAnimation();
        break;
      case "services":
        runServicesPageAnimation();
        break;
      case "cs":
        runCsPageAnimation();
        break;
      case "legal":
        runLegalPageAnimation();
        break;
      case "success":
        runSuccessPageAnimation();
        break;
      case "error":
        runErrorPageAnimation();
        break;
      case "contact":
        runContactPageAnimation();
        break;
      }
    }
  }

  // Global animation
  function runGlobalAnimation() {
    let tl = gsap.timeline();

    // Ensure visibility for headerBg
    if (headerBg) {
      gsap.set(headerBg, { visibility: "visible" });
      tl.fromTo(
        headerBg, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "easeOut" }
      );
    }

    // Ensure visibility for headerText
    if (headerText) {
      gsap.set(headerText, { visibility: "visible" });
      headerText.forEach(header => {
        tl.from(header.querySelectorAll(".line"), {
          yPercent: 110,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.2,
          stagger: { each: 0.1 },
        }, "-=0.2");
      });
    }

    // Ensure visibility for navComponent
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "easeOut" },
        "<"
      );
    }

    // Ensure visibility for headerFade
    if (headerFade.length > 0) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 }, {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "-=0.2"
      );
    }

    // Ensure visibility for headerMove
    if (headerMove.length > 0) {
      gsap.set(headerMove, { visibility: "visible" }); // Corrected to `headerMove`
      tl.fromTo(
        headerMove, { opacity: 0, yPercent: 20 }, {
          opacity: 1,
          yPercent: 0,
          duration: 1,
          stagger: 0.2,
          ease: "easeOut"
        },
        "-=0.2"
      );
    }

    // Ensure visibility for headerNext
    if (headerNext) {
      gsap.set(headerNext, { visibility: "visible" });
      tl.fromTo(
        headerNext, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "easeOut" },
        "-=0.2"
      );
    }
  }

  // Page-specific animation for Home page
  function runHomePageAnimation() {
    let tl = gsap.timeline();

    // Ensure headerBgScale animations
    if (headerBgScale) {
      gsap.set(headerBgScale, { visibility: "visible" });
      headerBgScale.forEach(header => {
        tl.from(header, {
          scale: 0,
          skewY: -10,
          rotateY: -25,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.6,
        });
      });
    }

    // Ensure headerMove animations
    if (headerMove) {
      gsap.set(headerMove, { visibility: "visible" });
      tl.fromTo(
        headerMove, { yPercent: 200 }, {
          yPercent: 0,
          duration: 1.1,
          willChange: "transform",
          stagger: { each: 0.15 },
          ease: "inOutQuart"
        },
        "<0.2"
      );
      tl.from(
        headerMove, {
          opacity: 0,
          duration: 0.4,
          stagger: { each: 0.15 },
          ease: "easeOut"
        },
        "<"
      );
    }

    // Ensure headerFade animations
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "-=0.2"
      );
    }

    // Ensure navComponent animations
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "<"
      );
    }
  }

  // Page-specific animation for CS Template page
  function runCsPageAnimation() {
    let tl = gsap.timeline();
    if (headerBgScale) {
      gsap.set(headerBgScale, { visibility: "visible" });
      headerBgScale.forEach(header => {
        tl.from(header, {
          scale: 0,
          skewY: -8,
          rotateY: -25,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.6,
        });
      });
    }
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "-=0.2"
      );
    }
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "<"
      );
    }
    if (headerNext) {
      gsap.set(headerNext, { visibility: "visible" });
      tl.fromTo(
        headerNext, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "<"
      );
    }

  }

  // Page-specific animation for Services and Studio page
  function runServicesPageAnimation() {
    const wordsSection = document.querySelector("[data-words-section]");
    let tl = gsap.timeline();

    if (headerChar.length) {
      let headerArray = Array.from(headerChar);
      headerArray.forEach((header, i) => {
        const chars = header.querySelectorAll(".char");
        // Set initial state for chars
        gsap.set(chars, {
          scale: 0,
          visibility: "visible",
          transformOrigin: "bottom left"
        });
        // Animate chars inside each word
        tl.to(chars, {
          scale: 1,
          visibility: "visible",
          ease: "inOutQuart",
          duration: 0.8,
          stagger: { amount: 0.1 }
        }, i * 0.15);
      });
    }

    if (headerBg) {
      gsap.set(headerBg, { visibility: "visible" });
      tl.fromTo(
        headerBg, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "easeOut" },
        0
      );
    }

    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "<0.2"
      );
    }

    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "easeOut" },
        "<"
      );
    }

    let tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: wordsSection,
        start: "bottom bottom",
        end: "bottom center",
        scrub: true,
      }
    });

    if (headerChar.length) {
      const allButLastHeader = Array.from(headerChar).slice(0, -1);
      tl2.to(allButLastHeader, {
        opacity: 0,
      });
    }

    if (headerBg) {
      tl2.set(headerBg, { willChange: "transform" });
      tl2.to(headerBg, {
        yPercent: 10,
      }, 0);
    }

    return { firstTimeline: tl, secondTimeline: tl2 };
  }

  // Global animation
  function runLegalPageAnimation() {
    let tl = gsap.timeline();
    if (headerText) {
      gsap.set(headerText, { visibility: "visible" });
      headerText.forEach(header => {
        tl.from(header.querySelectorAll(".line"), {
          yPercent: 110,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.2,
          stagger: { each: 0.1 },
        });
      });
    }
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "easeOut" },
        "<"
      );
    }
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 }, {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "-=0.2"
      );
    }
  }

  // Page-specific animation for Success page
  function runSuccessPageAnimation() {
    let tl = gsap.timeline();

    // Background Scale Animation
    if (headerBgScale) {
      gsap.set(headerBgScale, { visibility: "visible" });
      headerBgScale.forEach(header => {
        tl.from(header, {
          scale: 0,
          skewY: -8,
          rotateY: -25,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.2
        });
      });
    }

    // Header Text Animation
    if (headerText) {
      gsap.set(headerText, { visibility: "visible" });
      headerText.forEach(header => {
        tl.from(header.querySelectorAll(".line"), {
          yPercent: 110,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.2,
          stagger: { each: 0.1 }
        }, "-=0.4");
      });
    }

    // Subtitle Animation
    if (headerSubtitle) {
      const subtitleDot = headerSubtitle.querySelector('.g_subtitle_dot');
      const subtitleText = headerSubtitle.querySelector('.g_subtitle_text');

      gsap.set(headerSubtitle, { visibility: "visible" });

      if (subtitleText) {
        gsap.set(subtitleText, { opacity: 0 });
      }

      if (subtitleDot) {
        tl.fromTo(
          subtitleDot, { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "easeOut"
          },
          "<"
        );
      }

      if (subtitleText) {
        tl.to(
          subtitleText,
          {
            opacity: 1,
            duration: 0.6,
            ease: "easeOut"
          },
          "<"
        ).to(
          subtitleText,
          {
            scrambleText: {
              chars: "upperCase",
              speed: 0.6,
              text: "{original}",
              delimiter: ""
            },
            duration: 0.6
          },
          "<"
        );
      }
    }

    // Button Animation
    if (headerButtons.length > 0) {
      headerButtons.forEach(button => {
        const buttonIcon = button.querySelector("[data-button-animation=icon]");
        const buttonText = button.querySelector("[data-button-animation=text]");
        const buttonLine = button.querySelector("[data-button-animation=line]");

        gsap.set(button, { visibility: "visible" });

        if (buttonIcon) {
          tl.fromTo(
            buttonIcon, { opacity: 0 },
            {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            "<"
          );
        }

        if (buttonLine) {
          tl.fromTo(
            buttonLine, { width: "0%" },
            {
              width: "100%",
              duration: 0.8,
              ease: "inOutQuart"
            },
            "<"
          );
        }

        if (buttonText) {
          tl.fromTo(
            buttonText,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            "<"
          );
        }
      });
    }

    // Navigation Component Animation
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "easeOut"
        },
        "<"
      );
    }

    // Header Fade Animation
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "<"
      );
    }

    // Header Next Animation
    if (headerNext) {
      gsap.set(headerNext, { visibility: "visible" });
      tl.fromTo(
        headerNext, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "<"
      );
    }
  }

  // Page-specific animation for Error page
  function runErrorPageAnimation() {
    let tl = gsap.timeline();
    // Header Text Animation
    if (headerText.length > 0) {
      gsap.set(headerText, { visibility: "visible" });
      headerText.forEach(header => {
        tl.from(header.querySelectorAll(".line"), {
          yPercent: 110,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.2,
          stagger: { each: 0.1 }
        });
      });
    }
    // Header Fade Animation
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "-=0.2"
      );
    }
    // Button Animation
    if (headerButtons.length > 0) {
      headerButtons.forEach(button => {
        const buttonIcon = button.querySelector("[data-button-animation=icon]");
        const buttonText = button.querySelector("[data-button-animation=text]");
        const buttonLine = button.querySelector("[data-button-animation=line]");

        gsap.set(button, { visibility: "visible" });

        if (buttonIcon) {
          tl.fromTo(
            buttonIcon, { opacity: 0 },
            {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            "-=0.2"
          );
        }

        if (buttonLine) {
          tl.fromTo(
            buttonLine, { width: "0%" },
            {
              width: "100%",
              duration: 0.8,
              ease: "inOutQuart"
            },
            "<"
          );
        }

        if (buttonText) {
          tl.fromTo(
            buttonText,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            "<"
          );
        }
      });
    }
    // BG Animation
    if (headerBg) {
      gsap.set(headerBg, { visibility: "visible" });
      tl.fromTo(
        headerBg, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "easeOut" }, "-=0.2"
      );
    }
  }

  // Page-specific animation for Contact page
  function runContactPageAnimation() {
    let tl = gsap.timeline();
    // Header Text Animation
    if (headerText.length > 0) {
      gsap.set(headerText, { visibility: "visible" });
      headerText.forEach(header => {
        tl.from(header.querySelectorAll(".line"), {
          yPercent: 110,
          willChange: "transform",
          ease: "inOutQuart",
          duration: 1.2,
          stagger: { each: 0.1 }
        });
      });
    }

    // Header Fade Animation
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "-=0.2"
      );
    }

    // Navigation Component Animation
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "easeOut"
        },
        "<"
      );
    }

    // Subtitle Animation
    if (headerSubtitle) {
      const subtitleDot = headerSubtitle.querySelector('.g_subtitle_dot');
      const subtitleText = headerSubtitle.querySelector('.g_subtitle_text');

      gsap.set(headerSubtitle, { visibility: "visible" });

      if (subtitleText) {
        gsap.set(subtitleText, { opacity: 0 });
      }

      if (subtitleDot) {
        tl.fromTo(
          subtitleDot, { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "easeOut"
          },
          "<"
        );
      }

      if (subtitleText) {
        tl.to(
          subtitleText,
          {
            opacity: 1,
            duration: 0.6,
            ease: "easeOut"
          },
          "<"
        ).to(
          subtitleText,
          {
            scrambleText: {
              chars: "upperCase",
              speed: 0.6,
              text: "{original}",
              delimiter: ""
            },
            duration: 0.6
          },
          "<"
        );
      }
    }

    // Button Animation
    if (headerButtons.length > 0) {
      headerButtons.forEach(button => {
        const buttonIcon = button.querySelector("[data-button-animation=icon]");
        const buttonText = button.querySelector("[data-button-animation=text]");
        const buttonLine = button.querySelector("[data-button-animation=line]");

        gsap.set(button, { visibility: "visible" });

        if (buttonIcon) {
          tl.fromTo(
            buttonIcon, { opacity: 0 },
            {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            "<"
          );
        }

        if (buttonLine) {
          tl.fromTo(
            buttonLine, { width: "0%" },
            {
              width: "100%",
              duration: 0.8,
              ease: "inOutQuart"
            },
            "<"
          );
        }

        if (buttonText) {
          tl.fromTo(
            buttonText,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            "<"
          );
        }
      });
    }

    // Header Next Animation
    if (headerNext) {
      gsap.set(headerNext, { visibility: "visible" });
      tl.fromTo(
        headerNext, { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "easeOut"
        },
        "<"
      );
    }
  }

  // Update the click handler for links
  $("a:not(.excluded-class)").on("click", async function (e) {
    let currentUrl = $(this).attr("href");

    // Check conditions for internal navigation
    if (
      $(this).prop("hostname") === window.location.host && // Same host
      !currentUrl.includes("#") && // Not a hash link
      $(this).attr("target") !== "_blank" // Not opening in a new tab
    ) {
      e.preventDefault();

      // First, check if we need to close the navigation
      if (window.closeNavigation) {
        await window.closeNavigation();
      }

      // After navigation is closed, proceed with page transition
      let tl = gsap.timeline({
        onComplete: () => {
          window.location.href = currentUrl;
        },
      });

      // Create the reverse flip animation if applicable
      const reverseFlipAnim = createReverseFlipAnimation();

      // Start the page transition animation
      tl.set(".transition_wrap", {
          display: "flex",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",

        })
        .fromTo(
          ".transition_wrap",
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.6,
            ease: "easeOut",
          }
        );

      // Add the reverse flip animation if it exists
      if (reverseFlipAnim) {
        tl.add(reverseFlipAnim, "-=0.6");
      }
    }
  });

  // Handle back button with a page refresh to ensure correct state
  window.onpageshow = function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  };
}, "globalSplit");

// Lennis
pageFunctions.addFunction('globalLennis', function () {
  // Make lenis globally accessible
  window.lenis = new Lenis({
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    lerp: 0.1,
    wheelMultiplier: 0.7,
    mouseMultiplier: 0.7,
    smoothTouch: false,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Data attribute handlers
  document.querySelectorAll('[data-lenis-start="true"]').forEach(function (element) {
    element.addEventListener('click', function () {
      window.lenis.start();
    });
  });

  document.querySelectorAll('[data-lenis-stop="true"]').forEach(function (element) {
    element.addEventListener('click', function () {
      window.lenis.stop();
    });
  });

  document.querySelectorAll('[data-lenis-hover]').forEach(function (parentElement) {
    parentElement.addEventListener('mouseenter', function () {
      window.lenis.stop();
    });

    parentElement.addEventListener('mouseleave', function (event) {
      // Check if the mouse is leaving both the parent and its child (.w-dropdown-list)
      if (
        !parentElement.contains(event.relatedTarget) ||
        !parentElement.querySelector('.w-dropdown-list')?.contains(event.relatedTarget)
      ) {
        window.lenis.start();
      }
    });
  });

  document.querySelectorAll('[data-lenis-toggle]').forEach(function (element) {
    element.addEventListener('click', function () {
      element.classList.toggle('stop-scroll');
      if (element.classList.contains('stop-scroll')) {
        window.lenis.stop();
      } else {
        window.lenis.start();
      }
    });
  });
});

// Global Animation
pageFunctions.addFunction("globalAnimation", function () {
  // Global Items - Smaller item smaller duration
  const elementInView = document.querySelectorAll("[data-animation=in-view]");
  const elementInViewD1 = document.querySelectorAll("[data-animation=in-view-d1]");
  const elementInViewD2 = document.querySelectorAll("[data-animation=in-view-d2]");
  const elementInViewStagger = document.querySelectorAll("[data-animation=in-view-stagger]");
  const elementInViewMove = document.querySelectorAll("[data-animation=in-view-move]");
  const elementInViewClip = document.querySelectorAll("[data-animation=in-view-clip]");
  const elementInViewLine = document.querySelectorAll("[data-animation=in-view-line]");
  const visualParallex = document.querySelectorAll("[data-animation=visual-parallex]");

  // Specific Items - Button
  window.ButtonAnimation = class ButtonAnimation {
    constructor(selector) {
      this.buttons = document.querySelectorAll(selector);
      this.init();
    }

    init() {
      this.buttons.forEach((button) => {
        const buttonIcon = button.querySelector("[data-button-animation=icon]");
        const buttonText = button.querySelector("[data-button-animation=text]");
        const buttonLine = button.querySelector("[data-button-animation=line]");

        // Create GSAP timeline for the button
        const tlButton = gsap.timeline({
          scrollTrigger: {
            trigger: button,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        });

        // Animate the icon's opacity
        if (buttonIcon) {
          tlButton.from(buttonIcon, {
            opacity: 0,
            duration: 0.6,
            ease: "easeOut",
          });
        }

        // Animate the line's width
        if (buttonLine) {
          tlButton.fromTo(
            buttonLine, { width: "0%" },
            {
              width: "100%",
              duration: 0.8,
              ease: "inOutQuart",
            },
            0
          );
        }

        // Animate the text's opacity
        if (buttonText) {
          tlButton.fromTo(
            buttonText, { opacity: 0 }, {
              opacity: 1,
              duration: 0.6,
              ease: "easeOut"
            },
            0 // Start simultaneously with other animations
          );

          // // Animate the text with scramble effect
          // tlButton.to(
          //   buttonText,
          //   {
          //     scrambleText: {
          //       chars: "upperCase", // Random uppercase characters
          //       speed: 0.8, // Scrambling speed
          //       text: "{original}", // Use original text for unscrambling
          //       delimiter: "", // Reveal character by character
          //     },
          //     duration: 1.6, // Duration for the scramble effect
          //   },
          //   "-=0.4" // Start slightly before the opacity finishes
          // );
        }
      });
    }
  };

  // Instantiate the class
  window.addEventListener("load", () => {
    new ButtonAnimation("[data-animation=in-view-button]");
  });

  // Footer Lines
  const footerHLine = document.querySelectorAll(".footer_horizontal_line");
  const footerVLine = document.querySelectorAll(".footer_vertical_line");

  // Animations
  if (elementInView.length > 0) {
    elementInView.forEach((element) => {
      const tlElementInView = gsap.timeline({ paused: true });
      tlElementInView.from(element, {
        opacity: 0,
        duration: 1.2,
        ease: "easeOut",
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
    elementInViewD1.forEach((element) => {
      const tlElementInViewD1 = gsap.timeline({ paused: true });
      tlElementInViewD1.fromTo(element, {
        delay: 0.1,
        opacity: 0,
        duration: 1.2,
        ease: "easeOut",
      }, { opacity: 1 });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewD1,
      });
    });
  }

  if (elementInViewD2.length > 0) {
    elementInViewD2.forEach((element) => {
      const tlElementInViewD2 = gsap.timeline({ paused: true });
      tlElementInViewD2.from(element, {
        delay: 0.2,
        opacity: 0,
        duration: 1.2,
        ease: "easeOut",
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
    elementInViewMove.forEach((element) => {
      const tlElementInViewMove = gsap.timeline({ paused: true });
      tlElementInViewMove.from(element, {
        delay: 0.2,
        opacity: 0,
        y: "1rem",
        duration: 0.8,
        ease: "easeOut",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewMove,
      });
    });
  }

  if (elementInViewStagger.length > 0) {
    elementInViewStagger.forEach((parentElement) => {
      const children = parentElement.children;
      const tlElementInViewStagger = gsap.timeline({
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
        ease: "easeOut",
        stagger: 0.2, // Apply stagger effect to children
      });
    });
  }

  if (footerHLine.length > 0) {
    footerHLine.forEach((element) => {
      const tlFooterHLine = gsap.timeline({ paused: true });
      tlFooterHLine.from(element, {
        width: "0%",
        duration: 1.2,
        ease: "inOutQuart",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlFooterHLine,
      });
    });
  }

  if (footerVLine.length > 0) {
    footerVLine.forEach((element) => {
      const mm = gsap.matchMedia();

      // Define animations for different screen sizes
      mm.add("(min-width: 992px)", () => {
        // For screens larger than 991px
        const tlFooterVLine = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        });

        tlFooterVLine.from(element, {
          height: "0%",
          duration: 1.2,
          ease: "inOutQuart",
        });
      });

      mm.add("(max-width: 991px)", () => {
        // For screens smaller than or equal to 991px
        const tlFooterVLine = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        });

        tlFooterVLine.from(element, {
          width: "0%",
          duration: 1.2,
          ease: "inOutQuart",
        });
      });
    });
  }

  if (elementInViewClip.length > 0) {
    elementInViewClip.forEach((element) => {
      const tlElementInViewClip = gsap.timeline({ paused: true });
      tlElementInViewClip.fromTo(element, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.2,
        ease: "inCubic",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewClip,
      });
    });
  }

  if (elementInViewLine.length > 0) {
    elementInViewLine.forEach((element) => {
      const tlElementInViewLine = gsap.timeline({ paused: true });
      tlElementInViewLine.from(element, {
        width: "0%",
        duration: 1.2,
        ease: "inOutQuart",
      });
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInViewLine,
      });
    });
  }

  if (visualParallex.length > 0) {
    visualParallex.forEach((element) => {
      const visual = element.querySelector(".g_visual_wrap");

      if (!visual) return; // Skip if visual element not found

      gsap.fromTo(visual,
      {
        yPercent: -15,
      },
      {
        yPercent: 0,
        ease: "none", // Smoother parallax movement
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom center",
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
    });
  }

  // Hover
  // function buttonHover(button) {
  //   const buttonText = button.querySelector("[data-button-animation=text]");

  //   const buttonHoverTimeline = gsap.timeline({ paused: true });

  //   if (buttonText) {
  //     buttonHoverTimeline.to(buttonText, {
  //       scrambleText: {
  //         chars: "upperCase",
  //         speed: 0.8,
  //         text: "{original}",
  //         delimiter: "",
  //       },
  //       duration: 1.6,
  //     });
  //   }

  //   button.addEventListener("mouseenter", () => {
  //     buttonHoverTimeline.play();
  //   });

  //   button.addEventListener("mouseleave", () => {
  //     buttonHoverTimeline.reset();
  //   });
  // }

  function buttonHover(button) {
    const buttonText = button.querySelector("[data-button-animation=text]");
    if (!buttonText) return;

    let isAnimating = false;

    // Store original text on init
    const originalText = buttonText.textContent;
    buttonText.setAttribute('data-original-text', originalText);

    button.addEventListener("mouseenter", () => {
      if (!isAnimating) {
        isAnimating = true;

        gsap.to(buttonText, {
          scrambleText: {
            chars: "upperCase",
            speed: 0.8,
            text: originalText, // Use originalText instead of {original}
            delimiter: "",
            revealDelay: 0
          },
          duration: 1.6,
          onComplete: () => {
            isAnimating = false;
            // Ensure text is exactly the original at the end
            buttonText.textContent = originalText;
          }
        });
      }
    });

    button.addEventListener("mouseleave", () => {
      // Don't interrupt animation, just ensure it ends with original text
      gsap.delayedCall(1.6, () => {
        buttonText.textContent = originalText;
      });
    });

    // Initial setup
    buttonText.textContent = originalText;
  }

  // Hover Target
  document.querySelectorAll("[data-button='hover']").forEach((button) => {
    buttonHover(button);
  });

});

// Lazy Video
pageFunctions.addFunction("lazyVideo", function () {
  // Get all lazy videos and triggers
  var lazyVideos = [].slice.call(document.querySelectorAll("[data-video=lazy]"));
  var lazyTriggers = [].slice.call(document.querySelectorAll("[data-video=lazy-trigger]"));
  // Create a map to store video-trigger relationships
  var triggerMap = new Map();
  // Build relationships between triggers and videos using data attributes
  lazyTriggers.forEach(function (trigger) {
    var videoIds = trigger.dataset.videoTarget.split(',').map(id => id.trim());
    var targetVideos = videoIds
      .map(id => document.getElementById(id))
      .filter(video => video !== null); // Filter out any non-existent videos
    if (targetVideos.length > 0) {
      triggerMap.set(trigger, targetVideos);
    }
  });
  if ("IntersectionObserver" in window) {
    // Function to load the video
    function loadVideo(videoElement) {
      for (var source in videoElement.children) {
        var videoSource = videoElement.children[source];
        if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
          videoSource.src = videoSource.dataset.src;
        }
      }
      videoElement.load();
      videoElement.classList.remove("lazy");
    }
    // Helper function to check if a video has a trigger
    function videoHasTrigger(videoElement) {
      return Array.from(triggerMap.values()).some(videos =>
        videos.includes(videoElement)
      );
    }
    // Observer for videos
    var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (video) {
        if (video.isIntersecting) {
          // If no trigger exists, load the video immediately
          if (!videoHasTrigger(video.target)) {
            loadVideo(video.target);
            observer.unobserve(video.target);
          }
        }
      });
    });
    // Observer for triggers
    var triggerObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var videoElements = triggerMap.get(entry.target);
          if (videoElements) {
            // Load all videos associated with this trigger
            videoElements.forEach(function (videoElement) {
              loadVideo(videoElement);
              lazyVideoObserver.unobserve(videoElement);
            });
            observer.unobserve(entry.target);
          }
        }
      });
    });
    // Set up observers
    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
    // Observe all triggers
    lazyTriggers.forEach(function (trigger) {
      triggerObserver.observe(trigger);
    });
  }
});

// Refresh ScrollTriggers
pageFunctions.addFunction("responsiveScrollTrigger", function () {
  // Improved debounce function with immediate option
  const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function (...args) {
      const context = this;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Track pending refreshes to avoid redundant operations
  let refreshPending = false;
  let batchTimeoutId = null;

  // Batch multiple refresh requests together
  const batchedRefresh = (delay = 200) => {
    if (refreshPending) return; // Skip if already pending

    refreshPending = true;

    // Clear any existing timeout
    if (batchTimeoutId) {
      clearTimeout(batchTimeoutId);
    }

    // Set timeout for the actual refresh
    batchTimeoutId = setTimeout(() => {
      // Check if ScrollTrigger exists before refreshing
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
      refreshPending = false;
      batchTimeoutId = null;
    }, delay);
  };

  // Use ResizeObserver more efficiently
  const dimensions = {
    lastWidth: window.innerWidth,
    lastHeight: window.innerHeight,
    // Track significant breakpoints to reduce unnecessary refreshes
    breakpoint: window.innerWidth < 768 ? 'mobile' : (window.innerWidth < 992 ? 'tablet' :
      'desktop')
  };

  // Only refresh when actual breakpoints change, not on every pixel change
  const resizeObserver = new ResizeObserver(debounce(() => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newBreakpoint = newWidth < 768 ? 'mobile' :
      (newWidth < 992 ? 'tablet' : 'desktop');

    // Only refresh if there's a significant change
    const significantWidthChange = Math.abs(newWidth - dimensions.lastWidth) > 50;
    const significantHeightChange = Math.abs(newHeight - dimensions.lastHeight) > 50;
    const breakpointChange = newBreakpoint !== dimensions.breakpoint;

    if (breakpointChange || significantWidthChange || significantHeightChange) {
      dimensions.lastWidth = newWidth;
      dimensions.lastHeight = newHeight;
      dimensions.breakpoint = newBreakpoint;
      batchedRefresh(300);
    }
  }, 300));

  resizeObserver.observe(document.documentElement);

  // Throttle filter changes
  const filterContainer = document.querySelector("[fs-cmsfilter-element=filters]");
  if (filterContainer) {
    filterContainer.addEventListener("change", debounce((e) => {
      if (e.target.type === "radio") {
        batchedRefresh(500);
      }
    }, 200));
  }

  // Throttle search input
  const searchInput = document.querySelector("[filter-search]");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => batchedRefresh(500), 300));
  }

  // More efficient Finsweet attribute handling
  const fsAttributesProcessed = new Set();
  const fsAttributeHandler = (attributeName) => {
    if (fsAttributesProcessed.has(attributeName)) return;

    fsAttributesProcessed.add(attributeName);
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      attributeName,
      () => batchedRefresh(300)
    ]);
  };

  // Register Finsweet attribute handlers
  ['cmsload', 'cmsnest'].forEach(fsAttributeHandler);

  // More efficient load handler
  window.addEventListener('load', debounce(() => {
    batchedRefresh(300);
  }, 100, true)); // Use immediate execution

  // Cleanup on page change/unmount
  return () => {
    resizeObserver.disconnect();
    if (batchTimeoutId) {
      clearTimeout(batchTimeoutId);
    }
  };
});

// Copyright Year
pageFunctions.addFunction('footerCopyrightYear', function () {
  // Get the current year
  const currentYear = new Date().getFullYear();

  // Select all elements with the class 'copyright-year'
  const copyrightYearElements = document.querySelectorAll('.copyright-year');

  // Update the text content of each selected element to the current year
  copyrightYearElements.forEach(function (element) {
    element.textContent = currentYear;
  });
});
