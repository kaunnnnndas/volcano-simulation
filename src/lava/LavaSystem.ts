import * as THREE from 'three';
import { SimulationState } from '../core/SimulationManager';

export interface LavaParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  temperature: number;
}

export class LavaSystem {
  private particles: LavaParticle[] = [];
  private pool: LavaParticle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private scene: THREE.Scene;
  private maxParticles: number;
  private spawnRate: number;
  private craterPosition: THREE.Vector3;

  constructor(scene: THREE.Scene, maxParticles: number = 5000) {
    this.scene = scene;
    this.maxParticles = maxParticles;
    this.spawnRate = 0;
    this.craterPosition = new THREE.Vector3(0, 100, 0);

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.4;
      colors[i * 3 + 2] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      sizeAttenuation: true,
      map: this.createParticleTexture()
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'lava-particles';
    scene.add(this.points);
  }

  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  update(state: SimulationState, deltaTime: number): void {
    this.spawnRate = state.eruptionIntensity * 100;

    // Spawn new particles
    const spawnCount = Math.floor(this.spawnRate * deltaTime);
    for (let i = 0; i < spawnCount && this.particles.length < this.maxParticles; i++) {
      this.spawnParticle();
    }

    // Update particles
    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        this.pool.push(particle);
        continue;
      }

      // Physics
      particle.velocity.y -= 9.8 * deltaTime * 0.3; // Gravity
      particle.velocity.multiplyScalar(0.98); // Drag

      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );

      // Wind influence
      const windForce = state.windSpeed * 0.1;
      const windAngle = (state.windDirection * Math.PI) / 180;
      particle.velocity.x += Math.cos(windAngle) * windForce * deltaTime;
      particle.velocity.z += Math.sin(windAngle) * windForce * deltaTime;

      // Temperature decay
      particle.temperature -= deltaTime * 100;

      // Update geometry
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      // Color based on temperature
      const tempRatio = Math.max(0, Math.min(1, particle.temperature / 1000));
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.2 + tempRatio * 0.6;
      colors[i * 3 + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.setDrawRange(0, this.particles.length);
  }

  private spawnParticle(): void {
    let particle: LavaParticle;

    if (this.pool.length > 0) {
      particle = this.pool.pop()!;
    } else {
      particle = {
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        size: 0,
        temperature: 0
      };
    }

    // Randomize spawn position around crater
    const angle = Math.random() * Math.PI * 2;
    const radius = 35 + Math.random() * 5;
    particle.position.set(
      this.craterPosition.x + Math.cos(angle) * radius,
      this.craterPosition.y,
      this.craterPosition.z + Math.sin(angle) * radius
    );

    // Random velocity
    const speed = 30 + Math.random() * 40;
    const upAngle = Math.PI / 4 + Math.random() * 0.3;
    particle.velocity.set(
      Math.cos(angle) * speed * Math.cos(upAngle),
      Math.sin(upAngle) * speed,
      Math.sin(angle) * speed * Math.cos(upAngle)
    );

    particle.life = 4 + Math.random() * 3;
    particle.maxLife = particle.life;
    particle.size = 0.5 + Math.random() * 1.5;
    particle.temperature = 1000 + Math.random() * 300;

    this.particles.push(particle);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.points);
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}

export default LavaSystem;
