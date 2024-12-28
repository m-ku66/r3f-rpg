import { useState } from "react";
import { aStarPathfinding, getNeighbors, GridCell } from "./a-star-pathfinding";
import { ThreeEvent } from "@react-three/fiber";

type UnitProps = {
  position: [number, number, number];
  movement: number;
  jump: number;
  grid: GridCell[];
};

const Unit = ({ position, movement, jump, grid }: UnitProps) => {
  const [currentPosition, setCurrentPosition] =
    useState<[number, number, number]>(position);
  const [reachableCells, setReachableCells] = useState<GridCell[]>([]);

  const findGridCell = (
    position: [number, number, number],
    grid: GridCell[]
  ): GridCell | undefined => {
    const [x, y, z] = position;
    const foundCell = grid.find((cell) => {
      const xMatch = Math.abs(cell.x - x) < 0.1;
      const yMatch = Math.abs(cell.y - y) < 0.1;
      const zMatch = Math.abs(cell.z - z) < 0.1;
      return xMatch && yMatch && zMatch && cell.traversable;
    });

    console.log("Finding grid cell for position:", position);
    console.log("Found cell:", foundCell);
    return foundCell;
  };

  const calculateReachableCells = () => {
    console.log("Calculating reachable cells from position:", currentPosition);
    const startCell = findGridCell(currentPosition, grid);
    if (!startCell) {
      console.error("Starting cell not found in grid");
      return;
    }

    const reachable: GridCell[] = [];
    const visited = new Set<string>();
    const queue: { cell: GridCell; movementCost: number; jumpCost: number }[] =
      [{ cell: startCell, movementCost: 0, jumpCost: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const cellKey = `${current.cell.x},${current.cell.y},${current.cell.z}`;

      if (visited.has(cellKey)) continue;
      visited.add(cellKey);
      reachable.push(current.cell);

      const neighbors = getNeighbors(current.cell, grid);
      console.log(
        `Found ${neighbors.length} neighbors for cell:`,
        current.cell
      );

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y},${neighbor.z}`;
        if (visited.has(neighborKey)) continue;

        const horizontalDistance =
          Math.abs(neighbor.x - startCell.x) +
          Math.abs(neighbor.z - startCell.z);

        const heightDifference = neighbor.y - current.cell.y;
        // Jumping up costs more than moving down
        const newJumpCost =
          current.jumpCost + (heightDifference > 0 ? heightDifference : 0);
        const newMovementCost = current.movementCost + 1;

        const totalHeightDifference = Math.abs(neighbor.y - startCell.y);

        console.log("Checking neighbor:", {
          neighbor,
          horizontalDistance,
          heightDifference,
          newJumpCost,
          totalHeightDifference,
          withinMovement: newMovementCost <= movement,
          withinJump: newJumpCost <= jump && totalHeightDifference <= jump,
        });

        if (
          neighbor.traversable &&
          newMovementCost <= movement &&
          newJumpCost <= jump &&
          totalHeightDifference <= jump
        ) {
          queue.push({
            cell: neighbor,
            movementCost: newMovementCost,
            jumpCost: newJumpCost,
          });
        }
      }
    }

    console.log("Total reachable cells found:", reachable.length);
    setReachableCells(reachable);
  };

  const moveTo = (event: ThreeEvent<MouseEvent>, target: GridCell) => {
    event.stopPropagation();
    console.log("Move attempted to target cell:", target);
    console.log("Current position before move:", currentPosition);

    const startCell = findGridCell(currentPosition, grid);
    if (!startCell) {
      console.error("Invalid start position");
      return;
    }

    const path = aStarPathfinding(startCell, target, grid);
    console.log("Pathfinding result:", path);

    if (path.length > 0) {
      const finalCell = path[path.length - 1];
      console.log("Moving to final cell:", finalCell);
      setCurrentPosition([finalCell.x, finalCell.y, finalCell.z]);
      setReachableCells([]);
    } else {
      console.error("No valid path found between:", {
        start: startCell,
        target: target,
      });
    }
  };

  const handleUnitClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    console.log("Unit clicked at position:", currentPosition);
    calculateReachableCells();
  };

  return (
    <group>
      <mesh
        position={[
          currentPosition[0],
          currentPosition[1] + 1,
          currentPosition[2],
        ]}
        onClick={handleUnitClick}
      >
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {reachableCells.map((cell, index) => (
        <mesh
          key={`${cell.x}-${cell.y}-${cell.z}-${index}`}
          position={[cell.x, cell.y + 0.5, cell.z]}
          onClick={(e) => moveTo(e, cell)}
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
    </group>
  );
};

export default Unit;
