const startButton = document.getElementById('startButton');
const decibelLevelDisplay = document.getElementById('decibelLevel');
const thresholdInput = document.getElementById('threshold');
const alertSound = document.getElementById('alertSound');

let audioContext;
let microphone;
let analyser;
let dataArray;
let rafID;
let isRunning = false;

// Variables to track threshold duration
let aboveThresholdStartTime = null;
const thresholdDuration = 1000; // Duration in milliseconds

startButton.addEventListener('click', () => {
  if (!isRunning) {
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
  // Reset the aboveThresholdStartTime
  aboveThresholdStartTime = null;
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

  decibelLevelDisplay.textContent = `${decibels.toFixed(1)} dB`;

  const threshold = parseFloat(thresholdInput.value);

  // Check if decibel level is above threshold
  if (decibels > threshold) {
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

  rafID = requestAnimationFrame(updateDecibelMeter);
}
