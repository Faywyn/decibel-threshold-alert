# Decibel Threshold Alert

A simple web-based decibel meter that plays an alert sound when the decibel level exceeds a specified threshold for more than 1 second.

## Features

- **Real-time Decibel Measurement:** Uses your device's microphone to measure sound levels.
- **Custom Threshold Setting:** Allows you to set a decibel threshold value.
- **Alert Sound:** Plays an alert sound if the decibel level remains above the threshold for over 1 second.
- **Pure JavaScript Implementation:** Built with HTML, CSS, and JavaScript—no frameworks required.

## Website (Github Pages)

[Decibel Threshold Alert](https://faywyn.github.io/decibel-threshold-alert/)

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox) that supports:
  - The [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  - The [`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) API
- **Note:** Must be served over **HTTPS** to access the microphone due to browser security policies.
