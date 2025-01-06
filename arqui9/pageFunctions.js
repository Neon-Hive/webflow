// Custom Ease
gsap.registerPlugin(CustomEase);
pageFunctions.addFunction("globalEase", function () {
// Create custom easing functions
CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
CustomEase.create("inQuad", "0.55, 0.085, 0.68, 0.53");
CustomEase.create("inOutExpo", "1, 0, 0, 1");
});

// Lennis smooth scroll
pageFunctions.addFunction('globalLennis', function() {

const lenis = new Lenis({
direction: 'vertical',
gestureDirection: 'vertical',
smooth: true,
lerp: 0.1,
wheelMultiplier: 0.7,
mouseMultiplier: 0.7,
smoothTouch: false,
touchMultiplier: 1.5,
infinite: false,
})

function raf(time) {
lenis.raf(time)
requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

document.querySelectorAll("[data-lenis-start=true]").forEach(function(element) {
element.addEventListener("click", function() {
lenis.start();
});
});

document.querySelectorAll("[data-lenis-stop=true]").forEach(function(element) {
element.addEventListener("click", function() {
lenis.stop();
});
});

document.querySelectorAll("[data-lenis-hover]").forEach(function(parentElement) {
parentElement.addEventListener("mouseenter", function() {
lenis.stop();
});

parentElement.addEventListener("mouseleave", function(event) {
if (!parentElement.contains(event.relatedTarget) || !parentElement.querySelector('.w-dropdown-list').contains(event.relatedTarget)) {
lenis.start();
}
});
});

document.querySelectorAll("[data-lenis-toggle]").forEach(function(element) {
element.addEventListener("click", function() {
element.classList.toggle("stop-scroll");
if (element.classList.contains("stop-scroll")) {
lenis.stop();
} else {
lenis.start();
}
});
});

});

// PageTransition
pageFunctions.addFunction("pageTransition", function () {

  // Define reusable variables for elements
  const headerText = document.querySelectorAll("[data-animation='header-text']");
  const navComponent = document.querySelector("[data-animation='nav-component']");
  const headerChar = document.querySelectorAll("[data-animation='header-word']");
  const headerFade = document.querySelectorAll("[data-animation='header-fade']");
  const headerMove = document.querySelectorAll("[data-animation='header-move']");
  const headerBg = document.querySelectorAll("[data-animation='header-bg']");
  const headerBgScale = document.querySelectorAll("[data-animation='header-bg-scale']");
  const headerNext = document.querySelector("[data-animation='header-next']");
  
    // General page load transition with global or page-specific animation
    let tlPageReveal = gsap.timeline({
      onComplete: () => {
        // Set display to none after the timeline completes
        gsap.set(".transition_wrap", { display: "none" });
      },
    });
  
    // Fix clipPath animation
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
          ease: "inOutCubic", // Updated ease for smoother animation
        }
      )
      .to(
        ".transition_wrap",
        {
          color: "white",
          duration: 0.3,
          ease: "power1.in",
        },
        "-=0.3"
      )
      .add(() => {
        runAnimation(); // Ensure this function exists and runs as expected
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
    }
  }
  }
  
  // Global animation
  function runGlobalAnimation() {
  let tl = gsap.timeline();
  
  // Ensure visibility for headerText
  if (headerText.length > 0) {
    headerText.forEach(header => {
      gsap.set(header, { visibility: "visible" });
      tl.from(header.querySelectorAll(".line"), {
        y: "1rem",
        willChange: "transform, opacity",
        opacity: 0,
        ease: "inOutCubic",
        duration: 1.2,
        stagger: { each: 0.2 },
      });
    });
  }
  
  // Ensure visibility for navComponent
  if (navComponent) {
    gsap.set(navComponent, { visibility: "visible" });
    tl.fromTo(
      navComponent,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power1.out" },
      "<"
    );
  }
  
  // Ensure visibility for headerFade
  if (headerFade.length > 0) {
    gsap.set(headerFade, { visibility: "visible" });
    tl.fromTo(
      headerFade,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, stagger: 0.2, ease: "power1.out" },
      "-=0.2"
    );
  }
  
  // Ensure visibility for headerNext
  if (headerNext) {
    gsap.set(headerNext, { visibility: "visible" });
    tl.fromTo(
      headerNext,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power1.out" },
      "-=0.2"
    );
  }
  }
  
  // Page-specific animation for Home page
  function runHomePageAnimation() {
    let tl = gsap.timeline();
  
    // Ensure headerBgScale animations
    if (headerBgScale && headerBgScale.length > 0) {
      gsap.set(headerBgScale, { visibility: "visible" });
      headerBgScale.forEach(header => {
        tl.from(header, {
          scale: 0,
          skewY: -6,
          willChange: "transform",
          ease: "inOutCubic",
          duration: 1.6,
        });
      });
    }
  
    // Ensure headerMove animations
    if (headerMove && headerMove.length > 0) {
      gsap.set(headerMove, { visibility: "visible" });
      tl.fromTo(
        headerMove,
        { opacity: 0, yPercent: 100 },
        { opacity: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.2 }, ease: "power1.out" },
        0
      );
    }
  
    // Ensure headerFade animations
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power1.out" },
        "-=0.2"
      );
    }
  
    // Ensure navComponent animations
    if (navComponent) {
      gsap.set(navComponent, { visibility: "visible" });
      tl.fromTo(
        navComponent,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power1.out" },
        "<"
      );
    }
  }
  
  // Page-specific animation for About page
  function runServicesPageAnimation() {
    let tl = gsap.timeline();
  
    // Ensure visibility for headerText
    if (headerChar && headerChar.length > 0) {
      // Set visibility for all headerChar elements
      gsap.set(headerChar, { visibility: "visible" });
      
      // Set visibility for all .char items inside each headerChar
      headerChar.forEach(header => {
        gsap.set(header.querySelectorAll(".char"), { visibility: "visible" });
      });
  
      // Outer stagger for headerChar elements
      tl.to(
        headerChar,
        {
          onStart: function () {
            // For each headerChar, animate its .char items
            headerChar.forEach(header => {
              gsap.from(header.querySelectorAll(".char"), {
                yPercent: 100,
                willChange: "transform, opacity",
                opacity: 0,
                ease: "inOutCubic",
                duration: 0.8,
                stagger: { amount: 0.1 }, // Inner stagger for each .char
              });
            });
          },
          stagger: 0.3, // Delay between animations of each headerChar element
        }
      );
    }
  
    // Ensure headerBg animations
    if (headerBg) {
      gsap.set(headerBg, { visibility: "visible" });
      tl.fromTo(
        headerBg,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power1.in" },
        0
      );
    }
  
    // Ensure headerFade animations
    if (headerFade) {
      gsap.set(headerFade, { visibility: "visible" });
      tl.fromTo(
        headerFade,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power1.out" },
        "<"
      );
    }
  }
  
  // Triggering transition on link clicks
  $("a:not(.excluded-class)").on("click", function (e) {
    let currentUrl = $(this).attr("href");
  
    // Check conditions for internal navigation and prevent default behavior
    if (
      $(this).prop("hostname") === window.location.host && // Same host
      !currentUrl.includes("#") && // Not a hash link
      $(this).attr("target") !== "_blank" // Not opening in a new tab
    ) {
      e.preventDefault();
  
      // Create the timeline for the transition animation
      let tl = gsap.timeline({
        onComplete: () => {
          // Redirect to the target URL after animation completes
          window.location.href = currentUrl;
        },
      });
  
      tl.set(".transition_wrap", {
        display: "flex", // Make sure the element is visible
        willChange: "clip-path", // Optimize rendering for clip-path
      })
      .to(
        ".transition_wrap",
        {
          color: "dark", 
          duration: 0.3, // Adjusted for smoother animation
          ease: "power1.in", // Smoother easing
        },
      )
        .fromTo(
          ".transition_wrap",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", // Initial state (hidden)
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Final state (full-screen cover)
            duration: 0.8, // Adjusted for smoother animation
            ease: "inOutCubic", // Smoother easing
          }, "-=0.2"
        );
    }
  });
  
  // Handle back button with a page refresh to ensure correct state
  window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
  };
  });

// Split Animation
gsap.registerPlugin(ScrollTrigger);
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

class ScrambleTextEffect {
constructor(element, options = {}) {
if (!element || !(element instanceof HTMLElement)) {
throw new Error("Invalid element provided.");
}

this.element = element;
this.originalText = element.textContent;
this.options = Object.assign(
{
chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // Scramble characters
duration: 2000, // Total duration for the entire text
interval: 50, // Time between updates for each character
stagger: 200, // Delay between scrambling each character
},
options
);

this.setupScrollTrigger(); // Setup ScrollTrigger for this effect
}

scramble() {
const { chars, duration, interval, stagger } = this.options;
const originalText = this.originalText.split("");
const scrambledText = Array.from(originalText, () => ""); // Start with empty scrambled text
let currentIndex = 0; // Track which character is being scrambled

const revealCharacter = (index) => {
const start = Date.now();

const animateCharacter = () => {
const elapsedForChar = Date.now() - start;

// Check if the character should resolve to its original value
if (elapsedForChar >= duration / originalText.length) {
scrambledText[index] = originalText[index]; // Reveal original character
this.element.textContent = scrambledText.join("");
return;
}

// Continue scrambling this character
scrambledText[index] =
chars[Math.floor(Math.random() * chars.length)];
this.element.textContent = scrambledText.join("");

setTimeout(animateCharacter, interval);
};

animateCharacter();
};

const scrambleNextCharacter = () => {
if (currentIndex >= originalText.length) return; // Stop when all characters are done

revealCharacter(currentIndex); // Start scrambling the current character
currentIndex++; // Move to the next character

setTimeout(scrambleNextCharacter, stagger); // Wait before moving to the next character
};

scrambleNextCharacter();
}

setupScrollTrigger() {
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
trigger: this.element,
start: "top 95%", // Trigger the animation when the element enters 95% of the viewport
onEnter: () => this.scramble(), // Start scrambling effect on enter
});
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
      lines,
      { yPercent: 110, willChange: "transform", opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        ease: "inQuad",
        duration: 1.2,
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

const TextScrumble = document.querySelectorAll(
"[data-animation='text-scrumble']"
);
TextScrumble.forEach((element) => {
new ScrambleTextEffect(element);
});

const TextLines = document.querySelectorAll(
"[data-animation='text-lines']"
);
TextLines.forEach((element) => {
new TextEffectLines(element);
});

const splitLines = document.querySelectorAll("[data-split-lines]");
splitLines.forEach((element) => {
new splitLinesEffect(element);
});

const splitChars = document.querySelectorAll("[data-animation=header-word]");
splitChars.forEach((element) => {
new splitCharsEffect(element);
});

})();
},
    "globalEase",
    "font-loaded"
    );

// Global Animation
pageFunctions.addFunction("globalAnimation", function () {
let elementInView = document.querySelectorAll("[data-animation=in-view]");
let elementInViewD1 = document.querySelectorAll("[data-animation=in-view-d1]");
let elementInViewD2 = document.querySelectorAll("[data-animation=in-view-d2]");
let elementInViewStagger = document.querySelectorAll("[data-animation=in-view-stagger]");
let elementInViewMove = document.querySelectorAll("[data-animation=in-view-move]");

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

// Refresh ScrollTriggers
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

// Refresh ScrollTrigger on search input
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

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
'cmsload',
(listInstances) => {
refreshScrollTrigger();
},
]);

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
'cmsnest',
(listInstances) => {
refreshScrollTrigger();
},
]);

});
