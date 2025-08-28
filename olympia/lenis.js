  pageFunctions.addFunction("globalLenis", function() {
    // Check if we're not in Webflow editor mode
    if (typeof Webflow === "undefined" || Webflow.env("editor") === undefined) {

      // Initialize Lenis with configuration
      let lenis = new Lenis({
        direction: "vertical",
        gestureDirection: "vertical", 
        smooth: true,
        lerp: 0.1,
        wheelMultiplier: 0.6,
        mouseMultiplier: 0.6,
        smoothTouch: false,
        touchMultiplier: 1.2,
        infinite: false
      });

      // Store Lenis instance globally
      window.lenis = lenis;
      window.lenisRunning = true;

      // Store original start and stop methods
      const originalStart = lenis.start.bind(lenis);
      const originalStop = lenis.stop.bind(lenis);

      // Override start method to track running state
      lenis.start = function() {
        window.lenisRunning = true;
        originalStart();
      };

      // Override stop method to track running state  
      lenis.stop = function() {
        window.lenisRunning = false;
        originalStop();
      };

      // Animation frame loop for Lenis
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Event listeners for data attributes

      // Elements with data-lenis-start="true" will start Lenis on click
      document.querySelectorAll("[data-lenis-start=true]").forEach(element => {
        element.addEventListener("click", () => lenis.start());
      });

      // Elements with data-lenis-stop="true" will stop Lenis on click
      document.querySelectorAll("[data-lenis-stop=true]").forEach(element => {
        element.addEventListener("click", () => lenis.stop());
      });

      // Elements with data-lenis-toggle will toggle Lenis on/off
      document.querySelectorAll("[data-lenis-toggle]").forEach(element => {
        element.addEventListener("click", function() {
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
