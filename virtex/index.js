// Custom Ease
gsap.registerPlugin(ScrollTrigger, CustomEase, ScrambleTextPlugin);
pageFunctions.addFunction("globalEase", function () {
// Opacity, Blur
CustomEase.create("sineInOut", "0.445, 0.05, 0.55, 0.95");
// Movement
CustomEase.create("cubincInOut", "0.645, 0.045, 0.355, 1");
// Cliping, opening menu
CustomEase.create("quartInOut", "0.77, 0, 0.175, 1");
});

// Lennis
pageFunctions.addFunction("globalLenis", function () {
// Initialize Lenis with configuration
const lenis = new Lenis({
direction: 'vertical', // Scrolling direction
gestureDirection: 'vertical', // Gesture recognition direction
smooth: true, // Enable smooth scrolling
lerp: 0.05, // Animation interpolation factor
wheelMultiplier: 0.9, // Wheel scroll sensitivity
mouseMultiplier: 0.9, // Mouse scroll sensitivity
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

// NAV
pageFunctions.addFunction('navigation', function() {
// Elements
const navWrap = document.querySelector('.nav_wrap');
const navFill = document.querySelector('.nav_fill');

// Variables
let lastScrollY = window.scrollY;
let scrollTimeout = null;
let navIsVisible = true;
let navFillVisible = lastScrollY > 30;

// Debounced scroll handler
function onScroll() {
const currentScroll = window.scrollY;

// Only update DOM if there's a significant change in scroll position
// or state needs to change (improves performance)
const scrollDelta = Math.abs(currentScroll - lastScrollY);

if (scrollDelta > 5) {
  // Direction logic - only animate if state changes
  if (currentScroll > lastScrollY && navIsVisible && scrollDelta > 10) {
    // Scrolling down - hide nav
    navWrap.style.transform = 'translateY(-100%)';
    navIsVisible = false;
  } else if (currentScroll < lastScrollY && !navIsVisible) {
    // Scrolling up - show nav
    navWrap.style.transform = 'translateY(0)';
    navIsVisible = true;
  }
  
  lastScrollY = currentScroll;
}

// Nav fill clip-path when 30px from top - only animate on state change
if (currentScroll > 30 && !navFillVisible) {
  navFill.style.clipPath = 'polygon(0 0, 100% 0%, 100% 100%, 0% 100%)';
  navFillVisible = true;
} else if (currentScroll <= 30 && navFillVisible) {
  navFill.style.clipPath = 'polygon(0 0, 100% 0%, 100% 0%, 0% 0%)';
  navFillVisible = false;
}
}

// Use CSS transitions instead of GSAP for better performance
navWrap.style.transition = 'transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000)';
navFill.style.transition = 'clip-path 0.5s cubic-bezier(0.77, 0, 0.175, 1)';

// More efficient scroll listener with proper throttling
function throttledScroll() {
// Clear any existing timeout
if (scrollTimeout) {
  window.cancelAnimationFrame(scrollTimeout);
}

// Schedule the execution on the next animation frame
scrollTimeout = window.requestAnimationFrame(onScroll);
}

// Passive event listener for better scroll performance
window.addEventListener('scroll', throttledScroll, { passive: true });

// Run once on load to set initial state
onScroll();

// Clean up function for better memory management
return function cleanup() {
window.removeEventListener('scroll', throttledScroll);
if (scrollTimeout) {
  window.cancelAnimationFrame(scrollTimeout);
}
};
});

// HEADER ANIMATION
pageFunctions.addFunction('header', function() {
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitType === 'undefined') {
  console.error('GSAP, ScrollTrigger, or SplitType not loaded');
  return;
}

gsap.registerPlugin(ScrollTrigger);

// Stop Lenis at the beginning
if (window.lenis && window.lenisRunning) {
  window.lenis.stop();
}

// Set body overflow to hidden at the start
document.body.style.overflow = 'hidden';

// Elements
const headerHeight = document.querySelector('.header_height');
const nav = document.querySelector('.nav_component');
const headerVisualDriver = document.querySelector('.header_visual_driver');
const headerVisualClip = document.querySelector('.header_visual_clip');
const headerVisualBg = document.querySelector('.header_visual_bg');

const headerBodyWrap = document.querySelector('.header_block1');
const headerBodySub = headerBodyWrap?.querySelector('.header_subtitle');
const headerBodyHeading = headerBodyWrap?.querySelector('.header_heading');
const headerBodyText = headerBodyWrap?.querySelector('.header_text');
const headerBodyBtn = headerBodyWrap?.querySelector('.btn_main_wrap');

const headerBody2Wrap = document.querySelector('.header_block2');
const headerBody2Headings = headerBody2Wrap?.querySelectorAll('.header_heading2');
const headerBody2Text = headerBody2Wrap?.querySelector('.header_text2');

if (!headerHeight || !headerVisualDriver || !headerVisualBg || !headerBodyWrap) {
  console.error('One or more header elements not found');
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

 // Reveal timeline
 const pageReveal = gsap.timeline({
  onComplete: function() {
    // When pageReveal is complete, remove body overflow hidden
    document.body.style.overflow = '';

    // Start Lenis
    if (window.lenis && !window.lenisRunning) {
      window.lenis.start();
      window.lenisRunning = true;
    }

    // Setup for headerAnimation timeline
    // Set initial states for the second part elements
    if (headerBody2Wrap) {
      gsap.set(headerBody2Wrap, { visibility: 'visible', opacity: 0 });
    }
    if (headerVisualClip) {
      gsap.set(headerVisualClip, { visibility: 'visible', scale: 0, clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' });
    }

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
});

gsap.set([headerVisualDriver, headerVisualBg, headerBodyWrap, nav], { visibility: 'visible' });

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
});

// BLOCK REVEAL
pageFunctions.addFunction('blockReveal', function() {
// Make sure GSAP and ScrollTrigger are available
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
console.error('GSAP or ScrollTrigger is not loaded. Please include them in your project.');
return;
}

// Use gsap.matchMedia to create responsive behavior
const mm = gsap.matchMedia();

// Store all created ScrollTrigger instances for proper cleanup
const createdScrollTriggers = [];

// Only apply animations for screens larger than 991px
mm.add("(min-width: 992px)", () => {
// Select all elements with the .block_sticky class
const stickyBlocks = document.querySelectorAll('.block_sticky');

// Check if there are any sticky blocks on the page
if (!stickyBlocks.length) return;

// For each sticky block, set up the scroll-based animation with GSAP
stickyBlocks.forEach(stickyBlock => {
  // Find the container inside the sticky block
  const container = stickyBlock.querySelector('.block_contain_wrap');

  // If no container is found, skip this sticky block
  if (!container) return;

  // Set initial state for the container
  gsap.set(container, {
    rotationZ: -18,
    xPercent: 100,
    yPercent: 100,
    force3D: true
  });

  // Create a ScrollTrigger animation for the container
  const containerTrigger = ScrollTrigger.create({
    trigger: stickyBlock,
    start: "top bottom",
    end: "top top",
    scrub: 0.5,
    markers: false,
    immediateRender: false,
    animation: gsap.timeline()
      .to(container, {
        rotationZ: 0,
        xPercent: 0,
        yPercent: 0,
        ease: "power2.out"
      })
  });
  
  // Store the ScrollTrigger for cleanup
  createdScrollTriggers.push(containerTrigger);

  // Inner elements setup
  const heading = container.querySelectorAll('.block_body_heading');
  const textIndent = container.querySelector('.block_body_paragraph');
  const bodyItems = container.querySelectorAll('.block_body_item');
  const svg = container.querySelector('.block_body_svg');
  
  // Set initial states
  if (heading.length) {
    gsap.set(heading, { opacity: 0, filter: 'blur(5px)' });
  }
  
  if (textIndent) {
    gsap.set(textIndent, { opacity: 0, filter: 'blur(5px)' });
  }
  
  if (bodyItems.length) {
    gsap.set(bodyItems, { opacity: 0 });
    
    bodyItems.forEach(item => {
      const parentLine = item.closest('.block_body_line');
      if (parentLine) {
        gsap.set(parentLine, { width: 0 });
      }
    });
  }
  
  if (svg) {
    gsap.set(svg, { opacity: 0 });
  }
  
  // Create inner timeline
  const innerTimeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.8, ease: "sineInOut" }
  });
  
  // Add animations to timeline
  if (heading.length) {
    innerTimeline.to(heading, { 
      opacity: 1, 
      filter: 'blur(0px)',
      duration: 0.8
    });
  }
  
  if (textIndent) {
    innerTimeline.to(textIndent, { 
      opacity: 1, 
      filter: 'blur(0px)',
      duration: 0.8
    }, "-=0.4");
  }
  
  if (svg) {
    innerTimeline.to(svg, { 
      opacity: 1,
      duration: 0.5
    }, "-=0.4");
  }
  
  if (bodyItems.length) {
    const lines = new Set();
    bodyItems.forEach(item => {
      const parentLine = item.closest('.block_body_line');
      if (parentLine) {
        lines.add(parentLine);
      }
    });
    
    innerTimeline.to(Array.from(lines), { 
      width: "100%", 
      duration: 0.8,
      stagger: 0.15,
      ease: "cubicInOut" // Fixed typo in ease: "cubincInOut" -> "cubicInOut"
    }, "-=0.2");
    
    innerTimeline.to(bodyItems, { 
      opacity: 1, 
      duration: 0.5,
      stagger: 0.08
    }, "-=0.4");
  }
  
  // Create ScrollTrigger for inner animations
  const innerTrigger = ScrollTrigger.create({
    trigger: stickyBlock,
    start: "top center",
    onEnter: () => innerTimeline.play(),
    onLeaveBack: () => innerTimeline.reverse(),
  });
  
  // Store the ScrollTrigger for cleanup
  createdScrollTriggers.push(innerTrigger);
});

// Return a cleanup function that just kills the ScrollTriggers created by this media query
return () => {
  createdScrollTriggers.forEach(trigger => trigger.kill());
};
});

// Mobile animations
mm.add("(max-width: 991px)", () => {
// Store ScrollTriggers created in this media query
const mobileScrollTriggers = [];

const containers = document.querySelectorAll('.block_contain');

containers.forEach(container => {
  const headings = container.querySelectorAll('.block_body_heading');
  const textIndent = container.querySelector('.block_body_paragraph');
  const bodyItems = container.querySelectorAll('.block_body_item');
  const svg = container.querySelector('.block_body_svg');
  
  if (headings.length) {
    headings.forEach(heading => {
      gsap.set(heading, { opacity: 0 });
      
      const headingTrigger = ScrollTrigger.create({
        trigger: heading,
        start: "top 90%",
        toggleActions: "play none none reverse",
        animation: gsap.to(heading, {
          opacity: 1,
          duration: 0.8,
          ease: "sineInOut"
        })
      });
      
      mobileScrollTriggers.push(headingTrigger);
    });
  }
  
  if (textIndent) {
    gsap.set(textIndent, { opacity: 0 });
    
    const paragraphTrigger = ScrollTrigger.create({
      trigger: textIndent,
      start: "top 90%",
      toggleActions: "play none none reverse",
      animation: gsap.to(textIndent, {
        opacity: 1,
        duration: 0.8,
        ease: "sineInOut"
      })
    });
    
    mobileScrollTriggers.push(paragraphTrigger);
  }
  
  if (svg) {
    gsap.set(svg, { opacity: 0, scale: 0.9 });
    
    const svgTrigger = ScrollTrigger.create({
      trigger: svg,
      start: "top 90%",
      toggleActions: "play none none reverse",
      animation: gsap.to(svg, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "sineInOut"
      })
    });
    
    mobileScrollTriggers.push(svgTrigger);
  }
  
  if (bodyItems.length) {
    bodyItems.forEach(item => {
      gsap.set(item, { opacity: 0 });
      
      const itemTrigger = ScrollTrigger.create({
        trigger: item,
        start: "top 90%",
        toggleActions: "play none none reverse",
        animation: gsap.to(item, {
          opacity: 1,
          duration: 0.8,
          ease: "sineInOut"
        })
      });
      
      mobileScrollTriggers.push(itemTrigger);
    });
  }
});

// Return cleanup function that only kills this media query's ScrollTriggers
return () => {
  mobileScrollTriggers.forEach(trigger => trigger.kill());
};
});
});

// POPUP REVEAL
pageFunctions.addFunction('popup', function() {
// Initialize GSAP
const popup = document.querySelector('.popup_component');
const popupBtn = document.querySelector('.popup_btn_wrap');
const closeBtn = document.querySelector('.popup_close');
const contactSection = document.querySelector('[data-section-contact]');

// Set initial state - move popup off-screen
gsap.set(popup, { visibility: 'visible', xPercent: 100, force3D: true });

// Track popup state
let isPopupOpen = false;

// Function to open popup
function openPopup() {
// Animate the popup coming in from the right
gsap.to(popup, {
  xPercent: 0,
  duration: 1.2,
  ease: "quartInOut",
});

// Disable Lenis smooth scrolling
if (window.lenis) {
  window.lenis.stop();
}

// Disable scrolling
document.body.style.overflow = 'hidden';

isPopupOpen = true;
}

// Function to close popup
function closePopup() {
// Animate the popup going back to the right
gsap.to(popup, {
  xPercent: 100,
  duration: 0.6,
  ease: "quartInOut",
});

// Re-enable Lenis smooth scrolling
if (window.lenis) {
  window.lenis.start();
}

// Re-enable scrolling
document.body.style.overflow = '';

isPopupOpen = false;
}

// Toggle function for popup
function togglePopup() {
if (isPopupOpen) {
  closePopup();
} else {
  openPopup();
}
}

// Add click event listener to popup button for toggling
popupBtn.addEventListener('click', togglePopup);

// Add click event listener to close button
closeBtn.addEventListener('click', closePopup);

// Close popup when clicking outside
document.addEventListener('click', function(event) {
// Check if click is outside the popup and the popup is visible
if (!popup.contains(event.target) && 
    !popupBtn.contains(event.target) && 
    isPopupOpen) {
  closePopup();
}
});

// Function to animate popup button off-screen
function animateButtonOffscreen() {
gsap.to(popupBtn, {
  xPercent: -100,
  duration: 0.4,
  ease: "quartInOut"
});
}

// Function to animate popup button back to original position
function animateButtonOnscreen() {
gsap.to(popupBtn, {
  xPercent: 0,
  duration: 0.4,
  ease: "quartInOut"
});
}

// Add scroll-triggered animation for contact section
if (contactSection) {
// Create a ScrollTrigger for the contact section
ScrollTrigger.create({
  trigger: contactSection,
  start: "top center", // Trigger when top of section reaches center of viewport
  end: "bottom bottom", // End when bottom of section reaches bottom of viewport
  onEnter: animateButtonOffscreen,
  onLeave: animateButtonOnscreen,
  onEnterBack: animateButtonOffscreen,
  onLeaveBack: animateButtonOnscreen
});
}
});

// HORIZONTAL SCROLL
pageFunctions.addFunction('horizontal', function() {
document.querySelectorAll(".horizontal_wrap").forEach(function(wrap) {
const inner = wrap.querySelector(".horizontal_inner");
const track = wrap.querySelector(".horizontal_track");
const marquee = wrap.querySelectorAll("[data-marquee=component]");
const marqueeContain = wrap.querySelector(".horizontal_marquee_contain");
const marqueeText = wrap.querySelector(".horizontal_marquee_text");

// Store the timeout reference at this scope so cleanup can access it
let resizeTimeout;

function setMarqueeHeight() {
  if (marqueeContain && marqueeText) {
    marqueeContain.style.height = marqueeText.offsetHeight + "px";
  }
}

function setScrollDistance() {
  wrap.style.height = `calc(${track.offsetWidth}px + 100vh)`;
  setMarqueeHeight();
}

setScrollDistance();
ScrollTrigger.refresh();

const debounce = (func, wait) => {
  return function(...args) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => func(...args), wait);
  };
};

const debouncedSetScrollDistance = debounce(() => {
  setScrollDistance();
  ScrollTrigger.refresh();
}, 200);

window.addEventListener("resize", debouncedSetScrollDistance);

// Main horizontal scroll
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: wrap,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,
  },
  defaults: { ease: "none" },
});

tl.to(track, { xPercent: -100 });

gsap.set([marquee[1], marquee[2]], {
  yPercent: 100,
  force3D: true
});

gsap.set([marquee[0]], {
  yPercent: 0,
  force3D: true
});

// Item animations
const tl1 = gsap.timeline({
  scrollTrigger: {
    trigger: wrap.querySelector("[data-horizontal-item='2']"),
    containerAnimation: tl,
    start: "left center",
    toggleActions: "play none none reverse",
  },
});

tl1.to(marquee[0], { duration: 0.8, ease: "cubincInOut", yPercent: -100 }, 0);
tl1.to(marquee[1], { duration: 0.8, ease: "cubincInOut", yPercent: 0 }, 0);
tl1.to(marquee[2], { duration: 0.8, ease: "cubincInOut", yPercent: 100 }, 0);

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: wrap.querySelector("[data-horizontal-item='3']"),
    containerAnimation: tl,
    start: "left center",
    toggleActions: "play none none reverse",
  },
});

tl1.to(marquee[0], { duration: 0.8, ease: "cubincInOut", yPercent: -100 }, 0);
tl2.to(marquee[1], { duration: 0.8, ease: "cubincInOut", yPercent: -100 }, 0);
tl2.to(marquee[2], { duration: 0.8, ease: "cubincInOut", yPercent: 0 }, 0);

// Cleanup function
return function cleanup() {
  // Clear any pending resize timeout
  clearTimeout(resizeTimeout);
  
  // Remove event listener
  window.removeEventListener("resize", debouncedSetScrollDistance);

  // Kill ScrollTriggers linked to the wrap
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars.trigger === wrap) {
      trigger.kill();
    }
  });

  // Kill all timelines
  [tl, tl1, tl2].forEach(timeline => timeline?.kill());
};
});
});

// MARQUEE
pageFunctions.addFunction('marquee', function() {
function initMarqueeScroll() {
// Clean up only marquee-related animations instead of all ScrollTriggers
ScrollTrigger.getAll().forEach(st => {
// Only kill ScrollTriggers that are related to marquee elements
if (st.vars.trigger && 
  st.vars.trigger.closest && 
  st.vars.trigger.closest('[data-marquee="component"]')) {
st.kill();
}
});

// Kill only marquee track tweens instead of all tweens
gsap.getTweensOf('[data-marquee="track"]').forEach(tween => tween.kill());

document.querySelectorAll('[data-marquee="component"]').forEach((marquee) => {
// Query marquee elements
const marqueeContent = marquee.querySelector('[data-marquee="track"]:not([data-marquee-clone="true"])');
const marqueeScroll = marquee.querySelector('[data-marquee="wrap"]');
if (!marqueeContent || !marqueeScroll) return;

// Get data attributes
const { 
marqueeSpeed: speed, 
marqueeDirection: direction, 
marqueeOnScroll: onScroll 
} = marquee.dataset;

// Convert data attributes to usable types
const marqueeSpeedAttr = parseFloat(speed);
const marqueeDirectionAttr = direction === 'right' ? 1 : -1; // 1 for right, -1 for left

// Adjust speed multiplier based on screen size, including larger screens
let speedMultiplier;
if (window.innerWidth < 479) {
speedMultiplier = 0.25; // Mobile screens
} else if (window.innerWidth < 991) {
speedMultiplier = 0.5;  // Tablet screens
} else if (window.innerWidth > 1920) {
speedMultiplier = 2;    // Very large screens 
} else {
speedMultiplier = 1;    // Standard desktop screens
}

// Calculate required duplicates based on screen size
const contentWidth = marqueeContent.offsetWidth;
const windowWidth = window.innerWidth;
// Calculate raw value first
const rawDuplicateCount = (windowWidth * 2) / contentWidth;
// Round down if the decimal part is less than 0.5
const minRequiredDuplicates = rawDuplicateCount % 1 <= 0.5 ? Math.floor(rawDuplicateCount) : Math.ceil(rawDuplicateCount);

// Use the greater of default (1) or calculated minimum
let duplicateAmount = 1;
duplicateAmount = Math.max(duplicateAmount, minRequiredDuplicates);

// Recalculate marquee speed based on current dimensions
let marqueeSpeed = marqueeSpeedAttr * (contentWidth / windowWidth) * speedMultiplier;

// Remove any existing clones before adding new ones
marqueeScroll.querySelectorAll('[data-marquee-clone="true"]').forEach(clone => {
clone.remove();
});

// Duplicate marquee content
if (duplicateAmount > 0) {
const fragment = document.createDocumentFragment();
for (let i = 0; i < duplicateAmount; i++) {
  const clone = marqueeContent.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('data-marquee-clone', 'true');
  fragment.appendChild(clone);
}
marqueeScroll.appendChild(fragment);
}

// GSAP animation for all marquee items including clones
const marqueeItems = marquee.querySelectorAll('[data-marquee="track"]');

// Reset any existing transforms first
gsap.set(marqueeItems, { clearProps: "all" });
const animation = gsap.to(marqueeItems, {
xPercent: -100, // Move completely out of view
repeat: -1,
duration: marqueeSpeed,
ease: 'linear'
}).totalProgress(0.5);

// Initialize marquee in the correct direction
gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
animation.timeScale(marqueeDirectionAttr); // Set correct direction
animation.play(); // Start animation immediately

// Set initial marquee status
marquee.setAttribute('data-marquee-status', 'normal');

// Check if scroll direction change is enabled (default to false if not specified)
const scrollDirectionChange = onScroll === 'true';

// ScrollTrigger logic for direction inversion (only if enabled)
if (scrollDirectionChange) {
ScrollTrigger.create({
  trigger: marquee,
  start: 'top bottom',
  end: 'bottom top',
  onUpdate: (self) => {
    const isInverted = self.direction === 1; // Scrolling down
    const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;
    // Update animation direction and marquee status
    animation.timeScale(currentDirection);
    marquee.setAttribute('data-marquee-status', isInverted ? 'normal' : 'inverted');
  }
});
}
});
}

// Initialize on page load
initMarqueeScroll();

// Enhanced resize handler that only triggers after resizing is complete
let resizeTimer;
let isResizing = false;
let lastWidth = window.innerWidth;

// Handle resize start
window.addEventListener('resize', () => {
// Mark that we're in a resize operation
isResizing = true;

// Clear any pending timer
clearTimeout(resizeTimer);

// Set a timer to detect when resizing stops
resizeTimer = setTimeout(() => {
// Only reinitialize if the width actually changed
if (window.innerWidth !== lastWidth) {
const oldWidth = lastWidth;
lastWidth = window.innerWidth;

// Get all marquee components
const marqueeComponents = document.querySelectorAll('[data-marquee="component"]');
let needsRebuild = false;

// Check if we need to rebuild (if clone count would change)
marqueeComponents.forEach(marquee => {
const marqueeContent = marquee.querySelector('[data-marquee="track"]:not([data-marquee-clone="true"])');
if (!marqueeContent) return;

const duplicateAttr = 1;

// Calculate required duplicates based on old and new screen size
const contentWidth = marqueeContent.offsetWidth;
// Calculate raw values first
const oldRawCount = (oldWidth * 2) / contentWidth;
const newRawCount = (window.innerWidth * 2) / contentWidth;
// Apply the same rounding logic for consistency
const oldMinRequired = oldRawCount % 1 <= 0.5 ? Math.floor(oldRawCount) : Math.ceil(oldRawCount);
const newMinRequired = newRawCount % 1 <= 0.5 ? Math.floor(newRawCount) : Math.ceil(newRawCount);

// Only rebuild if the required number of clones changes
const oldDuplicateAmount = Math.max(duplicateAttr, oldMinRequired);
const newDuplicateAmount = Math.max(duplicateAttr, newMinRequired);

if (oldDuplicateAmount !== newDuplicateAmount) {
  needsRebuild = true;
}
});

// Only proceed with fade out/rebuild if necessary
if (needsRebuild) {
// Fade out all marquee components first
gsap.to(marqueeComponents, {
  opacity: 0,
  duration: 0.2,
  onComplete: () => {
    // After fade out is complete, rebuild the marquees
    marqueeComponents.forEach(marquee => {
      const marqueeScroll = marquee.querySelector('[data-marquee="wrap"]');
      const originalTrack = marquee.querySelector('[data-marquee="track"]:not([data-marquee-clone="true"])');

      // Keep only the original track and remove all clones
      if (marqueeScroll && originalTrack) {
        // Reset styles and positions
        gsap.set(originalTrack, { clearProps: "all" });

        // Remove all clones
        marqueeScroll.querySelectorAll('[data-marquee-clone="true"]').forEach(clone => {
          clone.remove();
        });
      }
    });

    // Reinitialize marquees
    initMarqueeScroll();

    // After rebuild, fade back in
    gsap.to(marqueeComponents, {
      opacity: 1,
      duration: 0.2
    });
  }
});
}
}

// Mark that we're done resizing
isResizing = false;
}, 500); 
}, { passive: true });
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

function buttonHover(button) {
const buttonText = button.querySelector("[data-button-text=target]");
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
document.querySelectorAll("[data-button-hover='text']").forEach((button) => {
buttonHover(button);
});
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

// FOOTER REVEAL
pageFunctions.addFunction('footerReveal', function() {
// Store all selectors as variables
const footerLine = document.querySelectorAll('[data-footer-line]');
const footerLabel = document.querySelectorAll('[data-footer-label]');
const footerFade = document.querySelectorAll('[data-footer-fade]');
const footerEmail = document.querySelectorAll('[data-footer-email]');
const footerStagger1 = document.querySelectorAll('[data-footer-stagger1]');
const footerStagger2 = document.querySelectorAll('[data-footer-stagger2]');
const footerSvg = document.querySelector('.footer_svg');
const footerSvgPaths = footerSvg ? Array.from(footerSvg.querySelectorAll('path')) : [];

// Create the animation timeline
const tl = gsap.timeline({
scrollTrigger: {
trigger: '.footer_wrap',
start: 'top top',
toggleActions: 'play none none none',
markers: false,
}
});

// 1. Animate SVG paths with random order and 0.2s stagger
if (footerSvgPaths.length > 0) {    
tl.fromTo(footerSvgPaths, {
opacity: 0,
filter: 'blur(5px)'
}, {
opacity: 1,
filter: 'blur(0px)',
duration: 0.8,
stagger: {
each: 0.15,
from: 'random'
},
ease: 'sineInOut'
});
}

// 3. Animate footer-fade elements with staggered timing
tl.fromTo(footerFade, {
opacity: 0
}, {
opacity: 1,
duration: 0.6,
stagger: 0.2,
ease: 'sineInOut'
}, "-=0.2");

// 4. Animate footer-email
tl.fromTo(footerEmail, {
opacity: 0,
filter: 'blur(5px)'
}, {
opacity: 1,
filter: 'blur(0px)',
duration: 0.8,
ease: 'sineInOut'
}, "<");

// 5. Animate footer-stagger1 children (from highest index to lowest)
footerStagger1.forEach(element => {
// Get children and properly sort them in reverse order (highest eq to lowest)
const children = Array.from(element.children);
children.reverse(); // This ensures highest index first

tl.fromTo(children, {
opacity: 0,
filter: 'blur(5px)'
}, {
opacity: 1,
filter: 'blur(0px)',
duration: 0.4,
stagger: {
each: 0.1,
},
ease: 'sineInOut'
});
}, "<");

// 6. Animate footer-stagger2 children (from highest index to lowest)
footerStagger2.forEach(element => {
// Get children and properly sort them in reverse order (highest eq to lowest)
const children = Array.from(element.children);
children.reverse(); // This ensures highest index first

tl.fromTo(children, {
opacity: 0,
filter: 'blur(5px)'
}, {
opacity: 1,
filter: 'blur(0px)',
duration: 0.4,
stagger: {
each: 0.1,
},
ease: 'sineInOut'
});
}, "<");

// 7. Animate footer-line width from 0%
tl.fromTo(footerLine, {
width: '0%'
}, {
width: '100%',
duration: 1.6,
ease: 'cubicInOut'
}, "<0.2");

// 8. Animate footer-label elements with staggered timing
tl.fromTo(footerLabel, {
opacity: 0,
filter: 'blur(5px)'
}, {
opacity: 1,
filter: 'blur(0px)',
duration: 0.8,
stagger: {
each: 0.1,
},
ease: 'sineInOut' 
}, "<");

return tl; // Return the timeline in case you want to use it elsewhere
});

// COLOR THEME SCROLL CHANGE
pageFunctions.addFunction('themeChange', function() {
document.querySelectorAll("[data-animate-theme-to]").forEach(function(element) {
let theme = element.getAttribute("data-animate-theme-to");

ScrollTrigger.create({
trigger: element,
start: "top center",
end: "bottom center",
onToggle: ({ self, isActive }) => {
  if (isActive) gsap.to("body", { ...colorThemes.getTheme(theme), duration: 0.8, ease: "sineInOut" });
}
});
});
});

pageFunctions.addFunction('reality', function() {
  // Save block elements as variables
  const realityVisual = document.querySelector('.reality_visual_inner');
  const realityBlock1 = document.querySelector('.reality_block1_wrap');
  const realityBlock2 = document.querySelector('.reality_block2_wrap');
  const realityBlock3 = document.querySelector('.reality_block3_wrap');
  const realityBlock4 = document.querySelector('.reality_block4_wrap');

  gsap.set([realityBlock1, realityBlock2, realityBlock3, realityBlock4, realityVisual], {
    visibility: 'visible'
  });
  
// Create ScrollTrigger for the reality section
const realityTrigger = {
  trigger: '.reality_height',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
};

// First timeline - Visual Animation
const visualTimeline = gsap.timeline({
  scrollTrigger: realityTrigger
});

// Add animations to the visual timeline
visualTimeline.to(realityVisual, { 
    opacity: 0.2
  }, 0
)
.to(realityVisual, { 
  rotateZ: 360,
  duration: 1,
}, 0.3)
.to(realityVisual, { 
  opacity: 0.4,
  duration: 0.3
}, 0.3)
.to(realityVisual, { 
  opacity: 1,
  duration: 0.2
}, 0.5)
.to(realityVisual, { 
  scale: 1.8,
  opacity: 0.4,
  duration: 0.2,
}, 0.7);

// Second timeline - Block Animation
const blockTimeline = gsap.timeline({
  scrollTrigger: realityTrigger
});

// Animate each block to opacity 1 with slight delay between each
blockTimeline.from(realityBlock1, 
  { opacity: 0, duration: 0.15 },
  0
)
.to(realityBlock1, 
  { opacity: 0, duration: 0.1 },
  0.15
)
.from(realityBlock2, 
  { filter: 'blur(5px)', opacity: 0, duration: 0.15 },
  0.25
)
.to(realityBlock2, 
  { opacity: 0, duration: 0.1 },
  0.4
)
.from(realityBlock3, 
  { opacity: 0, duration: 0.15 },
  0.5
)
.to(realityBlock3, 
  { opacity: 0, duration: 0.1 },
  0.65
)
.from(realityBlock4, 
  { filter: 'blur(5px)', opacity: 0, duration: 0.125 },
  0.75
);
});
