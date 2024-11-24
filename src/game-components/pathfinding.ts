export const calculatePath = (
  start: [number, number, number],
  target: [number, number, number],
  terrain: number[][],
  stats: { movement: number; jump: number }
): [number, number, number][] | null => {
  const [sx, sy, sz] = start;
  const [tx, ty, tz] = target;
  const maxMove = stats.movement;
  const maxJump = stats.jump;

  // A* Algorithm
  const openSet = new Set<string>();
  const closedSet = new Set<string>();
  const cameFrom: Record<string, string> = {};

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};

  const startKey = `${sx},${sy},${sz}`;
  const targetKey = `${tx},${ty},${tz}`;

  gScore[startKey] = 0;
  fScore[startKey] = heuristic([sx, sy, sz], [tx, ty, tz]);

  openSet.add(startKey);

  const getKey = (pos: [number, number, number]) =>
    `${pos[0]},${pos[1]},${pos[2]}`;
  const parseKey = (key: string): [number, number, number] =>
    key.split(",").map(Number) as [number, number, number];

  while (openSet.size > 0) {
    let current = Array.from(openSet).reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );

    if (current === targetKey) {
      // Reconstruct path
      const path = [];
      while (current in cameFrom) {
        path.unshift(parseKey(current));
        current = cameFrom[current];
      }
      return path;
    }

    openSet.delete(current);
    closedSet.add(current);

    const [cx, cy, cz] = parseKey(current);

    // Generate neighbors
    const neighbors = [
      [cx + 1, cy, cz],
      [cx - 1, cy, cz],
      [cx, cy, cz + 1],
      [cx, cy, cz - 1],
    ].filter(([nx, ny, nz]) => {
      const heightDiff = Math.abs(terrain[nx]?.[nz] ?? 0 - cy);
      return (
        Math.abs(nx - sx) + Math.abs(nz - sz) <= maxMove &&
        heightDiff <= maxJump &&
        !closedSet.has(getKey([nx, ny, nz]))
      );
    });

    for (const neighbor of neighbors) {
      const neighborKey = getKey(neighbor as [number, number, number]);
      const tentativeGScore = gScore[current] + 1;

      if (!openSet.has(neighborKey)) {
        openSet.add(neighborKey);
      } else if (tentativeGScore >= gScore[neighborKey]) {
        continue;
      }

      // This path is the best so far
      cameFrom[neighborKey] = current;
      gScore[neighborKey] = tentativeGScore;
      fScore[neighborKey] = tentativeGScore + heuristic(neighbor as [number, number, number], [tx, ty, tz]);
    }
  }

  return null; // No path found
};

// Heuristic function for A*
const heuristic = (
  [x1, y1, z1]: [number, number, number],
  [x2, y2, z2]: [number, number, number]
) => Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2);
