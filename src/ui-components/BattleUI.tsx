import { useGameStore } from "../store/gameStore";
import { getUnitTemplate } from "../data/unitData";
import { Affinity } from "../types/game";

const BattleUI = () => {
  const {
    rotateCamera,
    resetCamera,
    selectedUnitId,
    units,
    players,
    currentTurn,
    endTurn,
  } = useGameStore();

  // Get current player
  const currentPlayer = players[currentTurn];

  // Get selected unit
  const selectedUnit = selectedUnitId ? units[selectedUnitId] : null;

  // Get unit template if a unit is selected
  const unitTemplate = selectedUnit
    ? getUnitTemplate(selectedUnit.templateId)
    : null;

  // Helper function to get element color
  const getElementColor = (affinity: Affinity): string => {
    switch (affinity) {
      case Affinity.FIRE:
        return "text-red-500";
      case Affinity.WATER:
        return "text-blue-500";
      case Affinity.EARTH:
        return "text-yellow-800";
      case Affinity.WIND:
        return "text-green-400";
      case Affinity.LIGHTNING:
        return "text-yellow-400";
      case Affinity.NEUTRAL:
        return "text-blue-300";
      case Affinity.NEUTRAL:
        return "text-yellow-200";
      case Affinity.NEUTRAL:
        return "text-purple-500";
      case Affinity.NEUTRAL:
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="z-10 absolute bottom-0 right-0 flex flex-col items-end">
      {/* Camera Controls */}
      <div className="m-4 w-fit h-16 bg-gray-800/75 rounded-lg flex items-center justify-center gap-4 p-4">
        <img
          src="/left-arrow.svg"
          style={{ width: "3rem", height: "3rem" }}
          className="hover:scale-125 duration-150 cursor-pointer"
          onClick={() => rotateCamera("left")}
          alt="Rotate Left"
        />
        <img
          src="/camera.svg"
          style={{ width: "3rem", height: "3rem" }}
          onClick={resetCamera}
          className="hover:scale-125 duration-150 cursor-pointer"
          alt="Reset Camera"
        />
        <img
          src="/right-arrow.svg"
          style={{ width: "3rem", height: "3rem" }}
          className="hover:scale-125 duration-150 cursor-pointer"
          onClick={() => rotateCamera("right")}
          alt="Rotate Right"
        />
      </div>

      {/* Game Info Panel */}
      <div className="m-4 w-72 bg-gray-800/75 rounded-lg p-4 text-white">
        {/* Current Turn */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {currentPlayer ? `${currentPlayer.name}'s Turn` : "Waiting..."}
          </h2>
          <div className="mt-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={endTurn}
            >
              End Turn
            </button>
          </div>
        </div>

        {/* Selected Unit Info */}
        {selectedUnit && (
          <div className="border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedUnit.name}</h3>
              <span
                className={`px-2 py-1 rounded text-xs ${getElementColor(
                  selectedUnit.affinity
                )}`}
              >
                {selectedUnit.affinity}
              </span>
            </div>
            <p className="text-sm">
              {unitTemplate?.description || `Type: ${selectedUnit.type}`}
            </p>
            <div className="mt-2 max-h-64 overflow-y-auto pr-2">
              {/* Basic Stats */}
              <div className="flex justify-between">
                <span>Level:</span>
                <span>{selectedUnit.stats.level}</span>
              </div>
              <div className="flex justify-between">
                <span>HP:</span>
                <span>
                  {selectedUnit.stats.hp}/{selectedUnit.stats.maxHp}
                </span>
              </div>

              {/* Combat Stats */}
              <div className="mt-2 border-t border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span>P.ATK:</span>
                  <span>{selectedUnit.stats.patk}</span>
                </div>
                <div className="flex justify-between">
                  <span>M.ATK:</span>
                  <span>{selectedUnit.stats.matk}</span>
                </div>
                <div className="flex justify-between">
                  <span>DEF:</span>
                  <span>{selectedUnit.stats.def}</span>
                </div>
                <div className="flex justify-between">
                  <span>RES:</span>
                  <span>{selectedUnit.stats.res}</span>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="mt-2 border-t border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span>AGI:</span>
                  <span>{selectedUnit.stats.agi}</span>
                </div>
                <div className="flex justify-between">
                  <span>SKILL:</span>
                  <span>{selectedUnit.stats.skill}</span>
                </div>
                <div className="flex justify-between">
                  <span>LUCK:</span>
                  <span>{selectedUnit.stats.luck}</span>
                </div>
                <div className="flex justify-between">
                  <span>WIS:</span>
                  <span>{selectedUnit.stats.wis}</span>
                </div>
              </div>

              {/* Movement Stats */}
              <div className="mt-2 border-t border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span>MOV:</span>
                  <span>{selectedUnit.stats.mov}</span>
                </div>
                <div className="flex justify-between">
                  <span>JUMP:</span>
                  <span>{selectedUnit.stats.jump}</span>
                </div>
              </div>

              {/* Attributes */}
              <div className="mt-2 border-t border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span>Hit:</span>
                  <span>{selectedUnit.attributes.hitRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Evade:</span>
                  <span>{selectedUnit.attributes.evasionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolve:</span>
                  <span>{selectedUnit.attributes.resolve}%</span>
                </div>
              </div>

              {/* Abilities */}
              {selectedUnit.abilities.length > 0 && (
                <div className="mt-2 border-t border-gray-600 pt-2">
                  <h4 className="text-sm font-semibold mb-1">Abilities:</h4>
                  <ul className="text-xs space-y-1">
                    {selectedUnit.abilities.map((ability) => (
                      <li
                        key={ability.id}
                        className="p-1 bg-gray-700/50 rounded"
                      >
                        {ability.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleUI;
