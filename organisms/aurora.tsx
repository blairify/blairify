"use client";

import type React from "react";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AuroraProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Aurora({ className, children }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.01;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 200,
        canvas.height / 2 + Math.cos(time * 0.8) * 150,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8,
      );

      // Celadon and black aurora colors
      gradient.addColorStop(0, "rgba(175, 238, 238, 0.1)");
      gradient.addColorStop(0.3, "rgba(143, 188, 143, 0.05)");
      gradient.addColorStop(0.6, "rgba(0, 100, 0, 0.02)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add moving particles
      for (let i = 0; i < 3; i++) {
        const x = canvas.width / 2 + Math.sin(time + i * 2) * (200 + i * 100);
        const y =
          canvas.height / 2 + Math.cos(time * 0.7 + i * 1.5) * (150 + i * 80);

        const particleGradient = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          100 + i * 50,
        );
        particleGradient.addColorStop(
          0,
          `rgba(175, 238, 238, ${0.08 - i * 0.02})`,
        );
        particleGradient.addColorStop(1, "rgba(175, 238, 238, 0)");

        ctx.fillStyle = particleGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />
      {children}
    </div>
  );
}
