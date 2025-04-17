import React from 'react';

/**
 * SVG Logo: An ear with stylized electrons orbiting around it.
 * Designed for dark backgrounds, scalable for sidebar/header/app icon use.
 */
export default function EarElectronsLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Ear shape */}
      <path
        d="M24 40c-6 0-10-5.5-10-14 0-7 4.5-12 10-12s10 5 10 12c0 5-2 8-6 8-2 0-4-1.5-4-4 0-2 1.5-3 3-3 1.5 0 2.5 1 2.5 2.5"
        stroke="#1DB954"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Electrons (orbits) */}
      <ellipse
        cx="24"
        cy="24"
        rx="19"
        ry="7"
        stroke="#B3F5C0"
        strokeWidth="1.5"
        fill="none"
        transform="rotate(-18 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="19"
        ry="7"
        stroke="#1DB954"
        strokeWidth="1.5"
        fill="none"
        transform="rotate(18 24 24)"
      />
      {/* Electrons (dots) */}
      <circle cx="8" cy="28" r="2" fill="#1DB954" />
      <circle cx="40" cy="20" r="2" fill="#B3F5C0" />
      <circle cx="24" cy="9" r="2" fill="#1DB954" />
    </svg>
  );
}
