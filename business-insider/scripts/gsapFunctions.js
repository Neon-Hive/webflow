/*
 * NOTES: This should be executed within the footer of Business insider
 */

/*
 * GSAP Easings ===========================================
 */
pageFunctions.addFunction("gsapCreateEase", function () {
  // Register CustomEase plugin
  gsap.registerPlugin(CustomEase);

  // Create custom easing functions
  CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
  CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
  CustomEase.create("circOut", "0.23, 1, 0.32, 1");
});

/*
 * Split Text and GSAP Button, Heading Start ===========================================
 */
pageFunctions.addFunction(
  "splitType",
  function () {
    // First, target all items with [data-split-rich=true]
    document.querySelectorAll("[data-split-rich='true']").forEach((richText) => {
      // Find all headings inside these rich text elements and add the data-split=true attribute
      richText.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((heading) => {
        heading.setAttribute("data-split", "true");
      });
    });

    // Define typeSplit variable outside setupSplit function
    let typeSplit;

    function gsapButtonHover() {
      // Select all elements with the data attribute data-animation-hover=main-hover
      const buttonMain = document.querySelectorAll("[data-animation-hover=main-hover]");

      if (buttonMain.length > 0) {
        buttonMain.forEach(function (buttonElement) {
          const buttonFill = buttonElement.querySelector("[data-animation-selector=button-fill]");
          const iconOne = buttonElement.querySelector("[data-animation-selector=button-icon1]");
          const iconTwo = buttonElement.querySelector("[data-animation-selector=button-icon2]");

          if (buttonFill && iconOne && iconTwo) {
            let tlButtonFillIcons = gsap.timeline({ paused: true });

            // Store the original background color of the button
            const originalBackgroundColor = window.getComputedStyle(buttonElement).backgroundColor;

            // Animate the button fill size and position
            tlButtonFillIcons.to(buttonFill, {
              width: "100%",
              height: "100%",
              translateX: "0rem",
              translateY: "0rem",
              ease: "power3.inOut",
              duration: 0.5,
              onComplete: function () {
                // Get the background color of buttonFill
                let buttonFillColor = window.getComputedStyle(buttonFill).backgroundColor;
                // Apply the color to the trigger element
                gsap.to(buttonElement, { backgroundColor: buttonFillColor, duration: 0.01 });
              },
            });

            // Animate iconOne
            tlButtonFillIcons.fromTo(
              iconOne,
              { xPercent: 0 },
              { xPercent: 100, ease: "power3.inOut", duration: 0.5 },
              0 // Start at the same time as buttonFill animation
            );

            // Animate iconTwo
            tlButtonFillIcons.fromTo(
              iconTwo,
              { xPercent: -100 },
              { xPercent: 0, ease: "power3.inOut", duration: 0.5 },
              0 // Start at the same time as buttonFill animation
            );

            // Add mouseenter and mouseleave event listeners for the animations
            buttonElement.addEventListener("mouseenter", function () {
              tlButtonFillIcons.restart();
            });

            buttonElement.addEventListener("mouseleave", function () {
              tlButtonFillIcons.reverse();
              gsap.to(buttonElement, { backgroundColor: originalBackgroundColor, duration: 0.01 });
            });
          }
        });
      }

      // Select all elements with the data attribute data-animation-hover=main-hover
      const buttonMainVertical = document.querySelectorAll("[data-animation-hover=main-vertical-hover]");

      if (buttonMainVertical.length > 0) {
        buttonMainVertical.forEach(function (buttonElement) {
          const buttonFillVertical = buttonElement.querySelector("[data-animation-selector=button-fill]");
          const iconOneVertical = buttonElement.querySelector("[data-animation-selector=button-icon1]");
          const iconTwoVertical = buttonElement.querySelector("[data-animation-selector=button-icon2]");

          if (buttonFillVertical && iconOneVertical && iconTwoVertical) {
            let tlButtonFillIconsVertical = gsap.timeline({ paused: true });

            // Store the original background color of the button
            const originalBackgroundColor = window.getComputedStyle(buttonElement).backgroundColor;

            // Animate the button fill size and position
            tlButtonFillIconsVertical.to(buttonFillVertical, {
              width: "100%",
              height: "100%",
              translateX: "0rem",
              translateY: "0rem",
              ease: "power3.inOut",
              duration: 0.5,
              onComplete: function () {
                // Get the background color of buttonFill
                let buttonFillColor = window.getComputedStyle(buttonFillVertical).backgroundColor;
                // Apply the color to the trigger element
                gsap.to(buttonElement, { backgroundColor: buttonFillColor, duration: 0.01 });
              },
            });

            // Animate iconOne
            tlButtonFillIconsVertical.fromTo(
              iconOneVertical,
              { yPercent: 0 },
              { yPercent: 100, ease: "power3.inOut", duration: 0.5 },
              0 // Start at the same time as buttonFill animation
            );

            // Animate iconTwo
            tlButtonFillIconsVertical.fromTo(
              iconTwoVertical,
              { yPercent: -100 },
              { yPercent: 0, ease: "power3.inOut", duration: 0.5 },
              0 // Start at the same time as buttonFill animation
            );

            // Add mouseenter and mouseleave event listeners for the animations
            buttonElement.addEventListener("mouseenter", function () {
              tlButtonFillIconsVertical.restart();
            });

            buttonElement.addEventListener("mouseleave", function () {
              tlButtonFillIconsVertical.reverse();
              gsap.to(buttonElement, { backgroundColor: originalBackgroundColor, duration: 0.01 });
            });
          }
        });
      }

      // Select all elements with the data attribute data-animation-hover=text-char
      const buttonTextChars = document.querySelectorAll("[data-animation-hover=text-char]");

    //   if (buttonTextChars.length > 0) {
    //     buttonTextChars.forEach(function (buttonElement) {
    //       const textOne = buttonElement.querySelectorAll("[data-animation-selector=button-text1] .char");
    //       const textTwo = buttonElement.querySelectorAll("[data-animation-selector=button-text2] .char");

    //       if (textOne.length > 0 && textTwo.length > 0) {
    //         let tlButtonTextChar = gsap.timeline({ paused: true });

    //         tlButtonTextChar.to(textOne, {
    //           translateY: "-50%",
    //           rotationY: "-5.7deg",
    //           rotationX: "-90deg",
    //           stagger: { each: 0.02 },
    //           ease: "power3.inOut",
    //           duration: 0.5,
    //         });

    //         tlButtonTextChar.from(
    //           textTwo,
    //           {
    //             translateY: "50%",
    //             rotationY: "5.7deg",
    //             rotationX: "90deg",
    //             stagger: { each: 0.02 },
    //             ease: "power3.inOut",
    //             duration: 0.5,
    //           },
    //           0.1
    //         );

    //         buttonElement.addEventListener("mouseenter", function () {
    //           tlButtonTextChar.restart();
    //         });

    //         buttonElement.addEventListener("mouseleave", function () {
    //           tlButtonTextChar.reverse();
    //         });
    //       }
    //     });
    //   }
    // }

    // Function to handle GSAP animations for heading lines
    function gsapHeadingLines() {
      gsap.registerPlugin(ScrollTrigger);

      // Select all elements with data attribute data-animation=heading-lines
      let animationHeadingLines = document.querySelectorAll("[data-animation=heading-lines]");

      // Only proceed if elements exist
      if (animationHeadingLines.length > 0) {
        animationHeadingLines.forEach(function (headingElement) {
          let tlHeadingLines = gsap.timeline({
            paused: true,
          });

          tlHeadingLines.from(headingElement.querySelectorAll(".line"), {
            opacity: 0,
            stagger: { each: 0.15 },
            ease: "inOutCubic",
            yPercent: 110,
            duration: 1,
          });

          ScrollTrigger.create({
            trigger: headingElement,
            start: "top 95%",
            end: "bottom center",
            animation: tlHeadingLines,
          });
        });
      }
    }

    // Function to set up the splits
    function setupSplit() {
      typeSplit = new SplitType("[data-split='true']", {
        types: "lines, words",
        tagName: "span",
      });

      // Wrap each .line with a parent element with class .split-parent
      document.querySelectorAll(".line").forEach((line) => {
        const parent = document.createElement("div");
        parent.classList.add("split-parent");
        line.parentNode.insertBefore(parent, line);
        parent.appendChild(line);
      });

      // After setting up the split, re-initialize GSAP animations
      gsapHeadingLines();
      gsapButtonHover();
    }

    // Initial setup of splits
    setupSplit();

    // Threshold for screen width changes
    let windowWidth = window.innerWidth;
    const resizeThreshold = 200; // Set the threshold to 200 pixels

    // Revert and reapply split on window resize with a threshold
    window.addEventListener("resize", function () {
      if (Math.abs(window.innerWidth - windowWidth) > resizeThreshold) {
        windowWidth = window.innerWidth;
        typeSplit.revert();
        setupSplit();
      }
    });
  },
  ["gsapCreateEase"],
  "font-loaded"
);

/*
 * GSAP Clip Image ===========================================
 */
pageFunctions.addFunction("gsapClipImage", function () {
  let centerImageReveal = document.querySelectorAll("[data-animation=center-image-reveal]");
  let horizontalImageReveal = document.querySelectorAll("[data-animation=horizontal-image-reveal]");
  let verticalImageReveal = document.querySelectorAll("[data-animation=vertical-image-reveal]");

  // Center Image Reveal Animation
  if (centerImageReveal.length > 0) {
    centerImageReveal.forEach(function (element) {
      let tlCenterImageReveal = gsap.timeline();

      tlCenterImageReveal.fromTo(
        element,
        { clipPath: "polygon(30% 0%, 70% 0%, 70% 100%, 30% 100%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }
      );

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        end: "bottom 95%",
        scrub: true,
        animation: tlCenterImageReveal,
      });
    });
  }

  // Horizontal Image Reveal Animation
  if (horizontalImageReveal.length > 0) {
    horizontalImageReveal.forEach(function (element) {
      let tlHorizontalImageReveal = gsap.timeline();

      tlHorizontalImageReveal.fromTo(
        element,
        { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
        { clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)", duration: 1.3, ease: "inOutCubic" }
      );

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlHorizontalImageReveal,
      });
    });
  }

  // Vertical Image Reveal Animation
  if (verticalImageReveal.length > 0) {
    verticalImageReveal.forEach(function (element) {
      let tlVerticalImageReveal = gsap.timeline();

      tlVerticalImageReveal.fromTo(
        element,
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.3, ease: "inOutCubic" }
      );

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlVerticalImageReveal,
      });
    });
  }
});

/*
 * GSAP Divider Line ===========================================
 */
pageFunctions.addFunction("gsapDividerLine", function () {
  let dividerLineH = document.querySelectorAll("[data-animation=horizontal-divider-line]");
  let dividerLineHSmall = document.querySelectorAll("[data-animation=horizontal-divider-line-small]");
  let dividerLineV = document.querySelectorAll("[data-animation=vertical-divider-line]");
  let dividerLineVSmall = document.querySelectorAll("[data-animation=vertical-divider-line-small]");

  // Vertical Divider Lines Animation
  if (dividerLineV.length > 0) {
    dividerLineV.forEach(function (element) {
      let tlDividerLineV = gsap.timeline();

      tlDividerLineV.from(element, { height: "0%", duration: 1.3, ease: "inOutQuint" });

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlDividerLineV,
      });
    });
  }

  // Small Vertical Divider Lines Animation
  if (dividerLineVSmall.length > 0) {
    dividerLineVSmall.forEach(function (element) {
      let tlDividerLineVSmall = gsap.timeline();

      tlDividerLineVSmall.from(element, { height: "0%", duration: 0.8, ease: "inOutQuint" });

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlDividerLineVSmall,
      });
    });
  }

  // Horizontal Divider Lines Animation
  if (dividerLineH.length > 0) {
    dividerLineH.forEach(function (element) {
      let tlDividerLineH = gsap.timeline();

      tlDividerLineH.from(element, { width: "0%", duration: 1.3, ease: "inOutQuint" });

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlDividerLineH,
      });
    });
  }

  // Small Horizontal Divider Lines Animation
  if (dividerLineHSmall.length > 0) {
    dividerLineHSmall.forEach(function (element) {
      let tlDividerLineHSmall = gsap.timeline();

      tlDividerLineHSmall.from(element, { width: "0%", duration: 0.8, ease: "inOutQuint" });

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlDividerLineHSmall,
      });
    });
  }
});

/*
 * GSAP Element In View ===========================================
 */
pageFunctions.addFunction("gsapElementInView", function () {
  let elementInView = document.querySelectorAll("[data-animation=in-view]");
  let elementScale = document.querySelectorAll("[data-animation=scale]");

  if (elementInView.length > 0) {
    elementInView.forEach(function (element) {
      let tlElementInView = gsap.timeline({ paused: true });

      tlElementInView.from(element, { opacity: 0, duration: 1, ease: "inOutCubic" });

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementInView,
      });
    });
  }

  if (elementScale.length > 0) {
    elementScale.forEach(function (element) {
      let tlElementScale = gsap.timeline({ paused: true });

      tlElementScale.from(element, { scale: 0, duration: 1, ease: "inOutQuint" });

      ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
        animation: tlElementScale,
      });
    });
  }
});

/*
 * Aria attribute adder ===========================================
 */
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
