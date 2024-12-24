

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

// Set initial positions
if (buttonLine) gsap.set(buttonLine, { x: "-101%" });
if (buttonIcon1) gsap.set(buttonIcon1, { x: "0%" });
if (buttonIcon2) gsap.set(buttonIcon2, { x: "-150%" });

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
hoverInTimeline.restart();
});
buttonText.addEventListener("pointerleave", () => {
hoverOutTimeline.restart();
});

}
// Button Text - Line and Icon hover - Initiate
const buttonTextElements = document.querySelectorAll(
"[data-button=hover-text]"
);
buttonTextElements.forEach((buttonText) => {
buttonTextHover(buttonText); 
});

// Button Text - Line and Icon hover (Left Direction)
function buttonTextHoverAlternative(buttonText) {
// Select elements inside the button text
const buttonLine = buttonText.querySelector("[data-button-hover=line]");
const buttonIcon1 = buttonText.querySelector("[data-button-hover=icon1]");
const buttonIcon2 = buttonText.querySelector("[data-button-hover=icon2]");

// Set initial positions (Pointing Left)
if (buttonLine) gsap.set(buttonLine, { x: "101%" });
if (buttonIcon1) gsap.set(buttonIcon1, { x: "0%" });
if (buttonIcon2) gsap.set(buttonIcon2, { x: "150%" });

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

// Lennis
pageFunctions.addFunction("globalLenis", function () {

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

//get scroll value
// lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
//   console.log({ scroll, limit, velocity, direction, progress })
// })

function raf(time) {
lenis.raf(time)
requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

/* 
* Lenis toggle states - add attributes to DOM items you want to stop/start/toggle
* NOTE - important to have corresponding FinSweet attribute on element as well 
* E.G. [fs-scrolldisable-element = enable] + [data-lenis-start]
*/ 

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
// Check if the mouse is leaving both the parent and its child (.w-dropdown-list)
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

// Refresh Triggers if there are functions that change the DOM
pageFunctions.addFunction("globalRefreshTriggers", function () {
function refreshScrollTrigger(reason) {
ScrollTrigger.refresh();
}

// Refresh when page is fully loaded
window.addEventListener("load", () => {
refreshScrollTrigger();
});

// Initialize last known dimensions
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

// Debounce function to prevent excessive calls
function debounce(func, delay) {
let timer;
return function (...args) {
clearTimeout(timer);
timer = setTimeout(() => func.apply(this, args), delay);
};
}

// Detect window resize and refresh ScrollTrigger
window.addEventListener(
"resize",
debounce(() => {
const newWidth = window.innerWidth;
const newHeight = window.innerHeight;

if (newWidth !== lastWidth) {
refreshScrollTrigger();
lastWidth = newWidth;
}

if (newHeight !== lastHeight) {
refreshScrollTrigger();
lastHeight = newHeight;
}
}, 300)
);

// Detect changes in search input
const searchInput = document.querySelector("[filter-search]");
if (searchInput) {
searchInput.addEventListener(
"input",
debounce(() => {
refreshScrollTrigger();
}, 300)
);
}

// Refresh ScrollTrigger on radio button change
const filterElement = document.querySelector("[fs-cmsfilter-element=filters]");
if (filterElement) {
const radioButtons = filterElement.querySelectorAll("input[type=radio]");
radioButtons.forEach((radio) => {
radio.addEventListener("change", () => {
setTimeout(() => {
refreshScrollTrigger();
}, 300);  // 300ms delay
});
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

// page load
let tl = gsap.timeline();
tl.to(".transition_wrap", {opacity: 0, delay: 0.2, duration: 1, easing: "power1.out"})
tl.set(".transition_wrap", {display: "none"})

// link click
$("a:not(.excluded-class)").on("click", function (e) {
let currentUrl = $(this).attr("href");
if ($(this).prop("hostname") === window.location.host && !currentUrl.includes("#") && $(this).attr("target") !== "_blank") {
e.preventDefault();
// lenis.stop();
let tl = gsap.timeline({ onComplete: () => (window.location.href = currentUrl) });
tl.set(".transition_wrap", {display: "flex"})
tl.fromTo(".transition_wrap", {opacity: 0}, {opacity: 1, duration: 0.6, easing: "power1.out"})
}
});
// On Back Button Tap
window.onpageshow = function (event) {
if (event.persisted) window.location.reload();
};

});
