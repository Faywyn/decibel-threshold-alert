// Get DOM elements
const startButton = document.getElementById('startButton');
const decibelLevelDisplay = document.getElementById('decibelLevel');
const thresholdInput = document.getElementById('threshold');
const alertSound = document.getElementById('alertSound');
const themeToggle = document.getElementById('themeToggle');

// Audio variables
let audioContext;
let microphone;
let analyser;
let dataArray;
let rafID;
let isRunning = false;

// Variables for moving average
const decibelHistory = [];
const historyLength = 30; // Number of samples for moving average

// Variables to track threshold duration
let aboveThresholdStartTime = null;
const thresholdDuration = 1000; // Duration in milliseconds

// Get canvas and context
const canvas = document.getElementById('decibelChart');
const ctx = canvas.getContext('2d');

// Variables for chart
let chartWidth = canvas.clientWidth;
let chartHeight = canvas.clientHeight;
const dataPoints = [];
let maxDataPoints = 600; // Will be adjusted based on frame rate

// Resize canvas to fit container
function resizeCanvas() {
  chartWidth = canvas.clientWidth;
  chartHeight = canvas.clientHeight;
  canvas.width = chartWidth;
  canvas.height = chartHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

// Adjust maxDataPoints based on desired duration and estimated frame rate
const chartDuration = 10; // Duration in seconds
const estimatedFrameRate = 60; // Adjust if necessary
maxDataPoints = chartDuration * estimatedFrameRate;

startButton.addEventListener('click', () => {
  if (!isRunning) {
    resizeCanvas(); // Ensure canvas is resized before starting
    startDecibelMeter();
    startButton.textContent = 'Stop';
  } else {
    stopDecibelMeter();
    startButton.textContent = 'Start';
  }
  isRunning = !isRunning;
});

function startDecibelMeter() {
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      microphone.connect(analyser);
      dataArray = new Uint8Array(analyser.fftSize);
      updateDecibelMeter();
    })
    .catch((err) => {
      console.error('Error accessing the microphone:', err);
      alert('Microphone access denied or not available.');
    });
}

function stopDecibelMeter() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (rafID) {
    cancelAnimationFrame(rafID);
  }
  // Reset variables
  aboveThresholdStartTime = null;
  decibelHistory.length = 0;
  dataPoints.length = 0;
}

function updateDecibelMeter() {
  analyser.getByteTimeDomainData(dataArray);

  // Calculate RMS (Root Mean Square)
  let sumSquares = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const normalized = (dataArray[i] - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const rms = Math.sqrt(sumSquares / dataArray.length);
  let decibels = 20 * Math.log10(rms);

  // Shift decibels to positive values
  decibels += 100; // Adjust the offset as needed

  // Clamp decibel value between 0 and 100
  decibels = Math.max(0, Math.min(100, decibels));

  // Add decibel value to history
  decibelHistory.push(decibels);
  if (decibelHistory.length > historyLength) {
    decibelHistory.shift();
  }

  // Calculate moving average
  const averageDecibels = decibelHistory.reduce((a, b) => a + b, 0) / decibelHistory.length;

  decibelLevelDisplay.textContent = `${averageDecibels.toFixed(1)} dB`;

  const threshold = parseFloat(thresholdInput.value);

  // Check if decibel level is above threshold
  if (averageDecibels > threshold) {
    if (aboveThresholdStartTime === null) {
      // Record the time when the decibel level first exceeded the threshold
      aboveThresholdStartTime = Date.now();
    } else {
      // Check if decibel level has been above threshold for more than 1 second
      const elapsedTime = Date.now() - aboveThresholdStartTime;
      if (elapsedTime >= thresholdDuration) {
        // Play the alert sound and reset the start time to prevent repeated alerts
        alertSound.play();
        aboveThresholdStartTime = null; // Reset to avoid multiple triggers
      }
    }
  } else {
    // Reset the start time if decibel level drops below threshold
    aboveThresholdStartTime = null;
  }

  // Update chart data
  updateChart(decibels, threshold);

  rafID = requestAnimationFrame(updateDecibelMeter);
}

// Function to update the chart
function updateChart(decibelValue, threshold) {
  // Add the new decibel value to dataPoints
  dataPoints.push(decibelValue);
  if (dataPoints.length > maxDataPoints) {
    dataPoints.shift(); // Remove oldest data point
  }

  // Clear the canvas
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  // Draw the decibel line
  ctx.beginPath();
  for (let i = 0; i < dataPoints.length; i++) {
    const x = (i / (maxDataPoints - 1)) * chartWidth;
    const y = chartHeight - ((dataPoints[i] / 100) * chartHeight);
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

// Theme toggle functionality with icons
// Check for saved theme in localStorage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.checked = true;
}

// Theme toggle functionality
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});
