import React from 'react';

interface Props {
  className?: string;
}

export const MapucheBanner: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden select-none ${className}`}>
      {/* Authentic Mapuche Stepped Fretwork & Guñelve (8-pointed star) SVG pattern */}
      <svg
        className="w-full h-4 sm:h-5 text-cyan-400"
        viewBox="0 0 400 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
      >
        <pattern id="mapuche-motif" width="50" height="16" patternUnits="userSpaceOnUse">
          {/* Stepped fretwork lines */}
          <path
            d="M0 8 L6 8 L6 2 L12 2 L12 14 L18 14 L18 8 L24 8"
            stroke="#00f0ff"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Guñelve central star geometric diamond */}
          <polygon
            points="34,4 37,8 40,4 37,1"
            fill="#ff007f"
          />
          <polygon
            points="34,12 37,8 40,12 37,15"
            fill="#ff007f"
          />
          <polygon
            points="30,8 34,5 34,11"
            fill="#00f0ff"
          />
          <polygon
            points="44,8 40,5 40,11"
            fill="#00f0ff"
          />
          <circle cx="37" cy="8" r="1.5" fill="#facc15" />
          <path
            d="M26 8 L32 8 M42 8 L48 8"
            stroke="#ff007f"
            strokeWidth="1"
          />
        </pattern>
        <rect width="100%" height="16" fill="url(#mapuche-motif)" />
      </svg>
    </div>
  );
};
