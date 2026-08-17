import * as THREE from 'three';

export class SimplexNoise {
  private permutation: number[];

  constructor(seed: number = 0) {
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    
    // Fisher-Yates shuffle with seed
    for (let i = 255; i > 0; i--) {
      const j = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }

    this.permutation = this.permutation.concat(this.permutation);
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const p = this.permutation;
    const aa = p[p[p[xi] + yi] + zi];
    const ab = p[p[p[xi] + yi + 1] + zi];
    const ba = p[p[p[xi + 1] + yi] + zi];
    const bb = p[p[p[xi + 1] + yi + 1] + zi];
    const aaa = p[aa + zi];
    const aab = p[aa + zi + 1];
    const aba = p[ab + zi];
    const abb = p[ab + zi + 1];
    const baa = p[ba + zi];
    const bab = p[ba + zi + 1];
    const bba = p[bb + zi];
    const bbb = p[bb + zi + 1];

    const g000 = this.grad(aaa, xf, yf, zf);
    const g100 = this.grad(baa, xf - 1, yf, zf);
    const g010 = this.grad(aba, xf, yf - 1, zf);
    const g110 = this.grad(bba, xf - 1, yf - 1, zf);
    const g001 = this.grad(aab, xf, yf, zf - 1);
    const g101 = this.grad(bab, xf - 1, yf, zf - 1);
    const g011 = this.grad(abb, xf, yf - 1, zf - 1);
    const g111 = this.grad(bbb, xf - 1, yf - 1, zf - 1);

    const x00 = this.lerp(g000, g100, u);
    const x10 = this.lerp(g010, g110, u);
    const x0 = this.lerp(x00, x10, v);
    const x01 = this.lerp(g001, g101, u);
    const x11 = this.lerp(g011, g111, u);
    const x1 = this.lerp(x01, x11, v);

    return this.lerp(x0, x1, w);
  }
}

export class ProceduralGenerator {
  private noise: SimplexNoise;

  constructor(seed: number = 0) {
    this.noise = new SimplexNoise(seed);
  }

  generateTerrainHeight(x: number, z: number, scale: number = 50): number {
    let height = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < 6; i++) {
      height += amplitude * this.noise.noise(x * frequency / scale, 0, z * frequency / scale);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return (height / maxValue) * 30;
  }

  generateVolcanoHeight(x: number, z: number, centerX: number, centerZ: number): number {
    const dx = x - centerX;
    const dz = z - centerZ;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Volcano cone shape
    let height = Math.max(0, 80 - distance * 1.5);

    // Add surface details
    const detail = this.noise.noise(x * 0.05, 0, z * 0.05) * 5;
    height += detail;

    // Make it asymmetric
    const asymmetry = this.noise.noise(x * 0.02, 0, z * 0.02) * 10;
    height += asymmetry * Math.max(0, (60 - distance) / 60);

    return height;
  }

  generateRockPositions(centerX: number, centerZ: number, count: number, radius: number): Array<{ x: number; z: number; size: number }> {
    const rocks = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.noise.noise(i, i, 0) * 0.5;
      const r = radius * 0.5 + this.noise.noise(i * 0.5, 0, i * 0.3) * radius * 0.5;
      const size = 1 + Math.abs(this.noise.noise(i * 0.7, i * 0.8, 0)) * 4;

      rocks.push({
        x: centerX + Math.cos(angle) * r,
        z: centerZ + Math.sin(angle) * r,
        size
      });
    }
    return rocks;
  }
}

export default ProceduralGenerator;
