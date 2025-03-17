document.addEventListener("DOMContentLoaded", function () {
  // Notes: TPT = time per task && POT = % of time

  const WORK_DAYS_PER_YEAR = 230; // Shared between calcs - avg work amount
  const potForm = document.querySelector("#POT-form form");
  const tptForm = document.querySelector("#TPT-form form");

  // START - Time per Task selectors and functions =========================

  // User input selectors
  const tptIndustryDropdown = document.getElementById("tpt-industry");
  const tptUsersInput = document.getElementById("tpt-users");
  const tptUsersTaskTime = document.getElementById("tpt-time-taken");
  const tptAiImpact = document.getElementById("tpt-impact");
  const tptTimesTasksDone = document.getElementById("tpt-times-done");
  const tptAverageSalary = document.getElementById("tpt-salary");
  const tptBillableRate = document.getElementById("tpt-billable");
  const tptRoiYears = document.getElementById("tpt-years");

  // Result selectors
  const tptCurrentCostResult = document.getElementById("tpt-current-cost");
  const tptAiCostResult = document.getElementById("tpt-ai-cost");
  const tptOpportunityCostResult = document.getElementById("tpt-opportunity-cost");

  // Display span for range values
  const tptSalaryValueDisplay = document.getElementById("tpt-salary-value");
  const tptBillableValueDisplay = document.getElementById("tpt-billable-value");
  const tptYearsValueDisplay = document.getElementById("tpt-years-value");

  // Current days, AI days, and FTE displays
  const tptCurrentDaysDisplay = document.getElementById("tpt-current-days");
  const tptCurrentFTEDisplay = document.getElementById("tpt-current-fte");
  const tptAiDaysDisplay = document.getElementById("tpt-ai-days");
  const tptAiFTEDisplay = document.getElementById("tpt-ai-fte");

  // calculate activity days based on time per task
  function calculateTptActivityDays(timeTaken) {
    const tptUsers = parseFloat(tptUsersInput.value);
    const tptTasksPerWeek = parseFloat(tptTimesTasksDone.value);
    // eg. 50 x 30 x 5 x 52 / 60 / 8 = 812.5
    return Math.round((tptUsers * timeTaken * tptTasksPerWeek * 52) / 60 / 8);
  }

  // calculate cost per year based on activity days and salary
  function calculateTptCostPerYear(timeTaken) {
    const tptActivityDays = calculateTptActivityDays(timeTaken);
    const tptSalaryPerYear = parseFloat(tptAverageSalary.value) * 1000; // bands of 1k eg. 100 = 100k
    // eg. 813 x 100,000 / 230 = 353,478
    return Math.round(tptActivityDays * (tptSalaryPerYear / WORK_DAYS_PER_YEAR));
  }

  // calculate opportunity cost based on fte and daily billing rate for work year
  function calculateTptOpportunityCost(tptCurrentFTE, tptAiFTE) {
    // eg. 353478 - 58696 x 3 x 100 = 884,346
    return (tptCurrentFTE - tptAiFTE) * WORK_DAYS_PER_YEAR * parseFloat(tptBillableRate.value);
  }

  // calculate FTE based on days
  function calculateTptFTE(days) {
    return days / WORK_DAYS_PER_YEAR;
  }

  // global so it can be accessed in displayTptResults
  let tptChartInstance;

  // Display TPT results
  function displayTptResults() {
    const tptTimePerTaskNow = parseFloat(tptUsersTaskTime.value);
    const tptTimePerTaskWithAI = parseFloat(tptAiImpact.value);

    // Calculate days and FTEs
    const tptCurrentDays = calculateTptActivityDays(tptTimePerTaskNow);
    const tptAiDays = calculateTptActivityDays(tptTimePerTaskWithAI);
    const tptCurrentFTE = calculateTptFTE(tptCurrentDays);
    const tptAiFTE = calculateTptFTE(tptAiDays);

    // Calculate costs
    const tptCostNow = calculateTptCostPerYear(tptTimePerTaskNow);
    const tptCostWithAI = calculateTptCostPerYear(tptTimePerTaskWithAI);
    const tptOpportunityCost = calculateTptOpportunityCost(tptCurrentFTE, tptAiFTE);

    // Update DOM elements with calculated values
    tptCurrentDaysDisplay.textContent = `${tptCurrentDays} days`;
    tptAiDaysDisplay.textContent = `${tptAiDays} days`;
    tptCurrentFTEDisplay.textContent = `${tptCurrentFTE.toFixed(1)} FTE`;
    tptAiFTEDisplay.textContent = `${tptAiFTE.toFixed(1)} FTE`;
    tptCurrentCostResult.textContent = `$${tptCostNow.toLocaleString()}`;
    tptAiCostResult.textContent = `$${tptCostWithAI.toLocaleString()}`;
    tptOpportunityCostResult.textContent = `$${tptOpportunityCost.toLocaleString()}`;

    // Update chart data and refresh it
    if (tptChartInstance) {
      tptChartInstance.data.datasets[0].data = [tptCostWithAI, tptCostNow];
      tptChartInstance.update();
    }
  }

  // Update range display values
  function updateTptRangeDisplays() {
    const trackColourFilled = "#7423F9";
    const trackColour = "#e6e6e6";

    // Display values
    tptSalaryValueDisplay.textContent = `${tptAverageSalary.value}k`;
    tptBillableValueDisplay.textContent = `$${tptBillableRate.value}`;
    tptYearsValueDisplay.textContent = `${tptRoiYears.value} years`;

    // Update background color progression
    const salaryProgress = (tptAverageSalary.value / tptAverageSalary.max) * 100;
    const billableProgress = (tptBillableRate.value / tptBillableRate.max) * 100;
    const yearsProgress = (tptRoiYears.value / tptRoiYears.max) * 100;

    setSliderBackground(tptAverageSalary, salaryProgress, trackColourFilled, trackColour);
    setSliderBackground(tptBillableRate, billableProgress, trackColourFilled, trackColour);
    setSliderBackground(tptRoiYears, yearsProgress, trackColourFilled, trackColour);
  }

  // Event listeners for inputs
  [tptUsersInput, tptUsersTaskTime, tptAiImpact, tptTimesTasksDone, tptAverageSalary, tptBillableRate, tptRoiYears].forEach((input) => {
    input.addEventListener("input", () => {
      updateTptRangeDisplays();
      displayTptResults();
    });
  });

  // START - Time per Task Polar Chart
  function initialiseTptChart() {
    const tptChart = document.getElementById("tpt-chart");

    const data = {
      labels: ["Cost With AI", "Cost Without AI"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["rgba(116, 35, 249, 0.6)", "rgb(255, 255, 255, 0.30)"],
        },
      ],
    };

    const customTooltipColors = ["rgba(116, 35, 249, 1)", "rgb(255, 255, 255, 1)"];
    const customTooltipBorders = ["rgba(116, 35, 249, 1)", "rgba(0, 0, 0, 1)"];

    tptChartInstance = new Chart(tptChart, {
      type: "polarArea",
      data: data,
      options: {
        responsive: true,
        elements: {
          arc: {
            borderColor: "transparent",
          },
        },
        scales: {
          r: {
            grid: {
              color: "#fff",
            },
            ticks: {
              color: "#fff",
              font: {
                size: 10,
                family: "Arial",
                // weight: "bold",
              },
              showLabelBackdrop: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            titleColor: "#000",
            bodyColor: "#000",
            padding: 15,
            xAlign: "right",
            // caretPadding: 10,
            // footerSpacing: 100,
            // titleSpacing: 50,
            // bodySpacing: 50,
            boxWidth: 20,
            boxHeight: 20,
            boxPadding: 15,
            titleFont: {
              size: 14,
              // weight: "bold",
            },
            bodyFont: {
              size: 14,
              // family: "Arial",
            },
            callbacks: {
              label: function (context) {
                // Retrieve the original label and value
                const value = context.raw;

                // Format the value with a dollar sign and add commas for thousands
                const formattedValue = `$${value.toLocaleString()}`;

                // Return the label and formatted value
                return `${formattedValue}`;
              },
              labelColor: function (context) {
                const dataIndex = context.dataIndex;

                return {
                  backgroundColor: customTooltipColors[dataIndex],
                  borderColor: customTooltipBorders[dataIndex],
                  borderWidth: 2,
                };
              },
            },
          },
        },
      },
    });
  }

  // Initial setup
  updateTptRangeDisplays();
  initialiseTptChart();
  displayTptResults();

  // END - Time per Task selectors and functions ============================

  // START - Percentage of Time selectors and functions =====================

  // User input selectors
  const potIndustryDropdown = document.getElementById("pot-industry");
  const potUsersInput = document.getElementById("pot-users");
  const potUsersPercentageTime = document.getElementById("pot-percentage-spent");
  const potAiImpact = document.getElementById("pot-impact");
  const potAverageSalary = document.getElementById("pot-salary");
  const potBillableRate = document.getElementById("pot-billable");
  const potRoiYears = document.getElementById("pot-years");

  // Result selectors
  const potCurrentCostResult = document.getElementById("pot-current-cost");
  const potAiCostResult = document.getElementById("pot-ai-cost");
  const potOpportunityCostResult = document.getElementById("pot-opportunity-cost");

  // Display span for range values
  const potPercentageValueDisplay = document.getElementById("pot-percentage-spent-value");
  const potPercentageImpactValueDisplay = document.getElementById("pot-percentage-impact-value");
  const potSalaryValueDisplay = document.getElementById("pot-salary-value");
  const potBillableValueDisplay = document.getElementById("pot-billable-value");
  const potYearsValueDisplay = document.getElementById("pot-years-value");

  // Current days, AI days, and FTE displays
  const potCurrentFTEDisplay = document.getElementById("pot-current-fte");
  const potAiFTEDisplay = document.getElementById("pot-ai-fte");

  // calculate cost of activities per a year
  function calculatePotCostPerYear(percentageTime) {
    const potUsers = parseFloat(potUsersInput.value);
    const potSalaryPerYear = parseFloat(potAverageSalary.value) * 1000; // bands of 1k eg. 100 = 100k
    // eg. 50 x 0.15 x 100,000 = 750,000
    return Math.round(potUsers * (percentageTime / 100) * potSalaryPerYear);
  }

  // calculate opportunity cost based on fte and daily billing rate for work year
  function calculatePotOpportunityCost(percentageTimeNow, percentageTimeAI) {
    const potUsers = parseFloat(potUsersInput.value);
    const potBillableRatePerDay = parseFloat(potBillableRate.value);
    // eg. 353478 - 58696 x 3 x 100 = 884,346
    const opportunityCost = WORK_DAYS_PER_YEAR * (percentageTimeNow - percentageTimeAI) * (potBillableRatePerDay / 100) * potUsers;
    return Math.round(opportunityCost);
  }

  // calculate FTE based on average salary
  function calculatePotFTE(cost, averageSalary) {
    return cost / (averageSalary * 1000);
  }

  // global so it can be accessed in displaypotResults
  let potChartInstance;

  // Display POT results
  function displayPotResults() {
    const potTimePerTaskNow = parseFloat(potUsersPercentageTime.value);
    const potTimePerTaskWithAI = parseFloat(potAiImpact.value);
    const potSalaryPerYear = parseFloat(potAverageSalary.value);

    // Calculate costs
    const potCostNow = calculatePotCostPerYear(potTimePerTaskNow);
    const potCostWithAI = calculatePotCostPerYear(potTimePerTaskWithAI);
    const potOpportunityCost = calculatePotOpportunityCost(potTimePerTaskNow, potTimePerTaskWithAI);

    // Calculate FTEs
    const potCurrentFTE = calculatePotFTE(potCostNow, potSalaryPerYear);
    const potAiFTE = calculatePotFTE(potCostWithAI, potSalaryPerYear);

    // Update DOM elements with calculated values
    potCurrentFTEDisplay.textContent = `${potCurrentFTE.toFixed(1)} FTE`;
    potAiFTEDisplay.textContent = `${potAiFTE.toFixed(1)} FTE`;
    potCurrentCostResult.textContent = `$${potCostNow.toLocaleString()}`;
    potAiCostResult.textContent = `$${potCostWithAI.toLocaleString()}`;
    potOpportunityCostResult.textContent = `$${potOpportunityCost.toLocaleString()}`;

    // Update chart data and refresh it
    if (potChartInstance) {
      potChartInstance.data.datasets[0].data = [potCostWithAI, potCostNow];
      potChartInstance.update();
    }
  }

  // Update range display values
  function updatePotRangeDisplays() {
    const trackColourFilled = "#7423F9";
    const trackColour = "#e6e6e6";

    // Display values
    potPercentageValueDisplay.textContent = `${potUsersPercentageTime.value}%`;
    potPercentageImpactValueDisplay.textContent = `${potAiImpact.value}%`;
    potSalaryValueDisplay.textContent = `${potAverageSalary.value}k`;
    potBillableValueDisplay.textContent = `$${potBillableRate.value}`;
    potYearsValueDisplay.textContent = `${potRoiYears.value} years`;

    // Update background color progression
    const percentageTimeProgress = (potUsersPercentageTime.value / potUsersPercentageTime.max) * 100;
    const impactProgress = (potAiImpact.value / potAiImpact.max) * 100;
    const salaryProgress = (potAverageSalary.value / potAverageSalary.max) * 100;
    const billableProgress = (potBillableRate.value / potBillableRate.max) * 100;
    const yearsProgress = (potRoiYears.value / potRoiYears.max) * 100;

    // Apply progress to sliders
    setSliderBackground(potUsersPercentageTime, percentageTimeProgress, trackColourFilled, trackColour);
    setSliderBackground(potAiImpact, impactProgress, trackColourFilled, trackColour);
    setSliderBackground(potAverageSalary, salaryProgress, trackColourFilled, trackColour);
    setSliderBackground(potBillableRate, billableProgress, trackColourFilled, trackColour);
    setSliderBackground(potRoiYears, yearsProgress, trackColourFilled, trackColour);
  }

  // Event listeners for inputs
  [potUsersInput, potUsersPercentageTime, potAiImpact, potAverageSalary, potBillableRate, potRoiYears].forEach((input) => {
    input.addEventListener("input", () => {
      updatePotRangeDisplays();
      displayPotResults();
    });
  });

  // START - Percentage of Time Polar Chart
  function initialisePotChart() {
    const potChart = document.getElementById("pot-chart");

    const data = {
      labels: ["Cost With AI", "Cost Without AI"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["rgba(116, 35, 249, 0.6)", "rgb(255, 255, 255, 0.30)"],
        },
      ],
    };

    const customTooltipColors = ["rgba(116, 35, 249, 1)", "rgb(255, 255, 255, 1)"];
    const customTooltipBorders = ["rgba(116, 35, 249, 1)", "rgba(0, 0, 0, 1)"];

    potChartInstance = new Chart(potChart, {
      type: "polarArea",
      data: data,
      options: {
        responsive: true,
        elements: {
          arc: {
            borderColor: "transparent",
          },
        },
        scales: {
          r: {
            grid: {
              color: "#fff",
            },
            ticks: {
              color: "#fff",
              font: {
                size: 10,
                family: "Arial",
                // weight: "bold",
              },
              showLabelBackdrop: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            titleColor: "#000",
            bodyColor: "#000",
            padding: 15,
            xAlign: "right",
            // caretPadding: 10,
            // footerSpacing: 100,
            // titleSpacing: 50,
            // bodySpacing: 50,
            boxWidth: 20,
            boxHeight: 20,
            boxPadding: 15,
            titleFont: {
              size: 14,
              // weight: "bold",
            },
            bodyFont: {
              size: 14,
              // family: "Arial",
            },
            callbacks: {
              label: function (context) {
                // Retrieve the original label and value
                const value = context.raw;

                // Format the value with a dollar sign and add commas for thousands
                const formattedValue = `$${value.toLocaleString()}`;

                // Return the label and formatted value
                return `${formattedValue}`;
              },
              labelColor: function (context) {
                const dataIndex = context.dataIndex;

                return {
                  backgroundColor: customTooltipColors[dataIndex],
                  borderColor: customTooltipBorders[dataIndex],
                  borderWidth: 2,
                };
              },
            },
          },
        },
      },
    });
  }

  // Initial setup
  updatePotRangeDisplays();
  initialisePotChart();
  displayPotResults();

  // END - Percentage of Time selectors and functions =======================

  // START - ROI Results popup logic =========================
  const tptButton = document.getElementById("tpt-submit");
  const potButton = document.getElementById("pot-submit");
  const popup = document.querySelector(".calculator_popup");
  const popupBackground = document.querySelector(".calculator_popup-background");
  const popupClose = document.querySelector(".calculator_popup-close");
  const successMessage = document.querySelector(".form-response.is-success");
  const errorMessage = document.querySelector(".form-response.is-error");

  function getBrowserInfo() {
    return `${navigator.userAgent}, Platform: ${navigator.platform}, Language: ${navigator.language}`;
  }

  function getCurrentTime() {
    return new Date().toLocaleString();
  }

  function populateSharedFields() {
    const resultLocation = document.querySelectorAll("#result-user-location");
    const resultIP = document.querySelectorAll("#result-user-ip");
    const resultBrowserInfo = document.querySelectorAll("#result-browser-info");
    const resultTime = document.querySelectorAll("#result-submission-time");

    resultLocation.forEach((element) => {
      element.value = document.querySelector(".user-location").textContent;
    });
    resultIP.forEach((element) => {
      element.value = document.querySelector(".user-ip").textContent;
    });

    resultBrowserInfo.forEach((element) => {
      element.value = getBrowserInfo();
    });

    resultTime.forEach((element) => {
      element.value = getCurrentTime();
    });
  }

  const industryDropdown = document.querySelectorAll("#result-industry");

  // Populate TPT Hidden Fields
  function populateTptFields() {
    // Results
    document.getElementById("result-tpt-current-cost").value = tptCurrentCostResult.textContent;
    document.getElementById("result-tpt-ai-cost").value = tptAiCostResult.textContent;
    document.getElementById("result-tpt-opportunity-cost").value = tptOpportunityCostResult.textContent;
    document.getElementById("result-tpt-current-days").value = tptCurrentDaysDisplay.textContent;
    document.getElementById("result-tpt-ai-days").value = tptAiDaysDisplay.textContent;
    document.getElementById("result-tpt-current-fte").value = tptCurrentFTEDisplay.textContent;
    document.getElementById("result-tpt-ai-fte").value = tptAiFTEDisplay.textContent;

    // Handle shared industry dropdown
    industryDropdown.forEach((industry) => {
      industry.value = tptIndustryDropdown.value;
    });

    // Values entered
    document.getElementById("result-tpt-users").value = tptUsersInput.value;
    document.getElementById("result-tpt-task-time").value = tptUsersTaskTime.value;
    document.getElementById("result-tpt-ai-impact").value = tptAiImpact.value;
    document.getElementById("result-tpt-times-task-done").value = tptTimesTasksDone.value;
    document.getElementById("result-tpt-avg-salary").value = tptSalaryValueDisplay.textContent;
    document.getElementById("result-tpt-billable-rate").value = tptBillableValueDisplay.textContent;
  }

  // Populate POT Hidden Fields
  function populatePotFields() {
    // Results
    document.getElementById("result-pot-current-cost").value = potCurrentCostResult.textContent;
    document.getElementById("result-pot-ai-cost").value = potAiCostResult.textContent;
    document.getElementById("result-pot-opportunity-cost").value = potOpportunityCostResult.textContent;
    document.getElementById("result-pot-current-fte").value = potCurrentFTEDisplay.textContent;
    document.getElementById("result-pot-ai-fte").value = potAiFTEDisplay.textContent;

    // Handle shared industry dropdown
    industryDropdown.forEach((industry) => {
      industry.value = potIndustryDropdown.value;
    });

    // Values entered
    document.getElementById("result-pot-users").value = potUsersInput.value;
    document.getElementById("result-pot-percentage-spent").value = potPercentageValueDisplay.textContent;
    document.getElementById("result-pot-ai-impact").value = potPercentageImpactValueDisplay.textContent;
    document.getElementById("result-pot-avg-salary").value = potSalaryValueDisplay.textContent;
    document.getElementById("result-pot-billable-rate").value = potBillableValueDisplay.textContent;
  }

  // Open popup and populate fields based on clicked button
  function openPopupAndPopulate(buttonType) {
    populateSharedFields(); // populate shared for both
    if (buttonType === "TPT") {
      populateTptFields();
      tptForm.style.display = "flex"; // Show POT form
      potForm.style.display = "none"; // Ensure TPT form is hidden
    } else if (buttonType === "POT") {
      populatePotFields();
      potForm.style.display = "flex"; // Show TPT form
      tptForm.style.display = "none"; // Ensure TPT form is hidden
    }

    popup.classList.add("is-active"); // Show popup
  }

  function showPopup(buttonType) {
    openPopupAndPopulate(buttonType);
  }

  function resetRecaptchas() {
    document.querySelectorAll('.calculator_popup-content iframe[title="reCAPTCHA"]').forEach(function (iframe) {
      iframe.src = iframe.src;
    });
  }

  // Function to hide the popup, reset form state
  function hidePopup() {
    // Hide success and error messages
    if (successMessage) successMessage.style.display = "none";
    if (errorMessage) errorMessage.style.display = "none";

    // Reset forms state
    potForm.reset();
    potForm.querySelector(".w-checkbox-input").classList.remove("w--redirected-checked"); // reset privacy checkbox
    tptForm.reset();
    tptForm.querySelector(".w-checkbox-input").classList.remove("w--redirected-checked"); // reset privacy checkbox

    resetRecaptchas(); // Reset reCAPTCHA - hacky way (thanks webflow)

    // Remove the active class to hide the popup
    popup.classList.remove("is-active");
  }

  // Event listeners to show the popup when either button is clicked
  tptButton.addEventListener("click", () => showPopup("TPT"));
  potButton.addEventListener("click", () => showPopup("POT"));
  popupBackground.addEventListener("click", hidePopup);
  popupClose.addEventListener("click", hidePopup);
  // END - ROI Results popup logic =========================

  // START - Helper functions =========================
  function setSliderBackground(sliderElement, progress, filledColor = "#7423F9", trackColor = "#e6e6e6") {
    sliderElement.style.background = `linear-gradient(to right, ${filledColor} ${progress}%, ${trackColor} ${progress}%)`;
  }

  function syncDropdowns(source, target) {
    target.value = source.value;
  }

  // Keep both industry downs in sync
  potIndustryDropdown.addEventListener("change", () => {
    syncDropdowns(potIndustryDropdown, tptIndustryDropdown);
  });

  tptIndustryDropdown.addEventListener("change", () => {
    syncDropdowns(tptIndustryDropdown, potIndustryDropdown);
  });
});

// Get users location to use later
function geoip(json) {
  const userLocation = json.city + ", " + json.country;
  const userIP = json.ip;
  const userLocationElement = document.querySelector(".user-location");
  const userIPElement = document.querySelector(".user-ip");

  userLocationElement.textContent = userLocation;
  userIPElement.textContent = userIP;
}
