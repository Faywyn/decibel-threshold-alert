// Audio variables
let audioContext;
let microphone;
let analyser;
let dataArray;
let bandPassFilter;

// Variables for moving average
const decibelHistory = [];
const historyLength = 60; // Number of samples for moving average

// Variables for beeping and cooldown
let lastBeepTime = 0; // Timestamp of the last beep sequence
const beepCooldown = 1000; // Cooldown period in milliseconds

// Function to start the decibel meter
function startDecibelMeter() {
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      microphone = audioContext.createMediaStreamSource(stream);

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      // Initialize filter and connections
      setupFilter(window.voiceOnly);

      dataArray = new Uint8Array(analyser.fftSize);

      updateDecibelMeter(); // Start updating the decibel meter
    })
    .catch((err) => {
      console.error('Error accessing the microphone:', err);
      alert('Microphone access denied or not available.');
    });
}

// Function to set up filter based on voiceOnly flag
function setupFilter(voiceOnly) {
  // Disconnect previous connections if any
  if (microphone) {
    microphone.disconnect();
  }
  if (bandPassFilter) {
    bandPassFilter.disconnect();
  }

  if (voiceOnly) {
    // Create a band-pass filter
    bandPassFilter = audioContext.createBiquadFilter();
    bandPassFilter.type = 'bandpass';

    // Set filter frequencies for human voice
    const lowerFrequency = 300;
    const upperFrequency = 3400;
    const bandwidth = upperFrequency - lowerFrequency;
    const centerFrequency = lowerFrequency + bandwidth / 2;
    const Q = centerFrequency / bandwidth;

    bandPassFilter.frequency.value = centerFrequency;
    bandPassFilter.Q = Q;

    // Connect nodes: microphone -> band-pass filter -> analyser
    microphone.connect(bandPassFilter);
    bandPassFilter.connect(analyser);
  } else {
    // Connect microphone directly to analyser
    microphone.connect(analyser);
  }
}

// Function to update filter type dynamically
function updateFilterType(voiceOnly) {
  setupFilter(voiceOnly);
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
  lastBeepTime = 0; // Reset last beep time
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

  const currentTime = Date.now();

  // Check if decibel level is above threshold
  if (averageDecibels > threshold) {
    if (window.aboveThresholdStartTime === null) {
      // Record the time when the decibel level first exceeded the threshold
      window.aboveThresholdStartTime = currentTime;
    } else {
      // Check if decibel level has been above threshold for more than the threshold duration
      const elapsedTime = currentTime - window.aboveThresholdStartTime;
      if (elapsedTime >= window.thresholdDuration) {
        // Check if cooldown period has passed since the last beep
        if (currentTime - lastBeepTime >= beepCooldown) {
          // Play three fast beeps and update the last beep time
          playBeep();
          lastBeepTime = currentTime;
        }
        // Reset aboveThresholdStartTime to avoid immediate re-trigger
        window.aboveThresholdStartTime = currentTime;
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
  const frequency = window.beepFrequency; // Beep frequency in Hz 
  const volume = 0.1; // Volume (0 to 1)
  const type = 'sine'; // Waveform type

  console.log('Playing beep sequence', frequency, 'Hz');

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
window.updateFilterType = updateFilterType;
