import React from 'react';

interface SizeIconProps {
  sizeLabel?: string;
  className?: string;
}

export function SizeIcon({sizeLabel, className}: SizeIconProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      role="img"
      aria-label={sizeLabel ? `Room layout for size ${sizeLabel}` : 'Room layout for rug size'}
      className={className ?? 'w-full h-full'}
    >
      {/* Background */}
      <rect x="0" y="0" width="120" height="80" fill="#F5F5F4" rx="8" />

      {/* Rug */}
      <rect x="18" y="20" width="84" height="40" fill="#A0B39C" rx="4" />
      <rect
        x="22"
        y="24"
        width="76"
        height="32"
        fill="#D7E0D3"
        stroke="#4B5A46"
        strokeWidth="1.5"
        rx="3"
      />

      {/* Sofa */}
      <rect x="30" y="10" width="60" height="16" fill="#E5E5E5" rx="3" />
      <rect x="30" y="10" width="18" height="16" fill="#D4D4D4" rx="3" />
      <rect x="72" y="10" width="18" height="16" fill="#D4D4D4" rx="3" />

      {/* Side tables */}
      <rect x="16" y="26" width="10" height="14" fill="#E5E5E5" rx="2" />
      <rect x="94" y="26" width="10" height="14" fill="#E5E5E5" rx="2" />

      {/* Coffee table */}
      <rect x="48" y="32" width="24" height="16" fill="#FFFFFF" stroke="#4B5A46" strokeWidth="1" rx="3" />

      {/* Optional size text in the middle of the rug */}
      {sizeLabel && (
        <text
          x="60"
          y="47"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fill="#4B5A46"
        >
          {sizeLabel}
        </text>
      )}
    </svg>
  );
}
