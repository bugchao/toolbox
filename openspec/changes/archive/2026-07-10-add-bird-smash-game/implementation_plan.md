# Implementation Plan: Bird Smash Game

## Goal Description
Add a new menu option **Bird Smash** that launches a standalone 2D physics‑based slingshot game built with React 18, TypeScript, Vite, Matter.js, Zustand, and TailwindCSS.

## User Review Required
> [!IMPORTANT]
> This plan creates a new Vite‑React workspace, adds a menu entry, and updates dependencies. Please confirm the integration approach (menu location, build strategy, asset location, target devices) before we start coding.

## Open Questions
> [!WARNING]
> - **Integration point**: Which component should host the new menu item? (Sidebar/MenuComponent, top‑level nav, or a dedicated route.)
> - **Build output**: Separate bundle, inline, or lazy‑loaded?
> - **Asset location**: `games/bird-smash/public` or shared `public/`?
> - **Target devices**: Desktop only, Desktop + mobile, or full responsive?
> - **Design doc**: Do you want a separate `design.md`? (Already created.)

## Proposed Changes
---
### 1. Scaffold Game Workspace
Create `games/bird-smash` with Vite‑React template.

#### [NEW] games/bird-smash/package.json
```json
{
  "name": "bird-smash",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "matter-js": "^0.19.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.24",
    "autoprefixer": "^10.4.14",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.38.0"
  }
}
```

#### [NEW] games/bird-smash/vite.config.ts
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/bird-smash/',
  plugins: [react()],
  build: {
    outDir: '../../dist/bird-smash',
  },
});
```

#### [NEW] games/bird-smash/tailwind.config.cjs
```js
module.exports = {
  content: ['./src/**/*.{tsx,ts,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        sky: 'hsl(210, 50%, 95%)',
        wood: 'hsl(30, 40%, 55%)',
        stone: 'hsl(0, 0%, 30%)',
        glass: 'hsl(200, 10%, 85%)',
      },
      animation: { shake: 'shake 0.5s ease-in-out' },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
};
```

### 2. Core Game Code (high‑level modules)
- `src/state/gameStore.ts` – Zustand store for birds, structures, score, UI flags.
- `src/hooks/useGame.ts` – creates Matter.js engine, world, runs RAF loop.
- `src/components/GameCanvas.tsx` – renders `<canvas>` and wires Matter render.
- `src/components/Slingshot.tsx` – drag‑release handling, trajectory preview.
- Bird components (`RedBird.tsx`, `YellowBird.tsx`, `BlueBird.tsx`, `BlackBird.tsx`) – each implements `applyAbility`.
- Structure components (`WoodBlock.tsx`, `StoneBlock.tsx`, `GlassBlock.tsx`).
- UI components (`HUD.tsx`, `PauseMenu.tsx`, `ResultScreen.tsx`).
- Effect components (`Particles.tsx`, `CameraShake.tsx`).

### 3. Integration into Main App
Modify the existing menu component to add the entry.

#### [MODIFY] apps/your-app/src/components/MenuComponent.tsx
```tsx
const menuItems = [
  // existing items ...
  { label: 'Bird Smash', path: '/bird-smash' },
];
```
(If the project uses a different file, adjust accordingly.)

### 4. Root Dependency Updates
Add the new workspace to `pnpm-workspace.yaml` and ensure shared deps are hoisted.

#### [MODIFY] package.json (root)
```json
"workspaces": [
  "apps/*",
  "packages/*",
  "games/*"
]
```
(If already present, just ensure `games/*` is included.)

### 5. Tests
- **Unit**: `tests/gameStore.test.ts` – verify state transitions.
- **E2E**: `tests/bird-smash.spec.ts` – Playwright script to drag, launch, and complete a level.

### 6. README for the Game
Create `games/bird-smash/README.md` with build/run instructions and contribution notes.

---
## Verification Plan
### Automated
- Run `pnpm install` at repo root (installs all workspaces).
- `pnpm --filter bird-smash dev` – launch dev server, verify no console errors.
- `pnpm run test` inside `games/bird-smash` – unit tests.
- `npx playwright test` – E2E flow.

### Manual
- Serve the full app (`pnpm dev`).
- Click the new **Bird Smash** menu item, ensure the game loads.
- Play through each bird ability, verify physics, score, star rating.
- Test on a mobile device (touch drag) if target includes mobile.

---
*Once you approve the above plan and answer the open questions, I will scaffold the workspace, add the menu entry, and begin implementing the modules step‑by‑step.*
