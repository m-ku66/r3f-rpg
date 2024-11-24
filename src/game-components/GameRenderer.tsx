import { Canvas } from "@react-three/fiber";
import OrthoCam from "./OrthoCam";
import Terrain from "./Terrain";

const GameRenderer = () => {
  return (
    <div className="h-full w-full">
      <Canvas>
        <OrthoCam
          position={[10, 10, 10]}
          target={[0, 0, 0]}
          zoom={0.5}
          resetDelay={2000}
          panSpeed={0.01}
        />

        <ambientLight intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={100} />

        <Terrain width={20} height={4} depth={20} noiseScale={30} />
      </Canvas>
    </div>
  );
};

export default GameRenderer;
