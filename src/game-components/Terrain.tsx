import { useEffect, memo } from "react";
import { useGameStore } from "../store/gameStore";

type TerrainProps = {
  width: number;
  height: number;
  depth: number;
  noiseScale?: number;
};

// Use memo to prevent unnecessary re-renders
const Terrain = memo(
  ({ width, height, depth, noiseScale = 30 }: TerrainProps) => {
    // Get terrain data from the store
    const { terrain, generateTerrain } = useGameStore();

    // Generate terrain on mount
    useEffect(() => {
      generateTerrain(width, height, depth, noiseScale);
    }, [width, height, depth, noiseScale, generateTerrain]);

    return (
      <group position={[0, 0, 0]}>
        {terrain.grid.map((cell, index) => (
          <mesh key={index} position={[cell.x, cell.y, cell.z]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={cell.traversable ? "green" : "red"} />
          </mesh>
        ))}
      </group>
    );
  }
);

export default Terrain;
