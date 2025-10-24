"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
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
  "light-blue": { light: "#60a5fa", dark: "#93c5fd" },
  primary: { light: "#0a0a0a", dark: "#e5e5e5" },
  secondary: { light: "#71717a", dark: "#a1a1aa" },
  accent: { light: "#f97316", dark: "#fdba74" },
  muted: { light: "#737373", dark: "#d4d4d4" },
};

export default function MainLogo({
  color = "light-blue",
  size = "md",
  animated = true,
}: MainLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const config = sizeConfig[size];

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";

    const currentTheme = (resolvedTheme || theme || "light") as
      | "light"
      | "dark";
    const colorHex = colorConfig[color][currentTheme];

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, config.camera);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Enhanced lighting for better 3D visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Key light from top-right
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light from left
    const fillLight = new THREE.DirectionalLight(0x8ab4f8, 1.2);
    fillLight.position.set(-6, 3, 4);
    scene.add(fillLight);

    // Rim light from behind
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);

    // Accent light for depth
    const accentLight = new THREE.PointLight(0xffffff, 1.5);
    accentLight.position.set(0, 0, 8);
    scene.add(accentLight);

    // Create logo geometry
    const logoShapes: THREE.Shape[] = [];
    const scale = 0.013;
    const centerX = 566.93 / 2;
    const centerY = 566.93 / 2;

    const convertPoint = (x: number, y: number): [number, number] => [
      (x - centerX) * scale,
      -(y - centerY) * scale,
    ];

    // Shape 1
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
    logoShapes.push(shape1);

    // Shape 2
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
    logoShapes.push(shape2);

    // Shape 3
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
    logoShapes.push(shape3);

    // Create meshes
    const logoGroup = new THREE.Group();
    logoGroup.scale.set(config.scale, config.scale, config.scale);

    logoShapes.forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.03,
        bevelSegments: 10,
        curveSegments: 32,
      });

      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.7,
        emissive: colorHex,
        emissiveIntensity: 0.15,
        flatShading: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Add edge highlighting
      const edges = new THREE.EdgesGeometry(geometry, 15);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: currentTheme === "dark" ? 0xffffff : 0x000000,
        transparent: true,
        opacity: 0.15,
      });
      const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(edgeLines);

      logoGroup.add(mesh);
    });

    scene.add(logoGroup);

    // Animation
    let animationId: number;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (animated) {
        const elapsedTime = clock.getElapsedTime();
        logoGroup.rotation.y = elapsedTime * 0.05;
        logoGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
        logoGroup.rotation.z = Math.cos(elapsedTime * 0.2) * 0.05;
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      logoGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [color, animated, theme, resolvedTheme, config]);

  return <div ref={containerRef} className="w-full h-full" />;
}
