import { createNoise2D } from "simplex-noise";
import { useEffect, useMemo } from "react";

type TerrainProps = {
  width: number;
  height: number;
  depth: number;
  noiseScale?: number;
  onGridGenerated?: (grid: GridCell[]) => void; // Callback to provide the grid
};

export type GridCell = {
  x: number;
  y: number;
  z: number;
  traversable: boolean;
};

function Terrain({
  width,
  height,
  depth,
  noiseScale = 30,
  onGridGenerated,
}: TerrainProps) {
  const noise2D = createNoise2D();

  const xOffset = width / 2;
  const zOffset = depth / 2;
  const yOffset = height / 2;

  const scale = noiseScale;
  const noiseAmplitude = height;
  const octaves = 4;
  const persistence = 0.5;
  const lacunarity = 2.0;

  function generateOctaveNoise(x: number, z: number): number {
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = 0;

    for (let i = 0; i < octaves; i++) {
      const nx = (x * frequency) / scale;
      const nz = (z * frequency) / scale;
      noiseValue += amplitude * noise2D(nx, nz);
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return (noiseValue + 1) / 2;
  }

  // Use useMemo to generate the terrain only when props change
  const cells = useMemo(() => {
    const generatedCells: GridCell[] = [];

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const noiseValue = generateOctaveNoise(x, z);
        const stackHeight = Math.max(
          1,
          Math.floor(noiseValue * noiseAmplitude)
        );

        for (let y = 0; y < stackHeight; y++) {
          generatedCells.push({
            x: x - xOffset,
            y: y - yOffset,
            z: z - zOffset,
            traversable: y === stackHeight - 1,
          });
        }
      }
    }

    return generatedCells;
  }, [
    width,
    height,
    depth,
    noiseScale,
    octaves,
    persistence,
    lacunarity,
    noiseAmplitude,
  ]);

  // Pass the generated grid to the parent via callback
  useEffect(() => {
    if (onGridGenerated) {
      onGridGenerated(cells);
    }
  }, [cells, onGridGenerated]);

  return (
    <group position={[0, 0, 0]}>
      {cells.map((cell, index) => (
        <mesh key={index} position={[cell.x, cell.y, cell.z]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={cell.traversable ? "green" : "red"} />
        </mesh>
      ))}
    </group>
  );
}

export default Terrain;
