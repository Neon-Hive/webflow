// Handle locationData from cms load. Needed to get more than 100+ items
window.fsAttributes = window.fsAttributes || [];
window.locationData = window.locationData || []; // Store location data globally

// Wait for FinSweet CMS Load to finish loading nest & filter
window.fsAttributes.push([
	"cmsload",
	(cmsLoadInstances) => {
		// First initialize cmsnest
		window.fsAttributes.cmsnest.init().then(() => {
			console.log("CMS Nest successfully initialized!");

			// Hide all skeleton wrappers once loading is complete
			document
				.querySelectorAll(".locations_loading-wrapper")
				.forEach((wrapper) => {
					wrapper.style.display = "none";
				});

			// Hide all skeleton wrappers once loading is complete - handle location list in map code
			document
				.querySelectorAll(".n4_loading-skeleton:not(.is-location-item)")
				.forEach((wrapper) => {
					wrapper.style.display = "none";
				});

			// Show all CMS locations once loading is complete
			document.querySelectorAll(".locations_nest").forEach((location) => {
				location.style.display = "";
			});

			syncStateAttributes(); // Sync state attributes for dropdown filters

			const [filterInstance] = cmsLoadInstances;

			// Then initialize cmsfilter when cmsnest is done
			window.fsAttributes.cmsfilter.init().then(() => {
				console.log("CMS Filter successfully initialized!");

				// Hook into the 'renderitems' event - this fires after FinSweet filtering updates the DOM
				filterInstance.listInstance.on("renderitems", () => {
					console.log(
						"FinSweet Filtering Applied. Checking empty countries...",
					);
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
	const fallbackUrl =
		"https://cdn.prod.website-files.com/67ab6f4970b90367b528f15a/67aecfc6a895ff8fabea7a46_Staffing%20Support.webp";
	const invalidPlaceholder =
		"https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg";

	document
		.querySelectorAll(".location_block_result_item_wrap")
		.forEach((item) => {
			// Build a unique key using name + lat + lng (or other unique fields)
			const name = item.getAttribute("data-name");
			const lat = Number.parseFloat(item.getAttribute("data-lat")) || 0;
			const lng = Number.parseFloat(item.getAttribute("data-lng")) || 0;
			const uniqueKey = `${name}_${lat}_${lng}`;

			// Only add if not already present (by uniqueKey)
			if (!locationData.some((entry) => entry.uniqueKey === uniqueKey)) {
				let imageUrl = item.querySelector("img")?.getAttribute("src") || "";

				// Ensure the fallback image is applied if imageUrl is empty or is the webflow placeholder
				if (
					!imageUrl ||
					imageUrl.trim() === "" ||
					imageUrl === invalidPlaceholder
				) {
					imageUrl = fallbackUrl;
				}

				locationData.push({
					uniqueKey: uniqueKey, // Add unique key for identification
					name: name,
					lat: lat,
					lng: lng,
					imageUrl: imageUrl,
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

	// Dispatch a custom event to signal that locationData is ready
	window.dispatchEvent(new Event("locationDataLoaded"));
}

// Function to reapply attributes to new dropdown options
function syncStateAttributes() {
	const dropdownLinks = document.querySelectorAll(
		"#w-dropdown-list-5 .filters_dropdown_list_item",
	);
	const originalStates = document.querySelectorAll(
		".cms-states .w-dyn-item[n4-filter-state-country]",
	);
	const fsSelectOptions = document.querySelectorAll("#area option");

	originalStates.forEach((originalState) => {
		const stateName = originalState.querySelector("div").textContent.trim();
		const country = originalState.getAttribute("n4-filter-state-country");

		// Find matching option in the new dropdown
		fsSelectOptions.forEach((option) => {
			if (option.textContent.trim() === stateName) {
				option.setAttribute("n4-filter-state-country", country);
			}
		});

		// Find matching .filters_dropdown_list_item elements
		dropdownLinks.forEach((link) => {
			if (link.textContent.trim() === stateName) {
				link.setAttribute("n4-filter-state-country", country);
			}
		});
	});
}

document.addEventListener("DOMContentLoaded", () => {
	window.userLocation = null; // Ensure global variable exists

	// Handle nesting load states for FinSweet
	const loadingWrappers = document.querySelectorAll(
		".locations_loading-wrapper",
	);
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
			await checkForLocationInURL();
		} else {
			console.log("⏳ Waiting for location data before initializing map...");
			window.addEventListener(
				"locationDataLoaded",
				async () => {
					console.log("📍 locationData is now loaded, initializing map...");
					await initMap();
					await checkForLocationInURL();
				},
				{ once: true }, // Ensure this runs only once
			);
		}
	}

	// Ensure Google Maps API is fully loaded (for geocoding fallback)
	async function loadGoogleMapsAPI() {
		if (!window.google || !google.maps || !google.maps.Geocoder) {
			return new Promise((resolve, reject) => {
				if (window.google && google.maps && google.maps.Geocoder) {
					return resolve();
				}

				const script = document.createElement("script");
				script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA7ZwRMGeOzHUAXbgiFsUaPD-KOab4Is6k&libraries=places`;
				script.async = true;
				script.defer = true;
				script.onload = () => {
					console.log("✅ Google Maps API Loaded");
					resolve();
				};
				script.onerror = () =>
					reject(new Error("❌ Google Maps API failed to load"));

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
			const permission = await navigator.permissions.query({
				name: "geolocation",
			});

			if (permission.state === "denied") {
				console.warn("❌ Geolocation access denied.");
				alert(
					"Location access is blocked. Please enable it in your browser settings.",
				);
				return null;
			}

			// If permission is "prompt", only request if the user explicitly clicks the button
			if (permission.state === "prompt" && !forceRequest) {
				console.log(
					"⏳ Waiting for user to interact before requesting location.",
				);
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
						showError(
							"❌ Unable to get your location. Please enable location services.",
						);
						resolve(null);
					},
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
		const errorDiv = document.getElementById("address-error");
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
			Math.cos(lat1 * (Math.PI / 180)) *
				Math.cos(lat2 * (Math.PI / 180)) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return (R * c).toFixed(1); // Distance in km, rounded to 1 decimal place
	}

	function updateMarkersList() {
		if (!window.map || !window.markers) return;
		var resultCountElem = document.getElementById("map_result_count"); // Marker count div
		var heroListElem = document.querySelector(".location_hero_list"); // Hero list div

		const bounds = map.getBounds();
		if (!bounds) return;

		const visibleMarkers = markers.filter((marker) =>
			bounds.contains(marker.getPosition()),
		);

		// Clear the hero list before updating
		heroListElem.innerHTML = "";

		if (visibleMarkers.length > 0) {
			// If geolocation is enabled, sort markers by distance before displaying
			if (window.userLocation) {
				visibleMarkers.forEach((marker) => {
					marker.extraData.distance = calculateDistance(
						window.userLocation.lat,
						window.userLocation.lng,
						marker.getPosition().lat(),
						marker.getPosition().lng(),
					);
				});

				// Sort by closest first
				visibleMarkers.sort(
					(a, b) => a.extraData.distance - b.extraData.distance,
				);
			} else {
				// If no geolocation, sort alphabetically by name
				visibleMarkers.sort((a, b) =>
					a.extraData.name.localeCompare(b.extraData.name),
				);
			}

			visibleMarkers.forEach((marker) => {
				if (!marker.extraData) {
					console.warn("❌ Missing extraData for marker:", marker);
					return; // Skip this marker
				}

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

				// Store location data in `n4-filter-` attributes for filtering
				heroItem.setAttribute("n4-filter-name", name ? name.toLowerCase() : "");
				heroItem.setAttribute("n4-filter-city", city ? city.toLowerCase() : "");
				heroItem.setAttribute(
					"n4-filter-state",
					state ? state.toLowerCase() : "",
				);
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
            <div class="learnmore_wrap is-underline w-inline-block">
              <div class="learnmore_text u-text-style-main">See Location</div>
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
			console.warn("No visible markers. Displaying the closest 3 locations.");

			// Recalculate distances after location change
			window.markers.forEach((marker) => {
				marker.extraData.distance = calculateDistance(
					window.userLocation.lat,
					window.userLocation.lng,
					marker.getPosition().lat(),
					marker.getPosition().lng(),
				);
			});

			// Sort all markers by distance from the user
			const closestThree = window.markers
				.filter(
					(marker) =>
						marker.extraData.distance !== null &&
						!isNaN(marker.extraData.distance),
				)
				.sort((a, b) => a.extraData.distance - b.extraData.distance)
				.slice(0, 3);

			if (closestThree.length > 0) {
				closestThree.forEach((marker, index) => {
					const { name, link, imageUrl, distance, stateISO } = marker.extraData;

					const heroItem = document.createElement("a");
					heroItem.classList.add("location_hero_item");
					heroItem.href = link;

					heroItem.innerHTML = `
            <div class="location_hero_item_image_wrap">
              <img src="${imageUrl}" loading="lazy" alt="${name}" class="location_hero_item_image">
            </div>
            <div class="location_hero_item_content">
              <h4 class="location_hero_item_heading u-text-style-large">${name}, ${stateISO}</h4>
              <p class="u-text-style-small">${distance} km away from you</p>
              <div class="learnmore_wrap is-underline w-inline-block">
                <div class="learnmore_text u-text-style-main">See Location</div>
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

				resultCountElem.textContent =
					"Showing Closest Locations to your current location.";
			} else {
				resultCountElem.textContent = "No locations found in this area.";
			}
		} else {
			console.warn("No locations available in this area.");
			resultCountElem.textContent = "No locations found in this area.";
		}
	}
	// Attach it to `window` so it is globally available
	window.updateMarkersList = updateMarkersList;
	window.updateLocationList = updateLocationList;

	function updateLocationList(filteredMarkers) {
		var heroListElem = document.querySelector(".location_hero_list");
		heroListElem.innerHTML = ""; // Clear current list

		filteredMarkers.forEach((marker) => {
			const { name, link, imageUrl, stateISO } = marker.extraData;

			const heroItem = document.createElement("a");
			heroItem.classList.add("location_hero_item");
			heroItem.href = link;

			heroItem.innerHTML = `
      <div class="location_hero_item_image_wrap">
        <img src="${imageUrl}" loading="lazy" alt="${name}" class="location_hero_item_image">
      </div>
      <div class="location_hero_item_content">
        <h4 class="location_hero_item_heading u-text-style-large">${name}, ${stateISO}</h4>
        <div class="learnmore_wrap is-underline w-inline-block">
          <div class="learnmore_text u-text-style-main">See Location</div>
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

		// Update result count
		document.getElementById("map_result_count").textContent =
			`Showing ${filteredMarkers.length} Locations`;
	}

	async function initMap(mapElemId = "map_canvas") {
		// Request needed libraries.
		const { Map, Marker } = await google.maps.importLibrary("maps");
		var mapElem = document.getElementById(mapElemId);

		// Define custom styles
		const customMapStyles = [
			{
				featureType: "administrative",
				elementType: "all",
				stylers: [{ saturation: "-100" }],
			},
			{
				featureType: "administrative.province",
				elementType: "all",
				stylers: [{ visibility: "off" }],
			},
			{
				featureType: "landscape",
				elementType: "all",
				stylers: [
					{ saturation: -100 },
					{ lightness: 65 },
					{ visibility: "on" },
				],
			},
			{
				featureType: "poi",
				elementType: "all",
				stylers: [
					{ saturation: -100 },
					{ lightness: "50" },
					{ visibility: "simplified" },
				],
			},
			{
				featureType: "road",
				elementType: "all",
				stylers: [{ saturation: "-100" }],
			},
			{
				featureType: "water",
				elementType: "geometry",
				stylers: [{ hue: "#ffff00" }, { lightness: -25 }, { saturation: -97 }],
			},
			{
				featureType: "water",
				elementType: "labels",
				stylers: [{ lightness: -25 }, { saturation: -100 }],
			},
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

		const markers = [];
		const bounds = new google.maps.LatLngBounds();
		const infoWindow = new google.maps.InfoWindow();

		// Add markers dynamically from locationData source & store in a new array with distance and fallback image
		locationData.forEach((location) => {
			let distance = null;

			if (userLocation) {
				distance = calculateDistance(
					userLocation.lat,
					userLocation.lng,
					location.lat,
					location.lng,
				);
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
				distance: distance, // TODO: Remove this for live
				country: location.country,
				state: location.state,
				city: location.city,
				postcodes: location.postcodes || "",
				stateISO: location.stateISO,
			};

			marker.addListener("click", () => {
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
			render: ({ count, position }) => {
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
			zoomOnClick: false, // We will handle zoom manually
			onClusterClick: (event, cluster) => {
				const bounds = cluster.bounds;
				map.fitBounds(bounds);

				// Delay to ensure map bounds are set before checking zoom level
				setTimeout(() => {
					const currentZoom = map.getZoom();
					// Prevent excessive zoom-in that hides markers
					if (currentZoom > 14) {
						map.setZoom(14); // Adjust max zoom to ensure pins stay visible
					}
				}, 300);
			},
		});

		// Return the map instance for further use
		return map;
	}

	// Function to check URL for lat/lng and center map if available
	async function checkForLocationInURL() {
		const params = new URLSearchParams(window.location.search);
		const lat = Number.parseFloat(params.get("lat"));
		const lng = Number.parseFloat(params.get("lng"));

		if (!isNaN(lat) && !isNaN(lng)) {
			// Wait for the map and markers to fully initialize
			const waitForMap = async () => {
				return new Promise((resolve) => {
					const check = () => {
						if (window.map && window.markers && window.markers.length > 0) {
							resolve();
						} else {
							setTimeout(check, 500);
						}
					};
					check();
				});
			};

			await waitForMap();
			window.map.setCenter({ lat, lng });
			window.map.setZoom(10);
		} else if (window.map && window.markers) {
			const bounds = new google.maps.LatLngBounds();
			window.markers.forEach((marker) => bounds.extend(marker.getPosition()));
			window.map.fitBounds(bounds);
		}
	}

	// Call geolocation when user clicks the "Use My Location" button
	document
		.getElementById("get_location_btn")
		.addEventListener("click", async () => {
			hideError(); // Hide any existing error messages
			await getUserLocation(true); // Forces prompt
		});

	// Listen for postcode/city/suburb/city form inputs and filter the hero list
	async function filterHeroList(searchTerm) {
		const heroItems = document.querySelectorAll(".location_hero_item");
		searchTerm = searchTerm.trim().toLowerCase();

		const bounds = new google.maps.LatLngBounds();
		let matchesFound = false;

		let matchedMarkers = window.markers.filter((marker) => {
			const { name, city, state, country, postcodes, stateISO } =
				marker.extraData;
			const locationText =
				`${name} ${city} ${state} ${country} ${postcodes} ${stateISO}`.toLowerCase();
			return locationText.includes(searchTerm);
		});

		if (matchedMarkers.length > 0) {
			// ✅ If we found an exact match, show those locations
			matchedMarkers.forEach((marker) => {
				marker.setMap(window.map);
				bounds.extend(marker.getPosition());
			});
			matchesFound = true;
		} else {
			// ❌ No match found in our data → Try Google Geocoding
			console.warn(`❌ No exact match for "${searchTerm}". Querying Google...`);
			const location = await getLatLngFromSearch(searchTerm);
			if (location) {
				// Find closest locations to the searched area
				matchedMarkers = findClosestLocations(location.lat, location.lng);
				matchedMarkers.forEach((marker) => {
					marker.setMap(window.map);
					bounds.extend(marker.getPosition());
				});
				matchesFound = true;
			}
		}

		// Hide non-matching markers
		window.markers.forEach((marker) => {
			if (!matchedMarkers.includes(marker)) {
				marker.setMap(null);
			}
		});

		// Update the left-hand list
		updateLocationList(matchedMarkers);

		// Adjust the map view
		if (matchesFound) {
			window.map.fitBounds(bounds);
			if (matchedMarkers.length === 1) {
				window.map.setZoom(14); // If only one location, zoom in
			}
		}
	}

	// Function to find the closest locations to a given lat/lng
	async function getLatLngFromSearch(searchQuery) {
		try {
			await loadGoogleMapsAPI(); // Ensure Google Maps API is loaded

			return new Promise((resolve, reject) => {
				const geocoder = new google.maps.Geocoder();
				geocoder.geocode({ address: searchQuery }, (results, status) => {
					if (status === "OK" && results.length > 0) {
						const location = results[0].geometry.location;
						console.log(`✅ Found lat/lng for "${searchQuery}":`, location);
						resolve({ lat: location.lat(), lng: location.lng() });
					} else {
						console.error(`❌ No results for "${searchQuery}".`);
						resolve(null);
					}
				});
			});
		} catch (error) {
			console.error("❌ Error in getLatLngFromSearch:", error);
			return null;
		}
	}

	function findClosestLocations(searchLat, searchLng) {
		window.markers.forEach((marker) => {
			marker.extraData.distance = calculateDistance(
				searchLat,
				searchLng,
				marker.getPosition().lat(),
				marker.getPosition().lng(),
			);
		});

		return window.markers
			.filter(
				(marker) =>
					marker.extraData.distance !== null &&
					!isNaN(marker.extraData.distance),
			)
			.sort((a, b) => a.extraData.distance - b.extraData.distance)
			.slice(0, 3); // Return the 3 closest locations
	}

	const addressInput = document.getElementById("geo-address");
	addressInput.addEventListener("input", function () {
		filterHeroList(this.value);
		hideError(); // Hide any existing error messages
	});

	// ####### Handle on page dropdown filters after CMS filter is loaded ########
	const countrySelect = document.getElementById("country");
	const stateSelect = document.getElementById("area");

	// Wait for FinSweet filters then check for empty countries
	function filterStates() {
		setTimeout(checkForEmptyCountries, 200);
	}

	function filterCountries() {
		const selectedCountry = countrySelect.value;
		const dropdownLinks = document.querySelectorAll(
			"#w-dropdown-list-5 .filters_dropdown_list_item",
		);

		// Show or hide countries based on selection
		document
			.querySelectorAll(".location_block_item_wrap")
			.forEach((countryItem) => {
				const country = countryItem.getAttribute("n4-filter-country");
				countryItem.style.display =
					selectedCountry === "" || selectedCountry === country
						? "block"
						: "none";
			});

		// Show or hide states based on selection
		dropdownLinks.forEach((option, index) => {
			const optionCountry = option.getAttribute("n4-filter-state-country");

			if (index === 0) {
				// Ensure "All States" is always visible
				option.style.display = "block";
			} else if (!selectedCountry || selectedCountry === "") {
				// If "All Countries" is selected, show all states
				option.style.display = "block";
			} else {
				// Otherwise, filter states based on the selected country
				option.style.display =
					optionCountry === selectedCountry ? "block" : "none";
			}
		});
	}

	function checkForEmptyCountries() {
		console.log("Checking for empty countries...");
		document
			.querySelectorAll(".location_block_item_wrap")
			.forEach((countryItem) => {
				const locationContainer = countryItem.querySelector(
					"[fs-cmsnest-collection='location']",
				);

				if (!locationContainer || locationContainer.children.length === 0) {
					countryItem.style.display = "none"; // Hide if no locations exist
				} else {
					countryItem.style.display = "block"; // Show if locations exist
				}
			});
	}

	// Event listeners
	if (countrySelect) countrySelect.addEventListener("change", filterCountries);
	if (stateSelect) stateSelect.addEventListener("change", filterStates);

	initMapWhenReady(); // Call function to wait for location data before initializing map
	checkForLocationInURL(); // Check URL for location data on page load
});
