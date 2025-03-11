// Handle locationData from cms load. Needed to get more than 100+ items
window.fsAttributes = window.fsAttributes || [];
window.locationData = window.locationData || [];

// Wait for FinSweet CMS Load to finish loading nest & filter
window.fsAttributes.push([
  "cmsload",
  (cmsLoadInstances) => {
    // First initialize cmsnest
    window.fsAttributes.cmsnest.init().then(() => {
      console.log("CMS Nest successfully initialized!");

      // Hide all skeleton wrappers once loading is complete
      document.querySelectorAll(".locations_loading-wrapper").forEach((wrapper) => {
        wrapper.style.display = "none";
      });

      // Hide all skeleton wrappers once loading is complete - handle location list in map code
      document.querySelectorAll(".n4_loading-skeleton:not(.is-location-item)").forEach((wrapper) => {
        wrapper.style.display = "none";
      });

      // Show all CMS locations once loading is complete
      document.querySelectorAll(".locations_nest").forEach((location) => {
        location.style.display = "";
      });

      const [filterInstance] = cmsLoadInstances;

      // Then initialize cmsfilter when cmsnest is done
      window.fsAttributes.cmsfilter.init().then(() => {
        console.log("CMS Filter successfully initialized!");

        // Hook into the 'renderitems' event - this fires after FinSweet filtering updates the DOM
        filterInstance.listInstance.on("renderitems", () => {
          console.log("FinSweet Filtering Applied. Checking empty countries...");
          checkForEmptyCountries();
        });
      });

      console.log("CMS Nest loading complete.");
    });

    // Listen for loaded event on each cms load instance
    cmsLoadInstances.forEach((instance) => {
      instance.on("loaded", () => {
        addItemsToLocationData();
      });
    });

    // Run once on initial load
    addItemsToLocationData();
  },
]);

function addItemsToLocationData() {
  const fallbackUrl = "https://cdn.prod.website-files.com/67ab6f4970b90367b528f15a/67aecfc6a895ff8fabea7a46_Staffing%20Support.webp";
  const invalidPlaceholder = "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg";

  document.querySelectorAll(".location_block_result_item_wrap").forEach((item) => {
    const name = item.getAttribute("data-name");

    if (!locationData.some((entry) => entry.name === name)) {
      let imageUrl = item.querySelector("img")?.getAttribute("src") || "";

      // Ensure the fallback image is applied if imageUrl is empty or is the webflow placeholder
      if (!imageUrl || imageUrl.trim() === "" || imageUrl === invalidPlaceholder) {
        imageUrl = fallbackUrl;
      }

      locationData.push({
        name: name,
        lat: parseFloat(item.getAttribute("data-lat")) || 0,
        lng: parseFloat(item.getAttribute("data-lng")) || 0,
        imageUrl: imageUrl,
        link: item.getAttribute("data-link") ? `/location/${item.getAttribute("data-link")}` : "",
        country: item.getAttribute("data-country") || "",
        state: item.getAttribute("data-state") || "",
        city: item.getAttribute("data-city") || "",
        postcodes: item.getAttribute("data-postcode") || "",
      });
    }
  });
  // console.log("Updated locationData:", locationData);

  // Dispatch a custom event to signal that locationData is ready
  window.dispatchEvent(new Event("locationDataLoaded"));
}

document.addEventListener("DOMContentLoaded", function () {
  window.userLocation = null; // Ensure global variable exists

  // Handle nesting load states for FinSweet
  const loadingWrappers = document.querySelectorAll(".locations_loading-wrapper");
  const cmsLocations = document.querySelectorAll(".locations_nest");

  cmsLocations.forEach((location) => {
    location.style.display = "none";
  });

  // Loop through each loading wrapper and append 10 skeletons
  loadingWrappers.forEach((wrapper) => {
    for (let i = 0; i < 10; i++) {
      const skeleton = document.createElement("div");
      skeleton.classList.add("n4-locations_loading-skeleton");
      wrapper.appendChild(skeleton);
    }
  });

  // Function to initialize the map once location data is available
  async function initMapWhenReady() {
    if (window.locationData.length > 0) {
      console.log("✅ Location data available, initializing map...");
      await initMap();
      checkForLocationInURL();
    } else {
      console.log("⏳ Waiting for location data before initializing map...");
      window.addEventListener(
        "locationDataLoaded",
        async () => {
          console.log("📍 locationData is now loaded, initializing map...");
          await initMap();
          checkForLocationInURL();
        },
        { once: true }
      ); // Ensure this runs only once
    }
  }

  // Call function to wait for location data before initializing map
  initMapWhenReady();

  // Ensure Google Maps API is fully loaded (for geocoding fallback)
  async function loadGoogleMapsAPI() {
    if (!window.google || !google.maps || !google.maps.Geocoder) {
      return new Promise((resolve, reject) => {
        if (window.google && google.maps && google.maps.Geocoder) {
          return resolve();
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD-y5SThmDqWvwCQgQ95LF8tsGHV68TJwk&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("✅ Google Maps API Loaded");
          resolve();
        };
        script.onerror = () => reject(new Error("❌ Google Maps API failed to load"));

        document.head.appendChild(script);
      });
    }
  }

  // Function to get the user's current location and update the address input
  async function getUserLocation(forceRequest = false) {
    if (!navigator.geolocation) {
      showError("❌ Geolocation is not supported by your browser.");
      return null;
    }

    try {
      // Check permission state before making request
      const permission = await navigator.permissions.query({ name: "geolocation" });

      if (permission.state === "denied") {
        console.warn("❌ Geolocation access denied.");
        alert("Location access is blocked. Please enable it in your browser settings.");
        return null;
      }

      // If permission is "prompt", only request if the user explicitly clicks the button
      if (permission.state === "prompt" && !forceRequest) {
        console.log("⏳ Waiting for user to interact before requesting location.");
        return null;
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("📍 User's Location:", lat, lng);

            hideError(); // Hide any existing error messages

            try {
              const address = await getAddressFromCoordinates(lat, lng);
              if (address) {
                const input = document.getElementById("geo-address");
                if (input) {
                  input.value = address;
                  input.dataset.lat = lat;
                  input.dataset.lng = lng;
                }
              } else {
                showError("❌ Unable to retrieve address from your location.");
              }

              // Automatically center & re-fit map when location is found
              if (window.map) {
                console.log("📌 Fitting map to user location");
                const userLatLng = new google.maps.LatLng(lat, lng);
                window.map.setCenter(userLatLng);
                window.map.setZoom(10);
              }

              // Set global user location
              window.userLocation = { lat, lng };

              // Immediately update marker list to show closest locations if needed
              window.updateMarkersList();

              resolve({ lat, lng });
            } catch (error) {
              console.error("❌ Error fetching address:", error);
              showError("❌ Unable to retrieve address from your location.");
              resolve(null);
            }
          },
          (error) => {
            console.error("❌ Geolocation error:", error);
            showError("❌ Unable to get your location. Please enable location services.");
            resolve(null);
          }
        );
      });
    } catch (error) {
      console.error("❌ Error checking geolocation permission:", error);
      return null;
    }
  }

  // Function to get an address from latitude & longitude (Google Maps Geocoder)
  async function getAddressFromCoordinates(lat, lng) {
    try {
      await loadGoogleMapsAPI(); // ✅ Ensure Google API is loaded

      if (!google.maps.Geocoder) {
        console.error("❌ Google Maps Geocoder is not available.");
        return null;
      }

      return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results.length > 0) {
            const address = results[0].formatted_address;
            console.log("✅ Address from Coordinates:", address);
            resolve(address);
          } else {
            console.error("❌ No address found or geocoding failed:", status);
            reject("Unable to retrieve address.");
          }
        });
      });
    } catch (error) {
      console.error("❌ Error in getAddressFromCoordinates:", error);
      return null;
    }
  }

  // Show an error message above button container
  function showError(message) {
    let errorDiv = document.getElementById("address-error");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
  }

  // Hide the error message, if present
  function hideError() {
    const errorDiv = document.getElementById("address-error");
    if (errorDiv) {
      errorDiv.style.display = "none";
      errorDiv.textContent = "";
    }
  }

  // Function to calculate distance (Haversine Formula)
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Distance in km, rounded to 1 decimal place
  }

  function updateMarkersList() {
    if (!window.map || !window.markers) return;
    var resultCountElem = document.getElementById("map_result_count"); // Marker count div
    var heroListElem = document.querySelector(".location_hero_list"); // Hero list div

    const bounds = map.getBounds();
    if (!bounds) return;

    let visibleMarkers = markers.filter((marker) => bounds.contains(marker.getPosition()));

    // Clear the hero list before updating
    heroListElem.innerHTML = "";

    if (visibleMarkers.length > 0) {
      visibleMarkers.forEach((marker) => {
        if (!marker.extraData) {
          console.warn("❌ Missing extraData for marker:", marker);
          return; // Skip this marker
        }

        const { name, link, imageUrl, distance, country, state, city, postcodes } = marker.extraData;
        const heroItem = document.createElement("div");
        heroItem.classList.add("location_hero_item");

        // Store location data in `n4-filter-` attributes for filtering
        heroItem.setAttribute("n4-filter-name", name ? name.toLowerCase() : "");
        heroItem.setAttribute("n4-filter-city", city ? city.toLowerCase() : "");
        heroItem.setAttribute("n4-filter-state", state ? state.toLowerCase() : "");
        heroItem.setAttribute("n4-filter-country", country ? country.toLowerCase() : "");
        heroItem.setAttribute("n4-filter-postcodes", postcodes ? postcodes.toLowerCase() : "");

        heroItem.innerHTML = `
          <div class="location_hero_item_image_wrap">
            <img src="${imageUrl}" loading="lazy" alt="${name}" class="location_hero_item_image">
          </div>
          <div class="location_hero_item_content">
            <h4 class="location_hero_item_heading u-text-style-large">${name}</h4>
            ${distance ? `<p class="u-text-style-small">${distance} km away</p>` : ""}
            <a href="${link}" class="learnmore_wrap is-underline w-inline-block">
              <div class="learnmore_text u-text-style-main">See location</div>
              <div class="learnmore_underline"></div>
              <div class="learnmore_icon w-embed">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 19" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
                  <rect y="0.5" width="18" height="18" rx="9" fill="#EC008C"></rect>
                  <path d="M10.5644 9.11433L8.55285 7.04545L9.08317 6.5L12 9.50002L9.08317 12.5L8.55285 11.9545L10.5644 9.88572H6V9.11433H10.5644Z" fill="white"></path>
                </svg>
              </div>
            </a>
          </div>
        `;
        heroListElem.appendChild(heroItem);
      });

      resultCountElem.textContent = `Showing ${visibleMarkers.length} Locations`;
    } else if (window.userLocation) {
      // if we have user location display closest 3 locations
      console.warn("❌ No visible markers. Displaying the closest 3 locations.");

      // ✅ Recalculate distances after location change
      window.markers.forEach((marker) => {
        marker.extraData.distance = calculateDistance(
          window.userLocation.lat,
          window.userLocation.lng,
          marker.getPosition().lat(),
          marker.getPosition().lng()
        );
      });

      // Sort all markers by distance from the user
      const closestThree = window.markers
        .filter((marker) => marker.extraData.distance !== null && !isNaN(marker.extraData.distance))
        .sort((a, b) => a.extraData.distance - b.extraData.distance)
        .slice(0, 3);

      if (closestThree.length > 0) {
        closestThree.forEach((marker, index) => {
          const { name, link, imageUrl, distance } = marker.extraData;

          const heroItem = document.createElement("div");
          heroItem.classList.add("location_hero_item");

          heroItem.innerHTML = `
            <div class="location_hero_item_image_wrap">
              <img src="${imageUrl}" loading="lazy" alt="${name}" class="location_hero_item_image">
            </div>
            <div class="location_hero_item_content">
              <h4 class="location_hero_item_heading u-text-style-large">${name}</h4>
              <p class="u-text-style-small">${distance} km away</p>
              <a href="${link}" class="learnmore_wrap is-underline w-inline-block">
                <div class="learnmore_text u-text-style-main">See location</div>
                <div class="learnmore_underline"></div>
                <div class="learnmore_icon w-embed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 19" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
                    <rect y="0.5" width="18" height="18" rx="9" fill="#EC008C"></rect>
                    <path d="M10.5644 9.11433L8.55285 7.04545L9.08317 6.5L12 9.50002L9.08317 12.5L8.55285 11.9545L10.5644 9.88572H6V9.11433H10.5644Z" fill="white"></path>
                  </svg>
                </div>
              </a>
            </div>
          `;
          heroListElem.appendChild(heroItem);
        });

        resultCountElem.textContent = "Showing Closest Locations to your current location.";
      } else {
        resultCountElem.textContent = "No locations found in this area.";
      }
    } else {
      console.warn("❌ No locations available in this area.");
      resultCountElem.textContent = "No locations found in this area.";
    }
  }

  async function initMap(mapElemId = "map_canvas") {
    // Request needed libraries.
    const { Map, Marker } = await google.maps.importLibrary("maps");
    var mapElem = document.getElementById(mapElemId);

    // Define custom styles
    const customMapStyles = [
      { featureType: "administrative", elementType: "all", stylers: [{ saturation: "-100" }] },
      { featureType: "administrative.province", elementType: "all", stylers: [{ visibility: "off" }] },
      { featureType: "landscape", elementType: "all", stylers: [{ saturation: -100 }, { lightness: 65 }, { visibility: "on" }] },
      { featureType: "poi", elementType: "all", stylers: [{ saturation: -100 }, { lightness: "50" }, { visibility: "simplified" }] },
      { featureType: "road", elementType: "all", stylers: [{ saturation: "-100" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ hue: "#ffff00" }, { lightness: -25 }, { saturation: -97 }] },
      { featureType: "water", elementType: "labels", stylers: [{ lightness: -25 }, { saturation: -100 }] },
    ];

    const userLocation = await getUserLocation(); // Get user location if available

    var mapOptions = {
      mapTypeId: "roadmap",
      zoom: 12,
      gestureHandling: window.innerWidth <= 425 ? "greedy" : "auto",
      styles: customMapStyles, // Apply custom styles
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      rotateControl: false,
      scaleControl: false,
    };

    console.log("Initializing the map:", mapElemId);
    var map = new google.maps.Map(mapElem, mapOptions);
    window.map = map; // Make map available globally

    // Custom marker icon
    const customMarkerIcon = {
      url: "https://cdn.prod.website-files.com/67ab6f4970b90367b528f15a/67c8f176df8419775322fa3d_NND-marker.svg",
      scaledSize: new google.maps.Size(50, 65),
      anchor: new google.maps.Point(25, 60),
    };

    let markers = [];
    let bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    // Add markers dynamically from locationData source & store in a new array with distance and fallback image
    locationData.forEach((location) => {
      let distance = null;

      if (userLocation) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng);
      }

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        icon: customMarkerIcon,
      });

      // Store extra data inside marker
      marker.extraData = {
        name: location.name,
        link: location.link,
        imageUrl: location.imageUrl,
        distance: distance,
        country: location.country,
        state: location.state,
        city: location.city,
        postcodes: location.postcodes || "",
      };

      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="max-width: 250px;">
            <div class="u-vflex-stretch-center u-gap-3">
              <div style="overflow: hidden; border-radius: .75rem;">
                <img style="max-height: 8rem; aspect-ratio: 16 / 9; object-position: 0% 50%;" src="${location.imageUrl}" alt="${location.name}">
              </div>
                <div>
                  <h4 class="location_hero_item_heading u-text-style-large">${location.name}</h4>
                  <p class="u-text-style-tiny">${location.city}, ${location.state}, ${location.country}</p>
                </div>
              ${distance ? `<p style="margin: 5px 0; font-size: 14px;"><strong>${distance} km away</strong></p>` : ""}
              <a href="${location.link}" class="learnmore_wrap is-underline w-inline-block">
                <div class="learnmore_text u-text-style-main">See location</div>
                <div class="learnmore_underline"></div>
                <div class="learnmore_icon w-embed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 19" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
                    <rect y="0.5" width="18" height="18" rx="9" fill="#EC008C"></rect>
                    <path d="M10.5644 9.11433L8.55285 7.04545L9.08317 6.5L12 9.50002L9.08317 12.5L8.55285 11.9545L10.5644 9.88572H6V9.11433H10.5644Z" fill="white"></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        `);
        infoWindow.open(map, marker);
      });

      markers.push(marker); // Push marker to array
      bounds.extend(marker.getPosition());
    });

    // Make markers available globally
    window.markers = markers;
    console.log("Markers added successfully.");

    // Fallback if markers ARE available and nesting is slow, show map and locations immediately
    document.querySelectorAll(".n4_loading-skeleton").forEach((loader) => {
      if (loader.style.display != "none") {
        loader.style.display = "none";
      }
    });

    // Show result count once loading is complete
    document.querySelector(".location_hero_count_wrap").style.display = "block";

    // If user location exists, prioritize it
    if (userLocation) {
      console.log("✅ Centering on user location:", userLocation);
      map.setCenter(userLocation);
      map.setZoom(10);
    } else {
      if (markers.length > 0) {
        map.fitBounds(bounds);
      }
    }

    // Remove old event listeners and attach the new function
    map.addListener("bounds_changed", updateMarkersList);
    setTimeout(updateMarkersList, 1000);

    // Map clustering with counts and scale based on amount
    const renderer = {
      render: function ({ count, position }) {
        // Define a base size and compute additional size based on count
        const baseSize = 40;
        // Increase by 10 for every 10 markers (capped at 80px)
        const additionalSize = Math.floor(count / 10) * 10;
        const size = Math.min(baseSize + additionalSize, 80);

        // Calculate circle parameters based on size
        const radius = size / 2;
        // Adjust text position; you may need to tweak these values for perfect centering
        const textX = radius;
        const textY = radius + size * 0.1;
        const fontSize = Math.floor(size / 3);

        // Build the SVG string with dynamic sizing
        const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#EC008C" />
          <text x="${textX}" y="${textY}" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-family="Arial" font-weight="bold">${count}</text>
        </svg>
        `;
        const icon = {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(size, size),
        };

        return new google.maps.Marker({
          map: map,
          position: position,
          icon: icon,
        });
      },
    };

    const markerCluster = new markerClusterer.MarkerClusterer({
      map: map,
      markers: markers,
      renderer,
      zoomOnClick: false,
      onClusterClick: (event, cluster) => {
        // On cluster click, fit the map bounds to the markers in that cluster and set an appropriate zoom.
        map.fitBounds(cluster.bounds);
        map.setZoom(10);
      },
    });

    // Return the map instance for further use
    return map;
  }

  // Function to check URL for lat/lng and center map if available
  async function checkForLocationInURL() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get("lat"));
    const lng = parseFloat(params.get("lng"));

    if (!isNaN(lat) && !isNaN(lng) && window.map) {
      console.log("Centering map from URL parameters:", lat, lng);
      window.map.setCenter({ lat, lng });
      window.map.setZoom(10);
    } else if (window.map && window.markers) {
      // Fit map bounds to show all markers if user location is not provided
      const bounds = new google.maps.LatLngBounds();
      window.markers.forEach((marker) => bounds.extend(marker.getPosition()));
      window.map.fitBounds(bounds);
    }
  }

  // Call geolocation when user clicks the "Use My Location" button
  document.getElementById("get_location_btn").addEventListener("click", async () => {
    hideError(); // Hide any existing error messages
    await getUserLocation(true); // Forces prompt
  });

  // Listen for address form inputs and filter the hero list
  function filterHeroList(searchTerm) {
    const heroItems = document.querySelectorAll(".location_hero_item");
    searchTerm = searchTerm.trim().toLowerCase();

    let bounds = new google.maps.LatLngBounds();
    let matchesFound = false;

    window.markers.forEach((marker) => {
      const { name, city, state, country, postcodes } = marker.extraData;
      const locationText = `${name} ${city} ${state} ${country} ${postcodes}`.toLowerCase();

      if (locationText.includes(searchTerm)) {
        marker.setMap(window.map); // Show matching markers
        bounds.extend(marker.getPosition());
        matchesFound = true;
      } else {
        marker.setMap(null); // Hide non-matching markers
      }
    });

    heroItems.forEach((item) => {
      const name = item.getAttribute("n4-filter-name") || "";
      const city = item.getAttribute("n4-filter-city") || "";
      const state = item.getAttribute("n4-filter-state") || "";
      const country = item.getAttribute("n4-filter-country") || "";
      const postcodes = item.getAttribute("n4-filter-postcodes") || "";

      // Check if the search term matches any field
      const matches =
        name.includes(searchTerm) ||
        city.includes(searchTerm) ||
        state.includes(searchTerm) ||
        country.includes(searchTerm) ||
        postcodes.split(", ").some((p) => p.startsWith(searchTerm));
    });

    // Update result count
    const visibleCount = document.querySelectorAll(".location_hero_item:not([style*='display: none'])").length;
    document.getElementById("map_result_count").textContent = `Showing ${visibleCount} Locations`;

    // Adjust map to fit filtered locations
    if (matchesFound) {
      window.map.fitBounds(bounds);
      if (visibleCount === 1) {
        window.map.setZoom(14); // If only one location, zoom in
      }
    }
  }

  const addressInput = document.getElementById("geo-address");
  addressInput.addEventListener("input", function () {
    filterHeroList(this.value);
    hideError(); // Hide any existing error messages
  });

  // #####
  // Handle on page dropdown filters after CMS filter is loaded
  // #####
  const countrySelect = document.getElementById("country");
  const stateSelect = document.getElementById("area");

  function filterCountries() {
    const selectedCountry = countrySelect.value;

    // Show or hide countries based on selection
    document.querySelectorAll(".location_block_item_wrap").forEach((countryItem) => {
      const country = countryItem.getAttribute("n4-filter-country");
      countryItem.style.display = selectedCountry === "" || selectedCountry === country ? "block" : "none";
    });
  }

  function checkForEmptyCountries() {
    document.querySelectorAll(".location_block_item_wrap").forEach((countryItem) => {
      const locationContainer = countryItem.querySelector("[fs-cmsnest-collection='location']");

      if (!locationContainer || locationContainer.children.length === 0) {
        console.log("Hiding empty country:", countryItem);
        countryItem.style.display = "none"; // Hide if no locations exist
      } else {
        countryItem.style.display = "block"; // Show if locations exist
      }
    });
  }

  function filterStates() {
    // Ensure filtering logic runs after FinSweet filtering completes
    setTimeout(checkForEmptyCountries, 200);
  }

  // Event listeners
  if (countrySelect) countrySelect.addEventListener("change", filterCountries);
  if (stateSelect) stateSelect.addEventListener("change", filterStates);
});
