import React from 'react';

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Thin wrapper around Material Icons Sharp web font.
 * Used throughout the Kairos workspace UI for sharp, consistent icons.
 */
export function MaterialIcon({ name, className = '', size = 18, style = {} }: MaterialIconProps) {
  return (
    <span
      className={`material-icons-sharp select-none flex items-center justify-center ${className}`}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
