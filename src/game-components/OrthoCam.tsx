import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3, OrthographicCamera as ThreeOrthographicCamera } from "three";
import { useGameStore } from "../store/gameStore";

type OrthographicCameraProps = {
  zoom?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  near?: number;
  far?: number;
  resetDelay?: number;
  panSpeed?: number;
};

export default function OrthographicCamera({
  zoom = 1,
  left = -5,
  right = 5,
  top = 5,
  bottom = -5,
  near = 0.01,
  far = 1000,
  resetDelay = 2000,
  panSpeed = 0.01,
}: OrthographicCameraProps) {
  const { set, size } = useThree();
  const { camera } = useGameStore();

  const cameraRef = useRef<ThreeOrthographicCamera>();
  const cameraTarget = useRef(new Vector3(...camera.target));

  // Pan state
  const isDragging = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>();
  const panOffset = useRef<[number, number, number]>([0, 0, 0]);

  // Calculate rotated position based on camera rotation
  const angleInRadians = (camera.rotation * Math.PI) / 180;
  const radius = Math.sqrt(
    camera.position[0] * camera.position[0] +
      camera.position[2] * camera.position[2]
  );
  const rotatedPosition: [number, number, number] = [
    radius * Math.cos(angleInRadians),
    camera.position[1],
    radius * Math.sin(angleInRadians),
  ];

  useEffect(() => {
    // Adjust camera when canvas size changes
    const aspect = size.width / size.height;
    const adjustedLeft = left * aspect;
    const adjustedRight = right * aspect;

    if (!cameraRef.current) {
      cameraRef.current = new ThreeOrthographicCamera(
        adjustedLeft,
        adjustedRight,
        top,
        bottom,
        near,
        far
      );
    } else {
      cameraRef.current.left = adjustedLeft;
      cameraRef.current.right = adjustedRight;
      cameraRef.current.top = top;
      cameraRef.current.bottom = bottom;
      cameraRef.current.near = near;
      cameraRef.current.far = far;
    }

    cameraRef.current.zoom = zoom;
    cameraRef.current.position.set(...rotatedPosition);
    cameraRef.current.lookAt(cameraTarget.current);
    cameraRef.current.updateProjectionMatrix();

    set({ camera: cameraRef.current });

    return () => {
      if (cameraRef.current) {
        cameraRef.current.removeFromParent();
      }
    };
  }, [set, size, camera.rotation, left, right, top, bottom, near, far, zoom]);

  // Update target when it changes
  useEffect(() => {
    cameraTarget.current.set(...camera.target);
  }, [camera.target]);

  // Handle mouse events for panning
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !lastMousePos.current) return;

      const deltaX = (e.clientX - lastMousePos.current.x) * panSpeed;
      const deltaY = (e.clientY - lastMousePos.current.y) * panSpeed;

      // Scale the movement based on camera zoom and viewport size
      const movementScale = (1 / zoom) * (size.width / 1000);

      panOffset.current = [
        panOffset.current[0] - deltaX * movementScale,
        panOffset.current[1] + deltaY * movementScale,
        panOffset.current[2],
      ];

      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Reset pan offset after a delay
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
      resetTimeout.current = setTimeout(() => {
        panOffset.current = [0, 0, 0];
      }, resetDelay);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      lastMousePos.current = null;
    };

    // Add event listeners
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
    };
  }, [panSpeed, resetDelay, zoom, size.width]);

  useFrame(() => {
    if (cameraRef.current) {
      const basePosition = [
        rotatedPosition[0] + panOffset.current[0],
        rotatedPosition[1] + panOffset.current[1],
        rotatedPosition[2] + panOffset.current[2],
      ] as [number, number, number];

      const newTarget: [number, number, number] = [
        camera.target[0] + panOffset.current[0],
        camera.target[1] + panOffset.current[1],
        camera.target[2] + panOffset.current[2],
      ];

      cameraRef.current.position.set(...basePosition);
      cameraTarget.current.set(...newTarget);
      cameraRef.current.lookAt(cameraTarget.current);
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return null;
}
