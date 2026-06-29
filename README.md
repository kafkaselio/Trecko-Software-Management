# 🎯 Trecko

Trecko is a premium, ultra-modern project collaboration workspace and sprint platform designed for developers and product creators. Engineered with a design-first philosophy, it brings together sprint planning, interactive data visualization, real-time-simulated teammate communications, and customizable tactical utility widgets under a highly responsive interface that features multiple custom-curated themes.

---

## ✨ Features

### 🖥️ 1. Mission Control Dashboard
A fully drag-and-drop customizable, modular widget-based dashboard. Mix, match, and organize your work stream:
*   **Widget Customization**: Drag and reorder widgets dynamically. Toggle specific tools to curate your perfect cockpit layout.
*   **Due Today Tracker**: View critical deliverables with responsive height adjustments and custom scrollbars.
*   **Active Sprint Overview**: Monitor task counts, status breakdowns, and overall progress at a single glance.

### 📅 2. Interactive Sprint Calendar
A beautifully crafted scheduling hub featuring a high-contrast layout and fluid interaction mechanics:
*   **Flexible Views**: Seamlessly switch between **Weekly** and **Monthly** perspectives, or customize calendar grids (1, 2, or 4-week views).
*   **Drag-and-Drop Task Management**: Reschedule or reorder tasks directly on the grid.
*   **Advanced Filtering**: Filter tasks by priority, status, or workspace categories in real-time.

### ⚡ 3. Unified Tactical Utilities Panel
A multi-module dashboard featuring deep functionality tailored for focus, tracking, and organization:
*   **Focus Session Timer**: A custom Pomodoro loop to control intervals, keep track of focus stats, and maintain workspace discipline.
*   **Sticky Notes Hub**: Create, custom-style, filter, and search text cards within a dedicated workspace canvas.
*   **Interactive Whiteboard**: A built-in sketch board canvas supporting drawing paths, color selectors, zoom, pan, and custom background grids.
*   **Knowledge Graph**: An interactive, D3-powered canvas representing relation links across documents, habits, and tasks with responsive node physics.
*   **Habit & Routine Tracker**: Build streak histories, complete daily goals, and review progress charts.
*   **Time Analytics & Goal Radar**: Stunning Recharts-powered graphs analyzing time allocation, milestones, and sprint health.
*   **Teammate Presence & File Vault**: Keep simulated companion contact metrics and asset references close at hand.

### 🎨 4. Premium Curated Skins & Themes
Experience a tailored UI with multiple high-contrast theme profiles that dynamically update components, borders, and cards:
*   🌌 **Cosmic Purple** (Deep purples with ambient glowing card layers)
*   🔋 **Emerald Green** (Sleek dark canvas with cybernetic mint-green accents)
*   ☀️ **Sunset Amber** (Warm amber gradients with high contrast)
*   🌊 **Cyan Aurora** (Cool arctic-blue theme with crisp contrast)
*   🪵 **Bronze & Crimson** (Sophisticated, warm workspaces with rich palettes)
*   💾 Automatically persisted in `localStorage` to retain your exact workspace preferences across reloads.

### 🛠️ 5. Developer Workspace Tools
*   **Integrated DevTools Suite**: Custom system metrics loggers, variables inspect interfaces, state monitors, and test console runners.
*   **Wiki System & Command Palette**: An integrated document editor and instant search-command overlay triggered via standard keyboard binds.

---

## 🚀 Tech Stack

Trecko leverages a robust full-stack configuration prioritizing speed, type safety, and clean layout:

*   **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
*   **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/) (using native `@import "tailwindcss";` specs)
*   **Animation**: [Motion](https://motion.dev/) (from `motion/react`) for smooth entry transitions and layouts
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) for low-overhead, global application state
*   **Data Visualization**: [D3.js](https://d3js.org/) (Interactive Knowledge Graph physics) & [Recharts](https://recharts.org/) (Sprint Analytics charts)
*   **Backend Server**: [Express](https://expressjs.com/) (Node.js full-stack container environment)
*   **Icons**: [Lucide React](https://lucide.dev/) for cohesive typography icons

---

## 🛠️ Getting Started & Installation

Follow these instructions to clone, configure, and boot Trecko locally.

### 📋 Prerequisites
*   **Node.js** (v18.x or v20.x recommended)
*   **npm** (or yarn/pnpm)

### 📦 Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/trecko.git
    cd trecko
    ```

2.  **Install Package Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add any required keys:
    ```env
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### 💻 Running the Application

#### Development Mode
Run the development server using `tsx` (TypeScript Execute) for hot reloading:
```bash
npm run dev
