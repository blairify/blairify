"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const LOGO_SIZE_VALUES = ["sm", "md", "lg", "xl"] as const;
export type LogoSize = (typeof LOGO_SIZE_VALUES)[number];

export interface MainLogoProps {
  size?: LogoSize;
  animated?: boolean;
  colorVar?: string;
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
  colorVar = "--logo",
}: MainLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = sizeConfig[size];

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const colorHex = getComputedStyle(document.documentElement)
      .getPropertyValue(colorVar)
      .trim();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, config.camera);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    // Better pixel ratio handling for mobile
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Enhanced lighting setup for better texture visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, -3, 5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, -5, -5);
    scene.add(backLight);

    // Add point light for dynamic highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(3, 3, 8);
    scene.add(pointLight);

    // Create smooth, sophisticated texture without visible dots
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Multi-layer gradient for smooth depth
    const gradient1 = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
    gradient1.addColorStop(0, "#f5f5f5");
    gradient1.addColorStop(0.5, "#e0e0e0");
    gradient1.addColorStop(1, "#c8c8c8");
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Very fine, smooth noise using multiple passes
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        // Smooth Perlin-like noise using sine waves
        const noise1 = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 8;
        const noise2 = Math.sin(x * 0.02 + y * 0.03) * 6;
        const noise3 = Math.random() * 4 - 2; // Very subtle random
        const totalNoise = noise1 + noise2 + noise3;

        imageData.data[i] += totalNoise;
        imageData.data[i + 1] += totalNoise;
        imageData.data[i + 2] += totalNoise;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Blur for smoothness
    ctx.filter = "blur(2px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";

    const mainTexture = new THREE.CanvasTexture(canvas);
    mainTexture.wrapS = THREE.RepeatWrapping;
    mainTexture.wrapT = THREE.RepeatWrapping;
    mainTexture.repeat.set(2, 2);
    mainTexture.minFilter = THREE.LinearMipMapLinearFilter;
    mainTexture.magFilter = THREE.LinearFilter;

    // Smooth normal map without dots
    const normalCanvas = document.createElement("canvas");
    normalCanvas.width = 1024;
    normalCanvas.height = 1024;
    const normalCtx = normalCanvas.getContext("2d");

    if (!normalCtx) return;

    const normalData = normalCtx.createImageData(
      normalCanvas.width,
      normalCanvas.height,
    );

    for (let y = 0; y < normalCanvas.height; y++) {
      for (let x = 0; x < normalCanvas.width; x++) {
        const i = (y * normalCanvas.width + x) * 4;
        // Smooth wave-based variation
        const wave = Math.sin(x * 0.03) * Math.cos(y * 0.03) * 10;
        normalData.data[i] = 128 + wave;
        normalData.data[i + 1] = 128 + wave;
        normalData.data[i + 2] = 220;
        normalData.data[i + 3] = 255;
      }
    }
    normalCtx.putImageData(normalData, 0, 0);
    normalCtx.filter = "blur(3px)";
    normalCtx.drawImage(normalCanvas, 0, 0);

    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(4, 4);
    normalTexture.minFilter = THREE.LinearMipMapLinearFilter;
    normalTexture.magFilter = THREE.LinearFilter;

    // Enhanced material with smooth texture
    const material = new THREE.MeshStandardMaterial({
      color: colorHex || "#b6dcf0",
      metalness: 0.35,
      roughness: 0.5,
      roughnessMap: mainTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.15, 0.15),
      side: THREE.DoubleSide,
      envMapIntensity: 1.0,
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

    logoShapes.forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.5, // Increased depth for more prominent 3D effect
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3,
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
      material.dispose();
      mainTexture.dispose();
      normalTexture.dispose();
      renderer.dispose();
      if (containerRef.current)
        containerRef.current.removeChild(renderer.domElement);
    };
  }, [animated, colorVar, config.scale, config.camera]);

  return <div ref={containerRef} className="w-full h-full" />;
}
