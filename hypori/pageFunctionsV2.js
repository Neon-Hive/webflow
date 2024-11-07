gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);
gsap.registerPlugin(MotionPathPlugin);

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

pageFunctions.addFunction("navDropdownLink", function () {
  $(document).on("click", ".nav_component .g_clickable-link", function () {
    if (window.innerWidth < 992) {
      const menuButton = $('[data-attribute="navigation-menu-button"]');

      menuButton.click();
    }
  });
});

pageFunctions.addFunction("pixelBurst", function () {
  let burst = document.querySelectorAll("[data-attribute=burst]");
  burst.forEach(function (mainElement) {
    let burstType = mainElement.getAttribute("data-burst");
    let opacityDuration = burstType === "v1" ? 4.5 : 3;
    let loop = mainElement.getAttribute("data-burst-loop") === "true";

    // Main timeline for non-looping animation
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

    // Separate looping timeline that starts after `tl` completes
    if (loop) {
      tl.add(() => {
        let loopTl = gsap.timeline({ repeat: -1, yoyo: true });
        loopTl.fromTo(
          mainElement,
          { scale: 1 },
          {
            scale: 1.05,
            duration: 5,
            ease: "none",
          }
        );
      });
    }
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

pageFunctions.addFunction("customCursor", function () {
  // Function for checking the type of device
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

  // Cursor dot & text effect
  function nhCursor() {
    const nh_cursor = document.getElementById("cursor-wrap");
    const cursor_dot = document.getElementById("cursor-dot");
    const cursor_text = document.getElementById("cursor-text");
    const targetElements = document.querySelectorAll("[data-cursor='true']");

    // Follow the pointer with smooth movement
    window.addEventListener("pointermove", (event) => {
      gsap.to(nh_cursor, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.4,
        ease: "power1.out",
        scale: 1,
      });
    });

    // Handle hover effects on targeted elements
    targetElements.forEach((e) => {
      // console.log("Target element found: ", e);

      e.addEventListener("mouseenter", () => {
        const customText = e.getAttribute("data-cursor-text");
        // console.log("Element hovered, custom text: ", customText);

        cursor_text.textContent = customText || ""; // Set custom text if available
        cursor_text.classList.add("show");
        cursor_dot.classList.add("active");
      });

      e.addEventListener("mouseleave", () => {
        // console.log("Element left, removing text and active states.");

        cursor_text.classList.remove("show");
        cursor_dot.classList.remove("active");
        cursor_text.textContent = ""; // Clear text on leave
      });
    });

    // Instantly set the cursor position (helps avoid lag)
    document.addEventListener("pointermove", (event) => {
      gsap.set(nh_cursor, { x: event.clientX, y: event.clientY });
    });

    // Hide the cursor when the mouse leaves the document
    document.addEventListener("mouseleave", () => {
      gsap.to(nh_cursor, { duration: 0.4, ease: "power1.in", scale: 0 });
    });
  }

  // Implement cursor, smooth scroll, and parallax effect based on the type of device
  if (deviceType() === "desktop") {
    // console.log("Device type: desktop, initializing cursor.");
    nhCursor();
  } else {
    // console.log("Device is not desktop, hiding cursor.");
    document.getElementById("cursor-wrap").style.display = "none";
  }
});

pageFunctions.addFunction("responsiveScrollTrigger", function () {
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
});

pageFunctions.addFunction("eventsDate", function () {
  function updateEventDates() {
    // Select all event elements
    const eventElements = document.querySelectorAll("[data-attribute='event']");

    eventElements.forEach((eventElement) => {
      // Find date and time elements inside each event
      const dateElement = eventElement.querySelector("[data-attribute='date']");
      const timeElement = eventElement.querySelector("[data-attribute='time']");

      if (dateElement && timeElement) {
        const dateValue = new Date(dateElement.textContent);
        const now = new Date();

        // Calculate the difference in time and convert to days
        const diffTime = dateValue - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeText = "";

        if (diffDays > 0) {
          timeText = `${diffDays} day${diffDays > 1 ? "s" : ""} away`;
        } else if (diffDays === 0) {
          timeText = "Today";
        } else {
          timeText = `${Math.abs(diffDays)} day${
            Math.abs(diffDays) > 1 ? "s" : ""
          } ago`;
        }

        // Update the time element with the calculated time text
        timeElement.textContent = timeText;
      }
    });
  }

  // Run the update function on initial load
  updateEventDates();

  // Add event listener to rerun the function when pagination button is clicked
  const paginationButtons = document.querySelectorAll(
    "[data-pagination-button]"
  );
  paginationButtons.forEach((button) => {
    button.addEventListener("click", updateEventDates);
  });
});

pageFunctions.addFunction("industriesScroll", function () {
  const lists = $(".h-industries_content-list");
  const items = $(".h-industries_content-item");
  const visuals = $(".h-industries_visual-list .h-industries_visual-item");

  // Set up GSAP matchMedia for desktop only (min-width: 992px)
  gsap.matchMedia().add("(min-width: 992px)", () => {
    // Remove 'is-active' from all items and visuals, then add to the first of each
    items.removeClass("is-active");
    visuals.removeClass("is-active");
    lists.each(function () {
      $(this).find(".h-industries_content-item").first().addClass("is-active");
    });
    visuals.first().addClass("is-active");

    // ScrollTrigger to toggle 'is-active' for content items and sync visuals
    items.each(function (index) {
      const item = $(this);
      const correspondingVisual = visuals.eq(index); // Get the visual item with matching index

      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          items.removeClass("is-active");
          visuals.removeClass("is-active");
          item.addClass("is-active");
          correspondingVisual.addClass("is-active");
        },
        onEnterBack: () => {
          items.removeClass("is-active");
          visuals.removeClass("is-active");
          item.addClass("is-active");
          correspondingVisual.addClass("is-active");
        },
        onLeave: () => {
          // Skip onLeave for the first and last items
          if (index !== 0 && index !== items.length - 1) {
            item.removeClass("is-active");
            correspondingVisual.removeClass("is-active");
          }
        },
        onLeaveBack: () => {
          // Skip onLeaveBack for the first and last items
          if (index !== 0 && index !== items.length - 1) {
            item.removeClass("is-active");
            correspondingVisual.removeClass("is-active");
          }
        },
      });
    });
  });
});

pageFunctions.addFunction("breadcrumbLine", function () {
  // Save all breadcrumb lines in a variable
  const breadcrumbLines = $("[data-breadcrumb-line]");

  // Define URL arrays for each breadcrumb type
  const productURLs = ["/how-it-work"];
  const solutionsURLs = ["/solutions"];
  const industriesURLs = ["/industries"];
  const companyURLs = [
    "/about-us",
    "/partners",
    "/resources/news-and-media",
    "/news-and-media",
  ];
  const resourcesURLs = ["/blog", "/faq", "/events", , "/users"];
  const contactURLs = ["/contact", "/contact#support"];

  // Helper function to activate matching breadcrumb line
  function activateLine(urlArray, line) {
    if (urlArray.some((path) => window.location.pathname.includes(path))) {
      line.addClass("is-active");
    } else {
      line.removeClass("is-active");
    }
  }

  // Iterate over each breadcrumb line and activate if URL matches
  breadcrumbLines.each(function () {
    const line = $(this);
    const lineType = line.data("breadcrumb-line"); // Get the line's type from the attribute

    // Check URL and activate the corresponding line
    if (lineType === "products") {
      activateLine(productURLs, line);
    } else if (lineType === "solutions") {
      activateLine(solutionsURLs, line);
    } else if (lineType === "industries") {
      activateLine(industriesURLs, line);
    } else if (lineType === "company") {
      activateLine(companyURLs, line);
    } else if (lineType === "resources") {
      activateLine(resourcesURLs, line);
    } else if (lineType === "contact") {
      activateLine(contactURLs, line);
    }
  });
});

pageFunctions.addFunction("buttonTextHover", function () {
  // Apply animation only for screens wider than 992px
  gsap.matchMedia().add("(min-width: 992px)", () => {
    // Select all elements with [data-hover=button-text]
    const buttonTextElements = document.querySelectorAll(
      "[data-button=hover-text]"
    );
    buttonTextElements.forEach((buttonText) => {
      // Find the [data-hover=button-line] inside each buttonText element
      const buttonLine = buttonText.querySelector("[data-hover=button-line]");

      if (buttonLine) {
        // Set initial position for the line (off-screen to the left)
        gsap.set(buttonLine, { x: "-100%" });

        // Slide in on mouse enter
        buttonText.addEventListener("mouseenter", () => {
          gsap.to(buttonLine, {
            x: "0%",
            duration: 0.6,
            ease: "inOutQuint",
          });
        });

        // Slide out on mouse leave
        buttonText.addEventListener("mouseleave", () => {
          gsap.to(buttonLine, {
            x: "100%",
            duration: 0.6,
            ease: "circOut",
            onComplete: () => {
              // Reset position to -100% after the animation completes
              gsap.set(buttonLine, { x: "-100%" });
            },
          });
        });
      }
    });
  });
});

pageFunctions.addFunction("drawSvg", function () {
  // Create a timeline with looping, back-and-forth motion, and delay at the end
  const tl = gsap.timeline({
    repeat: -1, // Infinite looping
    yoyo: true, // Reverse back to start
    ease: "none",
    repeatDelay: 1, // Delay for 1 second at the end of each loop
  });

  // Define the motion path animation
  tl.to("#movingLine", {
    duration: 15, // Duration of the full journey along the path
    motionPath: {
      path: "#largeSvgPath",
      align: "#largeSvgPath",
      autoRotate: true,
      alignOrigin: [0.5, 0.5],
    },
  });

  // Opacity transition over the first 30% of the path
  tl.fromTo(
    "#movingLine",
    { opacity: 0 }, // Start at 0% opacity
    { opacity: 0.5, duration: 1.5 }, // Fade to 50% opacity over the first 30% of the path
    0
  );

  // Transition to full opacity after 30%
  tl.to("#movingLine", { opacity: 1, duration: 0.5 }, 1.5); // 1.5s mark aligns with the first 30% duration
});
