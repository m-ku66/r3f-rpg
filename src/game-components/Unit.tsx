import { memo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGameStore } from "../store/gameStore";

type UnitProps = {
  unitId: string;
};

const Unit = memo(({ unitId }: UnitProps) => {
  const {
    units,
    selectedUnitId,
    highlightedCells,
    currentPath,
    selectUnit,
    findPath,
    executePath,
  } = useGameStore();

  const unit = units[unitId];

  if (!unit) return null;

  const isSelected = selectedUnitId === unitId;

  const handleUnitClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectUnit(isSelected ? null : unitId);
  };

  const handleCellClick = (
    event: ThreeEvent<MouseEvent>,
    cellIndex: number
  ) => {
    event.stopPropagation();
    findPath(unitId, highlightedCells[cellIndex]);
  };

  const handlePathClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    executePath();
  };

  return (
    <group>
      {/* Unit representation */}
      <mesh
        position={[unit.position[0], unit.position[1] + 1, unit.position[2]]}
        onClick={handleUnitClick}
      >
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color={isSelected ? "yellow" : "blue"} />
      </mesh>

      {/* Display reachable cells when unit is selected */}
      {isSelected &&
        highlightedCells.map((cell, index) => (
          <mesh
            key={`reachable-${index}`}
            position={[cell.x, cell.y + 0.5, cell.z]}
            onClick={(e) => handleCellClick(e, index)}
          >
            <boxGeometry args={[0.9, 0.2, 0.9]} />
            <meshStandardMaterial
              color="cyan"
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>
        ))}

      {/* Display current path */}
      {isSelected &&
        currentPath.map((cell, index) => (
          <mesh
            key={`path-${index}`}
            position={[cell.x, cell.y + 0.6, cell.z]}
            onClick={handlePathClick}
          >
            <boxGeometry args={[0.5, 0.1, 0.5]} />
            <meshStandardMaterial
              color="yellow"
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        ))}
    </group>
  );
});

export default Unit;
