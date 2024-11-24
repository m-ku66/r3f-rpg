import { createNoise2D } from "simplex-noise";

type TerrainProps = {
  width: number;
  height: number; // Maximum stack height for grid cells
  depth: number;
  noiseScale?: number; // Noise parameters that control the terrain's smoothness
};

type Cell = {
  position: [x: number, y: number, z: number];
  traversable: boolean;
};

function Terrain({ width, depth, height, noiseScale = 30 }: TerrainProps) {
  const cells: Cell[] = [];
  const noise2D = createNoise2D(); // Create a 2D noise generator

  // Terrain offsets to center the grid
  const xOffset = width / 2;
  const zOffset = depth / 2;
  const yOffset = height / 2;

  // Noise parameters
  const scale = noiseScale; // Larger values = smoother, more spread-out noise
  const noiseAmplitude = height; // Maximum stack height
  const octaves = 4; // Number of noise layers
  const persistence = 0.5; // Controls amplitude reduction per octave
  const lacunarity = 2.0; // Controls frequency increase per octave

  
  /**
   * Octave-based Perlin noise function
   * 
   * Generates a Perlin noise value at (x, z) using octave-based noise.
   * Octave-based noise is a technique to generate a more detailed noise pattern
   * by summing multiple noise functions with different frequencies and amplitudes.
   * The resulting noise value is normalized to the range [0, 1] and can be used
   * to generate a terrain with varying heights and smoothness.
   *
   * @param {number} x - The x-coordinate of the terrain cell.
   * @param {number} z - The z-coordinate of the terrain cell.
   * @returns {number} The Perlin noise value at (x, z) in the range [0, 1].
   */
  function generateOctaveNoise(x: number, z: number): number {
    // Initialize amplitude and frequency to 1
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = 0;

    // Iterate over the number of octaves
    for (let i = 0; i < octaves; i++) {
      // Calculate the noise coordinates for the current octave
      const nx = (x * frequency) / scale;
      const nz = (z * frequency) / scale;

      // Accumulate the noise value with the current amplitude and frequency
      noiseValue += amplitude * noise2D(nx, nz);

      // Update amplitude and frequency for the next octave
      amplitude *= persistence; // Reduce amplitude by persistence factor
      frequency *= lacunarity; // Increase frequency by lacunarity factor
    }

    // Normalize the noise value to the range [0, 1]
    return (noiseValue + 1) / 2;
  }

  // Generate terrain cells
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      // Get the layered noise value for the current (x, z) position
      const noiseValue = generateOctaveNoise(x, z);

      // Map noise value to a stack height
      const stackHeight = Math.max(1, Math.floor(noiseValue * noiseAmplitude));

      // Create stacks for the current grid cell
      for (let y = 0; y < stackHeight; y++) {
        cells.push({
          position: [x - xOffset, y - yOffset, z - zOffset], // Stack grid cells vertically
          traversable: y === stackHeight - 1, // Only the top cell is traversable
        });
      }
    }
  }

  return (
    <group position={[0, 0, 0]}>
      {cells.map((cell, index) => (
        <mesh key={index} position={cell.position}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={cell.traversable ? "green" : "red"} />
        </mesh>
      ))}
    </group>
  );
}

export default Terrain;
