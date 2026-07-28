# PilihAcak 🎡

A fast, lightweight, and serverless **Progressive Web App (PWA)** designed to randomly pick participants using a premium, highly responsive wheel spinner. Built with privacy in mind, all data is stored locally in the user's browser via `localStorage`.

---

## Key Features

- **📲 PWA Installable:** Install it directly to your home screen like a native mobile app for offline support and fullscreen experience.
- **📱 Mobile-First Layout:** Tailored and optimized for mobile screens (bounded container style) with smooth bottom tab navigation.
- **✨ Crisp Retina Display Support:** Auto-adjusts resolution based on `devicePixelRatio` to prevent pixelation on high-DPI (Retina) screens.
- **🎨 Dynamic High-Contrast Colors:** Uses the **Golden Angle distribution** (`(index * 137.5) % 360` degrees HSL) to assign a unique, highly contrasting color to every slice—scaling cleanly for 20+ names.
- **📝 Text Wrapping in Slices:** Long participant names automatically wrap up to 2 lines with smart ellipsis (`...`) clipping to ensure text remains clean and readable.
- **🎵 Elegant Synthesized Audio:** Uses the native browser **Web Audio API** to synthesize marimba-style wooden click tick sounds and a winning fanfare melody in real-time, requiring no external audio file downloads.
- **👥 Flexible Pool Management:** Supports manual single additions, bulk additions via line-separated copy-pasting, duplicate validation, and single-click removal.
- **💾 Full Data Control:**
  - **Local Persistence:** Data stays on your device (`pilihacak_state`).
  - **Backup & Restore:** Easily export the state to `.json` or import it back.
  - **Reset Total:** Reset all data with a secure double-confirmation modal.
- **🎉 Winner Celebration:** Interactive modal with custom fanfare sound and a burst of confetti using the `canvas-confetti` library.

---

## Tech Stack

- **Core:** HTML5, Vanilla JavaScript (ES6+)
- **Build Tool:** [Vite](https://vite.dev/)
- **CSS Framework:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Graphics:** HTML5 Canvas, Confetti (`canvas-confetti`)
- **Audio:** Web Audio API

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed and [pnpm](https://pnpm.io/) as the package manager.

### Installation

1. Install project dependencies:
   ```bash
   pnpm install
   ```

2. Run the local development server:
   ```bash
   pnpm run dev
   ```

3. Open the local address in your browser (usually `http://localhost:5173`). Toggle the device responsive inspector (`F12`) to view the application in mobile device layout.

### Building for Production

Compile the production bundle (generates optimized, zero-backend static files):
```bash
pnpm run build
```

The compiled assets will be located in the `dist/` directory, ready to be deployed to any static host (e.g., Vercel, Netlify, or GitHub Pages).
