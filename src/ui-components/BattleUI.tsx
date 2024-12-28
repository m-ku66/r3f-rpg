import { useCameraControls } from "../contexts/CameraContext";

const BattleUI = () => {
  const { rotateCamera, resetRotation } = useCameraControls();

  return (
    <div className="z-[10] absolute w-fit h-[5rem] bg-red-500/[0.5] bottom-[1rem] right-[1rem] flex items-center justify-center gap-4">
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
        onClick={resetRotation}
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
  );
};

export default BattleUI;
