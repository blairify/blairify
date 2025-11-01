"use client";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const LOGO_SIZE_VALUES = ["sm", "md", "lg", "xl"] as const;
export type LogoSize = (typeof LOGO_SIZE_VALUES)[number];

export interface MainLogoProps {
  size?: LogoSize;
  animated?: boolean;
  colorVar?: string; // CSS variable to use for color
}

const sizeConfig: Record<LogoSize, { camera: number; scale: number }> = {
  sm: { camera: 12, scale: 0.8 },
  md: { camera: 10, scale: 1 },
  lg: { camera: 9, scale: 1.3 },
  xl: { camera: 8, scale: 1.6 },
};

export default function MainLogo({
  size = "md",
  animated = true,
  colorVar = "--primary-for-3d-logo",
}: MainLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, theme } = useTheme();
  const config = sizeConfig[size];

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const currentTheme = resolvedTheme || theme || "light";
    const colorHex = getComputedStyle(document.documentElement).getPropertyValue(
      colorVar
    ).trim();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, config.camera);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio * 2);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Flat material for crispness
    const material = new THREE.MeshBasicMaterial({
      color: colorHex || "#b6dcf0",
      side: THREE.DoubleSide,
    });

    const logoGroup = new THREE.Group();
    logoGroup.scale.set(config.scale, config.scale, config.scale);

    const scale = 0.013;
    const centerX = 566.93 / 2;
    const centerY = 566.93 / 2;
    const convertPoint = (x: number, y: number): [number, number] => [
      (x - centerX) * scale,
      -(y - centerY) * scale,
    ];

    const logoShapes: THREE.Shape[] = [];

    // Shape 1
    const shape1 = new THREE.Shape();
    const [x1, y1] = convertPoint(100.48, 371.74);
    shape1.moveTo(x1, y1);
    shape1.bezierCurveTo(
      ...convertPoint(87.89, 344.88),
      ...convertPoint(80.31, 315.08),
      ...convertPoint(80.31, 283.42)
    );
    shape1.bezierCurveTo(
      ...convertPoint(80.31, 171.32),
      ...convertPoint(171.19, 80.44),
      ...convertPoint(283.29, 80.44)
    );
    shape1.bezierCurveTo(
      ...convertPoint(283.29, 80.44),
      ...convertPoint(169.52, 100.15),
      ...convertPoint(144.16, 236.74)
    );
    shape1.bezierCurveTo(
      ...convertPoint(135.02, 285.97),
      ...convertPoint(147.48, 352.62),
      ...convertPoint(178.21, 351.45)
    );
    shape1.bezierCurveTo(
      ...convertPoint(215.51, 350.04),
      ...convertPoint(412.39, 134.63),
      ...convertPoint(486.28, 283.42)
    );
    shape1.bezierCurveTo(
      ...convertPoint(337.36, 165.63),
      ...convertPoint(174.03, 528.73),
      ...convertPoint(100.48, 371.74)
    );
    shape1.closePath();
    logoShapes.push(shape1);

    // Shape 2
    const shape2 = new THREE.Shape();
    const [x2, y2] = convertPoint(462.56, 105.25);
    shape2.moveTo(x2, y2);
    shape2.bezierCurveTo(
      ...convertPoint(411.27, 143.97),
      ...convertPoint(399.36, 73.5),
      ...convertPoint(283.29, 80.44)
    );
    shape2.bezierCurveTo(
      ...convertPoint(372.78, 88.15),
      ...convertPoint(418.81, 131.7),
      ...convertPoint(390.46, 174.28)
    );
    shape2.bezierCurveTo(
      ...convertPoint(449.63, 134.29),
      ...convertPoint(480.79, 222.26),
      ...convertPoint(486.27, 283.42)
    );
    shape2.bezierCurveTo(
      ...convertPoint(492.14, 157.53),
      ...convertPoint(420.68, 158.98),
      ...convertPoint(462.56, 105.25)
    );
    shape2.closePath();
    logoShapes.push(shape2);

    // Shape 3
    const shape3 = new THREE.Shape();
    const [x3, y3] = convertPoint(486.27, 283.42);
    shape3.moveTo(x3, y3);
    shape3.bezierCurveTo(
      ...convertPoint(441.93, 513.76),
      ...convertPoint(210.11, 401.14),
      ...convertPoint(210.11, 401.14)
    );
    shape3.bezierCurveTo(
      ...convertPoint(210.11, 401.14),
      ...convertPoint(168.23, 428.39),
      ...convertPoint(139.66, 427.28)
    );
    shape3.bezierCurveTo(
      ...convertPoint(173.65, 462.41),
      ...convertPoint(227.38, 486.41),
      ...convertPoint(283.29, 486.41)
    );
    shape3.bezierCurveTo(
      ...convertPoint(395.39, 486.41),
      ...convertPoint(486.27, 397.66),
      ...convertPoint(486.27, 283.42)
    );
    shape3.closePath();
    logoShapes.push(shape3);

    logoShapes.forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.3,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
        curveSegments: 64,
      });
      const mesh = new THREE.Mesh(geometry, material);
      logoGroup.add(mesh);
    });

    scene.add(logoGroup);

    let animationId: number;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (animated) {
        const elapsedTime = clock.getElapsedTime();
        logoGroup.rotation.y = elapsedTime * 0.05;
        logoGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.05;
        logoGroup.rotation.z = Math.cos(elapsedTime * 0.2) * 0.05;
      }
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      logoGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, [size, animated, theme, resolvedTheme, colorVar]);

  return <div ref={containerRef} className="w-full h-full" />;
}
