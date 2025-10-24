"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export const LOGO_COLOR_VALUES = [
  "light-blue",
  "primary",
  "secondary",
  "accent",
  "muted",
] as const;
export type LogoColor = (typeof LOGO_COLOR_VALUES)[number];

export const LOGO_SIZE_VALUES = ["sm", "md", "lg", "xl"] as const;
export type LogoSize = (typeof LOGO_SIZE_VALUES)[number];

interface MainLogoProps {
  color?: LogoColor;
  size?: LogoSize;
  animated?: boolean;
}

const sizeConfig: Record<LogoSize, { camera: number; scale: number }> = {
  sm: { camera: 12, scale: 0.8 },
  md: { camera: 10, scale: 1 },
  lg: { camera: 9, scale: 1.3 },
  xl: { camera: 8, scale: 1.6 },
};

const colorConfig: Record<LogoColor, { light: string; dark: string }> = {
  "light-blue": { light: "#60a5fa", dark: "#93c5fd" }, // Brighter, more saturated blue for dark mode
  primary: { light: "#0a0a0a", dark: "#e5e5e5" }, // Slightly darker white to avoid blown-out highlights
  secondary: { light: "#71717a", dark: "#a1a1aa" }, // Lighter gray with more contrast
  accent: { light: "#f97316", dark: "#fdba74" }, // Brighter, warmer orange for visibility
  muted: { light: "#737373", dark: "#d4d4d4" }, // Much lighter for better visibility in dark mode
};

interface LogoGeometryProps {
  colorVariant: LogoColor;
  animated: boolean;
}

function LogoGeometry({ colorVariant, animated }: LogoGeometryProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { theme, resolvedTheme } = useTheme();

  const currentTheme = (resolvedTheme || theme || "light") as "light" | "dark";
  const color = colorConfig[colorVariant][currentTheme];

  useFrame((state) => {
    if (meshRef.current && animated) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.z =
        Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  const logoShapes = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    const scale = 0.013;
    const centerX = 566.93 / 2;
    const centerY = 566.93 / 2;

    const convertPoint = (x: number, y: number): [number, number] => [
      (x - centerX) * scale,
      -(y - centerY) * scale,
    ];

    const shape1 = new THREE.Shape();
    const [x1, y1] = convertPoint(100.48, 371.74);
    shape1.moveTo(x1, y1);
    shape1.bezierCurveTo(
      ...convertPoint(87.89, 344.88),
      ...convertPoint(80.31, 315.08),
      ...convertPoint(80.31, 283.42),
    );
    shape1.bezierCurveTo(
      ...convertPoint(80.31, 171.32),
      ...convertPoint(171.19, 80.44),
      ...convertPoint(283.29, 80.44),
    );
    shape1.bezierCurveTo(
      ...convertPoint(283.29, 80.44),
      ...convertPoint(169.52, 100.15),
      ...convertPoint(144.16, 236.74),
    );
    shape1.bezierCurveTo(
      ...convertPoint(135.02, 285.97),
      ...convertPoint(147.48, 352.62),
      ...convertPoint(178.21, 351.45),
    );
    shape1.bezierCurveTo(
      ...convertPoint(215.51, 350.04),
      ...convertPoint(412.39, 134.63),
      ...convertPoint(486.28, 283.42),
    );
    shape1.bezierCurveTo(
      ...convertPoint(337.36, 165.63),
      ...convertPoint(174.03, 528.73),
      ...convertPoint(100.48, 371.74),
    );
    shape1.closePath();
    shapes.push(shape1);

    const shape2 = new THREE.Shape();
    const [x2, y2] = convertPoint(462.56, 105.25);
    shape2.moveTo(x2, y2);
    const [lx2, ly2] = convertPoint(461.44, 104.13);
    shape2.lineTo(lx2, ly2);
    shape2.bezierCurveTo(
      ...convertPoint(411.27, 143.97),
      ...convertPoint(399.36, 73.5),
      ...convertPoint(283.29, 80.44),
    );
    shape2.bezierCurveTo(
      ...convertPoint(372.78, 88.15),
      ...convertPoint(418.81, 131.7),
      ...convertPoint(390.46, 174.28),
    );
    const [lx3, ly3] = convertPoint(392.2, 176.02);
    shape2.lineTo(lx3, ly3);
    shape2.bezierCurveTo(
      ...convertPoint(449.63, 134.29),
      ...convertPoint(480.79, 222.26),
      ...convertPoint(486.27, 283.42),
    );
    shape2.bezierCurveTo(
      ...convertPoint(492.14, 157.53),
      ...convertPoint(420.68, 158.98),
      ...convertPoint(462.56, 105.25),
    );
    shape2.closePath();
    shapes.push(shape2);

    const shape3 = new THREE.Shape();
    const [x3, y3] = convertPoint(486.27, 283.42);
    shape3.moveTo(x3, y3);
    shape3.bezierCurveTo(
      ...convertPoint(441.93, 513.76),
      ...convertPoint(210.11, 401.14),
      ...convertPoint(210.11, 401.14),
    );
    shape3.bezierCurveTo(
      ...convertPoint(210.11, 401.14),
      ...convertPoint(168.23, 428.39),
      ...convertPoint(139.66, 427.28),
    );
    shape3.bezierCurveTo(
      ...convertPoint(173.65, 462.41),
      ...convertPoint(227.38, 486.41),
      ...convertPoint(283.29, 486.41),
    );
    shape3.bezierCurveTo(
      ...convertPoint(395.39, 486.41),
      ...convertPoint(486.27, 397.66),
      ...convertPoint(486.27, 283.42),
    );
    shape3.closePath();
    shapes.push(shape3);

    return shapes;
  }, []);

  return (
    <group ref={meshRef}>
      {logoShapes.map((shape) => (
        <mesh key={`logo-shape-${shape}`}>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: 0.2,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.01,
                bevelSegments: 8,
                curveSegments: 32,
              },
            ]}
          />
          <meshStandardMaterial
            color={color}
            roughness={0.15}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-5, -5, 2]} intensity={0.6} />
      <pointLight position={[0, 0, 10]} intensity={0.5} />
    </>
  );
}

export default function MainLogo({
  color = "light-blue",
  size = "md",
  animated = true,
}: MainLogoProps) {
  const config = sizeConfig[size];

  return (
    <Canvas
      camera={{ position: [0, 0, config.camera], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Scene />
      <group scale={config.scale}>
        <LogoGeometry colorVariant={color} animated={animated} />
      </group>
    </Canvas>
  );
}
