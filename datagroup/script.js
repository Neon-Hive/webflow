gsap.registerPlugin(ScrollTrigger, CustomEase);
// Ease
pageFunctions.addFunction("globalEase", function () {
// Create custom easing functions
// Headings split movement, page transition
CustomEase.create("InOutQuart", "0.77, 0, 0.175, 1");
CustomEase.create("inCubic", "0.55, 0.055, 0.675, 0.19");
// Opacity
CustomEase.create("EaseOutSine", "0.39, 0.575, 0.565, 1");
// Heading Ease
CustomEase.create("InOutCubic", "0.645, 0.045, 0.355, 1");
CustomEase.create("SineIn", "0.47, 0, 0.745, 0.715");
CustomEase.create("CubicOut", "0.215, 0.61, 0.355, 1");
});
// Global Heading / Split
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
    this.splitText = new SplitType(this.textElement, {types: splitType });
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

window.TextEffectLines = class TextEffectLines {
  constructor(textElement) {
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error("Invalid text element provided.");
    }
    this.textElement = textElement;
    this.initializeEffect();
  }

  initializeEffect() {
    this.splitter = new TextSplitter(this.textElement, "lines, chars");
    this.scroll();
    this.initResizeObserver();
  }

  scroll() {
    const lines = this.splitter.getLines();
    if (lines.length === 0) {
      return;
    }

    // For each line, split into characters
    lines.forEach(line => {
      // Create a new splitter instance for this line
      const lineSplitter = new TextSplitter(line, "chars");
      const chars = lineSplitter.getChars();

      // Animate the characters
      gsap.fromTo(
        chars,
        {opacity: 0 },
        {
          opacity: 1,
          ease: "EaseOutSine",
          stagger: {amount: 0.8 },
          scrollTrigger: {
            trigger: this.textElement,
            start: "top 95%",
            end: "bottom 95%",
            toggleActions: "play none none none",
          }
        }
      );
    });
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

window.CharsAnimation = class CharsAnimation {
  constructor(textElement) {
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error("Invalid text element provided.");
    }
    this.textElement = textElement;
    this.initializeEffect();
  }

  initializeEffect() {
    // Use TextSplitter to split text into characters
    this.splitter = new TextSplitter(this.textElement, "chars");
    this.animate();
  }

  animate() {
    const chars = this.splitter.getChars(); // Get the individual characters
    if (chars.length === 0) {
      return;
    }

    // Animate opacity with a fade-in effect
    gsap.fromTo(
      chars, 
      { opacity: 0 }, // Initial opacity for each character
      {
        opacity: 1, // Final opacity
        ease: "easeOut",
        duration: 0.2, // Fast duration for opacity
        stagger: { each: 0.1 }, // Sequential animation
        scrollTrigger: {
          trigger: this.textElement,
          start: "top 95%",
          end: "bottom 95%",
          toggleActions: "play none none none",
        },
      }
    );
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
    this.splitter = new TextSplitter(this.textElement, "lines, chars");
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

  const TextLines = document.querySelectorAll(
    "[data-animation='text-lines']"
  );
  TextLines.forEach((element) => {
    new TextEffectLines(element);
  });

  const TextChars = document.querySelectorAll(
    "[data-animation='scramble']"
  );
  TextChars.forEach((element) => {
    new CharsAnimation(element);
  });

  const splitLines = document.querySelectorAll("[data-split-lines]");
  splitLines.forEach((element) => {
    new splitLinesEffect(element);
  });

  const splitChars = document.querySelectorAll("[data-split-chars]");
  splitChars.forEach((element) => {
    new splitCharsEffect(element);
  });

})();
},
                        "globalEase",
                        "font-loaded"
);
// Page Transition
pageFunctions.addFunction('pageTransition', function () {
// Define reusable variables for elements
const headerHeading = document.querySelectorAll('[data-animation="header-heading"]');
const headerText = document.querySelectorAll('[data-animation="header-text"]');
const navComponent = document.querySelector('[data-animation="nav-component"]');
const headerNext = document.querySelectorAll('[data-animation="header-next"]');
const headerProcess = document.querySelectorAll('[data-animation="header-process"]');
const headerButton = document.querySelectorAll('[data-animation="header-button"]');
const headerLine = document.querySelectorAll('[data-animation="header-line"]');
// Page Reveal
const transitionWrap = document.querySelector('.transition_wrap');
const transitionRows = document.querySelectorAll('.transition_row_wrap');
const blocks = document.querySelectorAll('.transition_block');
let tlPageReveal = gsap.timeline({
  onComplete: () => {
    gsap.set(transitionWrap, { display: "none" });
  },
});
tlPageReveal
  .to(blocks, {
  opacity: 0,
  duration: 0.1,
  ease: "power2.out",
  stagger: {
    amount: 0.75,
    from: "random",
  },
})
  .add(() => {
  runAnimation();
}, "-=0.4");
// Function to determine which animation to run
function runAnimation() {
  const pageName = $('body').data('page');
  if (!pageName) {
    runHeaderMainAnimation();
  } else {
    switch (pageName) {
      case 'header-main':
        runHeaderMainAnimation();
        break;
      case 'header-secondary':
        runHeaderSecondaryPageAnimation();
        break;
      case 'header-third':
        runHeaderThirdPageAnimation();
        break;
    }
  }
}
// Global animation
function runHeaderMainAnimation() {
  let tl = gsap.timeline();
  // Ensure visibility for headerProcess
  if (headerProcess) {
    gsap.set(headerProcess, { visibility: 'visible' });
    tl.fromTo(
      headerProcess,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'sine.out' }
    );
  }
  if (headerHeading.length > 0) {
    headerHeading.forEach(header => {
      gsap.set(header, { visibility: 'visible' });
      const lines = header.querySelectorAll('.line');
      const splitText = new SplitType(lines, { 
        types: 'chars',
        tagName: 'span'
      });

      const chars = splitText.chars;
      gsap.set(chars, { opacity: 0 });

      tl.to(chars, {
        opacity: 1,
        duration: 0.8,
        ease: "sine.out",
        stagger: { 
          amount: 0.8, 
          from: "start" 
        }
      }, "<0.1");
    });
  }
  // Ensure visibility for navComponent
  if (navComponent) {
    gsap.set(navComponent, { visibility: 'visible' });
    tl.fromTo(
      navComponent,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power1.out' },
      "<0.1"
    );
  }
  // Ensure visibility for headerText
  if (headerText.length > 0) {
    gsap.set(headerText, { visibility: 'visible' });
    tl.fromTo(
      headerText,
      { opacity: 0 },
      { opacity: 1, duration: 0.9, ease: 'sine.out' },
      "-=0.1"
    );
  }
  // Ensure visibility for headerButton
  if (headerButton.length > 0) {
    headerButton.forEach(button => {
      gsap.set(button, { visibility: 'visible' });
      tl.fromTo(
        button,
        { scale: 0.8 },
        { scale: 1, duration: 0.6, ease: 'sine.out' },
        "<"
      ).fromTo(
        button,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'cubic.out' },
        "<0.1"
      );
    });
  }
  
  if (headerNext) {
    gsap.set(headerNext, { visibility: 'visible' });
    tl.fromTo(
      headerNext,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power1.out' },
      "<0.2"
    );
  }
}
// Page-specific animation for Header Secondary page
function runHeaderSecondaryPageAnimation() {
  let tl = gsap.timeline();
  // Ensure visibility for headerHeading
  if (headerHeading.length > 0) {
    headerHeading.forEach(header => {
      gsap.set(header, { visibility: 'visible' });
      const lines = header.querySelectorAll('.line');
      const splitText = new SplitType(lines, { 
        types: 'chars',
        tagName: 'span'
      });

      const chars = splitText.chars;
      gsap.set(chars, { opacity: 0 });

      tl.to(chars, {
        opacity: 1,
        duration: 0.8,
        ease: "sine.out",
        stagger: { 
          amount: 0.8, 
          from: "start" 
        }
      });
    });
  }
  // Ensure visibility for navComponent
  if (navComponent) {
    gsap.set(navComponent, { visibility: 'visible' });
    tl.fromTo(
      navComponent,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power1.out' },
      "<"
    );
  }
  // Ensure visibility for headerLine
  if (headerLine.length > 0) {
    headerLine.forEach(line => {
      gsap.set(line, { visibility: 'visible' });
      tl.fromTo(
        line,
        { width: "0%" },
        { width: "100%", duration: 1, ease: 'InOutQuart' },
        "-=0.1"
      );
    });
  }
  // Ensure visibility for headerText
  if (headerText.length > 0) {
    gsap.set(headerText, { visibility: 'visible' });
    tl.fromTo(
      headerText,
      { opacity: 0 },
      { opacity: 1, duration: 0.9, stagger: 0.2, ease: 'EaseOutSine' },
      "-=0.1"
    );
  }
  // Ensure visibility for headerButton
  if (headerButton.length > 0) {
    headerButton.forEach(button => {
      gsap.set(button, { visibility: 'visible' });
      tl.fromTo(
        button,
        { scale: 0.8 },
        { scale: 1, duration: 0.6, ease: 'EaseOutSine' },
        "<"
      ).fromTo(
        button,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'EaseOutCubic' },
        "<0.1"
      );
    });
  }
}
// Page-specific animation for Header Secondary page
function runHeaderThirdPageAnimation() {
  let tl = gsap.timeline();
  // Ensure visibility for headerHeading
  if (headerHeading.length > 0) {
    headerHeading.forEach(header => {
      gsap.set(header, { visibility: 'visible' });
      const lines = header.querySelectorAll('.line');
      const splitText = new SplitType(lines, { 
        types: 'chars',
        tagName: 'span'
      });

      const chars = splitText.chars;
      gsap.set(chars, { opacity: 0 });

      tl.to(chars, {
        opacity: 1,
        duration: 0.8,
        ease: "sine.out",
        stagger: { 
          amount: 0.8, 
          from: "start" 
        }
      });
    });
  }
  // Ensure visibility for navComponent
  if (navComponent) {
    gsap.set(navComponent, { visibility: 'visible' });
    tl.fromTo(
      navComponent,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power1.out' },
      "<"
    );
  }
  // Ensure visibility for headerText
  if (headerText.length > 0) {
    gsap.set(headerText, { visibility: 'visible' });
    tl.fromTo(
      headerText,
      { opacity: 0 },
      { opacity: 1, duration: 0.9, stagger: 0.2, ease: 'EaseOutSine' },
      "-=0.1"
    );
  }
  // Ensure visibility for headerButton
  if (headerButton.length > 0) {
    headerButton.forEach(button => {
      gsap.set(button, { visibility: 'visible' });
      tl.fromTo(
        button,
        { scale: 0.8 },
        { scale: 1, duration: 0.6, ease: 'EaseOutSine' },
        "<"
      ).fromTo(
        button,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'EaseOutCubic' },
        "<0.1"
      );
    });
  }
}
$('a:not(.excluded-class)').on('click', function (e) {
  let currentUrl = $(this).attr('href');

  // Only apply if link is internal and not opening a new tab
  if ($(this).prop('hostname') === window.location.host && !currentUrl.includes('#') && $(this).attr('target') !== '_blank') {
    e.preventDefault(); // Prevent default navigation

    let tl = gsap.timeline({
      onComplete: () => {
        window.location.href = currentUrl; // Change the page after animation
      }
    });

    tl.set('.transition_wrap', { display: 'flex' })
      .to('.transition_block', {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
      stagger: { amount: 0.5, from: "random" }
    });
  }
});
// Handle back button with a page refresh to ensure correct state
window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload(); // Ensures animation runs even on back navigation
  } else {
    pageFunctions.addFunction('pageTransition'); // Use addFunction instead of run
  }
};
}, ['globalSplit', 'globalEase', 'font-loaded']);
// Global Anim
pageFunctions.addFunction('globalAnimation', function () {
let elementInView = document.querySelectorAll('[data-animation=in-view]');
let elementInViewD1 = document.querySelectorAll(
  '[data-animation=in-view-d1]'
);
let elementInViewD2 = document.querySelectorAll(
  '[data-animation=in-view-d2]'
);
let elementInViewD3 = document.querySelectorAll(
  '[data-animation=in-view-d3]'
);
let elementInViewStagger = document.querySelectorAll(
  '[data-animation=in-view-stagger]'
);
let elementInViewLine = document.querySelectorAll("[data-animation=in-view-line]"
                                                  );

if (elementInView.length > 0) {
  elementInView.forEach(function (element) {
    let tlElementInView = gsap.timeline({ paused: true });
    tlElementInView.from(element, {
      opacity: 0,
      duration: 0.8,
      ease: 'EaseOutSine',
    });
    ScrollTrigger.create({
      trigger: element,
      start: 'top 93%',
      toggleActions: 'play none none none',
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
      ease: 'EaseOutSine',
    });
    ScrollTrigger.create({
      trigger: element,
      start: 'top 93%',
      toggleActions: 'play none none none',
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
      ease: 'EaseOutSine',
    });
    ScrollTrigger.create({
      trigger: element,
      start: 'top 93%',
      toggleActions: 'play none none none',
      animation: tlElementInViewD2,
    });
  });
}

if (elementInViewD3.length > 0) {
  elementInViewD3.forEach(function (element) {
    let tlElementInViewD3 = gsap.timeline({ paused: true });
    tlElementInViewD3.from(element, {
      delay: 0.4,
      opacity: 0,
      duration: 0.8,
      ease: 'EaseOutSine',
    });
    ScrollTrigger.create({
      trigger: element,
      start: 'top 93%',
      toggleActions: 'play none none none',
      animation: tlElementInViewD3,
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
        start: 'top 93%',
        toggleActions: 'play none none none',
      },
    });
    tlElementInViewStagger.from(children, {
      opacity: 0,
      duration: 1,
      y: '4rem',
      ease: 'InOutCubic',
      stagger: 0.1, // Apply stagger effect to children
    });
  });
}

if (elementInViewLine.length > 0) {
  elementInViewLine.forEach((element) => {
    const tlElementInViewLine = gsap.timeline({ paused: true });
    tlElementInViewLine.from(element, {
      width: "0%",
      duration: 1.2,
      ease: "InOutQuart",
    });
    ScrollTrigger.create({
      trigger: element,
      start: "top 93%",
      toggleActions: "play none none none",
      animation: tlElementInViewLine,
    });
  });
}
});
// Button Hover
pageFunctions.addFunction('buttonTextHover', function() {
// Apply animation only for devices with fine pointer (mouse/trackpad)
gsap.matchMedia().add("(pointer: fine)", () => {
  // Select all elements with [data-hover=button-text]
  const buttonTextElements = document.querySelectorAll("[data-hover=button-text]");

  buttonTextElements.forEach(buttonText => {
    // Find the [data-hover=button-line] inside each buttonText element
    const buttonLine = buttonText.querySelector("[data-hover=button-line]");

    if (buttonLine) {
      // Set initial state to be off-screen to the left (-100%)
      gsap.set(buttonLine, { x: "-101%" });

      // Add hover animations
      buttonText.addEventListener("mouseenter", () => {
        gsap.to(buttonLine, {
          x: "0%",
          duration: 0.4,
          ease: "power2.out"
        });
      });

      buttonText.addEventListener("mouseleave", () => {
        gsap.to(buttonLine, {
          x: "100%",
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            // Reset to -100% after animation completes
            gsap.set(buttonLine, { x: "-101%" });
          }
        });
      });
    }
  });
});
});
// Button Hover Text
pageFunctions.addFunction("buttonHover", function() {
  // Check if device has fine pointer
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const buttons = document.querySelectorAll("[data-button='hover']");

  buttons.forEach(button => {
    const buttonText = button.querySelector("[data-button-animation=text]");
    if (!buttonText) return;

    let isAnimating = false;
    const originalText = buttonText.textContent;

    // Split text into spans, preserving spaces
    const chars = originalText.split('').map(char => {
      if (char === ' ') {
        return ' '; // Return space as-is
      }
      return `<span style="opacity: 1; display: inline-block;">${char}</span>`;
    });
    buttonText.innerHTML = chars.join('');

    button.addEventListener("mouseenter", () => {
      // Stop any existing animations and scale up immediately
      gsap.killTweensOf(button);
      gsap.to(button, {
        scale: 1.05,
        duration: 0.6,
        ease: "CubicOut"
      });

      if (!isAnimating) {
        isAnimating = true;
        const chars = buttonText.querySelectorAll('span');

        chars.forEach((char, i) => {
          gsap.to(char, {
            opacity: 0,
            yoyo: true,
            repeat: 1,
            duration: 0.2,
            delay: i * 0.02,
            onComplete: () => {
              if (i === chars.length - 1) {
                isAnimating = false;
              }
            }
          });
        });
      }
    });

    button.addEventListener("mouseleave", () => {
      // Stop any existing animations and scale down immediately
      gsap.killTweensOf(button);
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: "SineIn"
      });
    });
  });
});
// Lazy Load video with class lazy
pageFunctions.addFunction("lazyVideo", function () {
  var lazyVideos = [].slice.call(document.querySelectorAll("[data-video=lazy]"));
  
  if ("IntersectionObserver" in window) {
    var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (video) {
        if (video.isIntersecting) {
          for (var source in video.target.children) {
            var videoSource = video.target.children[source];
            if (typeof videoSource.tagName === "string" && videoSource.tagName ===
              "SOURCE") {
              videoSource.src = videoSource.dataset.src;
            }
          }
  
          video.target.load();
          lazyVideoObserver.unobserve(video.target);
        }
      });
    });
  
    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
  });
  
// Calendy
document.addEventListener("DOMContentLoaded", function () {
document.querySelectorAll("[data-calendly='true']").forEach(button => {
  button.addEventListener("click", function () {
    Calendly.initPopupWidget({ url: "https://calendly.com/graeve" });
  });
});
});
