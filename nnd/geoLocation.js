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

// Legacy geocoding function (fallback if the new service doesn’t yield lat/lng)
async function geocodeAddress(address) {
  await loadGoogleMapsAPI();
  if (!google.maps.Geocoder) {
    throw new Error("Google Maps Geocoder is not available.");
  }
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        resolve(results[0]);
      } else {
        reject(new Error("Geocoding failed: " + status));
      }
    });
  });
}

// New Autocomplete address API call
async function fetchAutocomplete(inputText) {
  const url = "https://places.googleapis.com/v1/places:autocomplete";
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": "AIzaSyD-y5SThmDqWvwCQgQ95LF8tsGHV68TJwk",
    "X-Goog-FieldMask": "suggestions(placePrediction(place,placeId,text))",
  };

  const body = {
    input: inputText,
    includedRegionCodes: ["US", "CA"], // Restricts to US & Canada
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  return response.json();
}

// Simple debounce function to limit API calls as user types
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Display the autocomplete predictions in a container below the input
function displaySuggestions(suggestions) {
  let container = document.getElementById("autocomplete-results");
  const inputWrapper = document.querySelector(".g_location_form_input_wrap");

  if (!container) {
    container = document.createElement("div");
    container.id = "autocomplete-results";
    container.style.position = "absolute";
    container.style.top = "3.5rem";
    container.style.background = "#fff";
    container.style.border = "1px solid #eee";
    container.style.width = "100%";
    container.style.maxHeight = "300px";
    container.style.overflowY = "auto";
    container.style.zIndex = "1000";

    // Append to the input's parent using the correct input id:
    const appendContainer = document.querySelector(".g_location_form");
    if (appendContainer) {
      appendContainer.appendChild(container);
    } else {
      // fallback: append to body
      document.body.appendChild(container);
    }
  }
  container.innerHTML = "";

  if (suggestions.length > 0) {
    inputWrapper.classList.add("input-no-round");
  } else {
    inputWrapper.classList.remove("input-no-round");
    container.remove();
  }

  suggestions.forEach((suggestion) => {
    if (suggestion.placePrediction) {
      const p = suggestion.placePrediction;
      const div = document.createElement("div");
      div.textContent = p.text.text;
      div.style.padding = "8px";
      div.style.cursor = "pointer";
      div.style.borderBottom = "1px solid #eee";

      div.addEventListener("click", () => {
        const input = document.getElementById("geo-address");
        if (input) {
          input.value = p.text.text;
          input.dataset.placeId = p.placeId;
        }

        container.innerHTML = "";
        container.remove();
        inputWrapper.classList.remove("input-no-round");

        hideError(); // Hide error if a suggestion is selected
        updateFindButtonState();
      });
      container.appendChild(div);
    }
  });
}

// Update the "Find" button state based on input content
function updateFindButtonState() {
  const input = document.getElementById("geo-address");
  const findBtn = document.getElementById("find-btn");
  if (!input || !findBtn) return;
  if (input.value.trim() === "") {
    findBtn.style.opacity = "0.5";
    findBtn.style.pointerEvents = "none";
  } else {
    findBtn.style.opacity = "1";
    findBtn.style.pointerEvents = "auto";
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

// Function to get the user's current location and update the address input
async function getUserLocation() {
  if (!navigator.geolocation) {
    showError("❌ Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      console.log("📍 User's Location:", lat, lng);

      try {
        const address = await getAddressFromCoordinates(lat, lng);
        if (address) {
          const input = document.getElementById("geo-address");
          if (input) {
            input.value = address; // ✅ Set address in input field
            input.dataset.lat = lat;
            input.dataset.lng = lng;
            updateFindButtonState();
          }
        } else {
          showError("❌ Unable to retrieve address from your location.");
        }
      } catch (error) {
        console.error("❌ Error fetching address:", error);
        showError("❌ Unable to retrieve address from your location.");
      }
    },
    (error) => {
      console.error("❌ Geolocation error:", error);
      showError("❌ Unable to get your location. Please enable location services.");
    }
  );
}

// Initialize new Autocomplete (New) by listening to input events
function initNewAutocomplete() {
  const input = document.getElementById("geo-address");
  if (!input) return;
  input.addEventListener(
    "input",
    debounce(async function () {
      const query = input.value.trim();
      if (!query) {
        const container = document.getElementById("autocomplete-results");
        if (container) container.innerHTML = "";
        return;
      }
      try {
        const data = await fetchAutocomplete(query);
        if (data.suggestions) {
          displaySuggestions(data.suggestions);
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    }, 300)
  );
}

// Show an error message below the g_location_form_input_wrap container
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

// "Find" button: when clicked, use Place Details to get lat/lng then redirect
document.getElementById("find-btn").addEventListener("click", async (event) => {
  event.preventDefault();
  const input = document.getElementById("geo-address");
  const address = input.value.trim();
  const findBtn = document.getElementById("find-btn");
  const btnIcon = findBtn.querySelector(".btn_main_icon");
  const originalIconHTML = btnIcon.innerHTML; // Store the original icon

  if (!address) {
    console.error("No address entered.");
    showError("Please enter an address.");
    return;
  }

  // Replace with a spinner
  btnIcon.innerHTML = `<div class="spinner"></div>`;
  findBtn.style.opacity = "0.5";
  findBtn.style.pointerEvents = "none";

  let lat, lng;

  // Use geocoding on locations
  if (!lat || !lng) {
    try {
      const result = await geocodeAddress(address);
      lat = result.geometry.location.lat();
      lng = result.geometry.location.lng();
    } catch (error) {
      console.error("Geocoding error:", error);
      showError("The address entered is not valid. Please select a valid address from the suggestions.");
      btnIcon.innerHTML = originalIconHTML; // Restore original button content
      findBtn.style.opacity = "1";
      findBtn.style.pointerEvents = "auto";
      return;
    }
  }
  const locationPageURL = `/locations?lat=${lat}&lng=${lng}`;
  console.log("Redirecting to:", locationPageURL);
  window.location.href = locationPageURL;
});

// "Use Current Location" button event handler
document.getElementById("get_location_btn").addEventListener("click", async (event) => {
  event.preventDefault();
  console.log("Getting user location...");
  await getUserLocation();
});

// Remove the input-no-round class when the input is empty
document.getElementById("geo-address").addEventListener("input", function () {
  const inputWrapper = document.querySelector(".g_location_form_input_wrap");
  if (this.value.trim() === "") {
    inputWrapper.classList.remove("input-no-round"); // Remove class when empty
    document.getElementById("autocomplete-results").remove(); // Remove autocomplete results
  }
});

// On DOMContentLoaded, update button state and initialize new autocomplete
document.addEventListener("DOMContentLoaded", () => {
  updateFindButtonState();
  const addressInput = document.getElementById("geo-address");
  if (addressInput) {
    hideError(); // Hide error when user types a new address
    addressInput.addEventListener("input", updateFindButtonState);
  }
  initNewAutocomplete();
});
