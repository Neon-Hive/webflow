gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);
gsap.registerPlugin(Flip);
pageFunctions.addFunction("globalEase", function () {
// Create custom easing functions
CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
CustomEase.create("inQuad", "0.55, 0.085, 0.68, 0.53");
CustomEase.create("inOutExpo", "1, 0, 0, 1");
});

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

class textEffectFade {
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
{ opacity: 0, willChange: "opacity" },
{
opacity: 1,
ease: "none",
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

class textEffectClip {
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
{ yPercent: 110, opacity: 0, willChange: "opacity, transform" },
{
yPercent: 0,
opacity: 1,
ease: "none",
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

class splitCharEffect {
constructor(textElement) {
if (!textElement || !(textElement instanceof HTMLElement)) {
throw new Error("Invalid text element provided.");
}
this.textElement = textElement;
this.initializeEffect();
}
initializeEffect() {
this.splitter = new TextSplitter(this.textElement, "words, chars");
}
}

const headingSplit = document.querySelectorAll(
"[data-split='heading']"
);
headingSplit.forEach((element) => {
new splitLinesEffect(element);
});

const charSplit = document.querySelectorAll(
"[data-split='char']"
);
charSplit.forEach((element) => {
new splitCharEffect(element);
});

const headingAnimation = document.querySelectorAll(
"[data-animation-gsap='heading']"
);
headingAnimation.forEach((element) => {
new textEffectClip(element);
});

const textAnimation = document.querySelectorAll(
"[data-animation-gsap='text']"
);
textAnimation.forEach((element) => {
new textEffectFade(element);
});
},
"globalEase",
"font-loaded"
);

pageFunctions.addFunction("pageTransition", function () {
// Define reusable variables for elements
const navComponent = document.querySelector("[data-animation-header='nav']");
const navLinks = document.querySelector("[data-animation-header='nav-links']");
const navLine = document.querySelector("[data-animation-header='nav-line']");

const headerHeading = document.querySelector("[data-animation-header='heading']");
const headerText = document.querySelector("[data-animation-header='text']");
const headerVisual = document.querySelector("[data-animation-header='visual']");
const headerButton = document.querySelector("[data-animation-header='button']");

// Logo elements for FLIP animation
const transitionLogoInner = document.querySelector(".transition_logo_inner");
const navLogoWrap = document.querySelector(".nav_logo_wrap");

// Store split instances for cleanup on resize
let headingSplitInstance = null;
let textSplitInstance = null;

// Set initial states for all elements immediately
function setInitialStates() {
  // Set initial state for nav component
  if (navComponent) {
    gsap.set([navLinks, navLine], { 
      visibility: "hidden", 
      opacity: 0 
    });
  }

  // Set initial state for heading
  if (headerHeading) {
    gsap.set(headerHeading, { 
      visibility: "hidden" 
    });
  }

  // Set initial state for text
  if (headerText) {
    gsap.set(headerText, { 
      visibility: "hidden" 
    });
  }

  // Set initial state for visual
  if (headerVisual) {
    gsap.set(headerVisual, { 
      scale: 1.1,
    });
  }

  // Set initial state for button
  if (headerButton) {
    gsap.set(headerButton, { 
      visibility: "hidden", 
      opacity: 0 
    });
  }
}

// Call this immediately to set all initial states
setInitialStates();

// Helper function to create SplitType instance for a single element
function splitTextElement(element, types) {
  if (!element) return null;

  // Create new split
  const split = new SplitType(element, { types: types });

  // For line types, wrap in containers
  if (types.includes('lines') && split.lines) {
    split.lines.forEach(line => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('lines-wrap');
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });
  }

  return split;
}

// Function to clean up split text instances and wrappers
function cleanupSplitText(element, splitInstance) {
  if (!element || !splitInstance) return;
  
  // Remove line wrapper divs
  const wrappers = element.querySelectorAll('.lines-wrap');
  Array.from(wrappers).forEach(wrapper => {
    const parent = wrapper.parentNode;
    while (wrapper.firstChild) {
      parent.insertBefore(wrapper.firstChild, wrapper);
    }
    parent.removeChild(wrapper);
  });
  
  // Revert the split
  splitInstance.revert();
}

// Helper functions to manage scroll and body overflow
function disableScroll() {
  // Stop Lenis smooth scrolling if it exists
  if (window.lenis && window.lenisRunning) {
    window.lenis.stop();
  }

  // Add styles to prevent body scrolling without affecting layout
  document.body.style.overflow = 'hidden';
}

function enableScroll() {
  // Re-enable Lenis smooth scrolling if it exists
  if (window.lenis && !window.lenisRunning) {
    window.lenis.start();
  }

  // Remove fixed positioning
  document.body.style.overflow = 'visible';
}

// General page load transition
let tlPageReveal = gsap.timeline({
  onStart: () => {
    // Disable scroll during initial transition
    disableScroll();
  },
  onComplete: () => {
    // Set display to none after the timeline completes
    gsap.set(".transition_wrap", { display: "none" });

    // Re-enable scroll after transition completes
    enableScroll();
  },
});

// Fix clipPath animation and include logo FLIP
tlPageReveal
  .set(".transition_wrap", {
    display: "flex", // Ensure element is visible before animation
    willChange: "clip-path", // Hint browser for better performance
  })
  .to(".nav_component", {
    opacity: 1,
    duration: 0.3
  })
  .fromTo(
    ".transition_wrap",
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Fully covering the viewport
    },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", // Reveal content
      delay: 0.2,
      duration: 1.6,
      ease: "power2.inOut", // Updated ease for smoother animation
    }
  )
  // Add the logo FLIP animation - no need for a callback function
  .add(() => {
    // Check if both logo elements exist
    if (transitionLogoInner && navLogoWrap) {
      // Get initial state
      const state = Flip.getState(transitionLogoInner);

      // Move the logo to navigation
      navLogoWrap.appendChild(transitionLogoInner);

      // Create and play the Flip animation
      Flip.from(state, {
        duration: 1.2,
        ease: "power2.inOut",
        absolute: true,
      });
    }
  }, '<0.6')
  .add(() => {
    runAnimation(); // Run the appropriate animation
  }, "-=0.8");

// Function to determine which animation to run
function runAnimation() {
  const pageName = document.body.getAttribute("data-page");

  if (!pageName) {
    runGlobalAnimation();
  } else {
    switch (pageName) {
      case "home":
        runHomePageAnimation();
        break;
      default:
        runGlobalAnimation();
        break;
    }
  }
}

// Global animation
function runGlobalAnimation() {
  let tl = gsap.timeline();

  // Animate heading with clip effect
  if (headerHeading) {
    headingSplitInstance = splitTextElement(headerHeading, 'lines');

    if (headingSplitInstance && headingSplitInstance.lines) {
      gsap.set(headerHeading, { visibility: "visible" });

      tl.fromTo(
        headingSplitInstance.lines,
        { 
          yPercent: 110, 
          opacity: 0, 
          willChange: "opacity, transform" 
        },
        {
          yPercent: 0,
          opacity: 1,
          ease: "power2.out",
          duration: 0.8,
          stagger: { amount: 0.2 },
          onComplete: function() {
            gsap.set(headingSplitInstance.lines, { clearProps: "willChange" });
          }
        },
        "0"
      );
    }
  }

  // Animate text with fade effect
  if (headerText) {
    textSplitInstance = splitTextElement(headerText, 'lines');

    if (textSplitInstance && textSplitInstance.lines) {
      gsap.set(headerText, { visibility: "visible" });

      tl.fromTo(
        textSplitInstance.lines,
        { 
          opacity: 0, 
          willChange: "opacity" 
        },
        {
          opacity: 1,
          ease: "power1.out",
          duration: 0.8,
          stagger: { amount: 0.2 },
          onComplete: function() {
            gsap.set(textSplitInstance.lines, { clearProps: "willChange" });
          }
        },
        "-=0.4"
      );
    }
  }

  // Animate visual
  if (headerVisual) {
    gsap.set(headerVisual, { 
      visibility: "visible",
      willChange: 'transform',
      autoAlpha: 1
    });

    tl.to(headerVisual, {
      scale: 1,
      duration: 1.2,
      ease: "power2.out",
      onComplete: function() {
        gsap.set(headerVisual, { clearProps: "willChange" });
      }
    }, "-=0.8");
  }

  // Animate button
  if (headerButton) {
    gsap.set(headerButton, { visibility: "visible" });

    tl.to(headerButton, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4");
  }

  // Animate nav component
  if (navComponent) {
    gsap.set([navLinks, navLine], { visibility: "visible" });

    tl.to([navLinks, navLine], { 
      opacity: 1, 
      duration: 0.6, 
      ease: "power1.out" 
    }, "-=0.6");
  }
}

// Home page specific animation (simply runs global for now)
function runHomePageAnimation() {
  runGlobalAnimation();
}

// Function to refresh text animations on resize
function refreshTextAnimations() {
  // Only refresh if we've already split text (animation has run)
  if (!headingSplitInstance && !textSplitInstance) return;
  
  // Clean up existing split text instances
  if (headerHeading && headingSplitInstance) {
    cleanupSplitText(headerHeading, headingSplitInstance);
    headingSplitInstance = null;
  }
  
  if (headerText && textSplitInstance) {
    cleanupSplitText(headerText, textSplitInstance);
    textSplitInstance = null;
  }
  
  // Re-create the split instances
  if (headerHeading) {
    headingSplitInstance = splitTextElement(headerHeading, 'lines');
  }
  
  if (headerText) {
    textSplitInstance = splitTextElement(headerText, 'lines');
  }
}

// Set up a single ResizeObserver to handle both text elements
const resizeObserver = new ResizeObserver(debounce(() => {
  refreshTextAnimations();
}, 300));

// Observe header container to catch all relevant resizes
const headerContainer = document.querySelector("[data-animation-header='container']") || 
                        document.querySelector("header") ||
                        (headerHeading ? headerHeading.closest("section") : null);
                        
if (headerContainer) {
  resizeObserver.observe(headerContainer);
}

// Debounce helper function
function debounce(func, delay) {
  let timer;
  return function(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
}

// Triggering transition on link clicks
document.querySelectorAll("a:not(.excluded-class)").forEach(link => {
  link.addEventListener("click", function(e) {
    const currentUrl = this.getAttribute("href");

    // Check conditions for internal navigation and prevent default behavior
    if (
      this.hostname === window.location.host && // Same host
      !currentUrl.includes("#") && // Not a hash link
      this.getAttribute("target") !== "_blank" // Not opening in a new tab
    ) {
      e.preventDefault();

      // Disable scrolling before transition starts
      disableScroll();

      // Create the timeline for the transition animation
      let tl = gsap.timeline({
        onComplete: () => {
          // Redirect to the target URL after animation completes
          window.location.href = currentUrl;
          // Note: No need to re-enable scroll here as we're navigating away
        },
      });

      tl.set(".transition_wrap", {
        display: "flex",
        willChange: "clip-path"
      })
      tl.to(".nav_component", {
        opacity: 0,
        duration: 0.3
      })
      .fromTo(
        ".transition_wrap",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.6,
          ease: "power2.inOut"
        }
      );
    }
  });
});
});

pageFunctions.addFunction("globalLenis", function () {
// Initialize Lenis with configuration
const lenis = new Lenis({
direction: 'vertical', // Scrolling direction
gestureDirection: 'vertical', // Gesture recognition direction
smooth: true, // Enable smooth scrolling
lerp: 0.1, // Animation interpolation factor
wheelMultiplier: 0.7, // Wheel scroll sensitivity
mouseMultiplier: 0.7, // Mouse scroll sensitivity
smoothTouch: false, // Disable smooth touch scrolling
touchMultiplier: 1.5, // Touch scroll sensitivity
infinite: false, // Prevent infinite scrolling
});

// Attach Lenis to the global window object
window.lenis = lenis;

// Custom flag to track the running state
window.lenisRunning = true;

// Overwrite Lenis start/stop methods to add console logs
const originalStart = lenis.start.bind(lenis);
const originalStop = lenis.stop.bind(lenis);

lenis.start = function () {
window.lenisRunning = true;
originalStart();
};

lenis.stop = function () {
window.lenisRunning = false;
originalStop();
};

// Scroll event listener (optional)
// Uncomment this to log scroll details if needed
// lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
//   console.log({ scroll, limit, velocity, direction, progress });
// });

// Animation frame handler
function raf(time) {
lenis.raf(time);
requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Add event listeners to control Lenis
document.querySelectorAll("[data-lenis-start=true]").forEach((element) => {
element.addEventListener("click", () => lenis.start());
});

document.querySelectorAll("[data-lenis-stop=true]").forEach((element) => {
element.addEventListener("click", () => lenis.stop());
});

document.querySelectorAll("[data-lenis-toggle]").forEach((element) => {
element.addEventListener("click", function () {
this.classList.toggle("stop-scroll");
if (this.classList.contains("stop-scroll")) {
lenis.stop();
} else {
lenis.start();
}
});
});
});

pageFunctions.addFunction('globalAnimations', function() {
// Find all elements with data-animation-gsap=visual
const visualElements = document.querySelectorAll('[data-animation-gsap=visual]');

// Loop through each element and set up animations
visualElements.forEach(element => {
// Find image inside the element (if any)
const image = element.querySelector('img');

// Skip if no image found
if (!image) return;

// Set initial properties with GPU acceleration
gsap.set(image, { 
willChange: 'transform, filter',
backfaceVisibility: 'hidden',
webkitBackfaceVisibility: 'hidden',
// Ensure clip-path is properly supported
clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
// Add vendor prefixes for broader support
WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
});

// Create a timeline for this element
const tl = gsap.timeline({
scrollTrigger: {
trigger: element,
start: 'top 92%', // Trigger when the top of the element reaches 95% of viewport height
toggleActions: 'play none none none',
markers: false // Set to true for debugging
}
});

// Add clip-path animation (without semicolons in the values)
tl.to(image, {
clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
duration: 1.6,
ease: 'power2.out'
}, 0);

// Add blur animation
tl.fromTo(image,
{ filter: 'blur(10px)' },
{ 
filter: 'blur(0px)',
duration: 1.4,
ease: 'power2.out' 
},
0
);

// Add scale animation
tl.fromTo(image,
{ scale: 1.2 },
{ 
scale: 1,
duration: 1.4,
ease: 'power1.out',
clearProps: 'willChange' // Clean up when animation completes
},
0
);
});


// Find all elements with data-animation-gsap=horizontal-line
const horizontalLines = document.querySelectorAll('[data-animation-gsap=horizontal-line]');

// If no elements found, exit early
if (!horizontalLines.length) return;

// Loop through each element and set up animations
horizontalLines.forEach(line => {
// Set initial properties
gsap.set(line, { 
width: '0%',
willChange: 'width',
transformOrigin: 'left center' // Animate from left to right
});

// Create a timeline for this element
const tl = gsap.timeline({
scrollTrigger: {
trigger: line,
start: 'top 90%', // Trigger when the top of the line reaches 90% of viewport height
toggleActions: 'play none none none',
markers: false // Set to true for debugging
}
});

// Animate width from 0% to 100%
tl.to(line, {
width: '100%',
duration: 1.6,
ease: 'power2.inOut',
clearProps: 'willChange', // Clean up when animation completes
});
});

// Find all elements with data-animation-gsap=horizontal-line
const verticalLines = document.querySelectorAll('[data-animation-gsap=vertical-line]');

// If no elements found, exit early
if (!verticalLines.length) return;

// Loop through each element and set up animations
verticalLines.forEach(line => {
// Set initial properties
gsap.set(line, { 
height: '0%',
willChange: 'height',
});

// Create a timeline for this element
const tl = gsap.timeline({
scrollTrigger: {
trigger: line,
start: 'top 90%', // Trigger when the top of the line reaches 90% of viewport height
toggleActions: 'play none none none',
markers: false // Set to true for debugging
}
});

// Animate width from 0% to 100%
tl.to(line, {
height: '100%',
duration: 1.6,
ease: 'power2.inOut',
clearProps: 'willChange', // Clean up when animation completes
});
});

// Find all elements with data-animation-gsap=horizontal-line
const fade = document.querySelectorAll('[data-animation-gsap=fade]');

// If no elements found, exit early
if (!fade.length) return;

// Loop through each element and set up animations
fade.forEach(element => {
// Set initial properties
gsap.set(element, { 
opacity: 0,
willChange: 'opacity',
});

// Create a timeline for this element
const tl = gsap.timeline({
scrollTrigger: {
trigger: element,
start: 'top 92%', // Trigger when the top of the line reaches 90% of viewport height
toggleActions: 'play none none none',
markers: false // Set to true for debugging
}
});

// Animate width from 0% to 100%
tl.to(element, {
opacity: 1,
duration: 1.2,
ease: 'power2.out',
clearProps: 'willChange', // Clean up when animation completes
});
});


});

pageFunctions.addFunction('navClassToggle', function() {
$("[data-attribute=transparent-nav]").each(function(index) {
  ScrollTrigger.create({
    trigger: $(this),
    start: "top 40px",
    end: "bottom 40px",
    onEnter: () => {
      $(".nav_component").removeClass("is-red");
      $(".nav_component").removeClass("is-green");
    },
    onEnterBack: () => {
      $(".nav_component").removeClass("is-red");
      $(".nav_component").removeClass("is-green");
    },
  });
});

$("[data-attribute=red-nav]").each(function(index) {
  ScrollTrigger.create({
    trigger: $(this),
    start: "top 40px",
    end: "bottom 40px",
    onEnter: () => {
      $(".nav_component").addClass("is-red");
      $(".nav_component").removeClass("is-green");
    },
    onEnterBack: () => {
      $(".nav_component").addClass("is-red");
      $(".nav_component").removeClass("is-green");
    },
  });
});

$("[data-attribute=green-nav]").each(function(index) {
  ScrollTrigger.create({
    trigger: $(this),
    start: "top 40px",
    end: "bottom 40px",
    onEnter: () => {
      $(".nav_component").addClass("is-green");
      $(".nav_component").removeClass("is-red");
    },
    onEnterBack: () => {
      $(".nav_component").addClass("is-green");
      $(".nav_component").removeClass("is-red");
    },
  });
});
});

pageFunctions.addFunction('navigationBehavior', function() {
  let lastScrollTop = 0;
  const threshold = 5; // Minimum scroll amount to trigger hide/show

  function handleNavigation() {
    const navComponents = document.querySelectorAll('.nav_component');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Only handle hide/show if we're not at the top
    if (currentScroll > 0) {
      // Check if we've scrolled more than the threshold
      if (Math.abs(currentScroll - lastScrollTop) <= threshold) {
        return;
      }

      navComponents.forEach(nav => {
        if (currentScroll > lastScrollTop) {
          // Scrolling down
          nav.classList.add('move');
        } else {
          // Scrolling up
          nav.classList.remove('move');
        }
      });
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
  }

  // Throttle the scroll event to improve performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        handleNavigation();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  handleNavigation();
});

pageFunctions.addFunction("buttonHover", function() {
  // Function to handle GSAP animations for heading lines
  function gsapButtonTextHover() {
    // Select all elements with the data attribute data-hover-button=trigger
    const buttonTextChars = document.querySelectorAll("[data-hover-button=trigger]");
    
    if (buttonTextChars.length > 0) {
      buttonTextChars.forEach(function (buttonElement) {        
        const textOne = buttonElement.querySelectorAll("[data-hover-button=text1] .char");
        const textTwo = buttonElement.querySelectorAll("[data-hover-button=text2] .char");
        
        if (textOne.length > 0 && textTwo.length > 0) {          
          let tlButtonTextChar = gsap.timeline({ paused: true });
          
          tlButtonTextChar.to(textOne, {
            yPercent: -50,
            opacity: 0,
            stagger: { each: 0.02 },
            ease: "power3.inOut",
            duration: 0.5,
          });
          
          tlButtonTextChar.from(
            textTwo,
            {
              yPercent: 50,
              opacity: 0,
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
  }

  function gsapButtonUnderline() {
    // Select all elements with the data attribute
    const buttons = document.querySelectorAll("[data-hover-button=underline]");
    
    if (buttons.length > 0) {
      buttons.forEach(function(button) {
        const line = button.querySelector(".btn_text_line");
        
        if (line) {
          // Set initial position
          gsap.set(line, { xPercent: -100 });
          
          // Create separate timelines
          const hoverInTL = gsap.timeline({ 
            paused: true,
            onComplete: function() {
              // Mark as completed for reference in the mouseleave handler
              button.dataset.hoverInComplete = "true";
            }
          });
          
          const hoverOutTL = gsap.timeline({ 
            paused: true,
            onComplete: function() {
              // Reset position and state when hover out completes
              gsap.set(line, { xPercent: -100 });
              button.dataset.hoverInComplete = "false";
            }
          });
          
          // Set up hover in animation
          hoverInTL.to(line, {
            xPercent: 0,
            duration: 0.5,
            ease: "power3.inOut"
          });
          
          // Set up hover out animation
          hoverOutTL.to(line, { 
            xPercent: 100,
            duration: 0.5,
            ease: "power3.inOut"
          });
          
          // Add event listeners
          button.addEventListener("mouseenter", function() {
            // Clear any existing animations
            hoverOutTL.progress(0).pause();
            
            // Play hover in from beginning
            hoverInTL.restart();
          });
          
          button.addEventListener("mouseleave", function() {
            // Only play hover out if hover in completed
            if (button.dataset.hoverInComplete === "true") {
              hoverOutTL.restart();
            } else {
              // For quick hovers, immediately end everything and reset
              hoverInTL.progress(0).pause();
              hoverOutTL.progress(0).pause();
              gsap.set(line, { xPercent: -100 });
            }
          });
          
          // Initialize dataset property
          button.dataset.hoverInComplete = "false";
        }
      });
    }
  }

  // Call the function to initialize the animations
  gsapButtonTextHover();
  gsapButtonUnderline();
}, "globalSplit");
