import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import OrthoCam from "./OrthoCam";
import Terrain from "./Terrain";
import Unit from "./Unit";

const GameRenderer = () => {
  const { terrain, units, addUnit } = useGameStore();

  // Initialize the game by adding a player unit when terrain is generated
  useEffect(() => {
    if (terrain.grid.length > 0 && Object.keys(units).length === 0) {
      // Find a suitable starting position for the unit (center of map)
      const startingCell =
        terrain.grid.find(
          (cell) => cell.x === 0 && cell.z === 0 && cell.traversable
        ) || terrain.grid.find((cell) => cell.traversable);

      if (startingCell) {
        // Add a player unit at the starting position
        addUnit({
          position: [startingCell.x, startingCell.y, startingCell.z],
          movement: 4,
          jump: 2,
        });
      }
    }
  }, [terrain.grid, units, addUnit]);

  return (
    <div className="h-full w-full">
      <Canvas>
        <OrthoCam zoom={0.5} resetDelay={2000} panSpeed={0.01} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />

        <Terrain width={20} height={10} depth={20} noiseScale={30} />

        {/* Render all units */}
        {Object.keys(units).map((unitId) => (
          <Unit key={unitId} unitId={unitId} />
        ))}
      </Canvas>
    </div>
  );
};

export default GameRenderer;
