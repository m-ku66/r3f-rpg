import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import OrthoCam from "./OrthoCam";
import Terrain, { GridCell } from "./Terrain";
import Unit from "./Unit";
import { CameraStateContext } from "../contexts/CameraContext";
import { useContext } from "react";

const GameRenderer = () => {
  const [terrainGrid, setTerrainGrid] = useState<GridCell[]>([]);
  const cameraState = useContext(CameraStateContext);

  const findStartingCell = (x: number, z: number): GridCell | null => {
    const column = terrainGrid.filter(
      (cell) =>
        Math.abs(cell.x - x) < 0.1 &&
        Math.abs(cell.z - z) < 0.1 &&
        cell.traversable
    );

    if (column.length > 0) {
      const highest = column.reduce((highest, cell) =>
        cell.y > highest.y ? cell : highest
      );
      return highest;
    }
    return null;
  };

  const startingCell = findStartingCell(0, 0);

  return (
    <div className="h-full w-full">
      <Canvas>
        <CameraStateContext.Provider value={cameraState}>
          <OrthoCam
            position={[10, 10, 10]}
            target={[0, 0, 0]}
            zoom={0.5}
            resetDelay={2000}
            panSpeed={0.01}
          />

          <ambientLight intensity={0.5} />
          <pointLight position={[0, 5, 0]} intensity={0.5} />

          <Terrain
            width={20}
            height={10}
            depth={20}
            noiseScale={30}
            onGridGenerated={setTerrainGrid}
          />

          {terrainGrid.length > 0 && startingCell && (
            <Unit
              position={[startingCell.x, startingCell.y, startingCell.z]}
              movement={4}
              jump={2}
              grid={terrainGrid}
            />
          )}
        </CameraStateContext.Provider>
      </Canvas>
    </div>
  );
};

export default GameRenderer;
