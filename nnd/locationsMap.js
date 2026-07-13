// Console logging is restricted to the staging environment so production stays clean.
const MAP_IS_STAGING =
  window.location.hostname === "nursenextdoor-staging.webflow.io";
const MAP_LOG_PREFIX = "[LocationsMap]";

const mapLogger = {
  log: (...args) => {
    if (MAP_IS_STAGING) console.log(MAP_LOG_PREFIX, ...args);
  },
  info: (...args) => {
    if (MAP_IS_STAGING) console.info(MAP_LOG_PREFIX, ...args);
  },
  warn: (...args) => {
    if (MAP_IS_STAGING) console.warn(MAP_LOG_PREFIX, ...args);
  },
  error: (...args) => {
    if (MAP_IS_STAGING) console.error(MAP_LOG_PREFIX, ...args);
  },
};

window.fsAttributes = window.fsAttributes || [];
window.locationData = window.locationData || [];

const LOCATION_DATA_KEY = "nnd_location_data";
const LOCATION_DATA_TIMESTAMP_KEY = "nnd_location_data_timestamp";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

function isCacheValid() {
  const timestamp = sessionStorage.getItem(LOCATION_DATA_TIMESTAMP_KEY);
  if (!timestamp) return false;
  return Date.now() - Number.parseInt(timestamp, 10) < CACHE_EXPIRY_MS;
}

// Single source of truth for whether a location entry is usable. Rejects blank /
// "null" / "undefined" names and missing / (0,0) coordinates. Applied on EVERY
// path — cache load, fresh CMS ingest, and marker build — so a bad row can never
// reach the map or list regardless of where it came from.
function isValidLocationEntry(entry) {
  if (!entry) return false;
  const name =
    typeof entry.name === "string" ? entry.name.trim().toLowerCase() : "";
  if (!name || name === "null" || name === "undefined") return false;
  const lat = Number(entry.lat);
  const lng = Number(entry.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

const cachedData = sessionStorage.getItem(LOCATION_DATA_KEY);

if (cachedData && isCacheValid()) {
  try {
    // Filter here too — the cache may have been written before this guard
    // existed, or hold a row whose CMS Name field is empty.
    window.locationData = JSON.parse(cachedData).filter(isValidLocationEntry);
    mapLogger.log(
      "Loaded locationData from sessionStorage:",
      window.locationData.length,
      "items",
    );
    window.dispatchEvent(new Event("locationDataLoaded"));
  } catch (e) {
    mapLogger.warn(
      "Failed to parse sessionStorage data, will reload from CMS.",
      e,
    );
    sessionStorage.removeItem(LOCATION_DATA_KEY);
    sessionStorage.removeItem(LOCATION_DATA_TIMESTAMP_KEY);
  }
} else if (cachedData) {
  sessionStorage.removeItem(LOCATION_DATA_KEY);
  sessionStorage.removeItem(LOCATION_DATA_TIMESTAMP_KEY);
}

window.fsAttributes.push([
  "cmsload",
  (cmsLoadInstances) => {
    window.fsAttributes.cmsnest.init().then(() => {
      document
        .querySelectorAll(".locations_loading-wrapper")
        .forEach((wrapper) => {
          wrapper.style.display = "none";
        });

      document
        .querySelectorAll(".n4_loading-skeleton:not(.is-location-item)")
        .forEach((wrapper) => {
          wrapper.style.display = "none";
        });

      document.querySelectorAll(".locations_nest").forEach((location) => {
        location.style.display = "";
      });

      syncStateAttributes();

      const [filterInstance] = cmsLoadInstances;

      // CMS Filter isn't guaranteed to be loaded on the page (window.fsAttributes
      // may have no `cmsfilter`). Guard it so a missing solution can't throw.
      if (window.fsAttributes.cmsfilter?.init) {
        window.fsAttributes.cmsfilter.init().then(() => {
          filterInstance.listInstance.on("renderitems", () => {
            checkForEmptyCountries();
          });
        });
      } else {
        mapLogger.warn("FinSweet cmsfilter not loaded; skipping filter init.");
        checkForEmptyCountries();
      }
    });

    if (!cachedData || !isCacheValid()) {
      cmsLoadInstances.forEach((instance) => {
        instance.on("loaded", () => {
          addItemsToLocationData();
        });
      });

      addItemsToLocationData();
    }
  },
]);

function addItemsToLocationData() {
  const fallbackUrl =
    "https://cdn.prod.website-files.com/67ab6f4970b90367b528f15a/67aecfc6a895ff8fabea7a46_Staffing%20Support.webp";
  const invalidPlaceholder =
    "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg";

  document
    .querySelectorAll(".location_block_result_item_wrap")
    .forEach((item) => {
      const rawName = item.getAttribute("data-name");
      const name = rawName?.trim();
      const lat = Number.parseFloat(item.getAttribute("data-lat"));
      const lng = Number.parseFloat(item.getAttribute("data-lng"));

      // Skip empty/placeholder rows. Treat a missing name, blank string, or the
      // literal "null"/"undefined" text as invalid (a real CMS record with an
      // unbound Name field renders `data-name="null"`), and require real coords.
      const invalidName =
        !name ||
        name.toLowerCase() === "null" ||
        name.toLowerCase() === "undefined";
      if (invalidName || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        mapLogger.warn("Skipping location with missing data:", {
          name: rawName,
          lat,
          lng,
        });
        return;
      }

      const uniqueKey = `${name}_${lat}_${lng}`;

      if (!window.locationData.some((entry) => entry.uniqueKey === uniqueKey)) {
        let imageUrl = item.querySelector("img")?.getAttribute("src") || "";

        if (
          !imageUrl ||
          imageUrl.trim() === "" ||
          imageUrl === invalidPlaceholder
        ) {
          imageUrl = fallbackUrl;
        }

        window.locationData.push({
          uniqueKey,
          name,
          lat,
          lng,
          imageUrl,
          link: item.getAttribute("data-link")
            ? `/location/${item.getAttribute("data-link")}`
            : "",
          country: item.getAttribute("data-country") || "",
          state: item.getAttribute("data-state") || "",
          city: item.getAttribute("data-city") || "",
          postcodes: item.getAttribute("data-postcode") || "",
          stateISO: item.getAttribute("data-state-iso") || "",
        });
      }
    });

  try {
    sessionStorage.setItem(
      LOCATION_DATA_KEY,
      JSON.stringify(window.locationData),
    );
    sessionStorage.setItem(LOCATION_DATA_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    mapLogger.warn("sessionStorage save failed:", e);
  }

  window.dispatchEvent(new Event("locationDataLoaded"));
}

function syncStateAttributes() {
  const dropdownLinks = document.querySelectorAll(
    "#w-dropdown-list-5 .filters_dropdown_list_item",
  );
  const originalStates = document.querySelectorAll(
    ".cms-states .w-dyn-item[n4-filter-state-country]",
  );
  const fsSelectOptions = document.querySelectorAll("#area option");

  originalStates.forEach((originalState) => {
    const stateName = originalState.querySelector("div")?.textContent.trim();
    const country = originalState.getAttribute("n4-filter-state-country");

    if (!stateName) return;

    fsSelectOptions.forEach((option) => {
      if (option.textContent.trim() === stateName) {
        option.setAttribute("n4-filter-state-country", country);
      }
    });

    dropdownLinks.forEach((link) => {
      if (link.textContent.trim() === stateName) {
        link.setAttribute("n4-filter-state-country", country);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.userLocation = null;

  const heroListElem = document.querySelector(".location_hero_list");
  const resultCountElem = document.getElementById("map_result_count");

  // Holds the active MarkerClusterer so filtering can drive it (instead of
  // toggling marker.map directly, which the clusterer would undo on redraw).
  let markerCluster;

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function markerLat(marker) {
    return typeof marker.position?.lat === "function"
      ? marker.position.lat()
      : marker.position?.lat;
  }

  function markerLng(marker) {
    return typeof marker.position?.lng === "function"
      ? marker.position.lng()
      : marker.position?.lng;
  }

  document.querySelectorAll(".locations_nest").forEach((location) => {
    location.style.display = "none";
  });

  document.querySelectorAll(".locations_loading-wrapper").forEach((wrapper) => {
    for (let i = 0; i < 10; i++) {
      const skeleton = document.createElement("div");
      skeleton.classList.add("n4-locations_loading-skeleton");
      wrapper.appendChild(skeleton);
    }
  });

  async function loadGoogleMapsAPI() {
    if (window.google?.maps?.importLibrary) return;

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        "script[src*='maps.googleapis.com/maps/api/js']",
      );
      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyB0jAOIGrgm3Lds1w4emxDtTADvgtYUFYo&v=weekly&libraries=places,marker";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Google Maps API failed to load"));
      document.head.appendChild(script);
    });
  }

  async function initMapWhenReady() {
    if (window.locationData.length > 0) {
      await initMap();
      await checkForLocationInURL();
    } else {
      window.addEventListener(
        "locationDataLoaded",
        async () => {
          await initMap();
          await checkForLocationInURL();
        },
        { once: true },
      );
    }
  }

  async function getUserLocation(forceRequest = false) {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return null;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "denied") {
        mapLogger.warn("Geolocation access denied.");
        alert(
          "Location access is blocked. Please enable it in your browser settings.",
        );
        return null;
      }

      if (permission.state === "prompt" && !forceRequest) return null;

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            mapLogger.log("User location:", lat, lng);

            hideError();

            try {
              const address = await getAddressFromCoordinates(lat, lng);
              const input = document.getElementById("geo-address");

              if (input && address) {
                input.value = address;
                input.dataset.lat = lat;
                input.dataset.lng = lng;
              }

              if (window.map) {
                window.map.setCenter({ lat, lng });
                window.map.setZoom(10);
              }

              window.userLocation = { lat, lng };
              window.updateMarkersList();
              resolve({ lat, lng });
            } catch (error) {
              mapLogger.error("Error fetching address:", error);
              showError("Unable to retrieve address from your location.");
              resolve(null);
            }
          },
          (error) => {
            mapLogger.error("Geolocation error:", error);
            showError(
              "Unable to get your location. Please enable location services.",
            );
            resolve(null);
          },
        );
      });
    } catch (error) {
      mapLogger.error("Error checking geolocation permission:", error);
      return null;
    }
  }

  async function getAddressFromCoordinates(lat, lng) {
    await loadGoogleMapsAPI();

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Unable to retrieve address (status: ${status})`));
        }
      });
    });
  }

  function showError(message) {
    const errorDiv = document.getElementById("address-error");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
  }

  function hideError() {
    const errorDiv = document.getElementById("address-error");
    if (errorDiv) {
      errorDiv.style.display = "none";
      errorDiv.textContent = "";
    }
  }

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }

  function buildLocationCard(marker, showDistance = false) {
    const {
      name,
      link,
      imageUrl,
      distance,
      country,
      state,
      city,
      postcodes,
      stateISO,
    } = marker.extraData;

    const heroItem = document.createElement("a");
    heroItem.classList.add("location_hero_item");
    heroItem.href = link;

    heroItem.setAttribute("n4-filter-name", name ? name.toLowerCase() : "");
    heroItem.setAttribute("n4-filter-city", city ? city.toLowerCase() : "");
    heroItem.setAttribute("n4-filter-state", state ? state.toLowerCase() : "");
    heroItem.setAttribute(
      "n4-filter-country",
      country ? country.toLowerCase() : "",
    );
    heroItem.setAttribute(
      "n4-filter-postcodes",
      postcodes ? postcodes.toLowerCase() : "",
    );
    heroItem.setAttribute(
      "n4-filter-stateISO",
      stateISO ? stateISO.toLowerCase() : "",
    );

    heroItem.innerHTML = `
      <div class="location_hero_item_image_wrap">
        <img src="${imageUrl}" loading="lazy" alt="${name}" class="location_hero_item_image">
      </div>
      <div class="location_hero_item_content">
        <h4 class="location_hero_item_heading u-text-style-large">${name}, ${stateISO}</h4>
        ${showDistance && distance ? `<p class="u-text-style-small">${distance} km away from you</p>` : ""}
        <div class="learnmore_wrap is-underline w-inline-block">
          <div class="learnmore_text u-text-style-main">See Location</div>
          <div class="learnmore_underline"></div>
        </div>
      </div>
    `;

    return heroItem;
  }

  function updateMarkersList() {
    if (!window.map || !window.markers || !heroListElem || !resultCountElem)
      return;

    const bounds = window.map.getBounds();
    if (!bounds) return;

    const visibleMarkers = window.markers.filter((marker) =>
      bounds.contains(marker.position),
    );
    heroListElem.innerHTML = "";

    if (visibleMarkers.length > 0) {
      if (window.userLocation) {
        visibleMarkers.forEach((marker) => {
          marker.extraData.distance = calculateDistance(
            window.userLocation.lat,
            window.userLocation.lng,
            markerLat(marker),
            markerLng(marker),
          );
        });

        visibleMarkers.sort(
          (a, b) => a.extraData.distance - b.extraData.distance,
        );
      } else {
        visibleMarkers.sort((a, b) =>
          a.extraData.name.localeCompare(b.extraData.name),
        );
      }

      visibleMarkers.forEach((marker) => {
        heroListElem.appendChild(buildLocationCard(marker));
      });

      resultCountElem.textContent = `Showing ${visibleMarkers.length} Locations`;
      return;
    }

    if (window.userLocation) {
      window.markers.forEach((marker) => {
        marker.extraData.distance = calculateDistance(
          window.userLocation.lat,
          window.userLocation.lng,
          markerLat(marker),
          markerLng(marker),
        );
      });

      const closestThree = window.markers
        .filter(
          (marker) =>
            marker.extraData.distance !== null &&
            !Number.isNaN(marker.extraData.distance),
        )
        .sort((a, b) => a.extraData.distance - b.extraData.distance)
        .slice(0, 3);

      closestThree.forEach((marker) => {
        heroListElem.appendChild(buildLocationCard(marker, true));
      });

      resultCountElem.textContent = closestThree.length
        ? "Showing Closest Locations to your current location."
        : "No locations found in this area.";
    } else {
      resultCountElem.textContent = "No locations found in this area.";
    }
  }

  window.updateMarkersList = updateMarkersList;

  function updateLocationList(filteredMarkers) {
    if (!heroListElem || !resultCountElem) return;

    heroListElem.innerHTML = "";

    filteredMarkers.forEach((marker) => {
      heroListElem.appendChild(buildLocationCard(marker));
    });

    resultCountElem.textContent = `Showing ${filteredMarkers.length} Locations`;
  }

  window.updateLocationList = updateLocationList;

  async function initMap(mapElemId = "map_canvas") {
    await loadGoogleMapsAPI();

    const { Map: GoogleMap } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const mapElem = document.getElementById(mapElemId);
    if (!mapElem) return null;

    const map = new GoogleMap(mapElem, {
      mapId: "7ba0795cc547b1373ea4ae23",
      mapTypeId: "roadmap",
      zoom: 12,
      gestureHandling: window.innerWidth <= 425 ? "greedy" : "auto",
      clickableIcons: false, // Suppress Google's default POI's
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      rotateControl: false,
      scaleControl: false,
    });

    window.map = map;

    const markers = [];
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    // Final safety net: drop any invalid entry before it becomes a marker, so a
    // bad row from any source can never appear on the map or in the list.
    window.locationData = window.locationData.filter(isValidLocationEntry);

    window.locationData.forEach((location) => {
      const markerEl = document.createElement("img");
      markerEl.src =
        "https://cdn.prod.website-files.com/67ab6f4970b90367b528f15a/67c8f176df8419775322fa3d_NND-marker.svg";
      markerEl.alt = location.name || "Location marker";
      markerEl.style.width = "50px";
      markerEl.style.height = "65px";

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: location.lat, lng: location.lng },
        content: markerEl,
        title: location.name,
      });

      marker.extraData = {
        name: location.name,
        link: location.link,
        imageUrl: location.imageUrl,
        distance: null,
        country: location.country,
        state: location.state,
        city: location.city,
        postcodes: location.postcodes || "",
        stateISO: location.stateISO,
      };

      marker.addListener("gmp-click", () => {
        const distance = window.userLocation
          ? calculateDistance(
              window.userLocation.lat,
              window.userLocation.lng,
              location.lat,
              location.lng,
            )
          : null;

        infoWindow.setContent(`
          <div style="max-width: 250px;">
            <div class="u-vflex-stretch-center u-gap-3">
              <div style="overflow: hidden; border-radius: .75rem;">
                <img style="max-height: 8rem; aspect-ratio: 16 / 9; object-position: 0% 50%;" src="${location.imageUrl}" alt="${location.name}">
              </div>
              <div>
                <h4 class="location_hero_item_heading u-text-style-large">${location.name}, ${location.stateISO}</h4>
                <p class="u-text-style-tiny">${location.city}, ${location.state}, ${location.country}</p>
              </div>
              ${distance ? `<p style="margin: 5px 0; font-size: 14px;"><strong>${distance} km away</strong></p>` : ""}
              <a href="${location.link}" class="learnmore_wrap is-underline w-inline-block">
                <div class="learnmore_text u-text-style-main">See Location</div>
                <div class="learnmore_underline"></div>
              </a>
            </div>
          </div>
        `);

        infoWindow.open({
          anchor: marker,
          map,
        });
      });

      markers.push(marker);
      bounds.extend(marker.position);
    });

    window.markers = markers;

    document.querySelectorAll(".n4_loading-skeleton").forEach((loader) => {
      loader.style.display = "none";
    });

    const countWrap = document.querySelector(".location_hero_count_wrap");
    if (countWrap) countWrap.style.display = "block";

    if (markers.length > 0) {
      map.fitBounds(bounds);
    }

    map.addListener("bounds_changed", debounce(updateMarkersList, 300));
    setTimeout(updateMarkersList, 1000);

    if (window.markerClusterer && markers.length > 0) {
      const renderer = {
        render: ({ count, position }) => {
          const size = Math.min(40 + Math.floor(count / 10) * 10, 80);

          const clusterEl = document.createElement("div");
          clusterEl.style.width = `${size}px`;
          clusterEl.style.height = `${size}px`;
          clusterEl.style.borderRadius = "50%";
          clusterEl.style.background = "#EC008C";
          clusterEl.style.color = "#fff";
          clusterEl.style.display = "flex";
          clusterEl.style.alignItems = "center";
          clusterEl.style.justifyContent = "center";
          clusterEl.style.fontFamily = "Arial, sans-serif";
          clusterEl.style.fontWeight = "700";
          clusterEl.style.fontSize = `${Math.floor(size / 3)}px`;
          clusterEl.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.25)";
          clusterEl.textContent = count;

          return new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: clusterEl,
            title: `${count} locations`,
          });
        },
      };

      markerCluster = new markerClusterer.MarkerClusterer({
        map,
        markers,
        renderer,
        zoomOnClick: false,
        onClusterClick: (_event, cluster) => {
          map.fitBounds(cluster.bounds);

          setTimeout(() => {
            const currentZoom = map.getZoom();
            if (currentZoom > 14) map.setZoom(14);
          }, 300);
        },
      });
    }

    return map;
  }

  async function checkForLocationInURL() {
    const params = new URLSearchParams(window.location.search);
    const lat = Number.parseFloat(params.get("lat"));
    const lng = Number.parseFloat(params.get("lng"));
    const urlAddress = params.get("address"); // already decoded by URLSearchParams

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      // Treat the searched point as the user's location so the results list
      // sorts by proximity (and falls back to the closest 3) instead of showing
      // every location alphabetically.
      window.userLocation = { lat, lng };

      const waitForMap = () =>
        new Promise((resolve) => {
          const check = () => {
            if (window.map && window.markers && window.markers.length > 0)
              resolve();
            else setTimeout(check, 500);
          };
          check();
        });

      await waitForMap();

      window.map.setCenter({ lat, lng });
      window.map.setZoom(10);

      const input = document.getElementById("geo-address");
      if (input) {
        input.dataset.lat = String(lat);
        input.dataset.lng = String(lng);
        if (urlAddress) input.value = urlAddress;
      }

      window.updateMarkersList?.(); // Refresh the list now that userLocation is set
    } else if (window.map && window.markers) {
      const bounds = new google.maps.LatLngBounds();
      window.markers.forEach((marker) => {
        bounds.extend(marker.position);
      });
      window.map.fitBounds(bounds);
    }
  }

  const getLocationBtn = document.getElementById("get_location_btn");
  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", async () => {
      hideError();
      await getUserLocation(true);
    });
  }

  function filterHeroList(rawSearchTerm) {
    const searchTerm = rawSearchTerm.trim().toLowerCase();

    const bounds = new google.maps.LatLngBounds();

    const matchedMarkers = window.markers.filter((marker) => {
      const { name, city, state, country, postcodes, stateISO } =
        marker.extraData;
      const locationText =
        `${name} ${city} ${state} ${country} ${postcodes} ${stateISO}`.toLowerCase();
      return locationText.includes(searchTerm);
    });

    // Show only the matched markers. Drive the clusterer when it's active so
    // cluster counts stay in sync; otherwise toggle marker.map directly.
    if (markerCluster) {
      markerCluster.clearMarkers();
      markerCluster.addMarkers(matchedMarkers);
    } else {
      window.markers.forEach((marker) => {
        marker.map = matchedMarkers.includes(marker) ? window.map : null;
      });
    }

    matchedMarkers.forEach((marker) => {
      bounds.extend(marker.position);
    });

    updateLocationList(matchedMarkers);

    if (matchedMarkers.length > 0) {
      window.map.fitBounds(bounds);
      if (matchedMarkers.length === 1) window.map.setZoom(14);
    }
  }

  const addressInput = document.getElementById("geo-address");
  if (addressInput) {
    addressInput.addEventListener(
      "input",
      debounce(function () {
        filterHeroList(this.value);
        hideError();
      }, 500),
    );
  }

  const countrySelect = document.getElementById("country");
  const stateSelect = document.getElementById("area");

  function filterStates() {
    setTimeout(checkForEmptyCountries, 200);
  }

  function filterCountries() {
    const selectedCountry = countrySelect.value;
    const dropdownLinks = document.querySelectorAll(
      "#w-dropdown-list-5 .filters_dropdown_list_item",
    );

    document
      .querySelectorAll(".location_block_item_wrap")
      .forEach((countryItem) => {
        const country = countryItem.getAttribute("n4-filter-country");
        countryItem.style.display =
          selectedCountry === "" || selectedCountry === country
            ? "block"
            : "none";
      });

    dropdownLinks.forEach((option, index) => {
      const optionCountry = option.getAttribute("n4-filter-state-country");

      if (index === 0 || !selectedCountry) {
        option.style.display = "block";
      } else {
        option.style.display =
          optionCountry === selectedCountry ? "block" : "none";
      }
    });
  }

  function checkForEmptyCountries() {
    document
      .querySelectorAll(".location_block_item_wrap")
      .forEach((countryItem) => {
        const locationContainer = countryItem.querySelector(
          "[fs-cmsnest-collection='location']",
        );
        countryItem.style.display =
          !locationContainer || locationContainer.children.length === 0
            ? "none"
            : "block";
      });
  }

  if (countrySelect) countrySelect.addEventListener("change", filterCountries);
  if (stateSelect) stateSelect.addEventListener("change", filterStates);

  initMapWhenReady();
});
