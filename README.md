# 🎨 Clockwork Canvas

> A mesmerizing generative art piece where geometric shapes dance in orbital paths, drawn toward a cosmic center.

[![Deploy to GitHub Pages](https://github.com/Ashborn-047/clockwork-canvas/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashborn-047/clockwork-canvas/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)

<div align="center">

**[🌐 Live Demo](https://ashborn-047.github.io/clockwork-canvas/)** · **[⭐ Star this project](https://github.com/Ashborn-047/clockwork-canvas)**

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔮 **Dynamic Shapes** | 70+ geometric shapes with unique behaviors and colors |
| 🌀 **Orbital Animation** | Shapes orbit and attract toward the cosmic center |
| 💫 **Soft Collision** | Organic physics where shapes naturally repel each other |
| 🔗 **Connection Lines** | Golden threads connect nearby forms as they drift |
| 📽️ **1080p Recording** | Record the animation as WebM video |
| 🎞️ **Film Grain** | Subtle noise overlay for artistic texture |
| 📱 **Responsive UI** | Controls adapt to any screen size |

## 🖼️ Preview

<div align="center">

*Abstract geometric shapes orbiting with golden metallic accents*

</div>

## 🚀 Quick Start

### View Online
Visit the **[Live Demo](https://ashborn-047.github.io/clockwork-canvas/)** - no installation required!

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Ashborn-047/clockwork-canvas.git
cd clockwork-canvas

# Start a local server (choose one)
python -m http.server 8000    # Python
npx serve .                    # Node.js
```

Then open: **http://localhost:8000**

## 🎮 Controls

| Button | Action |
|--------|--------|
| **New Pattern** | Regenerate all shapes with new random properties |
| **Record 1080p** | Start/Stop video recording (downloads as WebM) |

## 🛠️ Tech Stack

- **HTML5 Canvas** - For rendering graphics
- **Vanilla JavaScript** - No frameworks, no dependencies
- **CSS3** - Responsive styling with glassmorphism effects
- **GitHub Actions** - Automatic deployment to GitHub Pages

## 🎨 Customization

Modify the `settings` object in `script.js` to personalize your canvas:

```javascript
const settings = {
    shapeCount: 70,            // Number of orbiting shapes
    connectionDistance: 220,    // Max distance for connection lines
    palette: [...],            // Color palette array
    metallicAccent: '#D4AF37', // Gold accent color
    frameMargin: 140,          // Frame border width
    fps: 60                    // Recording framerate
};
```

## 📁 Project Structure

```
clockwork-canvas/
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages deployment
├── index.html            # Main HTML file
├── styles.css            # All CSS styles
├── script.js             # Animation logic
├── LICENSE               # MIT License
└── README.md             # This file
```

## 🌐 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome | ✅ Recommended |
| Firefox | ✅ |
| Edge | ✅ |
| Safari | ✅ |

> ⚠️ Video recording may have limited support in some browsers

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ and vanilla JavaScript

**[⬆ Back to Top](#-clockwork-canvas)**

</div>
