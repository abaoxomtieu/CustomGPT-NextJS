"use client";

import React, { useEffect, useRef } from 'react';

const ParallaxHeroBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      
      // Different parallax speeds for each layer
      const layers = [
        { selector: '[data-parallax-layer="1"]', speed: -0.3 },
        { selector: '[data-parallax-layer="2"]', speed: -0.5 },
        { selector: '[data-parallax-layer="3"]', speed: -0.7 },
        { selector: '[data-parallax-layer="4"]', speed: -0.2 },
      ];

      layers.forEach(({ selector, speed }) => {
        const layer = document.querySelector(selector) as HTMLElement;
        if (layer) {
          const yPos = scrolled * speed;
          layer.style.transform = `translateY(${yPos}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Layer 1 - Background Gradients */}
      <div 
        data-parallax-layer="1"
        className="parallax-layer parallax-bg-primary"
      />
      
      {/* Layer 2 - Gradient Overlay */}
      <div 
        data-parallax-layer="2"
        className="parallax-layer parallax-gradient-overlay"
      />

      {/* Layer 3 - Floating Orbs */}
      <div 
        data-parallax-layer="3"
        className="parallax-layer"
      >
        <div className="parallax-orb parallax-orb-1" />
        <div className="parallax-orb parallax-orb-2" />
        <div className="parallax-orb parallax-orb-3" />
        <div className="parallax-orb parallax-orb-4" />
        <div className="parallax-orb parallax-orb-5" />
      </div>

      {/* Layer 4 - Geometric Shapes */}
      <div 
        data-parallax-layer="4"
        className="parallax-layer parallax-shapes-container"
      >
        <div className="parallax-shape parallax-triangle" />
        <div className="parallax-shape parallax-hexagon" />
        <div className="parallax-shape parallax-circle" />
      </div>

      {/* Static Grid Pattern */}
      <div className="parallax-layer parallax-grid" />

      {/* Floating Particles */}
      <div className="parallax-particles">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="parallax-particle" />
        ))}
      </div>

      {/* Enhanced Blur Layers for Depth */}
      <div className="parallax-layer parallax-blur-sm opacity-20">
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-primary/10 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-primary/15 rounded-full" />
      </div>

      <div className="parallax-layer parallax-blur-md opacity-15">
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-primary/8 rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-primary/12 rounded-full" />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/10" />
    </div>
  );
};

export default ParallaxHeroBackground;