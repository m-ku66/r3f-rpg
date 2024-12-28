import { useState } from "react";
import BattleUI from "./BattleUI";

/**
 * 
 * @returns The UI component to be rendered
 * the UI components themselves will have absolute positioning
 * while this component doesn't enforce any positioning
 */

const UIRenderer = () => {
  const [UIState, setUIState] = useState("battle"); // might be better to make a global context instead for the future...

  function renderUI(UIState: string) {
    switch (UIState) {
      case "battle":
        return <BattleUI />;
    }
  }

  return renderUI(UIState);
};

export default UIRenderer;
