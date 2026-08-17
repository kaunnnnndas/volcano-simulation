import * as THREE from 'three';
import { SimulationState } from '../core/SimulationManager';
import ParticleSystem from '../particles/ParticleSystem';

export class EruptionController {
  private lavaSystem: any;
  private ashSystem: ParticleSystem;
  private smokeSystem: ParticleSystem;
  private emberSystem: ParticleSystem;
  private rockSystem: ParticleSystem;
  private steamSystem: ParticleSystem;
  private craterPosition: THREE.Vector3;
  private scene: THREE.Scene;
  private spawnAccumulator: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.craterPosition = new THREE.Vector3(0, 100, 0);

    this.ashSystem = new ParticleSystem(scene, 'ash', 3000);
    this.smokeSystem = new ParticleSystem(scene, 'smoke', 2000);
    this.emberSystem = new ParticleSystem(scene, 'embers', 1500);
    this.rockSystem = new ParticleSystem(scene, 'rocks', 800);
    this.steamSystem = new ParticleSystem(scene, 'steam', 1000);
  }

  update(state: SimulationState, deltaTime: number): void {
    this.spawnAccumulator += deltaTime;

    const intensity = state.eruptionIntensity / 100;

    // Spawn particles based on eruption stage
    if (this.spawnAccumulator > 0.02) {
      const spawnCount = Math.floor(intensity * 50);

      for (let i = 0; i < spawnCount; i++) {
        this.spawnEruptionParticles(state);
      }

      this.spawnAccumulator = 0;
    }

    // Update all particle systems
    this.ashSystem.update(deltaTime, state);
    this.smokeSystem.update(deltaTime, state);
    this.emberSystem.update(deltaTime, state);
    this.rockSystem.update(deltaTime, state);
    this.steamSystem.update(deltaTime, state);
  }

  private spawnEruptionParticles(state: SimulationState): void {
    const intensity = state.eruptionIntensity / 100;
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * 15;

    const spawnPos = new THREE.Vector3(
      this.craterPosition.x + Math.cos(angle) * radius,
      this.craterPosition.y,
      this.craterPosition.z + Math.sin(angle) * radius
    );

    // Spawn lava/embers
    if (Math.random() < intensity * 0.6) {
      const speed = 40 + Math.random() * 60 * intensity;
      const upAngle = Math.PI / 3 + Math.random() * 0.3;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed * Math.cos(upAngle),
        Math.sin(upAngle) * speed,
        Math.sin(angle) * speed * Math.cos(upAngle)
      );
      this.emberSystem.spawn(spawnPos, velocity, state);
    }

    // Spawn ash
    if (Math.random() < intensity * 0.8) {
      const ashSpeed = 20 + Math.random() * 40 * intensity;
      const ashAngle = Math.PI / 4 + Math.random() * 0.5;
      const ashVelocity = new THREE.Vector3(
        Math.cos(angle) * ashSpeed * Math.cos(ashAngle) * 0.5,
        Math.sin(ashAngle) * ashSpeed,
        Math.sin(angle) * ashSpeed * Math.cos(ashAngle) * 0.5
      );
      this.ashSystem.spawn(spawnPos, ashVelocity, state);
    }

    // Spawn smoke
    if (Math.random() < intensity * 0.5) {
      const smokeVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        10 + Math.random() * 20,
        (Math.random() - 0.5) * 15
      );
      this.smokeSystem.spawn(spawnPos, smokeVelocity, state);
    }

    // Spawn rocks at higher intensities
    if (intensity > 0.5 && Math.random() < intensity * 0.3) {
      const rockSpeed = 50 + Math.random() * 80 * intensity;
      const rockAngle = Math.PI / 5 + Math.random() * 0.4;
      const rockVelocity = new THREE.Vector3(
        Math.cos(angle) * rockSpeed * Math.cos(rockAngle),
        Math.sin(rockAngle) * rockSpeed,
        Math.sin(angle) * rockSpeed * Math.cos(rockAngle)
      );
      this.rockSystem.spawn(spawnPos, rockVelocity, state);
    }

    // Spawn steam
    if (Math.random() < intensity * 0.2) {
      const steamVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        15 + Math.random() * 30,
        (Math.random() - 0.5) * 10
      );
      this.steamSystem.spawn(spawnPos, steamVelocity, state);
    }
  }

  getParticleCount(): number {
    return (
      this.ashSystem.getParticleCount() +
      this.smokeSystem.getParticleCount() +
      this.emberSystem.getParticleCount() +
      this.rockSystem.getParticleCount() +
      this.steamSystem.getParticleCount()
    );
  }

  dispose(): void {
    this.ashSystem.dispose();
    this.smokeSystem.dispose();
    this.emberSystem.dispose();
    this.rockSystem.dispose();
    this.steamSystem.dispose();
  }
}

export default EruptionController;