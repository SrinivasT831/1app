document.getElementById("fraudForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Client-Side Validation for Numeric Inputs
  let otpFreqEl = document.getElementById("otpFreq");
  let typingObsEl = document.getElementById("typingObs");
  let typingExpEl = document.getElementById("typingExp");

  if (
    otpFreqEl.value === "" ||
    isNaN(otpFreqEl.value) ||
    Number(otpFreqEl.value) < 0
  ) {
    alert("Please enter a valid non-negative number for OTP Requests.");
    otpFreqEl.focus();
    return;
  }
  if (
    typingObsEl.value === "" ||
    isNaN(typingObsEl.value) ||
    Number(typingObsEl.value) < 0
  ) {
    alert("Please enter a valid non-negative number for Typing Speed Observed.");
    typingObsEl.focus();
    return;
  }
  if (
    typingExpEl.value === "" ||
    isNaN(typingExpEl.value) ||
    Number(typingExpEl.value) <= 0
  ) {
    alert("Please enter a valid positive number for Typing Speed Expected.");
    typingExpEl.focus();
    return;
  }

  // Get values from radio buttons
  const getRadioValue = (name) => {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
  };

  let metadata = getRadioValue("metadata");
  let locationField = getRadioValue("location");
  let gestureObs = getRadioValue("gestureObs");
  let sensitiveAction = getRadioValue("sensitiveAction");
  let insecureNetwork = getRadioValue("insecureNetwork");
  let fraudDB = getRadioValue("fraudDB");
  let multipleAccounts = getRadioValue("multipleAccounts");

  // Ensure all binary options are selected
  if (
    [metadata, locationField, gestureObs, sensitiveAction, insecureNetwork, fraudDB, multipleAccounts].includes(null)
  ) {
    alert("Please make sure to select all options for the binary fields.");
    return;
  }

  let data = {
    metadata: metadata,
    location: locationField,
    otpFreq: otpFreqEl.value,
    typingObs: typingObsEl.value,
    typingExp: typingExpEl.value,
    gestureObs: gestureObs,
    sensitiveAction: sensitiveAction,
    insecureNetwork: insecureNetwork,
    fraudDB: fraudDB,
    multipleAccounts: multipleAccounts,
  };

  fetch("http://127.0.0.1:5000/detect_fraud", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((result) => {
      let riskPercentage = result.risk_score;
      const riskFill = document.getElementById("riskFill");
      
      // Reset the risk meter to 0% before animation
      riskFill.style.width = "0%";
      
      // Set dynamic gradient based on risk level
      if (riskPercentage <= 40) {
        riskFill.style.background = "linear-gradient(to right, #5cb85c, #8bc34a)";
      } else if (riskPercentage <= 70) {
        riskFill.style.background = "linear-gradient(to right, #f0ad4e, #ffc107)";
      } else {
        riskFill.style.background = "linear-gradient(to right, #d9534f, #c9302c)";
      }
      
      // Animate the risk meter rising up to the target percentage
      animateRiskBar(riskPercentage);
      
      // Play sound based on risk level
      if (riskPercentage <= 40) {
        document.getElementById("lowRiskSound").play();
      } else if (riskPercentage <= 70) {
        document.getElementById("mediumRiskSound").play();
      } else {
        document.getElementById("fraudAlertSound").play();
      }
      
      // Display final result in modal
      let finalResult = document.getElementById("finalResult");
      if (riskPercentage > 70) {
        finalResult.innerHTML = `🚨 <b>Risk Score: ${riskPercentage}%</b> - Potential Fraud Detected!`;
        finalResult.style.color = "#d9534f";
      } else {
        finalResult.innerHTML = `✅ <b>Risk Score: ${riskPercentage}%</b> - Action Verified!`;
        finalResult.style.color = "#5cb85c";
      }
      document.getElementById("resultModal").style.display = "block";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    });
});

// Function to animate the rising bar meter using requestAnimationFrame
function animateRiskBar(targetPercentage) {
  const riskFill = document.getElementById("riskFill");
  let startTime = null;
  const duration = 700; // Animation duration in ms
  
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1);
    riskFill.style.width = progress * targetPercentage + "%";
    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Modal close functionality for result modal
document.querySelector(".close").addEventListener("click", function () {
  document.getElementById("resultModal").style.display = "none";
});

// About Modal: Open and close functionality
document.getElementById("aboutButton").addEventListener("click", function() {
  document.getElementById("aboutModal").style.display = "block";
});

document.getElementById("aboutClose").addEventListener("click", function () {
  document.getElementById("aboutModal").style.display = "none";
});

window.addEventListener("click", function(event) {
  const aboutModal = document.getElementById("aboutModal");
  if (event.target == aboutModal) {
    aboutModal.style.display = "none";
  }
});

// Dark Mode Toggle
document.getElementById("darkModeToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});
