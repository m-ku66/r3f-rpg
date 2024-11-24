import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3, OrthographicCamera as ThreeOrthographicCamera } from "three";

type OrthographicCameraProps = {
  position: [number, number, number]; // Camera position
  target: [number, number, number]; // Camera target
  zoom?: number; // Camera zoom
  left?: number; // Left plane of the camera frustum
  right?: number; // Right plane of the camera frustum
  top?: number; // Top plane of the camera frustum
  bottom?: number; // Bottom plane of the camera frustum
  near?: number; // Near clipping plane
  far?: number; // Far clipping plane
  resetDelay?: number; // Time in ms before camera resets to default position
  panSpeed?: number; // Speed multiplier for panning
};

export default function OrthographicCamera(props: OrthographicCameraProps) {
  const {
    position,
    target,
    zoom = 1,
    left = -5,
    right = 5,
    top = 5,
    bottom = -5,
    near = 0.01,
    far = 1000,
    resetDelay = 2000, // Default 2 seconds
    panSpeed = 1,
  } = props;

  const { set, size } = useThree(); // Extracts set and size(reactive pixel size of canvas) from the useThree hook
  const cameraRef = useRef<ThreeOrthographicCamera>(); // Ref to store the OrthographicCamera instance
  const cameraTarget = useRef(new Vector3(...target)); // Here we store the target of the camera

  // Pan state
  const [panOffset, setPanOffset] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const isDragging = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Setup camera
  useEffect(() => {
    // When the aspect ratio of the canvas changes, the left and right
    // planes of the camera frustum need to be adjusted accordingly.
    // Otherwise the camera's field of view will appear to change.
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
    cameraRef.current.position.set(...position);
    cameraRef.current.lookAt(cameraTarget.current);
    cameraRef.current.updateProjectionMatrix();

    set({ camera: cameraRef.current });

    return () => {
      if (cameraRef.current) {
        cameraRef.current.removeFromParent();
      }
    };
  }, [set, size, left, right, top, bottom, near, far, zoom, position]);

  // Update target when prop changes
  useEffect(() => {
    cameraTarget.current.set(...target);
  }, [target]);

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

      setPanOffset(([x, y, z]) => [
        x - deltaX * movementScale,
        y + deltaY * movementScale,
        z,
      ]);

      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Clear existing timeout and set a new one
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
      resetTimeout.current = setTimeout(() => {
        setPanOffset([0, 0, 0]);
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

  // Update camera position and target in animation frame
  useFrame(() => {
    if (cameraRef.current) {
      // Apply base position plus pan offset
      const newPosition: [number, number, number] = [
        position[0] + panOffset[0],
        position[1] + panOffset[1],
        position[2] + panOffset[2],
      ];

      // Apply pan offset to target as well to maintain relative position
      const newTarget: [number, number, number] = [
        target[0] + panOffset[0],
        target[1] + panOffset[1],
        target[2] + panOffset[2],
      ];

      cameraRef.current.position.set(...newPosition);
      cameraTarget.current.set(...newTarget);
      cameraRef.current.lookAt(cameraTarget.current);
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return null;
}
