function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }

  const htmlElement = document.documentElement;
  let toggleEl;
  let togglePressed = "false";

  const scriptTag = document.querySelector("[data-theme-toggle-script]");
  if (!scriptTag) {
    console.warn(
      "Script tag with data-theme-toggle-script attribute not found"
    );
    return;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
  let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));
  
  // Find unicorn elements
  const lightUnicorns = document.querySelectorAll('[data-unicorn="light"]');
  const darkUnicorns = document.querySelectorAll('[data-unicorn="dark"]');

  // Function to set visibility of unicorns based on theme
  function setUnicornVisibility(theme) {
    if (theme === 'dark') {
      // Dark theme - show dark unicorns, hide light unicorns
      gsap.to(darkUnicorns, { autoAlpha: 1, duration: 0.5 });
      gsap.to(lightUnicorns, { autoAlpha: 0, duration: 0.5 });
    } else {
      // Light theme - show light unicorns, hide dark unicorns
      gsap.to(lightUnicorns, { autoAlpha: 1, duration: 0.5 });
      gsap.to(darkUnicorns, { autoAlpha: 0, duration: 0.5 });
    }
  }

  function setColors(themeString, animate) {
    if (typeof gsap !== "undefined" && animate) {
      gsap.to(htmlElement, {
        ...colorThemes.getTheme(themeString),
        duration: colorModeDuration,
        ease: colorModeEase,
      });
    } else {
      htmlElement.classList.remove("u-theme-dark");
      htmlElement.classList.remove("u-theme-light");
      htmlElement.classList.add("u-theme-" + themeString);
    }
    
    // Update unicorn visibility based on theme
    setUnicornVisibility(themeString);
  }

  function goDark(dark, animate) {
    if (dark) {
      localStorage.setItem("dark-mode", "true");
      htmlElement.classList.add("dark-mode");
      setColors("dark", animate);
      togglePressed = "true";
      document.documentElement.style.setProperty('--_theme---blend-mode--logo', 'darken');
      if (toggleEl) {
        toggleEl.forEach(function(element) {
          element.classList.add('is-active');
        });
      }
    } else {
      localStorage.setItem("dark-mode", "false");
      htmlElement.classList.remove("dark-mode");
      setColors("light", animate);
      togglePressed = "false";
      document.documentElement.style.setProperty('--_theme---blend-mode--logo', 'lighten');
      if (toggleEl) {
        toggleEl.forEach(function(element) {
          element.classList.remove('is-active');
        });
      }
    }
    if (typeof toggleEl !== "undefined") {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  function checkPreference(e) {
    goDark(e.matches, false);
  }
  const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
  colorPreference.addEventListener("change", (e) => {
    checkPreference(e);
  });

  let storagePreference = localStorage.getItem("dark-mode");
  if (storagePreference !== null) {
    storagePreference === "true" ? goDark(true, false) : goDark(false, false);
  } else {
    checkPreference(colorPreference);
  }

  window.addEventListener("DOMContentLoaded", (event) => {
    toggleEl = document.querySelectorAll("[data-theme-toggle-button]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "View Dark Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
    });
    document.addEventListener("click", function (e) {
      const targetElement = e.target.closest("[data-theme-toggle-button]");
      if (targetElement) {
        let darkClass = htmlElement.classList.contains("dark-mode");
        darkClass ? goDark(false, true) : goDark(true, true);
      }
    });
    
    // Initial unicorn visibility setup based on current theme
    const currentTheme = htmlElement.classList.contains("dark-mode") ? "dark" : "light";
    setUnicornVisibility(currentTheme);
  });
}
colorModeToggle();
