# Chaotic Pen

An artistic drawing experience that uses face detection and a chaotic pen algorithm to create continuous-stroke portraits.

## How It Works

1. **Upload a portrait** - Start by loading any portrait image
2. **Face detection** - The system automatically detects the face using MediaPipe Face Mesh
3. **Edge isolation** - Adjust edge details and erase areas you don't want drawn
4. **Watch it draw** - A single chaotic pen traces the edges, filling in shadows with looping strokes

## Features

- Face-aware drawing that prioritizes facial features
- Chaotic force-based pen movement for organic, hand-drawn aesthetics
- Real-time parameter adjustment via the dev panel
- Export finished artwork as PNG

## Usage

Open `index.html` in a modern browser. The app uses:
- MediaPipe Face Mesh for face detection
- Canvas API for rendering

## Live Demo

Deploy to GitHub Pages by enabling it in repository settings. The site will be available at `https://triggeredcode.github.io/chaoticPen/`
