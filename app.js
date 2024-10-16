// Get DOM elements
const startButton = document.getElementById('startButton');
const decibelLevelDisplay = document.getElementById('decibelLevel');
const thresholdInput = document.getElementById('threshold');
const themeToggle = document.getElementById('themeToggle');

// Variables
let isRunning = false;
window.rafID = null;
window.aboveThresholdStartTime = null;
window.thresholdDuration = 2000; // Duration in milliseconds
let wakeLock = null;

// Chart variables
const canvas = document.getElementById('decibelChart');
const ctx = canvas.getContext('2d');
let chartWidth = canvas.clientWidth;
let chartHeight = canvas.clientHeight;
window.dataPoints = [];
const chartDuration = 10; // Duration in seconds
const estimatedFrameRate = 60; // Adjust if necessary
const maxDataPoints = chartDuration * estimatedFrameRate;

// Resize canvas to fit container
function resizeCanvas() {
  chartWidth = canvas.clientWidth;
  chartHeight = canvas.clientHeight;
  canvas.width = chartWidth;
  canvas.height = chartHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

// Start/Stop button event listener
startButton.addEventListener('click', () => {
  if (!isRunning) {
    resizeCanvas(); // Ensure canvas is resized before starting
    window.startDecibelMeter();
    startButton.textContent = 'Stop';
    requestWakeLock(); // Request the wake lock when starting
  } else {
    window.stopDecibelMeter();
    startButton.textContent = 'Start';
    releaseWakeLock(); // Release the wake lock when stopping
  }
  isRunning = !isRunning;
});

// Function to update the chart
function updateChart(decibelValue, threshold) {
  // Add the new decibel value to dataPoints
  window.dataPoints.push(decibelValue);
  if (window.dataPoints.length > maxDataPoints) {
    window.dataPoints.shift(); // Remove oldest data point
  }

  // Clear the canvas
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  // Draw the decibel line
  ctx.beginPath();
  for (let i = 0; i < window.dataPoints.length; i++) {
    const x = (i / (maxDataPoints - 1)) * chartWidth;
    const y = chartHeight - ((window.dataPoints[i] / 100) * chartHeight);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  // Set line style based on theme
  if (document.body.classList.contains('dark-mode')) {
    ctx.strokeStyle = '#00bfff'; // Light blue for dark mode
  } else {
    ctx.strokeStyle = '#0077ff'; // Blue for light mode
  }
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw threshold line
  const thresholdY = chartHeight - ((threshold / 100) * chartHeight);
  ctx.beginPath();
  ctx.moveTo(0, thresholdY);
  ctx.lineTo(chartWidth, thresholdY);
  ctx.strokeStyle = '#ff0000'; // Red color for threshold line
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Wake Lock functions
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock is active');

      // Listen for the release event
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
    } else {
      console.log('Wake Lock API not supported');
    }
  } catch (err) {
    console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
  }
}

async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock released');
  }
}

// Handle visibility change events to re-acquire wake lock if necessary
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

// Theme toggle functionality
// Check for saved theme in localStorage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.checked = true;
}

// Theme toggle event listener
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Expose variables and functions needed by sound.js
window.decibelLevelDisplay = decibelLevelDisplay;
window.thresholdInput = thresholdInput;
window.updateChart = updateChart;
