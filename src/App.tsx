import GameRenderer from "./game-components/GameRenderer";
import UIRenderer from "./ui-components/UIRenderer";

function App() {
  return (
    <div className="bg-black max-w-full h-screen container flex relative">
      <UIRenderer />
      <GameRenderer />
    </div>
  );
}

export default App;
