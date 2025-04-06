import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { UnitType } from "../types/game";
import OrthoCam from "./OrthoCam";
import Terrain from "./Terrain";
import Unit from "./Unit";

const GameRenderer = () => {
  const { terrain, units, players, createPlayer, createUnit } = useGameStore();

  // Initialize the game
  useEffect(() => {
    if (terrain.grid.length > 0 && Object.keys(players).length === 0) {
      // Create player
      const playerId = createPlayer("Player 1", "player");

      // Create enemy
      const enemyId = createPlayer("Enemy", "enemy");

      // Find a suitable starting position for player units
      const playerStartCell =
        terrain.grid.find(
          (cell) => cell.x === 0 && cell.z === 0 && cell.traversable
        ) || terrain.grid.find((cell) => cell.traversable);

      // Find a position for enemy units
      const enemyStartCell =
        terrain.grid.find(
          (cell) => cell.x === 5 && cell.z === 5 && cell.traversable
        ) ||
        terrain.grid.find(
          (cell) => cell.traversable && cell !== playerStartCell
        );

      if (playerStartCell) {
        // Add player units
        createUnit(playerId, UnitType.WARRIOR, [
          playerStartCell.x,
          playerStartCell.y,
          playerStartCell.z,
        ]);

        // Find adjacent cells
        const adjacentCell = terrain.grid.find(
          (cell) =>
            cell.x === playerStartCell.x + 1 &&
            cell.z === playerStartCell.z &&
            cell.traversable
        );

        if (adjacentCell) {
          createUnit(playerId, UnitType.ARCHER, [
            adjacentCell.x,
            adjacentCell.y,
            adjacentCell.z,
          ]);
        }
      }

      if (enemyStartCell) {
        // Add enemy unit
        createUnit(enemyId, UnitType.MAGE, [
          enemyStartCell.x,
          enemyStartCell.y,
          enemyStartCell.z,
        ]);
      }
    }
  }, [terrain.grid, players, createPlayer, createUnit]);

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
