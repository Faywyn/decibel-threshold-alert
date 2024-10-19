# Decibel Threshold Alert

A web-based decibel meter that monitors noise levels and alerts when thresholds are exceeded. Ideal for classrooms
and noise-sensitive environments.

## Features

- Real-time decibel level monitoring using the Web Audio API.
- Visual representation of noise levels with a dynamic chart.
- Adjustable parameters:
  - Decibel Threshold (dB)
  - Threshold Duration (ms)
  - Beep Frequency (Hz)
  - Voice Only Filter (On/Off)
- Audio alerts when noise levels exceed the threshold.
- Dark and Light themes with a toggle button.
- Responsive design suitable for various screen sizes.
- Wake Lock API to prevent the device from sleeping during monitoring.

## Website (Github Pages)

[Decibel Threshold Alert](https://faywyn.github.io/decibel-threshold-alert/)

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox) that supports:
  - The [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  - The [`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) API
- **Note:** Must be served over **HTTPS** to access the microphone due to browser security policies.
