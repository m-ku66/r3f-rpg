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
            <div className="mt-2">
              <div className="flex justify-between">
                <span>HP:</span>
                <span>
                  {selectedUnit.stats.hp}/{selectedUnit.stats.maxHp}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Attack:</span>
                <span>{selectedUnit.stats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span>Defense:</span>
                <span>{selectedUnit.stats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span>Movement:</span>
                <span>{selectedUnit.stats.movement}</span>
              </div>
              <div className="flex justify-between">
                <span>Jump:</span>
                <span>{selectedUnit.stats.jump}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleUI;
