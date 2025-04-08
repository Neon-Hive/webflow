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
