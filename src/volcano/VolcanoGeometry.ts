import * as THREE from 'three';

export class VolcanoGeometry {
  private mainCone: THREE.Mesh;
  private crater: THREE.Mesh;
  private magmaChamber: THREE.Mesh;
  private magmaConduit: THREE.Mesh;
  private scene: THREE.Scene;
  private rocks: THREE.InstancedMesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Create main volcano cone
    this.mainCone = this.createMainCone();
    scene.add(this.mainCone);

    // Create crater
    this.crater = this.createCrater();
    scene.add(this.crater);

    // Create magma chamber (underground)
    this.magmaChamber = this.createMagmaChamber();
    scene.add(this.magmaChamber);

    // Create magma conduit
    this.magmaConduit = this.createMagmaConduit();
    scene.add(this.magmaConduit);

    // Create surrounding rocks
    this.createSurroundingRocks();
  }

  private createMainCone(): THREE.Mesh {
    const geometry = new THREE.ConeGeometry(80, 100, 32, 32);
    
    // Adjust cone to be asymmetric
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Add noise-based distortion
      const noise = Math.sin(x * 0.05 + y * 0.02) * 0.1 + Math.cos(z * 0.03) * 0.08;
      positions[i] += noise * Math.abs(y);
      positions[i + 2] += noise * Math.abs(y) * 0.7;
    }

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.85,
      metalness: 0.05
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 50;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'volcano-cone';

    return mesh;
  }

  private createCrater(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(50, 45, 20, 32, 8, true);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 100;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'crater';

    return mesh;
  }

  private createMagmaChamber(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(40, 16, 16);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.8,
      roughness: 0.4,
      metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -50;
    mesh.visible = false;
    mesh.name = 'magma-chamber';

    return mesh;
  }

  private createMagmaConduit(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(12, 15, 120, 8, 8);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.6,
      roughness: 0.5,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 10;
    mesh.visible = false;
    mesh.name = 'magma-conduit';

    return mesh;
  }

  private createSurroundingRocks(): void {
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.9,
      metalness: 0
    });

    // Create rocks around the volcano base
    const positions: Array<[number, number, number, number]> = [];

    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 100 + Math.random() * 40;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const size = 2 + Math.random() * 6;
      positions.push([x, 0, z, size]);
    }

    // Create instanced mesh for rocks
    const instanceCount = positions.length;
    const instancedRocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, instanceCount);

    positions.forEach((pos, index) => {
      const [x, y, z, size] = pos;
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(x, y + size / 2, z),
        new THREE.Quaternion(),
        new THREE.Vector3(size, size, size)
      );
      instancedRocks.setMatrixAt(index, matrix);
    });

    instancedRocks.castShadow = true;
    instancedRocks.receiveShadow = true;
    instancedRocks.name = 'volcanic-rocks';
    this.scene.add(instancedRocks);
    this.rocks.push(instancedRocks);
  }

  getMainCone(): THREE.Mesh {
    return this.mainCone;
  }

  getCrater(): THREE.Mesh {
    return this.crater;
  }

  getMagmaChamber(): THREE.Mesh {
    return this.magmaChamber;
  }

  getMagmaConduit(): THREE.Mesh {
    return this.magmaConduit;
  }

  showUnderground(show: boolean): void {
    this.mainCone.visible = !show;
    this.crater.visible = !show;
    this.magmaChamber.visible = show;
    this.magmaConduit.visible = show;
  }

  dispose(): void {
    this.mainCone.geometry.dispose();
    (this.mainCone.material as THREE.Material).dispose();
    
    this.crater.geometry.dispose();
    (this.crater.material as THREE.Material).dispose();

    this.magmaChamber.geometry.dispose();
    (this.magmaChamber.material as THREE.Material).dispose();

    this.magmaConduit.geometry.dispose();
    (this.magmaConduit.material as THREE.Material).dispose();

    this.rocks.forEach(rock => {
      rock.geometry.dispose();
      (rock.material as THREE.Material).dispose();
    });
  }
}

export default VolcanoGeometry;
