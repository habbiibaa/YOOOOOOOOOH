"use client";

import { useEffect, useRef } from "react";

export default function Ball3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const ball = ballRef.current;
    if (!container || !ball) return;

    // Animation function for bouncing effect
    const animate = () => {
      const time = Date.now() / 1000;
      const yOffset = Math.abs(Math.sin(time * 2)) * 20;
      const xOffset = Math.cos(time) * 10;
      const scale = 1 + Math.sin(time * 2) * 0.1;

      ball.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;

      // Shadow effect
      const shadow = container.querySelector(".shadow") as HTMLElement;
      if (shadow) {
        const shadowScale = 1 - yOffset / 40; // Shadow gets smaller as ball goes up
        shadow.style.transform = `translateX(${xOffset}px) scale(${shadowScale}, 0.2)`;
        shadow.style.opacity = (0.3 - yOffset / 100).toString(); // Shadow gets lighter as ball goes up
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[200px] flex items-center justify-center"
    >
      {/* Shadow */}
      <div className="shadow absolute bottom-4 w-12 h-4 bg-black rounded-full opacity-30 transition-all duration-200 blur-sm"></div>

      {/* Ball */}
      <div
        ref={ballRef}
        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg transition-transform duration-200"
      >
        {/* Ball highlight */}
        <div className="absolute top-1 left-2 w-4 h-4 bg-white rounded-full opacity-50"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
    </div>
  );
}
