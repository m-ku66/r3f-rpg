import { useGameStore } from "../store/gameStore";

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
      <div className="m-4 w-64 bg-gray-800/75 rounded-lg p-4 text-white">
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
            <h3 className="text-lg font-semibold">{selectedUnit.name}</h3>
            <p className="text-sm">Type: {selectedUnit.type}</p>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleUI;
