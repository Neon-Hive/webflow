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

const headingSplit = document.querySelectorAll(
"[data-split='heading']"
);
headingSplit.forEach((element) => {
new splitLinesEffect(element);
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

pageFunctions.addFunction('headerReveal', function() {
  // Register ScrollTrigger plugin (if not already registered)
  gsap.registerPlugin(ScrollTrigger);
  
  // Define variables for reuse
  const headerContainer = document.querySelector('.intro_contain');
  const headerTrigger = document.querySelector('.header_wrap');
  const headerLogo = document.querySelector('.intro_logo_wrap');
  const headerLines = document.querySelectorAll('.intro_line');
  const headerHeading = document.querySelector('.intro_heading');
  const headerText = document.querySelector('.intro_text');
  const headerVisual = document.querySelector('.intro_visual_wrap img');
  
  // Store ScrollTrigger instances for later cleanup
  const scrollTriggers = [];
  
  // Animate the main container with scrub
  const containerTrigger = ScrollTrigger.create({
    trigger: headerTrigger,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    animation: gsap.fromTo(headerContainer, 
      { yPercent: -50 },
      { yPercent: 0, ease: 'none' }
    )
  });
  scrollTriggers.push(containerTrigger);
  
  // Set up visual element animation
  if (headerVisual) {
    initializeVisualAnimation();
  }
  
  // Animate the lines
  const linesTrigger = ScrollTrigger.create({
    trigger: headerTrigger,
    start: 'bottom 30%',
    toggleActions: 'play none none reverse',
    markers: false,
    animation: gsap.fromTo(headerLines, 
      { height: '0%', opacity: 0 },
      { 
        height: '100%',
        opacity: 1,
        ease: 'power2.out',
        duration: 1
      }
    )
  });
  scrollTriggers.push(linesTrigger);
  
  // Animate the logo
  const logoTrigger = ScrollTrigger.create({
    trigger: headerTrigger,
    start: 'bottom 10%',
    toggleActions: 'play none none reverse',
    markers: false,
    animation: gsap.fromTo(headerLogo, 
      { opacity: 0 },
      { 
        opacity: 1,
        ease: 'power2.out',
        duration: 0.7
      }
    )
  });
  scrollTriggers.push(logoTrigger);
  
  // Initialize text animations (these will be refreshed on resize)
  let headingSplitInstance = null;
  let textSplitInstance = null;
  
  initializeTextAnimations();
  
  // Handle responsive behavior
  // Set up a single ResizeObserver for both elements
  const resizeObserver = new ResizeObserver(debounce(() => {
    // Only refresh the text animations, not the entire headerReveal function
    refreshTextAnimations();
  }, 300));
  
  // Only observe the parent container to avoid multiple triggers
  if (headerTrigger) resizeObserver.observe(headerTrigger);
  
  // Function to initialize visual animation
  function initializeVisualAnimation() {
    gsap.set(headerVisual, { 
      willChange: 'transform, filter',
      backfaceVisibility: 'hidden',
      webkitBackfaceVisibility: 'hidden',
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      scale: 1.2,
      filter: 'blur(10px)',
      autoAlpha: 1 // Use autoAlpha instead of opacity for better performance
    });
    
    // Create a timeline for the visual element
    const visualTl = gsap.timeline({
      scrollTrigger: {
        trigger: headerTrigger,
        start: 'bottom 90%',
        end: 'bottom 25%',
        toggleActions: 'play none none reverse',
        scrub: true
      }
    });
    
    // Add animations to the timeline
    visualTl
      .to(headerVisual, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
      }, 0)
      .to(headerVisual, {
        filter: 'blur(0px)'
      }, 0)
      .to(headerVisual, {
        scale: 1,
        clearProps: 'willChange'
      }, 0);
      
    scrollTriggers.push(visualTl.scrollTrigger);
  }
  
  // Function to initialize text animations
  function initializeTextAnimations() {
    initializeHeadingAnimation();
    initializeBodyTextAnimation();
  }
  
  // Function to refresh text animations on resize
  function refreshTextAnimations() {
    // Clean up existing text animations
    if (headingSplitInstance) {
      // Remove ScrollTrigger for heading
      const headingTrigger = scrollTriggers.find(st => st.vars && st.vars.trigger === headerHeading);
      if (headingTrigger) {
        headingTrigger.kill();
        scrollTriggers.splice(scrollTriggers.indexOf(headingTrigger), 1);
      }
      
      // Remove line wrapper divs
      const headingWrappers = headerHeading.querySelectorAll('.lines-wrap');
      Array.from(headingWrappers).forEach(wrapper => {
        const parent = wrapper.parentNode;
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, wrapper);
        }
        parent.removeChild(wrapper);
      });
      
      // Revert the split
      headingSplitInstance.revert();
      headingSplitInstance = null;
    }
    
    if (textSplitInstance) {
      // Remove ScrollTrigger for text
      const textTrigger = scrollTriggers.find(st => st.vars && st.vars.trigger === headerText);
      if (textTrigger) {
        textTrigger.kill();
        scrollTriggers.splice(scrollTriggers.indexOf(textTrigger), 1);
      }
      
      // Remove line wrapper divs
      const textWrappers = headerText.querySelectorAll('.lines-wrap');
      Array.from(textWrappers).forEach(wrapper => {
        const parent = wrapper.parentNode;
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, wrapper);
        }
        parent.removeChild(wrapper);
      });
      
      // Revert the split
      textSplitInstance.revert();
      textSplitInstance = null;
    }
    
    // Re-initialize text animations with fresh splits
    initializeTextAnimations();
  }
  
  // Function to initialize heading animation
  function initializeHeadingAnimation() {
    if (!headerHeading) return;
    
    // Split the heading text into lines
    headingSplitInstance = new SplitType(headerHeading, { types: 'lines' });
    
    // Store the instance for later access
    headerHeading._splitType = headingSplitInstance;
    
    // Wrap lines in parent divs for overflow management
    if (headingSplitInstance.lines && headingSplitInstance.lines.length > 0) {
      headingSplitInstance.lines.forEach(line => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('lines-wrap');
        wrapper.style.overflow = 'hidden';
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
      
      // Animate the lines
      const headingAnimation = gsap.fromTo(
        headingSplitInstance.lines,
        { 
          yPercent: 110, 
          opacity: 0, 
          willChange: 'opacity, transform' 
        },
        {
          yPercent: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.8,
          stagger: { amount: 0.2 },
          onComplete: function() {
            gsap.set(headingSplitInstance.lines, { clearProps: 'willChange' });
          }
        }
      );
      
      const headingTrigger = ScrollTrigger.create({
        trigger: headerTrigger,
        start: 'bottom 40%',
        toggleActions: 'play none none reverse',
        markers: false,
        animation: headingAnimation
      });
      
      scrollTriggers.push(headingTrigger);
    }
  }
  
  // Function to initialize body text animation
  function initializeBodyTextAnimation() {
    if (!headerText) return;
    
    // Split the text into lines
    textSplitInstance = new SplitType(headerText, { types: 'lines' });
    
    // Store the instance for later access
    headerText._splitType = textSplitInstance;
    
    // Wrap lines in parent divs for overflow management
    if (textSplitInstance.lines && textSplitInstance.lines.length > 0) {
      textSplitInstance.lines.forEach(line => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('lines-wrap');
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
      
      // Animate the lines
      const textAnimation = gsap.fromTo(
        textSplitInstance.lines,
        { 
          opacity: 0, 
          willChange: 'opacity' 
        },
        {
          opacity: 1,
          ease: 'none',
          duration: 0.8,
          stagger: { amount: 0.2 },
          onComplete: function() {
            gsap.set(textSplitInstance.lines, { clearProps: 'willChange' });
          }
        }
      );
      
      const textTrigger = ScrollTrigger.create({
        trigger: headerTrigger,
        start: 'bottom 50%',
        toggleActions: 'play none none reverse',
        markers: false,
        animation: textAnimation
      });
      
      scrollTriggers.push(textTrigger);
    }
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

pageFunctions.addFunction('detailHoverAnimation', function() {
// Get all the necessary elements
const detailWrap = document.querySelector('.detail_wrap');
if (!detailWrap) return; // Exit if not found

const detailVisuals = detailWrap.querySelectorAll('.detail_main_visual');
const detailItems = detailWrap.querySelectorAll('.detail_main_item_wrap');

// Exit if required elements are not found
if (!detailVisuals.length || !detailItems.length) return;

// Keep track of currently active visual
let activeVisualIndex = 0;

// Variables for debounce control
let isAnimating = false;
let queuedAnimation = null;
const debounceDelay = 100; // Delay in milliseconds
let debounceTimer = null;

// Set initial clip-path states and z-index
detailVisuals.forEach((visual, index) => {
if (index === 0) {
// First visual is fully visible and on top
gsap.set(visual, {
clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
WebkitClipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
zIndex: 10
});
} else {
// All other visuals are clipped (hidden) and below
gsap.set(visual, {
clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
WebkitClipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
zIndex: 1
});
}
});

// Create a master timeline to control the sequence
const masterTimeline = gsap.timeline({
paused: true,
onComplete: function() {
isAnimating = false;
// Check if we need to play a queued animation
if (queuedAnimation !== null) {
const nextIndex = queuedAnimation;
queuedAnimation = null;
animateToVisual(nextIndex);
}
}
});

// Debounce function
function debounce(func, index) {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => {
func(index);
}, debounceDelay);
}

// Function to animate to a specific visual
function animateToVisual(index) {
// Don't animate if it's already the active visual
if (index === activeVisualIndex) return;

// If we're already animating, queue this request
if (isAnimating) {
queuedAnimation = index;
return;
}

// Set animation flag
isAnimating = true;

// Clear the master timeline
masterTimeline.clear();

// Get the previously active visual and the new one
const prevVisual = detailVisuals[activeVisualIndex];
const newVisual = detailVisuals[index];

if (!newVisual) {
isAnimating = false;
return;
}

// Update the active index
activeVisualIndex = index;

// Step 1: Put new visual on top
masterTimeline.set(newVisual, { zIndex: 10 });
masterTimeline.set(prevVisual, { zIndex: 5 }); // Previous visual is above others but below new one

// Step 2: Animate the new visual in (slower animation - 0.8s)
masterTimeline.fromTo(newVisual, 
{
clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
WebkitClipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)'
},
{
clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
WebkitClipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
duration: 0.8,
ease: 'power2.inOut'
}
);

// Step 3: Only after new visual is fully revealed, hide the previous visual
masterTimeline.to(prevVisual, 
{
clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
WebkitClipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
duration: 0.5,
ease: 'power2.inOut',
onComplete: function() {
  // Set all other visuals to lowest z-index
  detailVisuals.forEach((v, i) => {
    if (i !== activeVisualIndex) {
      gsap.set(v, { zIndex: 1 });
    }
  });
}
}, 
"+=0.2" // Small delay before hiding previous visual
);

// Play the timeline
masterTimeline.play(0);
}

// Add hover event listeners to each item
detailItems.forEach((item, index) => {
item.addEventListener('mouseenter', () => {
// Use debounce for hover events to prevent rapid triggering
debounce(animateToVisual, index);
});
});

// Reset to first item when mouse leaves the entire detail wrap
detailWrap.addEventListener('mouseleave', () => {
// Clear any pending debounce
clearTimeout(debounceTimer);

// Only reset if we're not already showing the first visual
if (activeVisualIndex !== 0) {
// If we're mid-animation, queue the reset
if (isAnimating) {
queuedAnimation = 0;
} else {
animateToVisual(0);
}
}
});
});

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
        .fromTo(
          ".transition_wrap",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.8,
            ease: "power2.inOut"
          }
        );
      }
    });
  });
});

pageFunctions.addFunction('sliderAnimation', function() {
// Select all required elements
const sliderItems = document.querySelectorAll('.slider_visual');
const prevButton = document.querySelector('[data-slider-arrow="prev"]');
const nextButton = document.querySelector('[data-slider-arrow="next"]');
const progressFill = document.querySelector('[data-slider-progress="fill"]');
let currentCount = document.querySelector('[data-slider-count="current"]'); // Changed from const to let
const totalCount = document.querySelector('[data-slider-count="total"]');

// Exit if required elements aren't found
if (!sliderItems.length || !prevButton || !nextButton || !progressFill || !currentCount || !totalCount) {
console.warn('Slider elements not found');
return;
}

// Initialize slider state
let currentIndex = 0;
const totalItems = sliderItems.length;

// Set initial state
function initSlider() {
// Update total count without leading zeros
totalCount.textContent = String(totalItems);

// Set initial current count without leading zeros
currentCount.textContent = String(currentIndex + 1);

// Set initial progress
updateProgress();

// Set initial visibility with clip-path
sliderItems.forEach((item, index) => {
if (index === currentIndex) {
gsap.set(item, { 
  autoAlpha: 1, 
  zIndex: 2,
  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' // Fully visible
});
} else {
gsap.set(item, { 
  autoAlpha: 1, // Set to visible but clipped
  zIndex: 1,
  clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' // Hidden by clip-path
});
}
});

// Add event listeners
prevButton.addEventListener('click', goToPrev);
nextButton.addEventListener('click', goToNext);
}

// Animate the current count with a vertical slide effect
function animateCurrentCount(newIndex) {
// Check if currentCount exists
if (!currentCount) {
console.warn('Current count element not found');
return;
}

// Get the existing wrapper (assumed to have overflow:hidden and position:relative)
const wrapper = currentCount.parentElement;
if (!wrapper) {
console.warn('Current count parent element not found');
return;
}

// Store current properties before creating new element
const currentClasses = currentCount.className;
const currentStyles = {
position: window.getComputedStyle(currentCount).position,
display: window.getComputedStyle(currentCount).display
};

// Set current count to absolute positioning if it's not already
if (currentStyles.position !== 'absolute') {
gsap.set(currentCount, { 
position: 'absolute',
width: '100%',
top: 0,
left: 0
});
}

// Create a new number element with the same classes as the original
const newNumber = document.createElement('span');
newNumber.className = currentClasses;
newNumber.textContent = String(newIndex + 1);

// Set initial styles for the new number
gsap.set(newNumber, {
position: 'absolute',
top: 0,
left: 0,
width: '100%',
yPercent: 100 // Start below the visible area
});

// Add the new number to the wrapper
wrapper.appendChild(newNumber);

// Create a timeline for the animation that matches the main slider duration
const tl = gsap.timeline({
onComplete: () => {
// Remove the old number
if (currentCount && currentCount.parentNode) {
  currentCount.remove();
}

// If the original wasn't absolutely positioned, reset the new one
if (currentStyles.position !== 'absolute') {
  gsap.set(newNumber, { 
    position: currentStyles.position,
    display: currentStyles.display,
    clearProps: 'yPercent,top,left'
  });
}

// Update the currentCount reference
currentCount = newNumber;
}
});

// Animate the current number up
tl.to(currentCount, {
yPercent: -100, // Move up out of view
duration: 0.8,
ease: 'power2.inOut'
}, 0);

// Animate the new number in
tl.to(newNumber, {
yPercent: 0, // Move to normal position
duration: 0.8,
ease: 'power2.inOut'
}, 0);
}

// Update progress bar (but only used for initial setup now)
function updateProgress() {
const progressPercentage = ((currentIndex + 1) / totalItems) * 100;

// Just set the initial width without animation
gsap.set(progressFill, {
width: `${progressPercentage}%`
});
}

// Animation for transitioning slides
function animateSlideChange(nextIndex) {
// Check if slides exist
if (!sliderItems[currentIndex] || !sliderItems[nextIndex]) {
console.warn('Slider items not found');
return;
}

// Get current and next slides
const currentSlide = sliderItems[currentIndex];
const nextSlide = sliderItems[nextIndex];

// Direction of animation (1 for forward, -1 for backward)
const direction = nextIndex > currentIndex ? 1 : -1;

// Make sure the next slide is ready and set higher z-index
gsap.set(nextSlide, { 
autoAlpha: 1, 
zIndex: 3,
clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' // Initial clip path (hidden)
});

// Set current slide z-index lower
gsap.set(currentSlide, { 
zIndex: 2,
clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' // Fully visible
});

// Calculate the new progress percentage for synchronization
const progressPercentage = ((nextIndex + 1) / totalItems) * 100;

// Create a master timeline for synchronized animations
const masterTl = gsap.timeline({
onComplete: () => {
// Update current index after animation
currentIndex = nextIndex;

// Reset z-index after animation
gsap.set(nextSlide, { zIndex: 2 });
gsap.set(currentSlide, { zIndex: 1 });
}
});

// Add clip-path animation to the master timeline
masterTl.to(nextSlide, {
clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)', // Animate to fully visible
duration: 0.8,
ease: 'power2.inOut'
}, 0);

// Add progress bar animation to the master timeline - synchronized with clip-path
masterTl.to(progressFill, {
width: `${progressPercentage}%`,
duration: 0.8,
ease: 'power2.inOut'
}, 0); // Start at the same time

// Animate the current count with the same timing
masterTl.add(animateCurrentCount(nextIndex), 0);

// Make sure all other slides are hidden
sliderItems.forEach((item, index) => {
if (index !== currentIndex && index !== nextIndex) {
gsap.set(item, { autoAlpha: 0, zIndex: 1 });
}
});
}

// Go to previous slide
function goToPrev() {
// Prevent clicking during animation
if (gsap.isTweening(sliderItems[currentIndex])) return;

let prevIndex = currentIndex - 1;
if (prevIndex < 0) {
prevIndex = totalItems - 1; // Loop to the end
}

// Animate to previous slide
animateSlideChange(prevIndex);
}

// Go to next slide
function goToNext() {
// Prevent clicking during animation
if (gsap.isTweening(sliderItems[currentIndex])) return;

let nextIndex = currentIndex + 1;
if (nextIndex >= totalItems) {
nextIndex = 0; // Loop to the beginning
}

// Animate to next slide
animateSlideChange(nextIndex);
}

// Initialize the slider
initSlider();

// Public API for controlling the slider externally
return {
goToNext,
goToPrev,
goToSlide: (index) => {
if (index >= 0 && index < totalItems && index !== currentIndex) {
animateSlideChange(index);
}
},
getCurrentIndex: () => currentIndex,
getTotalItems: () => totalItems
};
});

pageFunctions.addFunction('parallexSection', function() {
  // Select all parallax sticky sections
  const parallaxSections = document.querySelectorAll('.parallex_height');
  
  // Loop through each parallax section
  parallaxSections.forEach(section => {
  // Get the columns within this section
  const column1 = section.querySelector('[data-parallex=c1]');
  const column2 = section.querySelector('[data-parallex=c2]');
  const column3 = section.querySelector('[data-parallex=c3]');
  const visuals = section.querySelectorAll('[data-parallex=visual]')
  const visualInner = section.querySelector('.parallex_visual_inner');
  const finalVisual = section.querySelector('.parallex_final_visual');
  const startTrigger = section.querySelector('.parallex_component');
  
  // Get heading and overlay elements
  const heading = section.querySelector('.parallex_visual_heading');
  const overlay = section.querySelector('.parallex_visual_overlay');
  
  // Get all lines within the heading - more robust selector
  const headingLines = heading ? heading.querySelectorAll('.line, .line-text, [data-split]') : [];
  
  // Set initial state for overlay
  if (overlay) gsap.set(overlay, { opacity: 0 });
  
  // Set initial state for heading lines
  if (headingLines.length > 0) {
    gsap.set(headingLines, { 
      yPercent: 100, 
      opacity: 0,
      display: 'block' // Ensure they're visible for animation
    });
  } else if (heading) {
    // Fallback if no lines
    gsap.set(heading, { opacity: 0 });
  }
      
  // Create animation timeline for columns and visualInner
  const columnsTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "top -=400",
      scrub: true,
    }
  });
  
  // Add animations to timeline
  columnsTl.fromTo(column1, {yPercent: -50}, { yPercent: 0, ease: "none" }, 0)
            .fromTo(column2, {yPercent: -70}, { yPercent: 0, ease: "none" }, 0)
            .fromTo(column3, {yPercent: -45}, { yPercent: 0, ease: "none" }, 0);
  
  // Add visualInner animation if it exists
  if (visualInner) {
    // Create a separate timeline just for visualInner that will be controlled by the same ScrollTrigger
    const visualTl = gsap.timeline({
      scrollTrigger: {
        trigger: startTrigger,
        start: "top -=300",
        end: "bottom -=100",
        scrub: true,
      }
    });
    
    visualTl.to(visualInner, 
      {
        width: "100vw",
        height: "100vh",
        ease: "none"
      }, "0.2"
    )
    visualTl.to(visuals, 
      {
        opacity: 0,
        scale: 0,
        ease: "none"
      }, 0
    );
    
    // Create a more reliable final animation
    const finalAnimIn = gsap.timeline({ 
      paused: true,
      onComplete: function() {
        animationState = "visible";
      }
    });
    
    const finalAnimOut = gsap.timeline({ 
      paused: true,
      onComplete: function() {
        animationState = "hidden";
      }
    });
    
    // Build the animations with consistent timing and easing for both directions
    // Overlay animation
    if (overlay) {
      // Same duration and easing for both in and out
      finalAnimIn.to(overlay, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
      }, 0);
      
      finalAnimOut.to(overlay, {
        opacity: 0,
        duration: 1.2, // Match the in animation
        ease: "power2.out" // Match the in animation
      }, 0);
    }
    
    // Heading lines animation
    if (headingLines.length > 0) {
      // Animate each line for "in" animation
      finalAnimIn.to(headingLines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }, 0.2);
      
      // Animate each line for "out" animation - same timing and easing
      finalAnimOut.to(headingLines, {
        yPercent: 100,
        opacity: 0,
        duration: 0.8, // Match the in animation
        stagger: 0.1, // Match the in animation
        ease: "power2.out" // Match the in animation
      }, 0.2); // Match the in animation
    } else if (heading) {
      // Fallback for entire heading
      finalAnimIn.to(heading, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, 0.2);
      
      finalAnimOut.to(heading, {
        opacity: 0,
        duration: 0.8, // Match the in animation
        ease: "power2.out" // Match the in animation
      }, 0.2); // Match the in animation
    }
    
    // Animation state tracking
    let animationState = "hidden"; // hidden, animatingIn, visible, animatingOut
    let isScrollingDown = true;
    
    // Create a separate ScrollTrigger for the final animation
    ScrollTrigger.create({
      trigger: startTrigger,
      start: "bottom -=100",
      end: "bottom +=200",
      onEnter: function() {
        isScrollingDown = true;
        
        if (animationState === "hidden" || animationState === "animatingOut") {
          // Kill any active animation to prevent conflicts
          finalAnimOut.kill();
          
          // Set state before animation starts
          animationState = "animatingIn";
          
          // Clear any existing progress and play from start
          finalAnimIn.progress(0).play();
        }
      },
      onLeaveBack: function() {
        isScrollingDown = false;
        
        if (animationState === "visible" || animationState === "animatingIn") {
          // Kill any active animation to prevent conflicts
          finalAnimIn.kill();
          
          // Set state before animation starts
          animationState = "animatingOut";
          
          // Clear any existing progress and play from start
          finalAnimOut.progress(0).play();
        }
      }
    });
  }
  });
  },
  "globalEase",
  "font-loaded");

pageFunctions.addFunction('horizontalScroll', function() {
    $(".horizontal_wrap").each(function (index) {
      let wrap = $(this);
      let inner = $(this).find(".horizontal_inner");
      let track = $(this).find(".horizontal_track");
  
      // set section height
      function setScrollDistance() {
        wrap.css("height", "calc(" + track.outerWidth() + "px + 100vh)");
      }
      setScrollDistance();
      ScrollTrigger.refresh();
      
      // Debounce function to limit the rate at which a function can fire
      function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
      
      // Debounced resize handler for section height
      const debouncedSetScrollDistance = debounce(function() {
        setScrollDistance();
        ScrollTrigger.refresh();
      }, 200);
      
      window.addEventListener("resize", debouncedSetScrollDistance);
  
      // create main horizontal scroll timeline
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
        defaults: { ease: "none" },
      });
      tl.to(track, { xPercent: -100 });
  
      // get container left position
      function containerLeft() {
        return inner.offset().left + "px";
      }
      // get container right position
      function containerRight() {
        return (inner.offset().left + inner.innerWidth()) + "px";
      }
  
      // Split text for animations using SplitType library
      // Create a wrapper function to wrap lines
      function wrapLines(element) {
        // First split the text
        let splitText = new SplitType(element, {
          types: "lines",
          lineClass: "line"
        });
        
        // Then wrap each line with div.lines-wrap
        $(element).find('.line').each(function() {
          $(this).wrap('<div class="lines-wrap"></div>');
        });
        
        return splitText;
      }
      
      // Apply to heading and paragraph text
      let headingSplit = wrapLines($(this).find(".horizontal_item1_content_heading")[0]);
      let textSplit = wrapLines($(this).find(".horizontal_item1_content_text")[0]);
      
      // Function to handle text resplitting
      function resplitText() {
        // Store references to elements
        const headingElement = $(wrap).find(".horizontal_item1_content_heading")[0];
        const textElement = $(wrap).find(".horizontal_item1_content_text")[0];
        
        // Only proceed if elements exist
        if (headingElement && textElement) {
          // Remove wrapper divs before resplitting
          $(wrap).find('.lines-wrap > .line').unwrap();
          
          // Revert and resplit
          headingSplit.revert();
          textSplit.revert();
          
          headingSplit = new SplitType(headingElement, {
            types: "lines",
            lineClass: "line"
          });
          
          textSplit = new SplitType(textElement, {
            types: "lines",
            lineClass: "line"
          });
          
          // Re-wrap the lines
          $(wrap).find('.line').each(function() {
            $(this).wrap('<div class="lines-wrap"></div>');
          });
        }
      }
      
      // Debounced resize handler for text splitting
      const debouncedResplitText = debounce(resplitText, 250);
      
      // Make sure lines are responsive with debounced resize handler
      window.addEventListener("resize", debouncedResplitText);
  
      // Item 1 visual animations timeline
      let tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: $(this).find(".horizontal_item1_visual_wrap"),
          containerAnimation: tl,
          start: "left right-=200",
          toggleActions: "play none none reverse",
          // markers: true,
        },
      });
      
      // Visual clip path animation
      tl2.fromTo($(this).find(".horizontal_item1_visual_wrap"), 
        { 
          clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" 
        }, 
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.2,
          ease: "power3.out"
        }
      );
      
      // Image scale and blur animation
      tl2.fromTo($(this).find(".horizontal_item1_visual_wrap img"), 
        {
          scale: 1.1,
          filter: "blur(5px)"
        }, 
        {
          scale: 1,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power2.out"
        }, 
        0  // Start at the same time as the clip path
      );
      
      // Create separate timeline for content animations with its own ScrollTrigger
      let contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: $(this).find(".horizontal_item1_content_wrap"),
          containerAnimation: tl,
          start: "left right-=150",
          toggleActions: "play none none reverse",
          // markers: true,
        },
      });
      
      // Heading animation - each line
      contentTl.fromTo($(this).find(".horizontal_item1_content_heading .lines-wrap .line"), 
        {
          yPercent: 100,
          opacity: 0
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        },
        0  // Start at the beginning of this timeline
      );
      
      // Text paragraph animation - fade in lines
      contentTl.fromTo($(this).find(".horizontal_item1_content_text .lines-wrap .line"),
        {
          opacity: 0
        },
        {
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power1.out"
        },
        0.3  // Start after heading animation begins
      );
      
      // Button animation
      contentTl.fromTo($(this).find(".horizontal_item1_content_wrap .btn_main_wrap"),
        {
          opacity: 0
        },
        {
          opacity: 1,
          duration: 0.6,
          ease: "power1.out"
        },
        0.5  // Start after text animation begins
      );
  
      // Item 2 SVG animation
      let tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: $(this).find(".horizontal_item2_svg"),
          containerAnimation: tl,
          start: "left right-=200", 
          toggleActions: "play none none reverse",
          // markers: true,
        },
        defaults: { ease: "none" },
      });
      tl3.fromTo($(this).find(".horizontal_item2_svg"), { opacity: 0 }, { opacity: 1 });
  
      // Item 2 Visual 3 animation
      let tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: $(this).find(".horizontal_item2_visual3"),
          containerAnimation: tl,
          start: "left right-=200", 
          toggleActions: "play none none reverse",
          // markers: true,
        },
        defaults: { ease: "none" },
      });
  
      // Clip path animation for visual 3
      tl4.fromTo($(this).find(".horizontal_item2_visual3"), 
        { 
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" 
        }, 
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.2,
          ease: "power3.out"
        }
      );
      
      // Image scale and blur animation for visual 3
      tl4.fromTo($(this).find(".horizontal_item2_visual3 img"), 
        {
          scale: 1.1,
          filter: "blur(5px)"
        }, 
        {
          scale: 1,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power2.out"
        }, 
        0  // Start at the same time as the clip path
      );  
    });
});

pageFunctions.addFunction('detailSlider', function() {
  // Select all required elements
  const tabletBodyTexts = document.querySelectorAll('.detail_tablet_body_text');
  const tabletVisuals = document.querySelectorAll('.detail_tablet_visual');
  const tabletBgVisuals = document.querySelectorAll('.detail_tablet_bg_visual');
  const pagination = document.querySelector('.detail_tablet_nav_pagination');
  const prevArrow = document.querySelector('[data-detail-arrow=prev]');
  const nextArrow = document.querySelector('[data-detail-arrow=next]');
  
  // Variables to track current state
  let currentIndex = 0;
  const totalSlides = tabletVisuals.length;
  
  // Create and update pagination buttons
  function createPaginationButtons() {
    if (!pagination) return;
    
    // Clear existing content
    pagination.innerHTML = '';
    
    // Create a button for each slide
    for (let i = 0; i < totalSlides; i++) {
      const button = document.createElement('div');
      button.classList.add('detail_nav_pagination_button');
      
      if (i === currentIndex) {
        button.classList.add('is-active');
      }
      
      button.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(button);
    }
  }
  
  // Update pagination buttons (mark active)
  function updatePaginationButtons() {
    if (!pagination) return;
    
    // Update active class on pagination buttons
    const buttons = pagination.querySelectorAll('.detail_nav_pagination_button');
    buttons.forEach((button, index) => {
      if (index === currentIndex) {
        button.classList.add('is-active');
      } else {
        button.classList.remove('is-active');
      }
    });
  }
  
  // Update navigation arrow states based on current position
  function updateNavigationState() {
    // Update pagination buttons
    updatePaginationButtons();
    
    // Since we're implementing loop behavior, we don't need disabled states
    if (prevArrow) {
      prevArrow.classList.remove('button-disabled');
    }
    
    if (nextArrow) {
      nextArrow.classList.remove('button-disabled');
    }
  }
  
  // Set initial states
  function initSlider() {
    // Hide all text and visuals except the first ones
    tabletBodyTexts.forEach((text, index) => {
      gsap.set(text, { 
        opacity: index === 0 ? 1 : 0,
        visibility: index === 0 ? 'visible' : 'hidden'
      });
    });
    
    // Set initial states for main visuals
    tabletVisuals.forEach((visual, index) => {
      gsap.set(visual, {
        zIndex: index === 0 ? 2 : 1,
        visibility: index === 0 ? 'visible' : 'hidden',
        clipPath: index === 0 ? 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' : 'polygon(0 0, 0 0, 0 100%, 0% 100%)'
      });
    });
    
    // Set initial states for background visuals
    if (tabletBgVisuals.length > 0) {
      tabletBgVisuals.forEach((bgVisual, index) => {
        gsap.set(bgVisual, {
          zIndex: index === 0 ? 2 : 1,
          visibility: index === 0 ? 'visible' : 'hidden',
          clipPath: index === 0 ? 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' : 'polygon(0 0, 0 0, 0 100%, 0% 100%)'
        });
      });
    }
    
    // Create pagination buttons
    createPaginationButtons();
    
    // Set initial navigation state
    updateNavigationState();
  }
  
  // Navigate to a specific slide
  function goToSlide(targetIndex) {
    if (targetIndex === currentIndex) {
      return;
    }
    
    // Handle out of bounds (loop around)
    if (targetIndex < 0) {
      targetIndex = totalSlides - 1; // Go to last slide
    } else if (targetIndex >= totalSlides) {
      targetIndex = 0; // Go to first slide
    }
    
    if (targetIndex > currentIndex || (targetIndex === 0 && currentIndex === totalSlides - 1)) {
      // Going forward or looping from last to first
      animateToNextSlide(targetIndex);
    } else {
      // Going backward or looping from first to last
      animateToPrevSlide(targetIndex);
    }
  }
  
  // Animate to next slide (can be multiple steps)
  function animateToNextSlide(targetIndex = currentIndex + 1) {
    // Handle looping
    if (targetIndex >= totalSlides) targetIndex = 0;
    
    const currentVisual = tabletVisuals[currentIndex];
    const nextVisual = tabletVisuals[targetIndex];
    const currentText = tabletBodyTexts[currentIndex];
    const nextText = tabletBodyTexts[targetIndex];
    
    // Get background visuals if they exist
    const currentBgVisual = tabletBgVisuals.length > 0 ? tabletBgVisuals[currentIndex] : null;
    const nextBgVisual = tabletBgVisuals.length > 0 ? tabletBgVisuals[targetIndex] : null;
    
    // Prepare next visual for animation
    gsap.set(nextVisual, {
      visibility: 'visible',
      zIndex: 3, // Place above current
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)'
    });
    
    // Prepare next background visual if it exists
    if (nextBgVisual) {
      gsap.set(nextBgVisual, {
        visibility: 'visible',
        zIndex: 3, // Place above current
        clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)'
      });
    }
    
    // Animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Update current index after animation completes
        currentIndex = targetIndex;
        updateNavigationState();
        
        // Reset z-index after animation
        gsap.set(currentVisual, { zIndex: 1 });
        gsap.set(nextVisual, { zIndex: 2 });
        
        // Reset z-index for background visuals
        if (currentBgVisual && nextBgVisual) {
          gsap.set(currentBgVisual, { zIndex: 1 });
          gsap.set(nextBgVisual, { zIndex: 2 });
        }
      }
    });
    
    // Animate out current text
    tl.to(currentText, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        gsap.set(currentText, { visibility: 'hidden' });
      }
    });
    
    // Animate in next visual with clip-path
    tl.to(nextVisual, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
      duration: 0.8,
      ease: 'power2.inOut'
    }, '-=0.3');
    
    // Animate in next background visual if it exists
    if (nextBgVisual) {
      tl.to(nextBgVisual, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
        duration: 0.8,
        ease: 'power2.inOut'
      }, '-=0.8'); // Run at the same time as the main visual
    }
    
    // Animate in next text
    tl.fromTo(nextText, 
      { opacity: 0, visibility: 'visible' },
      { opacity: 1, duration: 0.5 },
      '-=0.3'
    );
  }
  
  // Animate to previous slide (can be multiple steps)
  function animateToPrevSlide(targetIndex = currentIndex - 1) {
    // Handle looping
    if (targetIndex < 0) targetIndex = totalSlides - 1;
    
    const currentVisual = tabletVisuals[currentIndex];
    const prevVisual = tabletVisuals[targetIndex];
    const currentText = tabletBodyTexts[currentIndex];
    const prevText = tabletBodyTexts[targetIndex];
    
    // Get background visuals if they exist
    const currentBgVisual = tabletBgVisuals.length > 0 ? tabletBgVisuals[currentIndex] : null;
    const prevBgVisual = tabletBgVisuals.length > 0 ? tabletBgVisuals[targetIndex] : null;
    
    // Prepare previous visual
    gsap.set(prevVisual, {
      visibility: 'visible',
      zIndex: 3, // Place above current
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' // Same starting point as next animation
    });
    
    // Prepare previous background visual if it exists
    if (prevBgVisual) {
      gsap.set(prevBgVisual, {
        visibility: 'visible',
        zIndex: 3, // Place above current
        clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' // Same starting point as next animation
      });
    }
    
    // Animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Update current index after animation completes
        currentIndex = targetIndex;
        updateNavigationState();
        
        // Reset z-index after animation
        gsap.set(currentVisual, { zIndex: 1 });
        gsap.set(prevVisual, { zIndex: 2 });
        
        // Reset z-index for background visuals
        if (currentBgVisual && prevBgVisual) {
          gsap.set(currentBgVisual, { zIndex: 1 });
          gsap.set(prevBgVisual, { zIndex: 2 });
        }
      }
    });
    
    // Animate out current text
    tl.to(currentText, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        gsap.set(currentText, { visibility: 'hidden' });
      }
    });
    
    // Animate in previous visual with clip-path
    tl.to(prevVisual, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
      duration: 0.8,
      ease: 'power2.inOut'
    }, '-=0.3');
    
    // Animate in previous background visual if it exists
    if (prevBgVisual) {
      tl.to(prevBgVisual, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
        duration: 0.8,
        ease: 'power2.inOut'
      }, '-=0.8'); // Run at the same time as the main visual
    }
    
    // Animate in previous text
    tl.fromTo(prevText, 
      { opacity: 0, visibility: 'visible' },
      { opacity: 1, duration: 0.5 },
      '-=0.3'
    );
  }
  
  // Shorthand functions
  function goToNext() {
    animateToNextSlide();
  }
  
  function goToPrev() {
    animateToPrevSlide();
  }
  
  // Add event listeners
  function setupEventListeners() {
    if (nextArrow) {
      nextArrow.addEventListener('click', goToNext);
    }
    
    if (prevArrow) {
      prevArrow.addEventListener('click', goToPrev);
    }
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    });
  }
  
  // Check if required elements exist
  if (tabletBodyTexts.length > 0 && tabletVisuals.length > 0) {
    // Initialize the slider
    initSlider();
    setupEventListeners();
    
    // Return public methods for external access if needed
    return {
      next: goToNext,
      prev: goToPrev,
      goToSlide: goToSlide
    };
  } else {
    return null;
  }
});
