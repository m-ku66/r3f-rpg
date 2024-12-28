import { createContext, useContext, ReactNode, useState } from "react";

// Types
type CameraState = {
  rotation: number;
};

type CameraControls = {
  rotateCamera: (direction: "left" | "right") => void;
  resetRotation: () => void;
};

// Contexts
export const CameraStateContext = createContext<CameraState | undefined>(
  undefined
);
export const CameraControlsContext = createContext<CameraControls | undefined>(
  undefined
);

// Provider Component
export function CameraContextProvider({ children }: { children: ReactNode }) {
  const [rotation, setRotation] = useState(45);

  const rotateCamera = (direction: "left" | "right") => {
    setRotation((prev) => {
      const newRotation = direction === "left" ? prev + 45 : prev - 45;
      return newRotation % 360;
    });
  };

  const resetRotation = () => setRotation(45);

  const state: CameraState = {
    rotation,
  };

  const controls: CameraControls = {
    rotateCamera,
    resetRotation,
  };

  return (
    <CameraStateContext.Provider value={state}>
      <CameraControlsContext.Provider value={controls}>
        {children}
      </CameraControlsContext.Provider>
    </CameraStateContext.Provider>
  );
}

// Custom hooks
export function useCameraState() {
  const context = useContext(CameraStateContext);
  if (context === undefined) {
    throw new Error(
      "useCameraState must be used within a CameraContextProvider"
    );
  }
  return context;
}

export function useCameraControls() {
  const context = useContext(CameraControlsContext);
  if (context === undefined) {
    throw new Error(
      "useCameraControls must be used within a CameraContextProvider"
    );
  }
  return context;
}
