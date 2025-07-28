"use client";

import React, { useEffect, useRef } from 'react';

const FuturisticBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate floating particles
    const createParticles = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const particleCount = 20;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
          position: absolute;
          width: 2px;
          height: 2px;
          background: ${i % 2 === 0 ? 'rgba(59, 130, 246, 0.6)' : 'rgba(147, 51, 234, 0.6)'};
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          animation: particle-float ${Math.random() * 8 + 8}s infinite linear;
          animation-delay: ${Math.random() * 12}s;
        `;
        container.appendChild(particle);
      }
    };

    // Parallax effect for mouse movement
    const initParallax = () => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        
        const orbs = containerRef.current.querySelectorAll('.gradient-orb');
        const spheres = containerRef.current.querySelectorAll('.sphere');
        
        orbs.forEach((orb, index) => {
          const speed = (index + 1) * 0.5;
          (orb as HTMLElement).style.transform = `translate(${mouseX * speed * 20}px, ${mouseY * speed * 20}px)`;
        });
        
        spheres.forEach((sphere, index) => {
          const speed = (index + 1) * 0.3;
          (sphere as HTMLElement).style.transform = `translate(${mouseX * speed * 15}px, ${mouseY * speed * 15}px)`;
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    };

    createParticles();
    const cleanup = initParallax();

    return cleanup;
  }, []);

  return (
    <>
      <style jsx>{`
        .futuristic-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
          z-index: -1;
        }
        
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          animation: float 8s infinite ease-in-out;
        }
        
        .gradient-orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
          top: 10%;
          left: 15%;
          animation-delay: 0s;
        }
        
        .gradient-orb-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.05) 50%, transparent 100%);
          top: 60%;
          right: 10%;
          animation-delay: -2s;
        }
        
        .gradient-orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(79, 172, 254, 0.25) 0%, rgba(79, 172, 254, 0.08) 50%, transparent 100%);
          bottom: 20%;
          left: 25%;
          animation-delay: -4s;
        }
        
        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          opacity: 0.1;
        }
        
        .wave-1 {
          background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.3) 50%, transparent 70%);
          animation: wave-flow 15s infinite linear;
          transform: rotate(-15deg);
          top: -50%;
          left: -50%;
        }
        
        .wave-2 {
          background: linear-gradient(-45deg, transparent 30%, rgba(147, 51, 234, 0.2) 50%, transparent 70%);
          animation: wave-flow 20s infinite linear reverse;
          transform: rotate(25deg);
          top: -30%;
          right: -50%;
        }
        
        .sphere {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: sphere-pulse 6s infinite ease-in-out;
        }
        
        .sphere-1 {
          width: 200px;
          height: 200px;
          top: 30%;
          right: 30%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          animation-delay: 0s;
        }
        
        .sphere-2 {
          width: 150px;
          height: 150px;
          bottom: 40%;
          left: 40%;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%);
          animation-delay: -2s;
        }
        
        .sphere-3 {
          width: 100px;
          height: 100px;
          top: 20%;
          left: 60%;
          background: radial-gradient(circle, rgba(79, 172, 254, 0.06) 0%, transparent 70%);
          animation-delay: -4s;
        }
        
        .blur-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(1px);
          background: linear-gradient(45deg, rgba(15, 15, 35, 0.1) 0%, rgba(26, 26, 46, 0.05) 50%, rgba(83, 52, 131, 0.1) 100%);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes wave-flow {
          0% { transform: translateX(-100%) rotate(-15deg); }
          100% { transform: translateX(100%) rotate(-15deg); }
        }
        
        @keyframes particle-float {
          0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(200px); opacity: 0; }
        }
        
        @keyframes sphere-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        
        @media (max-width: 768px) {
          .gradient-orb-1 { width: 300px; height: 300px; }
          .gradient-orb-2 { width: 400px; height: 400px; }
          .gradient-orb-3 { width: 200px; height: 200px; }
        }
      `}</style>
      
      <div ref={containerRef} className="futuristic-background">
        {/* Radial Gradient Orbs */}
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        
        {/* Flowing Digital Waves */}
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        
        {/* Transparent Spheres */}
        <div className="sphere sphere-1"></div>
        <div className="sphere sphere-2"></div>
        <div className="sphere sphere-3"></div>
        
        {/* Soft Blur Overlay */}
        <div className="blur-overlay"></div>
      </div>
    </>
  );
};

export default FuturisticBackground;