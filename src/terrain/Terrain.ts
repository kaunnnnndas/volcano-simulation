import * as THREE from 'three';
import ProceduralGenerator from '../utils/ProceduralGenerator';

export class Terrain {
  private geometry: THREE.BufferGeometry;
  private material: THREE.Material;
  private mesh: THREE.Mesh;
  private generator: ProceduralGenerator;
  private heightMap: Float32Array;
  private width: number;
  private length: number;
  private segmentSize: number;

  constructor(scene: THREE.Scene, width: number = 400, length: number = 400, segmentSize: number = 10) {
    this.width = width;
    this.length = length;
    this.segmentSize = segmentSize;
    this.generator = new ProceduralGenerator(42);

    const widthSegments = Math.floor(width / segmentSize);
    const lengthSegments = Math.floor(length / segmentSize);

    this.geometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments);
    this.geometry.rotateX(-Math.PI / 2);

    this.heightMap = new Float32Array(this.geometry.attributes.position.count);
    const positionAttribute = this.geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      let height = this.generator.generateTerrainHeight(x, z, 40);
      const volcanoHeight = this.generator.generateVolcanoHeight(x, z, 0, 0);
      height = Math.max(height, volcanoHeight);

      positions[i + 1] = height;
      this.heightMap[i / 3] = height;
    }

    positionAttribute.needsUpdate = true;
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.name = 'terrain';

    scene.add(this.mesh);
  }

  getHeightAt(x: number, z: number): number {
    const positionAttribute = this.geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;

    const gridX = Math.floor((x + this.width / 2) / this.segmentSize);
    const gridZ = Math.floor((z + this.length / 2) / this.segmentSize);
    const widthSegments = Math.floor(this.width / this.segmentSize);

    if (gridX < 0 || gridX >= widthSegments || gridZ < 0 || gridZ >= Math.floor(this.length / this.segmentSize)) {
      return 0;
    }

    const index = gridZ * (widthSegments + 1) + gridX;
    return positions[index * 3 + 1] || 0;
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  dispose(): void {
    this.geometry.dispose();
    if (this.material instanceof THREE.Material) {
      this.material.dispose();
    }
  }
}

export default Terrain;
