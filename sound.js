// Audio variables
let audioContext;
let microphone;
let analyser;
let dataArray;

// Variables for moving average
const decibelHistory = [];
const historyLength = 60; // Number of samples for moving average

// Function to start the decibel meter
function startDecibelMeter() {
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      microphone = audioContext.createMediaStreamSource(stream);

      // Create a band-pass filter
      const bandPassFilter = audioContext.createBiquadFilter();
      bandPassFilter.type = 'bandpass';
      bandPassFilter.frequency.value = 1000; // Center frequency in Hz
      bandPassFilter.Q = 0.707; // Quality factor

      // Adjust lower and upper cutoff frequencies
      const lowerFrequency = 300;   // Lower cutoff frequency in Hz
      const upperFrequency = 3400;  // Upper cutoff frequency in Hz

      // Calculate bandwidth and center frequency
      const bandwidth = upperFrequency - lowerFrequency;
      const centerFrequency = lowerFrequency + bandwidth / 2;

      // Update filter parameters
      bandPassFilter.frequency.value = centerFrequency;
      bandPassFilter.Q = centerFrequency / bandwidth;

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      // Connect nodes: microphone -> band-pass filter -> analyser
      microphone.connect(bandPassFilter);
      bandPassFilter.connect(analyser);

      dataArray = new Uint8Array(analyser.fftSize);

      updateDecibelMeter(); // Start updating the decibel meter
    })
    .catch((err) => {
      console.error('Error accessing the microphone:', err);
      alert('Microphone access denied or not available.');
    });
}

// Function to stop the decibel meter
function stopDecibelMeter() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (window.rafID) {
    cancelAnimationFrame(window.rafID);
  }
  // Reset variables
  window.aboveThresholdStartTime = null;
  decibelHistory.length = 0;
  window.dataPoints.length = 0;
}

// Function to update the decibel meter
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

  window.decibelLevelDisplay.textContent = `${averageDecibels.toFixed(1)} dB`;

  const threshold = parseFloat(window.thresholdInput.value);

  // Check if decibel level is above threshold
  if (averageDecibels > threshold) {
    if (window.aboveThresholdStartTime === null) {
      // Record the time when the decibel level first exceeded the threshold
      window.aboveThresholdStartTime = Date.now();
    } else {
      // Check if decibel level has been above threshold for more than the threshold duration
      const elapsedTime = Date.now() - window.aboveThresholdStartTime;
      if (elapsedTime >= window.thresholdDuration) {
        // Play three fast beeps and reset the start time to prevent repeated alerts
        playBeep();
        window.aboveThresholdStartTime = null; // Reset to avoid multiple triggers
      }
    }
  } else {
    // Reset the start time if decibel level drops below threshold
    window.aboveThresholdStartTime = null;
  }

  // Update chart data
  window.updateChart(decibels, threshold);

  window.rafID = requestAnimationFrame(updateDecibelMeter);
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

// Expose functions to app.js
window.startDecibelMeter = startDecibelMeter;
window.stopDecibelMeter = stopDecibelMeter;
