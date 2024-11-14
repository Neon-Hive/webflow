var userLocationAvailable = false; // Flag to indicate if user location is available

async function initMap() {
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Variables for Google maps
  var map, mapElem, infoWindow, marker;
  var markers = [],
    infoWindows = [];
  let markersDone = 0;

  var mapOptions = {
    mapTypeId: "roadmap",
    mapId: "f31c4abe96cf22c9",
    gestureHandling: window.innerWidth <= 425 ? "greedy" : "auto",
  };

  function initialize(mapElemId) {
    if (!mapElemId) return; // Exit if element doesn't exist

    geocoder = new google.maps.Geocoder();

    console.log("Initializing the map: ", mapElemId);

    // Display a map on the page
    mapElem = document.getElementById(mapElemId);
    map = new google.maps.Map(mapElem, mapOptions);

    // Loop through our array of locations
    for (i = 0; i < locations.length; i++) {
      var location = locations[i];

      let lat = locations[i].latitude;
      let lng = locations[i].longitude;

      createMarker(lat, lng, i);

      // Generate an info-window content for the marker
      var infoWindow = new google.maps.InfoWindow();
      infoWindow.setContent(
        '<div class="map-wrap">' +
          '<div class="map-header-wrapper">' +
          '<div class="map-title-inner">' +
          '<div class="map-title">' +
          location.name +
          "</div>" +
          '<div class="text-color-orange">Resonate Studio</div>' +
          "</div>" +
          (location.image ? '<img class="studio_nearby-image" src="' + location.image + '" alt="' + location.name + '">' : "") +
          "</div>" +
          '<div class="map-address">' +
          '<a href="' +
          location.directions +
          '" tabindex="0" target="_blank">' +
          '<i class="fa-solid fa-location-dot"></i>' +
          location.address +
          "</a>" +
          "</div>" +
          '<div class="map-button-wrapper">' +
          '<a href="' +
          location.url +
          '" class="button-map-details">View studio details</a>' +
          '<a href="' +
          location.directions +
          '" class="button-map-directions" target="_blank">Get Directions' +
          '<i class="fa-solid fa-arrow-right"></i>' +
          "</a>" +
          "</div>" +
          "</div>"
      );
      infoWindows.push(infoWindow);
    }

    // Map clustering with counts
    const renderer = {
      render: function ({ count, position }) {
        const cluster = document.createElement("div");
        cluster.className = "mapCluster";
        cluster.textContent = count;

        return new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: cluster,
        });
      },
    };

    const markerCluster = new markerClusterer.MarkerClusterer({
      map,
      markers,
      renderer,
      zoomOnClick: false,
      onClusterClick: (event, cluster, map) => {
        map.fitBounds(cluster.bounds);
        map.setZoom(10);
      },
    });

    navigator.geolocation.getCurrentPosition(
      function (position) {
        userLocationAvailable = true; // user has geolocated
        handleLocation(position);
        // Initialize the search input filtering after location is handled
        filterListings();
        filterRegions();
      },
      function (err) {
        map.setCenter(new google.maps.LatLng(-41.2735073, 173.2817839));
        map.setZoom(6);
        console.log(err);
        sortLocationsAlphabetically();
        // Initialize the search input filtering after error
        filterListings();
        filterRegions();
      }
    );

    console.log("Initializing map: ", mapElemId, " finished");
  }

  // Function to point users to their clicked location on the map
  $(".studio_nearby-item").click(function () {
    var activeMarkerTitle = $(this).find("#location-title").text();
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].title == activeMarkerTitle) {
        google.maps.event.trigger(markers[i], "click");
        map.setZoom(15);
        map.setCenter(markers[i].position); // Center the map on the clicked marker

        // Check if the device is mobile - as we want the pin offset so users can see map modal
        if (window.innerWidth <= 425) {
          const offsetLng = markers[i].position.lng;
          const offsetLat = markers[i].position.lat + 0.004;

          setTimeout(() => {
            map.setCenter(new google.maps.LatLng(offsetLat, offsetLng)); // Set map center after a short delay
          }, 300);

          document.getElementById("open-mobile-map").click(); // Trigger the mobile map popup
        }
      }
    }
  });

  function createMarker(x, y, i) {
    const parser = new DOMParser();
    const markerSvgString =
      '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="66" viewBox="0 0 50 66" fill="none"><g filter="url(#filter0_i_324_412)"><path d="M24.75 0C18.1882 0.00769411 11.8972 2.70538 7.25733 7.50123C2.61742 12.2971 0.00744394 18.7994 0 25.5818C0 47.4716 22.5 64.0039 23.4591 64.6957C23.8374 64.9697 24.2881 65.1166 24.75 65.1166C25.2119 65.1166 25.6626 64.9697 26.0409 64.6957C27 64.0039 49.5 47.4716 49.5 25.5818C49.4926 18.7994 46.8826 12.2971 42.2427 7.50123C37.6028 2.70538 31.3118 0.00769411 24.75 0Z" fill="#FF714D"/></g><path d="M17.75 34.6259V18.2519H20.4748V21.4284C20.7705 20.4242 21.3408 19.6164 22.1856 19.0051C23.0516 18.3938 23.9599 18.0881 24.9104 18.0881C25.3751 18.0881 25.787 18.1318 26.146 18.2191V21.1337C25.7658 20.959 25.2695 20.8717 24.6569 20.8717C23.5586 20.8717 22.587 21.3629 21.7421 22.3454C20.8972 23.3278 20.4748 24.7141 20.4748 26.5044V34.6259H17.75Z" fill="white"/><path d="M30.2664 34.0774C29.9291 34.4427 29.5114 34.6253 29.0135 34.6253C28.5155 34.6253 28.0899 34.4427 27.7365 34.0774C27.3991 33.7121 27.2305 33.2722 27.2305 32.7575C27.2305 32.2594 27.4072 31.8277 27.7605 31.4624C28.1139 31.0806 28.5316 30.8896 29.0135 30.8896C29.4954 30.8896 29.913 31.0806 30.2664 31.4624C30.6198 31.8277 30.7965 32.2594 30.7965 32.7575C30.7965 33.2722 30.6198 33.7121 30.2664 34.0774Z" fill="white"/><defs><filter id="filter0_i_324_412" x="0" y="0" width="49.5" height="65.6167" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="0.5"/><feGaussianBlur stdDeviation="1.5"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow_324_412"/></filter></defs></svg>';

    const pinMarker = parser.parseFromString(markerSvgString, "image/svg+xml").documentElement;

    marker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      content: pinMarker,
      position: new google.maps.LatLng(x, y),
      title: locations[i].name,
    });

    marker._index = i;
    markers.push(marker);
    markersDone++;

    // Click event on marker
    google.maps.event.addListener(
      marker,
      "click",
      (function (marker, i) {
        return function () {
          // Close last opened infowindow if any
          if (infoWindow) infoWindow.close();

          // Centre on marker position
          map.setCenter(marker.position);

          // Zoom in slowly with stepped increments
          let targetZoom = 16;
          let currentZoom = map.getZoom();
          let zoomStep = 0.5;
          let zoomInterval = setInterval(() => {
            if (currentZoom >= targetZoom) {
              clearInterval(zoomInterval);
            } else {
              currentZoom += zoomStep;
              map.setZoom(currentZoom);
            }
          }, 100);

          // Open clicked infowindow
          infoWindow = infoWindows[i];
          infoWindow.open(map, marker);
        };
      })(marker, i)
    );

    if (markersDone == locations.length) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleLocation, noLocation);
      } else {
        console.log("This browser does not support geolocation");
        fitToMarkers();
      }
    }
  }

  // Function to fit the map markers to the map
  function fitToMarkers() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  // Function to re-order all locations based on distance (if user opts in)
  function sortLocationsByDistance() {
    // Get the container element
    var container = document.getElementById("location-list");

    // Get all the items inside the container
    var items = Array.from(container.getElementsByClassName("w-dyn-item"));

    // Sort the items based on the data-order attribute in ascending order
    items.sort(function (a, b) {
      var orderA = parseInt(a.getAttribute("data-distance"));
      var orderB = parseInt(b.getAttribute("data-distance"));
      return orderA - orderB;
    });

    // Create a document fragment to hold the sorted items temporarily
    var fragment = document.createDocumentFragment();

    // Append the sorted items to the fragment
    items.forEach(function (item) {
      fragment.appendChild(item);
    });

    // Clear the container & Append the sorted items from the fragment back to the container
    container.innerHTML = "";
    container.appendChild(fragment);
  }

  // Function to take user coords, find marker distance from coords and add distance to list element's data-distance attribute
  function findDistances(userLat, userLng) {
    let closestLocation = null;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < locations.length; i++) {
      let currentStudio = locations[i];
      let distanceFromUser = getDistance(userLat, userLng, currentStudio.latitude, currentStudio.longitude);
      let roundDistance = Math.round(distanceFromUser);
      let listElement = document.querySelector('div[data-id="' + currentStudio.ID + '"]');

      listElement.setAttribute("data-distance", distanceFromUser);
      let $listElement = $(listElement);
      $listElement
        .find(".studio-distance")
        .text(roundDistance + "km away")
        .show();

      // Check if this is the closed studio
      if (distanceFromUser < minDistance) {
        minDistance = distanceFromUser;
        closestLocation = currentStudio;
      }
    }
    return closestLocation;
  }

  // Function to get the users coords to show them closest
  function handleLocation(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    const closestLocation = findDistances(userLat, userLng);

    // Sort by distance
    sortLocationsByDistance();

    if (closestLocation) {
      map.setCenter(new google.maps.LatLng(closestLocation.latitude, closestLocation.longitude));
      map.setZoom(14);
    } else {
      map.setCenter(new google.maps.LatLng(userLat, userLng));
      map.setZoom(13);
    }
  }

  // Calculate users distances
  function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  // Helper function for distances
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Function for error handling for users that opt out of location
  function noLocation(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        fitToMarkers();
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        fitToMarkers();
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        fitToMarkers();
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        fitToMarkers();
        break;
    }
  }

  // Function to sort locations alphabetically by title
  function sortLocationsAlphabetically() {
    var container = document.getElementById("location-list");

    // Get all the items inside the container
    var items = Array.from(container.getElementsByClassName("w-dyn-item"));

    // Sort the items based on the text of the #location-title element in ascending order
    items.sort(function (a, b) {
      var titleA = a.querySelector("#location-title").textContent.toUpperCase();
      var titleB = b.querySelector("#location-title").textContent.toUpperCase();
      return titleA.localeCompare(titleB);
    });

    // Create a document fragment to hold the sorted items temporarily
    var fragment = document.createDocumentFragment();

    // Append the sorted items to the fragment
    items.forEach(function (item) {
      fragment.appendChild(item);
    });

    // Clear the container & Append the sorted items from the fragment back to the container
    container.innerHTML = "";
    container.appendChild(fragment);
  }

  // Function to filter listings and markers based on search input
  function filterListings() {
    var inputDesktop = document.getElementById("location-search-input-desktop");
    var inputMobile = document.getElementById("location-search-input-mobile");
    var container = document.getElementById("location-list");
    var items = Array.from(container.querySelectorAll(".w-dyn-item .studio_nearby-item"));
    var noResults = document.getElementById("no-results");
    var resultsCount = document.getElementById("results-count");

    // Function to normalize text for comparison avoids issues like Whangarei not showing Whangārei
    function normalizeText(text) {
      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .toUpperCase();
    }

    function filterItems() {
      var filterDesktop = inputDesktop.value.toUpperCase();
      var filterMobile = inputMobile.value.toUpperCase();
      var filter = filterDesktop || filterMobile; // Combine both filters
      var matchesFound = false;
      var matchCount = 0;
      var bounds = new google.maps.LatLngBounds();

      items.forEach(function (item) {
        var address = normalizeText(item.getAttribute("data-address"));
        if (address.includes(filter)) {
          item.style.display = "";
          matchesFound = true;
          matchCount++;
        } else {
          item.style.display = "none";
        }
      });

      // Show or hide the no results element
      if (matchesFound) {
        noResults.style.display = "none";
      } else {
        noResults.style.display = "block";
      }

      // Update the results count
      resultsCount.textContent = `Select from ${matchCount} Resonate studio’s across NZ`;

      // Also filter markers
      markers.forEach(function (marker) {
        var address = locations[marker._index].address.toUpperCase();
        if (address.includes(filter)) {
          marker.map = map;
          bounds.extend(marker.position);
        } else {
          marker.map = null;
        }
      });

      // Hide marker clusters during search
      document.querySelectorAll(".mapCluster").forEach((cluster) => {
        cluster.style.display = matchesFound ? "none" : "";
      });

      // Adjust map viewport to fit the bounds
      if (matchCount > 0) {
        map.fitBounds(bounds);
        if (matchCount === 1) {
          map.setZoom(14); // Zoom level for one marker
        }
      }
    }

    // Function to set initial results count on load
    function setInitialResultsCount() {
      var totalItems = items.length;
      resultsCount.textContent = `Select from ${totalItems} Resonate studio’s across NZ`;
    }

    setInitialResultsCount();

    // Add event listeners for both search inputs
    inputDesktop.addEventListener("input", filterItems);
    inputMobile.addEventListener("input", filterItems);
  }

  // Function to filter regions based on radio button selection
  function filterRegions() {
    const radioButtons = document.querySelectorAll('#map-radio-filters input[type="radio"]');
    const container = document.getElementById("location-list");
    const items = Array.from(container.getElementsByClassName("studio_nearby-item"));
    console.log(items);

    radioButtons.forEach(function (radioButton) {
      radioButton.addEventListener("change", function () {
        var selectedRegion = document
          .querySelector('#map-radio-filters input[type="radio"]:checked')
          .nextElementSibling.textContent.trim()
          .toLowerCase();

        var bounds = new google.maps.LatLngBounds();
        var markersVisible = 0;

        markers.forEach(function (marker) {
          const markerRegion = locations[marker._index].region.toLowerCase();
          if (selectedRegion === "select all" || markerRegion === selectedRegion) {
            marker.map = map;
            bounds.extend(marker.position);
            markersVisible++;
          } else {
            marker.map = null;
          }
        });

        items.forEach(function (item) {
          const itemRegion = item.getAttribute("data-region").toLowerCase();
          if (selectedRegion === "select all" || itemRegion === selectedRegion) {
            item.style.display = ""; // Show the item
          } else {
            item.style.display = "none"; // Hide the item
          }
        });

        if (selectedRegion === "select all") {
          // zoom out to show whole of NZ with coords centered
          map.setCenter(new google.maps.LatLng(-41.2735073, 173.2817839));
          map.setZoom(6);
        } else {
          map.fitBounds(bounds);
          if (markersVisible === 1) {
            map.setZoom(14); // Zoom level for one marker
          }

          if (markersVisible > 1) {
            map.setZoom(10); // Default zoom level for multiple markers
          }
        }
      });
    });
  }
  // Initialize map before filtering studios
  initialize("map_canvas-desktop");
}

// ### Initialise map and Webflow related ###
document.addEventListener("DOMContentLoaded", function () {
  initMap(); // Init our map once everything is sussed
  // Stop users submitting the form wrapper
  document.querySelector("#map-form form").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Handles the automatic reset and closing of the locations dropdown
  const dropdownToggle = document.querySelector(".finder_main-filter-toggle");
  const dropdownContent = document.querySelector(".finder_main-filter-list");
  const radioButtons = document.querySelectorAll(".main_filter-list-content input[type='radio']");

  const closeDropdown = () => {
    if (dropdownContent.classList.contains("w--open") && dropdownToggle.classList.contains("w--open")) {
      // Trigger the Webflow 'w-close' event
      const event = new Event("w-close", { bubbles: true, cancelable: true });
      dropdownToggle.dispatchEvent(event);

      // Close the dropdown
      dropdownContent.classList.remove("w--open");
      dropdownToggle.classList.remove("w--open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    }
  };

  const updateDropdownToggle = (selectedValue) => {
    const toggleChildDiv = dropdownToggle.querySelector("div");
    if (toggleChildDiv) {
      toggleChildDiv.textContent = selectedValue;
    }
  };

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const selectedValue = event.target.nextElementSibling.textContent;
      updateDropdownToggle(selectedValue);
      closeDropdown();
    });
  });
});
