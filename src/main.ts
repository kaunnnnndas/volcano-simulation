import * as THREE from 'three';
import VolcanoGeometry from './volcano/VolcanoGeometry';
import Terrain from './terrain/Terrain';
import SimulationManager, { EruptionStage } from './core/SimulationManager';
import LavaSystem from './lava/LavaSystem';
import ParticleSystem from './particles/ParticleSystem';
import LightingManager from './effects/LightingManager';
import CameraController from './camera/CameraController';
import AudioManager from './audio/AudioManager';
import EruptionController from './eruption/EruptionController';
import UIController from './ui/UIController';

class VolcanoSimulation {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private simulationManager: SimulationManager;
  private volcanoGeometry: VolcanoGeometry;
  private terrain: Terrain;
  private lavaSystem: LavaSystem;
  private eruptionController: EruptionController;
  private lightingManager: LightingManager;
  private cameraController: CameraController;
  private audioManager: AudioManager;
  private uiController: UIController;
  private clock: THREE.Clock;
  private frameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 60;

  constructor() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(150, 80, 150);
    this.camera.lookAt(0, 50, 0);

    // Renderer setup
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Core systems
    this.simulationManager = new SimulationManager();
    this.volcanoGeometry = new VolcanoGeometry(this.scene);
    this.terrain = new Terrain(this.scene);
    this.lavaSystem = new LavaSystem(this.scene);
    this.eruptionController = new EruptionController(this.scene);
    this.lightingManager = new LightingManager(this.scene);
    this.cameraController = new CameraController(this.camera, this.scene);
    this.audioManager = new AudioManager();
    this.uiController = new UIController(this.simulationManager);

    this.clock = new THREE.Clock();

    // Expose to window for UI
    (window as any).cameraController = this.cameraController;
    (window as any).audioManager = this.audioManager;

    // Setup listeners
    this.simulationManager.subscribe('state-change', (state) => {
      this.updateSimulation(state);
    });

    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('wheel', (e) => this.onMouseWheel(e));

    // Start animation loop
    this.animate();
  }

  private updateSimulation(state: any): void {
    this.lightingManager.update(state);
    this.lavaSystem.update(state, 0.016);
    this.eruptionController.update(state, 0.016);
    this.audioManager.update(state);

    state.particleCount = this.eruptionController.getParticleCount() + this.lavaSystem.getParticleCount();
    this.uiController.updateInfoPanel(state);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();
    this.frameTime += deltaTime;
    this.frameCount++;

    if (this.frameTime >= 1) {
      this.fps = this.frameCount / this.frameTime;
      this.uiController.updateFPS(this.fps);
      this.frameTime = 0;
      this.frameCount = 0;
    }

    // Update simulation
    this.simulationManager.update(deltaTime);
    const state = this.simulationManager.getState();

    // Update camera
    this.cameraController.update(deltaTime, state);

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onMouseMove(event: MouseEvent): void {
    const deltaX = event.movementX || 0;
    const deltaY = event.movementY || 0;

    if (event.buttons === 1) {
      this.cameraController.rotateAroundVolcano(deltaX, deltaY);
    }
  }

  private onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 5 : -5;
    this.cameraController.zoomCamera(delta);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VolcanoSimulation();
  });
} else {
  new VolcanoSimulation();
}

export default VolcanoSimulation;