  pageFunctions.addFunction("lazyVideo", function () {
    var lazyVideos = [].slice.call(document.querySelectorAll("[data-video=lazy]"));
    if ("IntersectionObserver" in window) {
      var options = {
        rootMargin: "300px",
        threshold: 0
      };

      var loadedVideos = new Set(); // Track already loaded videos

      var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (video) {
          if (video.isIntersecting) {
            const videoElement = video.target;
            const videoId = videoElement.id || videoElement.dataset.src;

            // Skip if this video was already loaded
            if (loadedVideos.has(videoId)) {
              return;
            }

            // Handle case where data-src is directly on the video element
            if (videoElement.dataset.src) {
              videoElement.src = videoElement.dataset.src;
            }

            // Handle source children if present
            for (var source in videoElement.children) {
              var videoSource = videoElement.children[source];
              if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                videoSource.src = videoSource.dataset.src;
              }
            }

            // Add loaded event listener to confirm video has loaded successfully
            videoElement.addEventListener('loadeddata', function() {
              // Mark this video as loaded
              loadedVideos.add(videoId);
            });

            videoElement.load();
            lazyVideoObserver.unobserve(videoElement);
          }
        });
      }, options);

      lazyVideos.forEach(function (lazyVideo) {
        lazyVideoObserver.observe(lazyVideo);
      });
    }
  });

pageFunctions.addFunction("globalRefreshTriggers", function () {
  function refreshScrollTrigger() {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 75);
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
  
  const searchInput = document.querySelector("[filter-search]");
  
  if (searchInput) {
    searchInput.addEventListener("input", debounce(refreshScrollTrigger, 200));
  }
  
  // Refresh ScrollTrigger on radio button change
  const filterElement = document.querySelector("[fs-cmsfilter-element=filters]");
  if (filterElement) {
    const radioButtons = filterElement.querySelectorAll("input[type=radio]");
    const checkButtons = filterElement.querySelectorAll("input[type=checkbox]");
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", refreshScrollTrigger);
    });
    checkButtons.forEach((check) => {
      check.addEventListener("change", refreshScrollTrigger);
    });
  }
  
  // Add refresh on .nav_search_input and .filters_search input events
  const navSearchInputs = document.querySelectorAll(".nav_search_input, .filters_search");
  if (navSearchInputs.length) {
    navSearchInputs.forEach((input) => {
      input.addEventListener("input", debounce(refreshScrollTrigger, 200));
    });
  }
  
  // Add refresh on .main_pagination_button and .t_nav_content_item click events
  const clickElements = document.querySelectorAll(".main_pagination_button, .t_nav_content_item");
  if (clickElements.length) {
    clickElements.forEach((element) => {
      element.addEventListener("click", refreshScrollTrigger);
    });
  }
});
