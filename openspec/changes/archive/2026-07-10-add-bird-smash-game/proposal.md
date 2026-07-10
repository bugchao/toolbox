# Change: Add Bird Smash Game

## Why
The toolbox application currently lacks an interactive entertainment feature. Adding a 2D physics‑based slingshot game provides a fun demo of the framework, showcases Matter.js integration, and enriches the user experience.

## What Changes
- Introduce a new Vite‑React workspace `games/bird-smash` implementing the game using React 18, TypeScript, Matter.js, Zustand, and TailwindCSS.
- Add a menu entry "Bird Smash" that navigates to the game.
- Update root `package.json` with required dependencies.
- Configure Vite to build the game under `/bird‑smash`.
- Provide Tailwind configuration, asset pipeline, and shared styling for a premium look.
- Include unit and end‑to‑end tests.

## Impact
- **Specs affected**: none (new capability).
- **Code affected**: `apps/*` menu component, root `package.json`, new `games/bird-smash` source files.
- **Build**: The project will produce an additional bundle served at `/bird-smash`.
- **Runtime**: Increases bundle size modestly; optional lazy‑load can mitigate impact.
