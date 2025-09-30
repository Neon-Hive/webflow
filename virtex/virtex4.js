// Custom Ease
gsap.registerPlugin(ScrollTrigger, CustomEase, ScrambleTextPlugin, Flip);
pageFunctions.addFunction("globalEase", function () {
// Opacity, Blur
CustomEase.create("sineInOut", "0.445, 0.05, 0.55, 0.95");
// Movement
CustomEase.create("cubincInOut", "0.645, 0.045, 0.355, 1");
// Cliping, opening menu
CustomEase.create("quartInOut", "0.77, 0, 0.175, 1");
});

// HEADER ANIMATION
pageFunctions.addFunction('pageTransition', function() {
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitType === 'undefined') {
console.error('GSAP, ScrollTrigger, or SplitType not loaded');
return;
}

// Initial Setup to stop scrolling
if (window.lenis && window.lenisRunning) {
window.lenis.stop();
}
const navWrap = document.querySelector('.nav_wrap');
document.body.style.overflow = 'hidden';
document.body.style.paddingRight = '4px';
if (navWrap) navWrap.style.paddingRight = '4px';

// Helper function to reset body styles and start Lenis
function resetBodyAndStartLenis() {
// When animation is complete, remove body overflow hidden
document.body.style.overflow = '';
document.body.style.paddingRight = '';
if (navWrap) navWrap.style.paddingRight = '';

// Start Lenis
if (window.lenis && !window.lenisRunning) {
  window.lenis.start();
  window.lenisRunning = true;
}
}

const focItem = document.querySelectorAll('[data-transition]');
const transitionWrap = document.querySelector('.transition_wrap');
const transitionLottie = lottie.loadAnimation({
container: document.querySelector('.transition_lottie'),
loop: false, 
autoplay: false, 
path: 'https://cdn.prod.website-files.com/680f5fbcc4cb7ef827577478/689b84f3b0e97211b32855a6_Virtex%20Lottie%203.0.json' 
});

// Create the main transition timeline
let tlTransition = gsap.timeline({
onComplete: () => {
  gsap.set(transitionWrap, { display: "none" });
},
});

// Set initial states
tlTransition.set(transitionWrap, {
display: "flex",
willChange: "clip-path",
clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
});

// First play the Lottie animation 
tlTransition.to({}, {
delay: 0.2,
duration: 1.2,
onUpdate: function() {
  const progress = Math.min(this.progress(), 0.99);
  transitionLottie.goToAndStop(Math.floor(transitionLottie.totalFrames * progress), true);
},
});

// Then animate the clip path
tlTransition.to(transitionWrap, {
clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
duration: 1, // Adjusted duration for clip-path animation
ease: "quartInOut",
}, "-=0.6");

// Add the runAnimation callback near the end of the transition
tlTransition.add(() => {
runAnimation();
}, "-=0.6");

// Function to determine which animation to run
function runAnimation() {
const pageName = $("body").data("page");

if (!pageName) {
  runGlobalAnimation();
} else {
  switch (pageName) {
    case "launch":
      runLaunchPageAnimation();
      break;
    case "error":
      runErrorAnimation();
      break;
    case "how":
      runHowPageAnimation();
      break;
    case "news":
      runNewsPageAnimation();
      break;     
    case "home":
      runHomePageAnimation();
      break;           
  }
}
}

function runLaunchPageAnimation() {
const nav = document.querySelector('[data-transition=nav]');
const headerHeight = document.querySelector('.header_height');
const headerVisualDriver = document.querySelector('[data-transition=driver]');
const headerVisualClip = document.querySelector('[data-transition=clip]');
const headerVisualBg = document.querySelector('[data-transition=bg]');
// Launch Timeline Elements
const headerBodyWrap = document.querySelector('[data-transition=block1]');
const headerBodySub = headerBodyWrap?.querySelector('[data-transition=subtitle]');
const headerBodyHeading = headerBodyWrap?.querySelector('[data-transition=heading]');
const headerBodyText = headerBodyWrap?.querySelector('[data-transition=text]');
const headerBodyBtn = headerBodyWrap?.querySelector('[data-transition=btn]');
const headerBody2Wrap = document.querySelector('[data-transition=block2]');
const headerBody2Headings = headerBody2Wrap?.querySelectorAll('[data-transition=heading2]');
const headerBody2Text = headerBody2Wrap?.querySelector('[data-transition=text2]');

if (!headerHeight || !headerVisualDriver || !headerVisualBg || !headerBodyWrap) {
  console.error('One or more header elements not found');
  resetBodyAndStartLenis(); // Still reset body even if elements aren't found
  return;
}

// Split text
const headerText = document.querySelectorAll('[data-header-split]');
let splitTextInstance = null;
if (headerText.length > 0) {
  splitTextInstance = new SplitType(headerText, {
    types: 'words, chars',
    tagName: 'span'
  });
}

// Set up second part initial states
if (headerBody2Wrap) {
  gsap.set(headerBody2Wrap, { opacity: 0 });
}
if (headerVisualClip) {
  gsap.set(headerVisualClip, { scale: 0, clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' });
}

// Reveal timeline
const pageReveal = gsap.timeline({
  onComplete: function() {
    resetBodyAndStartLenis();
    setupScrollAnimation();
  }
});

function setupScrollAnimation() {
  // Create headerAnimation timeline with ScrollTrigger
  const headerAnimation = gsap.timeline({
    scrollTrigger: {
      trigger: headerHeight,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      markers: false,
    }
  });

  headerAnimation.to(headerBodyWrap, {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 0.1
  }, 0.1);

  headerAnimation.to([headerVisualBg, headerVisualDriver], {
    scale: 1,
    opacity: 0,
    duration: 0.3
  }, 0.3);

  if (headerBody2Wrap) {
    headerAnimation.to(headerBody2Wrap, {
      opacity: 1,
      duration: 0.05
    }, 0.5);

    // Animation for multiple headerBody2Headings
    if (headerBody2Headings && headerBody2Headings.length > 0) {
      // Create an array to store all the words from all headings
      let allWords = [];

      // Loop through each heading and collect its words
      headerBody2Headings.forEach(heading => {
        const words = heading.querySelectorAll('.word');
        if (words.length > 0) {
          words.forEach(word => allWords.push(word));
        }
      });

      if (allWords.length > 0) {
        headerAnimation.from(allWords, {
          opacity: 0,
          filter: 'blur(5px)',
          duration: 0.6,
          stagger: 0.1,
          ease: "power4.out"
        }, 0.5);
      }
    }

    // Animation for headerBody2Text if needed
    if (headerBody2Text) {
      headerAnimation.from(headerBody2Text, {
        opacity: 0,
        duration: 0.2,
        ease: "power3.out"
      }, 0.7);
    }
  }

  if (headerVisualClip) {
    headerAnimation.to(headerVisualClip, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      scale: 1,
      duration: 0.4
    }, 0.45);
  }
}

gsap.set(focItem, { visibility: 'visible' });

pageReveal.from(headerVisualBg, {
  opacity: 0,
  scale: 1.4,
  duration: 4,
  ease: "sineInOut"
});

pageReveal.from(headerVisualDriver, {
  opacity: 0,
  scale: 1.2,
  duration: 4,
  ease: "sineInOut"
}, "<1");

if (headerBodySub && nav) {
  pageReveal.from([headerBodySub, nav], {
    opacity: 0,
    duration: 1.2,
    ease: "sineInOut"
  }, "-=3");
}

if (headerBodyHeading && headerBodyHeading.querySelectorAll('.word').length > 0) {
  pageReveal.from(headerBodyHeading.querySelectorAll('.word'), {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1.2,
    stagger: 0.2,
    ease: "sineInOut"
  }, "<0.1");
}

if (headerBodyText && headerBodyBtn) {
  pageReveal.from([headerBodyText, headerBodyBtn], {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1,
    stagger: 0.5,
    ease: "sineInOut"
  }, "<0.3");
}
}

function runHowPageAnimation() {
const nav = document.querySelector('[data-transition=nav]');
const headerVisual = document.querySelector('[data-transition=bg]');
const headerBodyWrap = document.querySelector('.header2_component');
const headerBodySub = headerBodyWrap?.querySelector('[data-transition=subtitle]');
const headerBodyHeading = headerBodyWrap?.querySelector('[data-transition=heading]');
const headerBodyText = headerBodyWrap?.querySelector('[data-transition=text]');
const headerBodyBtn = headerBodyWrap?.querySelector('[data-transition=btn]');

if (!headerVisual || !headerBodyWrap) {
  console.error('One or more header elements not found');
  resetBodyAndStartLenis(); // Still reset body even if elements aren't found
  return;
}

// Split text
let splitTextInstance = null;
if (headerBodyHeading) {
  splitTextInstance = new SplitType(headerBodyHeading, {
    types: 'words, chars',
    tagName: 'span'
  });
}

gsap.set(focItem, { visibility: 'visible' });

const pageReveal = gsap.timeline({
  onComplete: function() {
    resetBodyAndStartLenis();
  }
});

pageReveal.from(headerVisual, {
  opacity: 0,
  scale: 1.4,
  duration: 4,
  ease: "sineInOut"
});

if (headerBodySub && nav) {
  pageReveal.from([headerBodySub, nav], {
    opacity: 0,
    duration: 1.2,
    ease: "sineInOut"
  }, "-=3");
}

if (headerBodyHeading && headerBodyHeading.querySelectorAll('.word').length > 0) {
  pageReveal.from(headerBodyHeading.querySelectorAll('.word'), {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1.2,
    stagger: 0.2,
    ease: "sineInOut"
  }, "<0.1");
}

if (headerBodyText && headerBodyBtn) {
  pageReveal.from([headerBodyText, headerBodyBtn], {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1,
    stagger: 0.5,
    ease: "sineInOut"
  }, "<0.3");
}
}

function runHomePageAnimation() {
const nav = document.querySelector('[data-transition=nav]');
const headerVisualDriver = document.querySelector('[data-transition=driver]');
const headerVisualBg = document.querySelector('[data-transition=bg]');
const headerBodyWrap = document.querySelector('.header2_component');
const headerBodySub = headerBodyWrap?.querySelector('[data-transition=subtitle]');
const headerBodyHeading = headerBodyWrap?.querySelector('[data-transition=heading]');
const headerBodyText = headerBodyWrap?.querySelector('[data-transition=text]');
const headerBodyBtn = headerBodyWrap?.querySelector('[data-transition=btn]');

if (!headerVisualDriver || !headerVisualBg || !headerBodyWrap) {
  console.error('One or more header elements not found');
  resetBodyAndStartLenis(); // Still reset body even if elements aren't found
  return;
}

// Split text
let splitTextInstance = null;
if (headerBodyHeading) {
  splitTextInstance = new SplitType(headerBodyHeading, {
    types: 'words, chars',
    tagName: 'span'
  });
}

// Reveal timeline
const pageReveal = gsap.timeline({
  onComplete: function() {
    resetBodyAndStartLenis();
  }
});

gsap.set(focItem, { visibility: 'visible' });

pageReveal.from(headerVisualBg, {
  opacity: 0,
  scale: 1.4,
  duration: 4,
  ease: "sineInOut"
});

pageReveal.from(headerVisualDriver, {
  opacity: 0,
  scale: 1.2,
  duration: 4,
  ease: "sineInOut"
}, "<1");

if (headerBodySub && nav) {
  pageReveal.from([headerBodySub, nav], {
    opacity: 0,
    duration: 1.2,
    ease: "sineInOut"
  }, "-=3");
}

if (headerBodyHeading && headerBodyHeading.querySelectorAll('.word').length > 0) {
  pageReveal.from(headerBodyHeading.querySelectorAll('.word'), {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1.2,
    stagger: 0.2,
    ease: "sineInOut"
  }, "<0.1");
}

if (headerBodyText && headerBodyBtn) {
  pageReveal.from([headerBodyText, headerBodyBtn], {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1,
    stagger: 0.5,
    ease: "sineInOut"
  }, "<0.3");
}
}

function runNewsPageAnimation() {
    const nav = document.querySelector('[data-transition=nav]');
    const pageFade = document.querySelectorAll('[data-transition="fade"]');
    const verticalLines = document.querySelectorAll('[data-transition="vertical-line"]');
    const horizontalLines = document.querySelectorAll('[data-transition="horizontal-line"]');
    const svgPaths = document.querySelectorAll('.news_header_svg path');
  
    const pageReveal = gsap.timeline({
      onComplete: function () {
        resetBodyAndStartLenis();
      }
    });
  
    gsap.set(focItem, { visibility: 'visible' });
  
    // Vertical lines
    if (verticalLines.length > 0) {
      pageReveal.from(verticalLines, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.2,
        delay: 0.2,
        ease: "sineInOut"
      });
    }
  
    // Horizontal lines
    if (horizontalLines.length > 0) {
      pageReveal.from(horizontalLines, {
        scaleX: 0,
        transformOrigin: "left",
        duration: 0.6,
        ease: "sineInOut",
        onComplete: () => {
            const originalGrid = document.querySelector('.grid_wrap');
            const news_header = document.querySelector('.news_header_wrap');
            const placeholders = {
              header: document.querySelector('[data-news-placeholder="header"]'),
              grid: document.querySelector('[data-news-placeholder="grid"]')
            };
          
            if (!originalGrid) return console.warn('Original grid not found');
          
            Object.entries(placeholders).forEach(([key, placeholder]) => {
              if (placeholder) {
                placeholder.appendChild(originalGrid.cloneNode(true));
              } else {
                console.warn(`${key} placeholder not found`);
              }
            });
          
            originalGrid.remove();
            news_header.classList.add('is-sticky');
          }
      }, "-=0.2");
    }
  
    // Fade-ins
    if (pageFade.length > 0) {
      pageReveal.from(pageFade, {
        opacity: 0,
        filter: 'blur(5px)',
        duration: 1,
        stagger: { each: 0.1 },
        ease: "sineInOut"
      }, "<0.3");
    }
  
    // SVG path reveal
    if (svgPaths.length > 0) {
      pageReveal.from(svgPaths, {
        opacity: 0,
        duration: 1,
        ease: "sineInOut",
        stagger: { amount: 0.6, from: "random" }
      }, "<0.2");
    }
  
    // Nav
    if (nav) {
      pageReveal.from(nav, {
        opacity: 0,
        duration: 1.2,
        ease: "sineInOut"
      }, "<");
    }
  

  }

function runGlobalAnimation() {
const nav = document.querySelector('[data-transition=nav]');
const pageVisual = document.querySelector('[data-transition="visual"]');
const pageFade = document.querySelectorAll('[data-transition="fade"]'); 
const horizontalLines = document.querySelectorAll('[data-transition="horizontal-line"]');


// Reveal timeline
const pageReveal = gsap.timeline({
  onComplete: function() {
    resetBodyAndStartLenis();
  }
});

gsap.set(focItem, { visibility: 'visible' });

if (pageVisual) {
  pageReveal.from(pageVisual, {
    scale: 1.4,
    duration: 2,
    ease: "sineInOut"
  });

  pageReveal.from(pageVisual, {
    opacity: 0,
    duration: 0.4,
    ease: "sineInOut"
  }, "<");
}

if (pageFade && pageFade.length > 0) { 
  pageReveal.from(pageFade, {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1,
    stagger: {
      each: 0.1
    },
    ease: "sineInOut"
  }, "<0.4");
}

  // Horizontal lines
if (horizontalLines.length > 0) {
pageReveal.from(horizontalLines, {
  scaleX: 0,
  transformOrigin: "left",
  duration: 0.6,
  ease: "sineInOut"
}, "-=0.2");
}

if (nav) {
  pageReveal.from(nav, {
    opacity: 0,
    duration: 1.2,
    ease: "sineInOut"
  }, "<");
}      
}

function runErrorAnimation() {
// Global Elements
const nav = document.querySelector('[data-transition=nav]');
const pageBg = document.querySelector('[data-transition="bg"]');
const pageVisual = document.querySelector('[data-transition="visual"]');
const pageFade = document.querySelectorAll('[data-transition="fade"]'); 

// Reveal timeline
const pageReveal = gsap.timeline({
  onComplete: function() {
    resetBodyAndStartLenis();
  }
});

gsap.set(focItem, { visibility: 'visible' });

if (pageBg) {
  pageReveal.from(pageBg, {
    opacity: 0,
    scale: 1.4,
    duration: 4,
    ease: "sineInOut"
  });
}

if (pageVisual) {
  pageReveal.from(pageVisual, {
    opacity: 0,
    scale: 1.2,
    duration: 4,
    ease: "sineInOut"
  }, "<1");
}

if (pageFade && pageFade.length > 0) { 
  pageReveal.from(pageFade, {
    opacity: 0,
    filter: 'blur(5px)',
    duration: 1,
    stagger: {
      each: 0.1
    },
    ease: "sineInOut"
  }, "<0.4");
}

if (nav) {
  pageReveal.from(nav, {
    opacity: 0,
    duration: 1.2,
    ease: "sineInOut"
  }, "<");
}     
}

// Create reusable function for page exit transitions
function createExitTransition() {
// Match the entrance transition for consistency
let tl = gsap.timeline();

// Reset Lottie to start position
transitionLottie.goToAndStop(0, true);

tl.set(transitionWrap, {
  display: "flex",
  clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
})
.to(transitionWrap, {
  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  duration: 0.6,
  ease: "quartInOut"
});

return tl;
}

// Update the click handler for links
$("a:not(.excluded-class)").on("click", function (e) {
let currentUrl = $(this).attr("href");

// Check conditions for internal navigation
if (
  $(this).prop("hostname") === window.location.host && // Same host
  !currentUrl.includes("#") && // Not a hash link
  $(this).attr("target") !== "_blank" // Not opening in a new tab
) {
  e.preventDefault();

  // Create and play exit transition
  const exitTransition = createExitTransition();
  exitTransition.eventCallback("onComplete", () => {
    window.location.href = currentUrl;
  });
}
});

// Handle back button with a page refresh to ensure correct state
window.onpageshow = function (event) {
if (event.persisted) {
  window.location.reload();
}
};
});

// LENNIS
pageFunctions.addFunction("globalLenis", function () {
// Initialize Lenis with configuration
    if (typeof Webflow === 'undefined' || Webflow.env("editor") === undefined) {
const lenis = new Lenis({
  direction: 'vertical', // Scrolling direction
  gestureDirection: 'vertical', // Gesture recognition direction
  smooth: true, // Enable smooth scrolling
  lerp: 0.1, // Animation interpolation factor
  wheelMultiplier: 0.6, // Wheel scroll sensitivity
  mouseMultiplier: 0.6, // Mouse scroll sensitivity
  smoothTouch: false, // Disable smooth touch scrolling
  touchMultiplier: 1, // Touch scroll sensitivity
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

// After initializing Lenis, connect it to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

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
    }
});

// GLOBAL ANIMATION
pageFunctions.addFunction("globalAnimation", function () {
// Select all elements with data-animation-gsap attribute
const animatedElements = document.querySelectorAll("[data-animation-gsap]");
if (animatedElements.length > 0) {
  animatedElements.forEach(function(element) {
    // Get the animation type from the data attribute
    const animationType = element.getAttribute("data-animation-gsap");
    // Get the delay value (default to 0 if not specified)
    const delay = parseFloat(element.getAttribute("data-delay-gsap") || 0);
    // Get the duration value (default to 0.8 if not specified)
    const duration = parseFloat(element.getAttribute("data-duration-gsap") || 0.8);

    // Create a timeline for this element
    const timeline = gsap.timeline({ paused: true });

    // Apply different animations based on the animation type
    switch(animationType) {
      case "fade-in":
        timeline.from(element, {
          opacity: 0,
          duration: duration,
          delay: delay,
          ease: "sineInOut"
        });
        break;

      case "fade-blur":
        timeline.from(element, {
          opacity: 0,
          filter: 'blur(5px)',
          duration: duration,
          delay: delay,
          ease: "sineInOut"
        });
        break;

      case "fade-in-up":
        timeline.from(element, {
          opacity: 0,
          y: "1rem",
          duration: duration,
          delay: delay,
          ease: "sineInOut"
        });
        break;

      case "scale-in":
        timeline.from(element, {
          opacity: 0,
          scale: 0.8,
          duration: duration,
          delay: delay,
          ease: "power1.out"
        });
        break;

      case "width":
        timeline.from(element, {
          width: "0%",
          duration: duration,
          delay: delay,
          ease: "cubincInOut"
        });
        break;

      case "stagger-children":
        // For staggering children elements
        const children = element.children;
        timeline.from(children, {
          opacity: 0,
          filter: 'blur(5px)',
          duration: duration,
          stagger: 0.2,
          delay: delay,
          ease: "sineInOut"
        });
        break;

      default:
        // Default to fade-in if animation type is not recognized
        timeline.from(element, {
          opacity: 0,
          duration: duration,
          delay: delay,
          ease: "sineInOut"
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

document.querySelectorAll('[data-button-hover="text"]').forEach(element => {
    var o = element.querySelector(".g_clickable_wrap, .g_clickable_link, .g_clickable_btn") || element;
    let a = element.querySelector('[data-button-text="target"]');
    if (a) {
        let e = a.textContent;
        let n = a.getBoundingClientRect().width || a.offsetWidth || .6 * e.length * 16;
        a.style.display = "inline-block";
        a.style.minWidth = n + "px";
        let t = false;
        o.addEventListener("mouseenter", () => {
            if (!t) {
                t = true;
                gsap.to(a, {
                    duration: 1,
                    scrambleText: {
                        text: e,
                        chars: "01",
                        tweenLength: false
                    },
                    onComplete: () => t = false
                });
            }
        });
        o.addEventListener("mouseleave", () => {
            if (!t) {
                t = true;
                gsap.to(a, {
                    duration: .6,
                    scrambleText: {
                        text: e,
                        speed: 2,
                        chars: "01",
                        tweenLength: false
                    },
                    onComplete: () => t = false
                });
            }
        });
    }
});

// GLOBAL REFRESH
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

});

// COLOR THEME SCROLL CHANGE  
pageFunctions.addFunction('themeChange', function() {
document.querySelectorAll("[data-animate-theme-to]").forEach(function(element) {
  let theme = element.getAttribute("data-animate-theme-to");

  ScrollTrigger.create({
    trigger: element,
    start: "top 10%",
    end: "bottom 10%",
    onToggle: ({ self, isActive }) => {
      if (isActive) gsap.to("body", { ...colorThemes.getTheme(theme), duration: 0.8, ease: "sineInOut" });
    }
  });
});
});
