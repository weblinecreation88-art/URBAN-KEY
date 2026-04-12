"use client";

import type { CSSProperties } from "react";

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
  style?: CSSProperties;
}

export default function Icon({ name, filled = false, className = "", size = 24, style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
