import React, { useEffect, useRef } from 'react';
import liquidGL from 'liquid-gl';

interface GlassLensProps {
  children: React.ReactNode;
  className?: string;
  targetId?: string;
  snapshotSelector?: string;
  tint?: string;
  style?: React.CSSProperties;
}

export const GlassLens: React.FC<GlassLensProps> = ({
  children,
  className = '',
  targetId,
  snapshotSelector,
  tint = 'rgba(10, 10, 14, 0.35)',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check accessibility media queries
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

    if (prefersReducedMotion || prefersReducedTransparency) {
      return; // Use CSS fallback
    }

    const targetEl = containerRef.current;
    if (!targetEl) return;

    try {
      const lens = liquidGL({
        target: targetEl,
        snapshot: snapshotSelector,
        engine: 'auto',
        resolution: window.devicePixelRatio > 1 ? 1.25 : 1.0,
        zIndex: 40,
        refraction: 0.015,
        frost: 0,
        shadow: false,
        specular: true,
        tilt: false,
        interaction: 'none',
        tint,
      });

      return () => {
        lens?.destroy?.();
      };
    } catch (e) {
      // Fallback silently to CSS backdrop-filter
    }
  }, [snapshotSelector, tint]);

  return (
    <div
      ref={containerRef}
      id={targetId}
      className={`glass-surface ${className}`}
      style={style}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
