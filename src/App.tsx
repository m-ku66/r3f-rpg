import GameRenderer from "./game-components/GameRenderer";
import UIRenderer from "./ui-components/UIRenderer";
import { CameraContextProvider } from "./contexts/CameraContext";

function App() {
  return (
    <CameraContextProvider>
      <div className="bg-black max-w-full h-screen container flex relative">
        <UIRenderer />
        <GameRenderer />
      </div>
    </CameraContextProvider>
  );
}

export default App;

// TODO:

/**
 * - Add more Unit stats and skills that can affect the terrain and other units
 * - Add UI for unit stats and skills
 * - Add UI for terrain stats
 * - Implement turn system and enemy AI
 */
