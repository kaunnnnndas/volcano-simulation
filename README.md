# Volcano Simulation 🌋

An interactive 3D volcano eruption simulator built with Three.js, TypeScript, and Vite.

## Features

🌋 **Realistic Eruption System**
- Multi-stage eruption progression (Dormant → Awakening → Strombolian → Major → Peak → Declining)
- Dynamic intensity control
- Procedurally generated terrain
- Interactive volcano geometry with crater

💥 **Advanced Particle Systems**
- Lava particles with temperature-based coloring
- Ash clouds with wind influence
- Smoke simulation
- Embers and projectiles
- Steam effects
- Real-time particle pooling for performance

🎥 **Dynamic Camera System**
- Free camera mode with mouse control
- Cinematic camera with automatic paths
- Scientific viewing angle
- Underground magma chamber view
- Smooth transitions between modes

🌞 **Environmental Effects**
- Real-time lighting based on eruption intensity
- Multiple lighting modes (Day, Sunset, Night)
- Dynamic fog system
- Directional and point light shadows
- Ambient lighting adjustments

🔊 **Audio System**
- Procedural sound generation
- Stage-specific audio feedback
- Rumble, explosion, and whoosh effects
- Wind-influenced audio dynamics

🎮 **Interactive Controls**
- Start/Pause/Resume/Reset simulation
- Eruption intensity slider
- Wind speed and direction controls
- Simulation speed multiplier
- Time of day selection
- Fog density adjustment
- Quality presets (Low/Medium/High/Ultra)

📚 **Educational Mode**
- Volcano terminology and descriptions
- Interactive learning panels
- Real-time data visualization
- Temperature and pressure indicators

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── main.ts                 # Main application entry point
├── core/
│   └── SimulationManager.ts   # State management and simulation logic
├── volcano/
│   └── VolcanoGeometry.ts     # 3D volcano model
├── terrain/
│   └── Terrain.ts             # Procedural terrain generation
├── lava/
│   └── LavaSystem.ts          # Lava particle physics
├── particles/
│   └── ParticleSystem.ts      # Universal particle system
├── eruption/
│   └── EruptionController.ts  # Eruption stage management
├── camera/
│   └── CameraController.ts    # Camera control systems
├── effects/
│   └── LightingManager.ts     # Lighting and fog
├── audio/
│   └── AudioManager.ts        # Audio synthesis
├── ui/
│   └── UIController.ts        # UI event handling
└── utils/
    └── ProceduralGenerator.ts # Noise and procedural generation
```

## Controls

### Mouse
- **Drag (Left Click)**: Rotate camera around volcano
- **Scroll**: Zoom in/out

### UI Controls
- **Start Eruption**: Begin the eruption simulation
- **Intensity Slider**: Control eruption force (0-100%)
- **Wind Speed/Direction**: Adjust particle drift
- **Simulation Speed**: Play at different time scales
- **Camera Mode**: Switch between different viewing angles
- **Time of Day**: Change lighting conditions
- **Educational Mode**: Toggle learning information
- **Sound Toggle**: Enable/disable audio

## Simulation Stages

1. **Dormant**: No activity (0s)
2. **Awakening**: Pressure building (2-5s)
3. **Strombolian**: Regular explosions (5-10s)
4. **Major**: Large eruption column (10-20s)
5. **Peak**: Maximum intensity (20-30s)
6. **Declining**: Gradual decrease (30-45s)

## Technical Details

### Performance Optimization
- Instanced mesh rendering for rocks
- Particle pooling to reduce GC pressure
- LOD (Level of Detail) for terrain
- Shadow map optimization
- Efficient buffer updates

### Browser Compatibility
- WebGL 2.0 support required
- Web Audio API for sound (graceful degradation)
- ES2020+ JavaScript support

## Technologies

- **Three.js**: 3D graphics rendering
- **TypeScript**: Type-safe development
- **Vite**: Fast build and dev server
- **Simplex Noise**: Procedural generation
- **Web Audio API**: Sound synthesis

## Future Enhancements

- [ ] Real volcano data integration
- [ ] Multi-volcano simulations
- [ ] Particle collision detection
- [ ] Lava flow simulation
- [ ] Seismic activity visualization
- [ ] Extended tutorial system
- [ ] Custom eruption profiles
- [ ] Data export/replay functionality

## License

MIT

## Contributing

Contributions welcome! Feel free to submit issues and pull requests.

---

**Created with passion for volcanology and WebGL** 🌋✨