import { memo, useRef, useState, useEffect } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useGameStore } from "../store/gameStore";
import { EntityId, UnitType } from "../types/game";
import { Object3D, Vector3 } from "three";
import { Group } from "three";

type UnitProps = {
  unitId: EntityId;
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
  const unitRef = useRef<Object3D>(null);

  // For animation
  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [moveSpeed] = useState(0.1);

  // Update target position when unit position changes
  useEffect(() => {
    if (unit) {
      setTargetPosition(
        new Vector3(...unit.position).add(new Vector3(0, 1, 0))
      );
    }
  }, [unit?.position]);

  // Handle smooth movement animation
  useFrame(() => {
    if (unitRef.current && targetPosition) {
      // Smoothly interpolate to the target position
      unitRef.current.position.lerp(targetPosition, moveSpeed);
    }
  });

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

  // Select the appropriate model and color based on unit type
  const getUnitModel = () => {
    // In a real game, we would use different models for different unit types
    // For this prototype, we'll use simple geometries
    switch (unit.type) {
      case UnitType.WARRIOR:
        return (
          <mesh onClick={handleUnitClick}>
            <boxGeometry args={[0.6, 0.8, 0.6]} />
            <meshStandardMaterial color={isSelected ? "yellow" : "blue"} />
          </mesh>
        );
      case UnitType.ARCHER:
        return (
          <mesh onClick={handleUnitClick}>
            <coneGeometry args={[0.4, 0.8, 8]} />
            <meshStandardMaterial color={isSelected ? "yellow" : "blue"} />
          </mesh>
        );
      case UnitType.MAGE:
        return (
          <mesh onClick={handleUnitClick}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color={isSelected ? "yellow" : "blue"} />
          </mesh>
        );
      default:
        return (
          <mesh onClick={handleUnitClick}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color={isSelected ? "yellow" : "red"} />
          </mesh>
        );
    }
  };

  // Render health bar above unit
  const renderHealthBar = () => {
    const { hp, maxHp } = unit.stats;
    const healthPercent = hp / maxHp;
    const width = 0.8;
    const height = 0.1;

    return (
      <group position={[0, 1, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Filled part */}
        <mesh position={[((healthPercent - 1) * width) / 2, 0, 0.01]}>
          <boxGeometry args={[width * healthPercent, height * 0.8, 0.05]} />
          <meshStandardMaterial
            color={
              healthPercent > 0.5
                ? "green"
                : healthPercent > 0.25
                ? "yellow"
                : "red"
            }
          />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Unit model */}
      <group
        ref={unitRef as React.RefObject<Group>}
        position={[unit.position[0], unit.position[1] + 1, unit.position[2]]}
      >
        {getUnitModel()}
        {renderHealthBar()}

        {/* Unit name */}
        <group position={[0, 1.2, 0]}>
          {/* In a real game, you'd use TextGeometry or HTML/CSS overlay */}
        </group>
      </group>

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
