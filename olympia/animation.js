// Ease
document.addEventListener("DOMContentLoaded", () => {
  // Cursor, Fading
  CustomEase.create("inOutsine", "0.445, 0.05, 0.55, 0.95");
  // Flip Text, Arrow, Masking
  CustomEase.create("inOutCirc", "0.785, 0.135, 0.15, 0.86");
  // Flip Cards
  CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
  CustomEase.create("OutQuint", "0.19, 1, 0.22, 1");
  // Video Flip
  CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
});

// Button
function initButtonCharacterStagger() {
  const offsetIncrement = 0.02; // Transition offset increment in seconds
  const buttons = document.querySelectorAll("[data-button-animate-chars]");

  buttons.forEach((button) => {
    const text = button.textContent; // Get the button's text content
    button.innerHTML = ""; // Clear the original content

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      // Handle spaces explicitly
      if (char === " ") {
        span.style.whiteSpace = "pre"; // Preserve space width
      }

      button.appendChild(span);
    });
  });
}

// Initialize Button Character Stagger Animation
document.addEventListener("DOMContentLoaded", () => {
  initButtonCharacterStagger();
});

// SPLIT ANIMATIONS
pageFunctions.addFunction("splitGlobalAnimation", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not loaded. Skipping animations.");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Word Split
  document.querySelectorAll("[data-split-gsap='words']").forEach((target) => {
    if (prefersReducedMotion) {
      gsap.set(target, { opacity: 1 });
      return;
    }

    const elementsToSplit = target.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6"
    );
    const splitTargets =
      elementsToSplit.length > 0 ? elementsToSplit : [target];

    splitTargets.forEach((el) => {
      gsap.set(el, { opacity: 1 });

      const split = SplitText.create(el, {
        type: "words, chars",
        mask: "words",
        wordsClass: "word",
        charsClass: "char",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 93%",
          toggleActions: "play none none none",
        },
      });

      tl.from(split.words, {
        yPercent: 110,
        rotate: 3,
        delay: 0.2,
        duration: 0.8,
        stagger: { amount: 0.5 },
      });
    });
  });

  // Line Split
  document.querySelectorAll("[data-split-gsap='lines']").forEach((target) => {
    if (prefersReducedMotion) {
      gsap.set(target, { opacity: 1 });
      return;
    }

    const elementsToSplit = target.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6"
    );
    const splitTargets =
      elementsToSplit.length > 0 ? elementsToSplit : [target];

    splitTargets.forEach((el) => {
      gsap.set(el, { opacity: 1 });

      SplitText.create(el, {
        type: "lines",
        autoSplit: true,
        mask: "lines",
        linesClass: "line",
        onSplit(self) {
          return gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: "top 93%",
                toggleActions: "play none none none",
              },
            })
            .from(self.lines, {
              yPercent: 110,
              delay: 0.2,
              duration: 0.8,
              stagger: { amount: 1 },
            });
        },
      });
    });
  });
});

pageFunctions.addFunction("globalGSAP", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not loaded. Skipping animations.");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const animatedElements = document.querySelectorAll("[data-animation-gsap]");

  if (animatedElements.length > 0) {
    animatedElements.forEach(function (element) {
      const animationType = element.getAttribute("data-animation-gsap");

      if (!animationType) {
        gsap.set(element, { opacity: 1 });
        return;
      }

      // Reduced motion: just show everything
      if (prefersReducedMotion) {
        gsap.set(element, { opacity: 1 });
        if (animationType === "stagger-children") {
          gsap.set(element.children, { opacity: 1 });
        }
        return;
      }

      const delay = parseFloat(element.getAttribute("data-delay-gsap") || 0.1);
      const duration = parseFloat(
        element.getAttribute("data-duration-gsap") || 0.6
      );
      const timeline = gsap.timeline({ paused: true });

      switch (animationType) {
        case "fade":
          timeline.fromTo(
            element,
            { opacity: 0 },
            {
              opacity: 1,
              duration,
              delay,
              ease: "power1.in",
            }
          );
          break;

        case "fade-in":
          timeline.fromTo(
            element,
            { opacity: 0, y: "2rem" },
            {
              opacity: 1,
              y: "0rem",
              duration,
              delay,
              ease: "power2.inOut",
            }
          );
          break;

        case "from-top":
          timeline.fromTo(
            element,
            { opacity: 0, y: "-100%" },
            {
              opacity: 1,
              y: "0%",
              duration,
              delay,
              ease: "power2.in",
            }
          );
          break;

        case "scale-in":
          timeline.fromTo(
            element,
            { opacity: 0, scale: 0 },
            {
              opacity: 1,
              scale: 1,
              duration,
              delay,
              ease: "power1.out",
            }
          );
          break;

        case "stagger-children":
          // Parent should be visible, children animate in
          timeline.set(element, { opacity: 1 });
          timeline.from(element.children, {
            opacity: 0,
            duration,
            stagger: 0.2,
            delay,
            ease: "power1.in",
          });
          break;

        case "border-width":
          timeline.fromTo(
            element,
            { opacity: 0, width: "0%" },
            {
              opacity: 1,
              width: "100%",
              duration,
              delay,
              ease: "power1.inOut",
            }
          );
          break;

        case "border-height":
          timeline.fromTo(
            element,
            { opacity: 0, height: "0%" },
            {
              opacity: 1,
              height: "100%",
              duration,
              delay,
              ease: "power1.inOut",
            }
          );
          break;

        default:
          return;
      }

      ScrollTrigger.create({
        trigger: element,
        start: "top 93%",
        toggleActions: "play none none none",
        animation: timeline,
      });
    });
  }

  // IMG Scale-in
  const visualScaleIn = document.querySelectorAll(
    "[data-animation-img=scale-in]"
  );
  if (visualScaleIn.length > 0) {
    visualScaleIn.forEach((element) => {
      const visual = element.querySelector("img");
      if (!visual) return;

      gsap.fromTo(
        visual,
        {
          yPercent: 20,
          scale: 0.8,
          rotate: 5,
          opacity: 0,
        },
        {
          yPercent: 0,
          scale: 1,
          rotate: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: element,
            start: "top 93%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }

  // Large Parallax
  const visualParallex = document.querySelectorAll(
    "[data-animation-img=visual-parallex]"
  );
  if (visualParallex.length > 0) {
    visualParallex.forEach((element) => {
      gsap.fromTo(
        element,
        { yPercent: -15 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }

  // Small Parallax
  const visualParallexSmall = document.querySelectorAll(
    "[data-animation-img=visual-parallex-small]"
  );
  if (visualParallexSmall.length > 0) {
    visualParallexSmall.forEach((element) => {
      gsap.fromTo(
        element,
        { yPercent: -8 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }
});

// GLOBAL REFRESH
pageFunctions.addFunction("globalRefreshTriggers", function () {
  if (typeof ScrollTrigger === "undefined") {
    console.warn("ScrollTrigger not loaded. Cannot set up refresh observer.");
    return;
  }

  function refreshScrollTrigger() {
    ScrollTrigger.refresh();
  }

  let initialRefreshDone = false;
  setTimeout(() => {
    if (!initialRefreshDone) {
      refreshScrollTrigger();
      initialRefreshDone = true;
    }
  }, 200);

  const resizeObserver = new ResizeObserver((entries) => {
    refreshScrollTrigger();
  });

  resizeObserver.observe(document.documentElement);
});
