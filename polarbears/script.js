// Heading animation function
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

    // Class for character and word splitting
    class splitCharEffect {
      constructor(textElement) {
        if (!textElement || !(textElement instanceof HTMLElement)) {
          throw new Error("Invalid text element provided.");
        }
        this.textElement = textElement;
        this.initializeEffect();
      }

      initializeEffect() {
        // Split text into both words and characters with a single TextSplitter instance
        this.splitter = new TextSplitter(this.textElement, "chars, words");
      }
    }

    gsap.registerPlugin(ScrollTrigger);

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

      const headingAnimation = document.querySelectorAll(
        "[data-animation='heading-text']"
      );
      headingAnimation.forEach((element) => {
        new HeadingEffect(element);
      });

      const splitText = document.querySelectorAll("[data-split-lines='true']");
      splitText.forEach((element) => {
        new splitTextEffect(element);
      });

      const splitWords = document.querySelectorAll("[data-split-words='true']");
      splitWords.forEach((element) => {
        new splitWordEffect(element);
      });

      // Add handling for character splitting
      const splitChars = document.querySelectorAll("[data-split-chars='true']");
      splitChars.forEach((element) => {
        new splitCharEffect(element);
      });
    })();
  },
  "font-loaded"
);

// Button animations function
pageFunctions.addFunction('buttonAnimations', function() {
  const hasPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (!hasPointerFine) return;
  const buttonTextChars = document.querySelectorAll("[data-animation-hover=text-char]");
  if (buttonTextChars.length > 0) {
    buttonTextChars.forEach(function (buttonElement) {
      const textOne = buttonElement.querySelectorAll("[data-animation-selector=button-text1] .char");
      const textTwo = buttonElement.querySelectorAll("[data-animation-selector=button-text2] .char");
      if (textOne.length > 0 && textTwo.length > 0) {
        let tlButtonTextChar = gsap.timeline({ paused: true });
        tlButtonTextChar.to(textOne, {
          translateY: "-50%",
          rotationX: "-90deg",
          stagger: { each: 0.02 },
          ease: "power3.inOut",
          duration: 0.5,
        });
        tlButtonTextChar.from(
          textTwo,
          {
            translateY: "50%",
            rotationX: "90deg",
            stagger: { each: 0.02 },
            ease: "power3.inOut",
            duration: 0.5,
          },
          0.1
        );
        buttonElement.addEventListener("mouseenter", function () {
          tlButtonTextChar.restart();
        });
        buttonElement.addEventListener("mouseleave", function () {
          tlButtonTextChar.reverse();
        });
      }
    });
  }
  const shadowButtons = document.querySelectorAll("[data-animation-shadow=true]");
  if (shadowButtons.length > 0) {
    const baseShadow = "0px 8px 8px -4px #10182808";
    const coloredShadow = "-9px 12px 24px -4px #3063F580";
    shadowButtons.forEach(function(button) {
      button.style.boxShadow = `${baseShadow}, ${coloredShadow}`;
      let currentOffsetX = -9;
      let requestId = null;
      let targetOffsetX = -9;
      function animateShadow() {
        currentOffsetX += (targetOffsetX - currentOffsetX) * 0.15;
        const dynamicColoredShadow = `${currentOffsetX}px 12px 24px -4px #3063F580`;
        button.style.boxShadow = `${baseShadow}, ${dynamicColoredShadow}`;
        if (Math.abs(targetOffsetX - currentOffsetX) > 0.1) {
          requestId = requestAnimationFrame(animateShadow);
        } else {
          requestId = null;
        }
      }
      button.addEventListener("mousemove", function(e) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.width / 2;
        const mouseX = e.clientX - rect.left - centerX;
        targetOffsetX = -9 + (mouseX / centerX) * 10;
        if (!requestId) {
          requestId = requestAnimationFrame(animateShadow);
        }
      });
      button.addEventListener("mouseleave", function() {
        targetOffsetX = -9;
        if (!requestId) {
          requestId = requestAnimationFrame(animateShadow);
        }
      });
    });
  }
});

// Global animation function
pageFunctions.addFunction("globalAnimation", function () {
  // Select all elements with data-animation-gsap attribute
  const animatedElements = document.querySelectorAll("[data-animation-gsap]");

  if (animatedElements.length > 0) {
    animatedElements.forEach(function (element) {
      // Get the animation type from the data attribute
      const animationType = element.getAttribute("data-animation-gsap");
      // Get the delay value (default to 0 if not specified)
      const delay = parseFloat(element.getAttribute("data-delay-gsap")) || 0;
      // Get the duration value (default to 0.8 if not specified)
      const duration = parseFloat(element.getAttribute("data-duration-gsap")) || 0.6;
      // Create a timeline for this element
      const timeline = gsap.timeline({ paused: true });

      // Apply different animations based on the animation type
      switch (animationType) {
        case "fade-in":
          timeline.from(element, {
            opacity: 0,
            duration: duration,
            delay: delay,
            ease: "sine.in",
          });
          break;
        case "fade-in-up":
          timeline.from(element, {
            opacity: 0,
            y: "1rem",
            duration: duration,
            delay: delay,
            ease: "sine.in",
          });
          break;
        case "scale-in":
          timeline.from(element, {
            opacity: 0,
            scale: 0.8,
            duration: duration,
            delay: delay,
            ease: "sine.out",
          });
          break;
        case "stagger-children":
          // For staggering children elements
          const children = element.children;
          timeline.from(children, {
            opacity: 0,
            duration: duration,
            stagger: 0.2,
            delay: delay,
            ease: "sine.in",
          });
          break;
        default:
          // Default to fade-in if animation type is not recognized
          timeline.from(element, {
            opacity: 0,
            duration: duration,
            delay: delay,
            ease: "sine.in",
          });
      }

      // Create the scroll trigger
      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: timeline,
      });
    });
  }
});

// Copyright Year
pageFunctions.addFunction('footerCopyrightYear', function() {
  // Get the current year
  const currentYear = new Date().getFullYear();
  
  // Select all elements with the class 'copyright-year'
  const copyrightYearElements = document.querySelectorAll('.copyright-year');
  
  // Update the text content of each selected element to the current year
  copyrightYearElements.forEach(function (element) {
  element.textContent = currentYear;
  });
});

// Lazy Load Video
pageFunctions.addFunction("lazyVideo", function () {
  var lazyVideos = [].slice.call(document.querySelectorAll("[data-video=lazy]"));
  
  if ("IntersectionObserver" in window) {
    var options = {
      rootMargin: "800px",
      threshold: 0
    };
    
    var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (video) {
        if (video.isIntersecting) {
          // Handle case where data-src is directly on the video element
          if (video.target.dataset.src) {
            video.target.src = video.target.dataset.src;
          }
          
          // Handle source children if present
          for (var source in video.target.children) {
            var videoSource = video.target.children[source];
            if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
              videoSource.src = videoSource.dataset.src;
            }
          }
  
          video.target.load();
          lazyVideoObserver.unobserve(video.target);
        }
      });
    }, options); // Pass options to IntersectionObserver
  
    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
});
