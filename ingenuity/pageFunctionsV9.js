// Custom Ease
gsap.registerPlugin(CustomEase);
pageFunctions.addFunction("globalEase", function () {
// Create custom easing functions
CustomEase.create("inOutCubic", "0.645, 0.045, 0.355, 1");
CustomEase.create("inOutQuint", "0.86, 0, 0.07, 1");
CustomEase.create("inQuad", "0.55, 0.085, 0.68, 0.53");
CustomEase.create("inOutExpo", "1, 0, 0, 1");
});

// Split Animation
gsap.registerPlugin(ScrollTrigger);
pageFunctions.addFunction('globalSplit', function () {

function debounce(func, delay) {
let timer;  // Added 'let' to define timer properly
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
}

reSplit() {
this.splitText.split({ types: this.splitType });
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

class HeadingEffectLines {
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
{ y: "1rem", willChange: "transform, opacity", opacity: 0 },
{
y: "0rem",
opacity: 1,
ease: "inOutCubic",
duration: 1.2,
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
this.splitter = new TextSplitter(this.textElement, "lines, chars");
}
}

(function () {
document
.querySelectorAll("[data-animation-rich='heading-lines']")
.forEach((richText) => {
richText
.querySelectorAll("h1, h2, h3, h4, h5, h6, p")
.forEach((heading) => {
heading.setAttribute("data-animation", "heading-lines");
});
});

const headingAnimationLines = document.querySelectorAll(
"[data-animation='heading-lines']"
);
headingAnimationLines.forEach((element) => {
new HeadingEffectLines(element);
});

const splitLines = document.querySelectorAll("[data-split-lines]");
splitLines.forEach((element) => {
new splitLinesEffect(element);
});

const splitWords = document.querySelectorAll("[data-split-words]");
splitWords.forEach((element) => {
new splitWordsEffect(element);
});

const splitChars = document.querySelectorAll("[data-split-chars]");
splitChars.forEach((element) => {
new splitCharsEffect(element);
});

})();
});

pageFunctions.addFunction('globalDropdown', function () {
  class Dropdown {
    constructor(element) {
      this.dropdown = element;
      this.toggle = element.querySelector('.n-dropdown-toggle');
      this.list = element.querySelector('.n-dropdown-list');
      this.backTrigger = element.querySelector('[data-dropdown-back]'); // Back trigger inside dropdown
      this.interactionType = element.getAttribute('data-dropdown-open'); // click or hover
      this.animationType = element.getAttribute('data-dropdown-animate'); // Get animation type (e.g., navigation, faq)
      this.waitForClose = element.hasAttribute('data-dropdown-wait'); // Check if dropdown should wait for others to close
      this.scrollDisable = element.getAttribute('data-dropdown-scroll') === 'disable'; // Disable scroll
      this.isOpen = false;
  
      if (!this.toggle || !this.list || !this.interactionType) return;
  
      // Bind core functionality
      this.init();
    }
  
    init() {
      if (this.interactionType === 'click') {
        this.toggle.addEventListener('click', (event) => {
          event.preventDefault();
          this.isOpen ? this.close() : this.open();
        });
  
        // Close when clicking outside
        document.addEventListener('click', (event) => {
          if (!this.dropdown.contains(event.target)) {
            this.close();
          }
        });
      } else if (this.interactionType === 'hover') {
        this.dropdown.addEventListener('mouseenter', () => {
          this.open();
        });
  
        this.dropdown.addEventListener('mouseleave', () => {
          this.close();
        });
      }
  
      this.toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.isOpen ? this.close() : this.open();
        }
      });
  
      if (this.backTrigger) {
        this.backTrigger.addEventListener('click', () => {
          this.close();
        });
      }
    }
  
    async open() {
      if (this.waitForClose) {
        await Dropdown.closeAllWithPromise(this);
      } else {
        Dropdown.closeAll(this);
      }
  
      if (this.scrollDisable) {
        this.disableBodyScroll();
      }
  
      this.toggle.classList.add('n--open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.list.classList.add('n--open');
      this.isOpen = true;
  
      if (this.animationType) {
        Dropdown.animations[this.animationType]?.open(this.list);
      }
    }
  
    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
  
      return new Promise((resolve) => {
        if (this.animationType) {
          Dropdown.animations[this.animationType]?.close(this.list, () => {
            this.cleanup();
            resolve();
          });
        } else {
          this.cleanup();
          resolve();
        }
      });
    }
  
    cleanup() {
      this.toggle.classList.remove('n--open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.list.classList.remove('n--open');
  
      if (this.scrollDisable) {
        this.enableBodyScroll();
      }
    }
  
    disableBodyScroll() {
      if (this.bodyScrollDisabled) return; // Prevent duplicate calls
      this.bodyScrollDisabled = true;
  
      const navComponent = document.querySelector('.nav_component');
  
      if (navComponent) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  
        if (scrollbarWidth > 0) {
          navComponent.style.marginRight = `${scrollbarWidth}px`;
          document.body.style.marginRight = `${scrollbarWidth}px`;
        }
  
        document.body.style.overflow = 'hidden';
  
        if (window.lenis) {
          lenis.stop("Lenis Stopped");
        }
      }
    }
  
    enableBodyScroll() {
      if (!this.bodyScrollDisabled) return; // Prevent duplicate calls
      this.bodyScrollDisabled = false;
  
      const navComponent = document.querySelector('.nav_component');
  
      if (navComponent) {
        navComponent.style.marginRight = '';
        document.body.style.marginRight = '';
        document.body.style.overflow = '';
  
        if (window.lenis) {
          lenis.start("Lenis Started");
        }
      }
    }
  
    static async closeAllWithPromise(excludeInstance = null) {
      const closePromises = [];
  
      document.querySelectorAll('.n-dropdown').forEach((dropdown) => {
        const instance = dropdown._dropdownInstance;
        if (instance && instance !== excludeInstance && instance.isOpen) {
          closePromises.push(instance.close());
        }
      });
  
      return Promise.all(closePromises);
    }
  
    static closeAll(excludeInstance = null) {
      document.querySelectorAll('.n-dropdown').forEach((dropdown) => {
        const instance = dropdown._dropdownInstance;
        if (instance && instance !== excludeInstance && instance.isOpen) {
          instance.close();
        }
      });
    }
  }


Dropdown.animations = {
  navigation: {
    open(list) {
      const megaFill = list.querySelector('.nav_dropdown_mega_fill');
      const megaBack = list.querySelector('.nav_dropdown_mega_back');
      const megaList = list.querySelector('.nav_dropdown_mega_list');
      const megaVisual = list.querySelector('[nav-dropdown-visual]');
      const timeline = gsap.timeline();
      // Check if the screen width is smaller than 60em
      const isSmallScreen = window.matchMedia('(max-width: 59.9em)').matches;
      if (megaFill) {
        if (isSmallScreen) {
          // On small screens, animate only opacity
          timeline.fromTo(
            megaFill,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
          );
        } else {
          // On larger screens, animate height
          timeline.fromTo(
            megaFill,
            { height: '0%' },
            { height: '100%', duration: 0.8, ease: 'inOutCubic' }
          );
        }
      }

      // Animate mega contain (opacity from 0 to 1)
      if (megaBack) {
        if (isSmallScreen) {
          // On small screens, animate only opacity
          timeline.fromTo(
            megaBack,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
          );
        } else {
          // On larger screens, animate height
          timeline.fromTo(
            megaBack,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 },
            '-=0.3'
          );
        }
      }

      // Animate mega contain (opacity from 0 to 1)
      if (megaList) {
        timeline.fromTo(
          megaList,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          '-=0.3'
        );
      }

      // Animate mega contain (opacity from 0 to 1)
      if (megaVisual) {
        timeline.fromTo(
          megaVisual,
          { opacity: 0, scale: 1.2 },
          { opacity: 1, scale: 1, duration: 0.6 },
          '-=0.3'
        );
      }



    },

    close(list, onComplete) {
      const megaFill = list.querySelector('.nav_dropdown_mega_fill');
      const megaBack = list.querySelector('.nav_dropdown_mega_back');
      const megaList = list.querySelector('.nav_dropdown_mega_list');
      const megaVisual = list.querySelector('[nav-dropdown-visual]');
      const timeline = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });

      const isSmallScreen = window.matchMedia('(max-width: 59.9em)').matches;

      // Reverse animate megaVisual
      if (megaVisual) {
        timeline.fromTo(
          megaVisual,
          { opacity: 1},
          { opacity: 0, duration: 0.4 }
        );
      }

      // Reverse animate megaList
      if (megaList) {
        timeline.fromTo(
          megaList,
          { opacity: 1 },
          { opacity: 0, duration: 0.4 },
          '-=0.3'
        );
      }

      // Reverse animate megaBack
      if (megaBack) {
        timeline.fromTo(
          megaBack,
          { opacity: 1 },
          { opacity: 0, duration: 0.4 },
          '-=0.3' // Slight overlap for smoother effect
        );
      }

      // Reverse animate megaFill
      if (megaFill) {
        if (isSmallScreen) {
          // On small screens, animate opacity
          timeline.fromTo(
            megaFill,
            { opacity: 1 },
            { opacity: 0, duration: 0.6 }, "-=0.2"
          );
        } else {
          // On larger screens, animate height
          timeline.fromTo(
            megaFill,
            { height: '100%' },
            { height: '0%', duration: 0.6, ease: 'inOutQuint' }, "<"
          );
        }
      }

      // Ensure cleanup is called after animations
      const dropdownInstance = list.closest('.n-dropdown')._dropdownInstance;
      timeline.call(() => {
        dropdownInstance.cleanup();
      });
    },
  },
};

// Initialize all dropdowns
document.querySelectorAll('.n-dropdown').forEach((dropdown) => {
  dropdown._dropdownInstance = new Dropdown(dropdown);
});
});

pageFunctions.addFunction("globalLenis", function () {
  // Initialize Lenis with configuration
  const lenis = new Lenis({
    direction: 'vertical',          // Scrolling direction
    gestureDirection: 'vertical',  // Gesture recognition direction
    smooth: true,                  // Enable smooth scrolling
    lerp: 0.1,                     // Animation interpolation factor
    wheelMultiplier: 0.7,          // Wheel scroll sensitivity
    mouseMultiplier: 0.7,          // Mouse scroll sensitivity
    smoothTouch: false,            // Disable smooth touch scrolling
    touchMultiplier: 1.5,          // Touch scroll sensitivity
    infinite: false,               // Prevent infinite scrolling
  });

  // Attach Lenis to the global window object
  window.lenis = lenis;

  // Custom flag to track the running state
  window.lenisRunning = true;

  // Overwrite Lenis start/stop methods to add console logs
  const originalStart = lenis.start.bind(lenis);
  const originalStop = lenis.stop.bind(lenis);

  lenis.start = function () {
    console.log("Lenis started.");
    window.lenisRunning = true;
    originalStart();
  };

  lenis.stop = function () {
    console.log("Lenis stopped.");
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

pageFunctions.addFunction('globalNavigation', function () {
  // Cache all .nav_wrap and .nav_component elements
  const navWraps = document.querySelectorAll(".nav_wrap");
  const navComponents = document.querySelectorAll(".nav_component");

  let lastDirection = 0;
  let actionDelay = false; // Prevent rapid toggling
  const delayDuration = 300; // Delay duration in milliseconds

  // ScrollTrigger for nav_component (hide/show on scroll direction with delay)
  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      if (self.direction !== lastDirection && !actionDelay) {
        lastDirection = self.direction;
        actionDelay = true;

        if (self.direction === 1) {
          // Scroll down
          gsap.to(navComponents, {
            yPercent: -100,
            opacity: 0,
            duration: 0.3,
            ease: "power1.out"
          });
        } else {
          // Scroll up
          gsap.to(navComponents, {
            yPercent: 0,
            opacity: 1,
            duration: 0.3,
            ease: "power1.out"
          });
        }

        // Reset delay after the specified duration
        setTimeout(() => {
          actionDelay = false;
        }, delayDuration);
      }
    },
  });

  // ScrollTrigger for nav_wrap (change background color based on scroll position)
  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "top+=30px top", // Trigger when scrolling 30px from the top
    onUpdate: (self) => {
      navWraps.forEach(navWrap => {
        if (self.progress === 1) {
          // Beyond 30px from the top
          navWrap.style.backgroundColor = "var(--theme--background-main)";
        } else {
          // At the top of the page
          navWrap.style.backgroundColor = "transparent";
        }
      });
    }
  });
});

// Global Animation
pageFunctions.addFunction("globalAnimation", function () {
let elementInView = document.querySelectorAll("[data-animation=in-view]");
let elementInViewD1 = document.querySelectorAll("[data-animation=in-view-d1]");
let elementInViewD2 = document.querySelectorAll("[data-animation=in-view-d2]");
let elementInViewStagger = document.querySelectorAll("[data-animation=in-view-stagger]");
let elementInViewStaggerMove = document.querySelectorAll("[data-animation=in-view-stagger-move]");
let elementInViewMove = document.querySelectorAll("[data-animation=in-view-move]");
let lineInView = document.querySelectorAll("[data-animation=in-view-line]");
let productInView = document.querySelectorAll("[data-animation=in-view-product]");

if (elementInView.length > 0) {
elementInView.forEach(function (element) {
let tlElementInView = gsap.timeline({ paused: true });
tlElementInView.from(element, {
opacity: 0,
duration: 1,
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
duration: 1,
willChange: "opacity",
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
duration: 1,
willChange: "opacity",
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
willChange: "transform, opacity",
duration: 1,
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

// Animate opacity first, then position
tlElementInViewStagger.from(
children,
{
opacity: 0,
duration: 0.6,            // Opacity animation lasts 1s
willChange: "opacity",
ease: "power1.in",
stagger: {each: 0.2},
}
);
});
}

if (elementInViewStaggerMove.length > 0) {
elementInViewStaggerMove.forEach(function (parentElement) {
let children = parentElement.children;

let tlElementInViewStaggerMove = gsap.timeline({
scrollTrigger: {
trigger: parentElement,
start: "top 95%",
toggleActions: "play none none none",
},
});

// Animate opacity first, then position
tlElementInViewStaggerMove.from(
children,
{
opacity: 0,
duration: 0.6,            // Opacity animation lasts 1s
willChange: "opacity",
ease: "power1.in",
stagger: {each: 0.2},
},
0
);

tlElementInViewStaggerMove.from(
children,
{
y: "2rem",
duration: 1,          // Position animation lasts 0.6s
willChange: "transform",
ease: "inOutCubic",
stagger: {each: 0.2},
},
0
);
});
}

if (lineInView.length > 0) {
lineInView.forEach(function (element) {
let tlLineInView = gsap.timeline({ paused: true });
tlLineInView.fromTo(element, {
width: "0%",
duration: 3,
willChange: "width",
ease: "power1.out",
},
{
width: "100%"
},
);
ScrollTrigger.create({
trigger: element,
start: "top 95%",
toggleActions: "play none none none",
animation: tlLineInView, // Corrected
});
});
}

if (productInView.length > 0) {
productInView.forEach(function (parentElement) {
const productVisual = parentElement.querySelector(".g_visual_wrap");
const productText = parentElement.querySelector(".g_projects_item_text_wrap");

let tlProductInView = gsap.timeline({
scrollTrigger: {
trigger: parentElement,
start: "top 95%",
toggleActions: "play none none none",
},
});

// Animate Parent Element - Movement and Opacity
tlProductInView.from(
parentElement,
{
opacity: 0,
duration: 0.6,            // Opacity animation
willChange: "opacity",
ease: "power1.in",
},
0
);

tlProductInView.from(
parentElement,
{
y: "5rem",              // Movement animation
duration: 1,
willChange: "transform",
ease: "inOutCubic",
},
0
);

// Animate Visual - Scaling
if (productVisual) {
tlProductInView.from(
productVisual,
{
scale: 1.25,           // Scale from 1.25 to 1
willChange: "transform",
duration: 1,
ease: "inOutCubic",
},
0
);
}


// Animate Text - Opacity
if (productText) {
tlProductInView.from(
productText,
{
opacity: 0,           // Fade in text
duration: 0.8,
willChange: "opacity",
ease: "power1.in",
},
0.2
);
}
});
}
});

// Copyright Year
pageFunctions.addFunction('globalCopirght', function() {
// Get the current year
const currentYear = new Date().getFullYear();

// Select all elements with the class 'copyright-year'
const copyrightYearElements = document.querySelectorAll('.copyright-year');

// Update the text content of each selected element to the current year
copyrightYearElements.forEach(function (element) {
element.textContent = currentYear;
});
});

// Hover Animations
pageFunctions.addFunction("globalHover", function () {

  // Button Text - Line and Icon Hover
  function buttonTextHover(buttonText) {
    // Select elements inside the button text
    const buttonLine = buttonText.querySelector("[data-button-hover=line]");
    const buttonIcon1 = buttonText.querySelector("[data-button-hover=icon1]");
    const buttonIcon2 = buttonText.querySelector("[data-button-hover=icon2]");
    
    // Timeline for pointerenter
    const hoverInTimeline = gsap.timeline({ paused: true });
    if (buttonLine) {
      hoverInTimeline.to(buttonLine, { x: "0%", duration: 0.6, ease: "inOutQuint" });
    }
    if (buttonIcon1 && buttonIcon2) {
      hoverInTimeline
        .to(buttonIcon1, { x: "150%", duration: 0.6, ease: "inOutQuint" }, 0)
        .to(buttonIcon2, { x: "0%", duration: 0.6, ease: "inOutQuint" }, 0);
    }
    
    // Timeline for pointerleave
    const hoverOutTimeline = gsap.timeline({ paused: true });
    if (buttonLine) {
      hoverOutTimeline.to(buttonLine, { x: "101%", duration: 0.6, ease: "circOut" });
    }
    if (buttonIcon1 && buttonIcon2) {
      hoverOutTimeline
        .to(buttonIcon2, { x: "-150%", duration: 0.6, ease: "circOut" }, 0)
        .to(buttonIcon1, { x: "0%", duration: 0.6, ease: "circOut" }, 0);
    }
    
    // Attach Event Listeners
    buttonText.addEventListener("pointerenter", () => {
      hoverOutTimeline.kill();
      hoverInTimeline.restart();
    });
    buttonText.addEventListener("pointerleave", () => {
      hoverInTimeline.kill();
      hoverOutTimeline.restart();
    });
  }
  // Button Text - Line and Icon hover - Initiate
  const buttonTextElements = document.querySelectorAll("[data-button=hover-text]");
  buttonTextElements.forEach((buttonText) => {
    buttonTextHover(buttonText); 
  });
  
  // Button Main - Icon Hover
  function buttonMainHover(buttonElement) {
  // Select elements inside the button
  const buttonIconFill = buttonElement.querySelector("[data-button-hover=icon-fill]");
  const buttonIcon1 = buttonElement.querySelector("[data-button-hover=icon1]");
  const buttonIcon2 = buttonElement.querySelector("[data-button-hover=icon2]");
  
  // Store the original background color of the button
  const originalBackgroundColor = window.getComputedStyle(buttonElement).backgroundColor;
  
  // Timeline for pointerenter
  const hoverTimeline = gsap.timeline({ paused: true });
  
/*   if (buttonIconFill) {
    // Animate the button fill size and position
    hoverTimeline.to(buttonIconFill, {
      width: "100%",
      height: "100%",
      translateX: "0rem",
      translateY: "0rem",
      ease: "power3.inOut",
      duration: 0.5,
      onComplete: function () {
        // Get the background color of buttonFill
       const buttonFillColor = window.getComputedStyle(buttonIconFill).backgroundColor;
        // Apply the color to the trigger element
        gsap.to(buttonElement, { backgroundColor: buttonFillColor, duration: 0.01 });
      }
    });
  } */
  
  if (buttonIcon1 && buttonIcon2) {
    hoverTimeline
      .to(buttonIcon1, { x: "150%", duration: 0.6, ease: "inOutQuint" }, 0)
      .to(buttonIcon2, { x: "0%", duration: 0.6, ease: "inOutQuint" }, 0);
  }
  
  // Attach Event Listeners
  buttonElement.addEventListener("pointerenter", () => {
    hoverTimeline.restart();
  });
  buttonElement.addEventListener("pointerleave", () => {
    hoverTimeline.reverse();
    // gsap.to(buttonElement, { backgroundColor: originalBackgroundColor, duration: 0.01 });
  });
  }
  // Button Main - Icon Hover - Initiate
  const buttonMain = document.querySelectorAll("[data-button='hover']");
  buttonMain.forEach((buttonElement) => {
  buttonMainHover(buttonElement); 
  });
  
  
  // Button Text - Line and Icon hover (Left Direction)
  function buttonTextHoverAlternative(buttonText) {
  // Select elements inside the button text
  const buttonLine = buttonText.querySelector("[data-button-hover=line]");
  const buttonIcon1 = buttonText.querySelector("[data-button-hover=icon1]");
  const buttonIcon2 = buttonText.querySelector("[data-button-hover=icon2]");
  
  // Timeline for pointerenter (Left Direction)
  const hoverInTimeline = gsap.timeline({ paused: true });
  if (buttonLine) {
  hoverInTimeline.to(buttonLine, { x: "0%", duration: 0.6, ease: "inOutQuint" });
  }
  if (buttonIcon1 && buttonIcon2) {
  hoverInTimeline
  .to(buttonIcon1, { x: "-150%", duration: 0.6, ease: "inOutQuint" }, 0)
  .to(buttonIcon2, { x: "0%", duration: 0.6, ease: "inOutQuint" }, 0);
  }
  
  // Timeline for pointerleave (Left Direction)
  const hoverOutTimeline = gsap.timeline({ paused: true });
  if (buttonLine) {
  hoverOutTimeline.to(buttonLine, { x: "-101%", duration: 0.6, ease: "circOut" });
  }
  if (buttonIcon1 && buttonIcon2) {
  hoverOutTimeline
  .to(buttonIcon2, { x: "150%", duration: 0.6, ease: "circOut" }, 0)
  .to(buttonIcon1, { x: "0%", duration: 0.6, ease: "circOut" }, 0);
  }
  
  // Attach Event Listeners
  buttonText.addEventListener("pointerenter", () => {
  hoverOutTimeline.kill();
  hoverInTimeline.restart();
  });
  
  buttonText.addEventListener("pointerleave", () => {
  hoverInTimeline.kill();
  hoverOutTimeline.restart();
  });
  }
  // Button Text - Line and Icon hover (Left Direction) - Initiate
  const buttonTextAlternativeElements = document.querySelectorAll(
  "[data-button=hover-text-alternative]"
  );
  buttonTextAlternativeElements.forEach((buttonText) => {
  buttonTextHoverAlternative(buttonText); 
  });
  
  // Project Item - Line, Image and Text
  function projectHoverAnimation(projectItem) {
  // Select elements inside the project item
  let line = projectItem.querySelector("[data-project-hover='line']");
  let visualImg = projectItem.querySelector(".g_visual_img");
  let text = projectItem.querySelector("[data-project-hover='text']");
  
  // Set initial positions
  if (line) gsap.set(line, { x: "-101%" });
  if (visualImg) gsap.set(visualImg, { scale: 1 });
  if (text) gsap.set(text, { scale: 1, transformOrigin: "bottom left" });
  
  // Timeline for pointerenter
  let hoverInTimeline = gsap.timeline({ paused: true });
  if (line) {
  hoverInTimeline.to(line, { x: "0%", duration: 0.6, ease: "inOutQuint" });
  }
  if (visualImg && text) {
  hoverInTimeline
  .to(visualImg, { scale: 1.25, duration: 1, ease: "inOutCubic" }, 0)
  .to(text, { scale: 1.2, duration: 1, ease: "inOutCubic" }, 0);
  }
  
  // Attach Event Listeners
  projectItem.addEventListener("pointerenter", () => hoverInTimeline.restart());
  projectItem.addEventListener("pointerleave", () => hoverInTimeline.reverse());
  }
  // Project Item - Line, Image and Text - Initiate
  const projectItems = document.querySelectorAll("[data-project='hover']");
  projectItems.forEach((projectItem) => {
  projectHoverAnimation(projectItem); 
  });
  
  
  
});

// Theme Change
pageFunctions.addFunction('globalThemeChange', function() {
$("[data-animate-to]").each(function () {
ScrollTrigger.create({
trigger: $(this),
start: "top center",
end: "bottom center",
toggleActions: "play reverse play reverse",
onEnter: () => {
let theme = $(this).attr("data-animate-to") === "dark" ? 2 : 1;
gsap.to("body", { ...colorThemes[theme], duration: 0.5 });
},
onLeaveBack: () => {
let theme = $(this).attr("data-animate-to") === "dark" ? 1 : 2;
gsap.to("body", { ...colorThemes[theme], duration: 0.5 });
}
});
});
});

// Set aria-hidden=true
pageFunctions.addFunction("globalSetAria", function () {
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

// Option 3: Add attributes on Tablet and smaller screens
mm.add("(max-width: 768px)", () => {
document.querySelectorAll("[data-aria='mobile-land']").forEach((el) => {
el.setAttribute("aria-hidden", "true");
el.setAttribute("tabindex", "-1");
});
});


});

// Footer Spotlight
pageFunctions.addFunction("footerSpotlight", function () {

function deviceType() {
const ua = navigator.userAgent;
if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
return "tablet";
} else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
return "mobile";
}
return "desktop";
}

function moveSpotlight() {
const footerWrap = document.querySelector(".footer_wrap");
const spotlight = document.querySelector(".footer_spotlight");

footerWrap.addEventListener("pointermove", (event) => {
const rect = footerWrap.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;

const spotlightWidth = spotlight.offsetWidth / 2;
const spotlightHeight = spotlight.offsetHeight / 2;

gsap.to(spotlight, {
x: x - spotlightWidth,
y: y - spotlightHeight,
duration: 1.6,
ease: "power1.out"
});
});
}

if (deviceType() === "desktop") {
moveSpotlight();
} else {
const spotlight = document.querySelector(".footer_spotlight");
if (spotlight) spotlight.style.display = "none";
}
});

// Insight Filter
pageFunctions.addFunction('filterDropdown', function() {
function filterDropdown() {
const filterComponents = document.querySelectorAll('[fs-cmsfilter-element="filters"]');

filterComponents.forEach((component) => {
const filterDropdowns = component.querySelectorAll('[data-filter-dropdown="item"]');

filterDropdowns.forEach((dropdown) => {
const trigger = dropdown.querySelector('[data-filter-dropdown="trigger"]');
const body = dropdown.querySelector('[data-filter-dropdown="body"]');

trigger.addEventListener("click", function () {
  if (!dropdown.classList.contains("is-active")) {
    // Expand: Animate border-radius before adding the class
    dropdown.style.transition = "border-radius 0.3s ease";
    dropdown.style.borderRadius = "1.25rem";

    // Wait for the animation to complete before expanding
    setTimeout(() => {
      dropdown.classList.add("is-active");
      body.style.maxHeight = body.scrollHeight + "px";  // Expand body
      ScrollTrigger.refresh();  // Refresh GSAP ScrollTriggers

    }, 300); // Same as transition duration

  } else {
    // Collapse: First remove the active class and animate maxHeight
    body.style.maxHeight = null; // Collapse body

    // Wait for maxHeight animation to complete before animating border-radius
    setTimeout(() => {
      dropdown.classList.remove("is-active");
      dropdown.style.transition = "border-radius 0.3s ease";
      dropdown.style.borderRadius = "100vw";  // Animate to rounded
      ScrollTrigger.refresh();  // Refresh GSAP ScrollTriggers

    }, 300); // Same as transition duration
  }
});
});
});
}

function checkScreenSize() {
if (window.innerWidth < 768) {
filterDropdown();  // Activate on small screens
} else {
removeDropdown();  // Reset functionality on larger screens
}
}

function removeDropdown() {
const filterComponents = document.querySelectorAll('[fs-cmsfilter-element="filters"]');

filterComponents.forEach((component) => {
const filterDropdowns = component.querySelectorAll('[data-filter-dropdown="item"]');

filterDropdowns.forEach((dropdown) => {
const body = dropdown.querySelector('[data-filter-dropdown="body"]');
dropdown.classList.remove("is-active");
dropdown.style.borderRadius = "100vw";  // Reset border-radius
body.style.maxHeight = null;  // Reset maxHeight
ScrollTrigger.refresh();  // Refresh GSAP ScrollTriggers
});
});
}

// Initial check on page load
window.addEventListener("DOMContentLoaded", checkScreenSize);

// Check on window resize
window.addEventListener("resize", checkScreenSize);
});

pageFunctions.addFunction("pageTransition", function () {

// Define reusable variables for elements
const headerText = document.querySelectorAll("[data-animation='header-text']");
const navComponent = document.querySelector("[data-animation='nav-component']");
const headerFade = document.querySelectorAll("[data-animation='header-fade']");
const headerNext = document.querySelector("[data-animation='header-next']");

// General page load transition with global or page-specific animation
let tl = gsap.timeline();

tl.to(".transition_wrap", { opacity: 0, delay: 0.2, duration: 1, ease: "power1.out" })
  .set(".transition_wrap", { display: "none" })
  .add(() => {
    runAnimation("-=0.6");
  });

// Function to determine which animation to run
function runAnimation() {
  const pageName = $("body").data("page");

  if (!pageName) {
    runGlobalAnimation();
  } else {
    switch (pageName) {
      case "process":
        runProcessPageAnimation();
        break;
      case "about":
        runAboutPageAnimation();
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

// Page-specific animation for Process page
function runProcessPageAnimation() {
  // Empty as per request
}

// Page-specific animation for About page
function runAboutPageAnimation() {
  // Empty as per request
}

// Triggering transition on link clicks
$("a:not(.excluded-class)").on("click", function (e) {
  let currentUrl = $(this).attr("href");
  if (
    $(this).prop("hostname") === window.location.host &&
    !currentUrl.includes("#") &&
    $(this).attr("target") !== "_blank"
  ) {
    e.preventDefault();

    let tl = gsap.timeline({ onComplete: () => (window.location.href = currentUrl) });
    tl.set(".transition_wrap", { display: "flex" })
      .fromTo(".transition_wrap", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" });
  }
});

// Handle back button with a page refresh to ensure correct state
window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};
});
