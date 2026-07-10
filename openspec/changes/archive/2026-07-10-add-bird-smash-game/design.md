# Design: Bird Smash Game

## Context
The toolbox application will gain an interactive 2D physics‑based game called **Bird Smash**, akin to Angry Birds. This feature showcases Matter.js physics, Zustand state management, and TailwindCSS styling while providing an entertaining user experience.

## Goals
- Deliver a polished, responsive game playable on desktop and mobile.
- Keep the game isolated as a Vite‑React workspace to avoid polluting the main bundle.
- Allow lazy loading to minimize initial load impact.
- Provide a clear extension point for adding new birds, structures, or levels.

## High‑Level Architecture
```
Bird Smash (games/bird-smash)
├─ public/                # static assets (icons, sounds, fonts)
├─ src/
│  ├─ assets/            # sprites, audio files
│  ├─ components/        # React UI components
│  │   ├─ GameCanvas.tsx  # Canvas wrapper with Matter.js world
│  │   ├─ Slingshot.tsx   # Drag‑release UI & trajectory preview
│  │   ├─ Bird/
│  │   │   ├─ RedBird.tsx
│  │   │   ├─ YellowBird.tsx
│  │   │   ├─ BlueBird.tsx
│  │   │   └─ BlackBird.tsx
│  │   ├─ Structure/
│  │   │   ├─ WoodBlock.tsx
│  │   │   ├─ StoneBlock.tsx
│  │   │   └─ GlassBlock.tsx
│  │   ├─ HUD.tsx         # Score, level selector, pause button
│  │   └─ Effects/
│  │       ├─ Particles.tsx
│  │       └─ CameraShake.tsx
│  ├─ hooks/             # Re‑usable logic
│  │   ├─ useGame.ts      # Game loop, RAF, world stepping
│  │   └─ usePhysics.ts   # Matter.js engine wrapper
│  ├─ state/             # Zustand stores
│  │   └─ gameStore.ts    # birds, structures, score, UI flags
│  ├─ types/             # TypeScript interfaces (Bird, Structure, Level)
│  ├─ App.tsx            # Root component, routing wrapper
│  └─ main.tsx           # Vite entry point
├─ tailwind.config.cjs    # Custom palette for premium look
├─ vite.config.ts         # Base path `/bird-smash`, output dir
├─ tsconfig.json
└─ index.html
```

## Component Responsibilities
| Component | Responsibility |
|-----------|-------------------|
| `GameCanvas` | Creates a `<canvas>` element, initializes Matter.js world, runs the simulation step on each animation frame. |
| `Slingshot` | Handles mouse/touch drag, renders a trajectory line using quadratic Bézier, enforces stretch limits, emits launch vector. |
| Bird components (`RedBird`, `YellowBird`, …) | Render sprite, bind to a Matter body, implement unique ability (speed boost, split, explosion) via custom `applyAbility` hook. |
| Structure components | Render block sprite, assign material properties (density, restitution, friction) to the Matter body. |
| `HUD` | Displays current score, remaining birds, level number, pause/resume button, star rating at level end. |
| `Particles` & `CameraShake` | Visual feedback for impacts and explosions; use CSS animations & Canvas particle pool. |

## State Management (Zustand)
```ts
interface GameState {
  level: number;
  birds: BirdInstance[]; // queue of birds to launch
  structures: StructureInstance[];
  score: number;
  lives: number;
  paused: boolean;
  gameOver: boolean;
  // UI flags
  showPauseMenu: boolean;
  showResultScreen: boolean;
}
```
- Store lives, score, and remaining birds.
- Provide actions: `launchBird(vector)`, `applyAbility(birdId)`, `removeStructure(id)`, `nextLevel()`, `resetGame()`, `togglePause()`.
- Persist level unlocks in `localStorage` for cross‑session progress.

## Physics Integration (Matter.js)
- Create a single `Engine` & `World` per level.
- Use `Composite` to group static bodies (ground, walls) and dynamic bodies (birds, blocks).
- Collision events trigger:
  - Damage calculation based on impact velocity.
  - Structure destruction when health ≤ 0.
  - Camera shake via a custom event dispatcher.
- Implement an **object pool** for `Body` instances to reduce GC pressure.

## Performance Optimizations
1. **Object Pools** – reuse Matter bodies for birds and blocks across levels.
2. **Texture Caching** – load sprite sheet once; reference via CSS `background-image`.
3. **RAF Loop** – run physics step at 60 fps; skip rendering when `paused`.
4. **Lazy Loading** – Dynamically import the game bundle when the menu item is clicked (`import('games/bird-smash')`).
5. **Responsive Canvas** – Scale canvas size based on device pixel ratio; limit resolution on low‑end devices.

## Styling (TailwindCSS)
- Custom palette: `sky`, `wood`, `stone`, `glass` for premium look.
- Use glassmorphism for HUD panels (`backdrop-blur`, semi‑transparent backgrounds).
- Micro‑animations: hover effects on menu, button press bounce, bird launch easing.
- Mobile‑first breakpoints: ensure touch targets ≥44 dp.

## Asset Management
- Place sprites (`bird-red.png`, `block-wood.png`, …) and audio (`launch.wav`, `explosion.wav`) in `src/assets/`.
- Reference them via `import` statements; Vite will handle bundling.
- Optional: Add a small sprite sheet to reduce HTTP requests.

## Testing Strategy
- **Unit Tests (Jest)** – Verify Zustand store logic, ability functions, collision damage calculations.
- **E2E Tests (Playwright)** – Simulate drag‑release, confirm birds launch, structures break, level completion, star rating.
- **Performance Benchmarks** – Measure FPS on typical devices; ensure >30 fps.

## Roadmap Milestones
1. Scaffold Vite‑React workspace & Tailwind config.
2. Implement core physics world & slingshot UI.
3. Add bird types with abilities.
4. Build structure components & material properties.
5. Integrate Zustand store & HUD.
6. Add particle effects, camera shake, slow‑motion.
7. Optimize with object pools & lazy loading.
8. Write tests and documentation.
9. Link menu entry and verify integration.

---
*If this design meets your expectations, I will proceed to scaffold the new workspace, update the menu component, and begin implementation according to the task list.*
