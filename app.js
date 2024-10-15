// // Get DOM elements
// const startButton = document.getElementById('startButton');
// const decibelLevelDisplay = document.getElementById('decibelLevel');
// const thresholdInput = document.getElementById('threshold');
// const themeToggle = document.getElementById('themeToggle');
//
// // Audio variables
// let audioContext;
// let microphone;
// let analyser;
// let dataArray;
// let rafID;
// let isRunning = false;
//
// // Variables for moving average
// const decibelHistory = [];
// const historyLength = 30; // Number of samples for moving average
//
// // Variables to track threshold duration
// let aboveThresholdStartTime = null;
// const thresholdDuration = 2000; // Duration in milliseconds
//
// // Get canvas and context
// const canvas = document.getElementById('decibelChart');
// const ctx = canvas.getContext('2d');
//
// // Variables for chart
// let chartWidth = canvas.clientWidth;
// let chartHeight = canvas.clientHeight;
// const dataPoints = [];
// let maxDataPoints = 600; // Will be adjusted based on frame rate
//
// // Resize canvas to fit container
// function resizeCanvas() {
//   chartWidth = canvas.clientWidth;
//   chartHeight = canvas.clientHeight;
//   canvas.width = chartWidth;
//   canvas.height = chartHeight;
// }
//
// window.addEventListener('resize', resizeCanvas);
// resizeCanvas(); // Initial resize
//
// // Adjust maxDataPoints based on desired duration and estimated frame rate
// const chartDuration = 10; // Duration in seconds
// const estimatedFrameRate = 60; // Adjust if necessary
// maxDataPoints = chartDuration * estimatedFrameRate;
//
// startButton.addEventListener('click', () => {
//   if (!isRunning) {
//     resizeCanvas(); // Ensure canvas is resized before starting
//     startDecibelMeter();
//     startButton.textContent = 'Stop';
//   } else {
//     stopDecibelMeter();
//     startButton.textContent = 'Start';
//   }
//   isRunning = !isRunning;
// });
//
// function startDecibelMeter() {
//   navigator.mediaDevices.getUserMedia({ audio: true, video: false })
//     .then((stream) => {
//       audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       microphone = audioContext.createMediaStreamSource(stream);
//       analyser = audioContext.createAnalyser();
//       analyser.fftSize = 2048;
//       microphone.connect(analyser);
//       dataArray = new Uint8Array(analyser.fftSize);
//       updateDecibelMeter();
//     })
//     .catch((err) => {
//       console.error('Error accessing the microphone:', err);
//       alert('Microphone access denied or not available.');
//     });
// }
//
// function stopDecibelMeter() {
//   if (audioContext) {
//     audioContext.close();
//     audioContext = null;
//   }
//   if (rafID) {
//     cancelAnimationFrame(rafID);
//   }
//   // Reset variables
//   aboveThresholdStartTime = null;
//   decibelHistory.length = 0;
//   dataPoints.length = 0;
// }
//
// function updateDecibelMeter() {
//   analyser.getByteTimeDomainData(dataArray);
//
//   // Calculate RMS (Root Mean Square)
//   let sumSquares = 0;
//   for (let i = 0; i < dataArray.length; i++) {
//     const normalized = (dataArray[i] - 128) / 128;
//     sumSquares += normalized * normalized;
//   }
//   const rms = Math.sqrt(sumSquares / dataArray.length);
//   let decibels = 20 * Math.log10(rms);
//
//   // Shift decibels to positive values
//   decibels += 100; // Adjust the offset as needed
//
//   // Clamp decibel value between 0 and 100
//   decibels = Math.max(0, Math.min(100, decibels));
//
//   // Add decibel value to history
//   decibelHistory.push(decibels);
//   if (decibelHistory.length > historyLength) {
//     decibelHistory.shift();
//   }
//
//   // Calculate moving average
//   const averageDecibels = decibelHistory.reduce((a, b) => a + b, 0) / decibelHistory.length;
//
//   decibelLevelDisplay.textContent = `${averageDecibels.toFixed(1)} dB`;
//
//   const threshold = parseFloat(thresholdInput.value);
//
//   // Check if decibel level is above threshold
//   if (averageDecibels > threshold) {
//     if (aboveThresholdStartTime === null) {
//       // Record the time when the decibel level first exceeded the threshold
//       aboveThresholdStartTime = Date.now();
//     } else {
//       // Check if decibel level has been above threshold for more than 1 second
//       const elapsedTime = Date.now() - aboveThresholdStartTime;
//       if (elapsedTime >= thresholdDuration) {
//         // Play three fast beeps and reset the start time to prevent repeated alerts
//         playBeep();
//         aboveThresholdStartTime = null; // Reset to avoid multiple triggers
//       }
//     }
//   } else {
//     // Reset the start time if decibel level drops below threshold
//     aboveThresholdStartTime = null;
//   }
//
//   // Update chart data
//   updateChart(decibels, threshold);
//
//   rafID = requestAnimationFrame(updateDecibelMeter);
// }
//
// // Function to update the chart
// function updateChart(decibelValue, threshold) {
//   // Add the new decibel value to dataPoints
//   dataPoints.push(decibelValue);
//   if (dataPoints.length > maxDataPoints) {
//     dataPoints.shift(); // Remove oldest data point
//   }
//
//   // Clear the canvas
//   ctx.clearRect(0, 0, chartWidth, chartHeight);
//
//   // Draw the decibel line
//   ctx.beginPath();
//   for (let i = 0; i < dataPoints.length; i++) {
//     const x = (i / (maxDataPoints - 1)) * chartWidth;
//     const y = chartHeight - ((dataPoints[i] / 100) * chartHeight);
//     if (i === 0) {
//       ctx.moveTo(x, y);
//     } else {
//       ctx.lineTo(x, y);
//     }
//   }
//
//   // Set line style based on theme
//   if (document.body.classList.contains('dark-mode')) {
//     ctx.strokeStyle = '#00bfff'; // Light blue for dark mode
//   } else {
//     ctx.strokeStyle = '#0077ff'; // Blue for light mode
//   }
//   ctx.lineWidth = 2;
//   ctx.stroke();
//
//   // Draw threshold line
//   const thresholdY = chartHeight - ((threshold / 100) * chartHeight);
//   ctx.beginPath();
//   ctx.moveTo(0, thresholdY);
//   ctx.lineTo(chartWidth, thresholdY);
//   ctx.strokeStyle = '#ff0000'; // Red color for threshold line
//   ctx.lineWidth = 1;
//   ctx.stroke();
// }
//
// // Function to play three fast beeps
// function playBeep() {
//   // Create a new audio context
//   const beepContext = new (window.AudioContext || window.webkitAudioContext)();
//
//   const duration = 150; // Beep duration in milliseconds
//   const pause = 100; // Pause between beeps in milliseconds
//   const frequency = 1500; // Frequency in Hz
//   const volume = 0.5; // Volume (0 to 1)
//   const type = 'sine'; // Waveform type
//
//   // Function to play a single beep
//   function beep(timeOffset) {
//     const oscillator = beepContext.createOscillator();
//     oscillator.frequency.value = frequency;
//     oscillator.type = type;
//
//     const gainNode = beepContext.createGain();
//     gainNode.gain.value = volume;
//
//     oscillator.connect(gainNode);
//     gainNode.connect(beepContext.destination);
//
//     oscillator.start(beepContext.currentTime + timeOffset);
//     oscillator.stop(beepContext.currentTime + timeOffset + duration / 1000);
//   }
//
//   // Schedule three beeps
//   beep(0); // First beep at timeOffset = 0
//   beep((duration + pause) / 1000); // Second beep after duration + pause
//   beep(2 * (duration + pause) / 1000); // Third beep after two durations and pauses
//
//   // Close the context after the last beep
//   setTimeout(() => {
//     beepContext.close();
//   }, 3 * (duration + pause));
// }
//
// // Theme toggle functionality with icons
// // Check for saved theme in localStorage
// if (localStorage.getItem('theme') === 'dark') {
//   document.body.classList.add('dark-mode');
//   themeToggle.checked = true;
// }
//
// // Theme toggle functionality
// themeToggle.addEventListener('change', () => {
//   document.body.classList.toggle('dark-mode');
//   if (document.body.classList.contains('dark-mode')) {
//     localStorage.setItem('theme', 'dark');
//   } else {
//     localStorage.setItem('theme', 'light');
//   }
// });



// Get DOM elements
const startButton = document.getElementById('startButton');
const decibelLevelDisplay = document.getElementById('decibelLevel');
const thresholdInput = document.getElementById('threshold');
const themeToggle = document.getElementById('themeToggle');

// Audio variables
let audioContext;
let microphone;
let analyser;
let dataArray;
let rafID;
let isRunning = false;

// Wake Lock variable
let wakeLock = null;

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

// Function to request a wake lock
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
      alert('Wake Lock API not supported in this browser, so the screen may turn off automatically while the app is running in the background.');
    }
  } catch (err) {
    console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
  }
}

// Function to release the wake lock
async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock released');
  }
}

// Update the start button event listener
startButton.addEventListener('click', () => {
  if (!isRunning) {
    resizeCanvas(); // Ensure canvas is resized before starting
    startDecibelMeter();
    startButton.textContent = 'Stop';
    requestWakeLock(); // Request the wake lock when starting
  } else {
    stopDecibelMeter();
    startButton.textContent = 'Start';
    releaseWakeLock(); // Release the wake lock when stopping
  }
  isRunning = !isRunning;
});

// Handle visibility change events to re-acquire wake lock if necessary
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
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
        // Play three fast beeps and reset the start time to prevent repeated alerts
        playBeep();
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

// Function to play three fast beeps
function playBeep() {
  // Create a new audio context
  const beepContext = new (window.AudioContext || window.webkitAudioContext)();

  const duration = 100; // Beep duration in milliseconds
  const pause = 100; // Pause between beeps in milliseconds
  const frequency = 1000; // Frequency in Hz
  const volume = 0.1; // Volume (0 to 1)
  const type = 'sine'; // Waveform type

  // Function to play a single beep
  function beep(timeOffset) {
    const oscillator = beepContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const gainNode = beepContext.createGain();
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(beepContext.destination);

    oscillator.start(beepContext.currentTime + timeOffset);
    oscillator.stop(beepContext.currentTime + timeOffset + duration / 1000);
  }

  // Schedule three beeps
  beep(0); // First beep at timeOffset = 0
  beep((duration + pause) / 1000); // Second beep after duration + pause
  beep(2 * (duration + pause) / 1000); // Third beep after two durations and pauses

  // Close the context after the last beep
  setTimeout(() => {
    beepContext.close();
  }, 3 * (duration + pause));
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
