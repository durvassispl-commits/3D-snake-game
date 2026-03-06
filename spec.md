# 3D Snake Game

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- 3D snake game playable in the browser using React Three Fiber / Three.js
- Snake rendered as 3D segmented body (boxes/cylinders) on a flat grid plane
- Food item rendered as a glowing 3D sphere on the grid
- Game logic: snake moves continuously, grows on eating food, dies on wall/self collision
- Score tracking displayed on screen (current score, high score)
- Keyboard controls: Arrow keys and WASD for direction changes
- Game states: Start screen, Playing, Game Over overlay
- Animated camera that subtly follows the snake or is fixed above the grid
- Visual grid floor with subtle grid lines
- Smooth snake movement with per-tick updates
- Mobile-friendly touch swipe controls (optional enhancement)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Install/confirm React Three Fiber, @react-three/drei, and three.js are available
2. Create main GameCanvas component with R3F Canvas and camera setup
3. Implement game state management (useReducer or useState) for snake position, direction, food, score
4. Build game loop using useFrame or setInterval for snake movement ticks
5. Render snake segments as 3D boxes with a distinct head color
6. Render food as an emissive/glowing sphere
7. Render grid floor plane with grid lines
8. Wire keyboard (Arrow/WASD) and touch event listeners for direction control
9. Implement collision detection (wall bounds and self-collision)
10. Add Start, Playing, and Game Over UI overlays (HTML over canvas)
11. Display score and high score in HUD
12. Add basic lighting (ambient + directional) for 3D depth
