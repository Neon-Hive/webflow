  // SVG
  pageFunctions.addFunction('svgCMS', function() {
    // create svg elements
    $("[data-cms-svg]").each(function(index) {
      let svgCode = $(this).text();
      $(svgCode).insertAfter($(this));
    });
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

  // Refresh Triggers if there are functions that change dom
  pageFunctions.addFunction("globalRefreshTriggers", function () {
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

    const searchInput = document.querySelector("[filter-search]");

    if (searchInput) {
      searchInput.addEventListener("input", debounce(refreshScrollTrigger, 200));
    }

    // Refresh ScrollTrigger on radio button change
    const filterElement = document.querySelector("[fs-cmsfilter-element=filters]");
    if (filterElement) {
      const radioButtons = filterElement.querySelectorAll("input[type=radio]");
      radioButtons.forEach((radio) => {
        radio.addEventListener("change", refreshScrollTrigger);
      });
    }
  });

  // Global Animation
  pageFunctions.addFunction("globalAnimation", function () {
    let elementInView = document.querySelectorAll("[data-animation=in-view]");
    let elementInViewD1 = document.querySelectorAll("[data-animation=in-view-d1]");
    let elementInViewD2 = document.querySelectorAll("[data-animation=in-view-d2]");
    let elementInViewStagger = document.querySelectorAll("[data-animation=in-view-stagger]");
    let elementInViewMove = document.querySelectorAll("[data-animation=in-view-move]");
    let elementInViewScale = document.querySelectorAll("[data-animation=in-view-scale]");
    let elementScaleStagger = document.querySelectorAll("[data-animation=scale-stagger]");

    if (elementInView.length > 0) {
      elementInView.forEach(function (element) {
        let tlElementInView = gsap.timeline({ paused: true });
        tlElementInView.from(element, {
          opacity: 0,
          duration: 0.9,
          ease: "power1.in",
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
          duration: 0.9,
          ease: "power1.in",
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
          duration: 0.9,
          ease: "power1.in",
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
          opacity: 0,
          y: "1rem",
          duration: 0.9,
          ease: "power1.in",
        });
        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlElementInViewMove,
        });
      });
    }

    if (elementInViewScale.length > 0) {
      elementInViewScale.forEach(function (element) {
        let tlElementInViewScale = gsap.timeline({ paused: true });
        tlElementInViewScale.from(element, {
          delay: 0.2,
          scale: 0,
          duration: 1.4,
          ease: "power1.out",
        });
        ScrollTrigger.create({
          trigger: element,
          start: "top 95%",
          toggleActions: "play none none none",
          animation: tlElementInViewScale, // Corrected this to use the correct timeline
        });
      });
    }

    if (elementScaleStagger.length > 0) {
      elementScaleStagger.forEach(function (parentElement) {
        let children = parentElement.children;
        let tlElementScaleStagger = gsap.timeline({
          scrollTrigger: {
            trigger: parentElement,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        });

        tlElementScaleStagger.from(children, {
          delay: 0.2,
          scale: 0,
          duration: 1.4,
          ease: "power1.out",
          stagger: 0.2, // Apply stagger effect to children
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
          duration: 0.9,
          ease: "power1.in",
          stagger: 0.2, // Apply stagger effect to children
        });
      });
    }
  });
