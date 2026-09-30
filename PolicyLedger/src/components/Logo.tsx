interface LogoProps {
  size?: number;
  className?: string;
}

/** InsureSight shield-eye logo as an inline SVG component */
export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="InsureSight logo"
    >
      {/* Shield outer (blue) */}
      <path
        d="M100 12 L170 42 L178 52 L178 108 Q178 152 100 188 Q22 152 22 108 L22 52 L30 42 Z"
        fill="#3b82f6"
      />
      {/* Shield inner cutout */}
      <path
        d="M100 30 L158 56 L164 65 L164 108 Q164 144 100 172 Q36 144 36 108 L36 65 L42 56 Z"
        fill="#0a0f1a"
      />
      {/* Eye sclera */}
      <path d="M30 100 Q100 46 170 100 Q100 154 30 100 Z" fill="white" />
      {/* Eye outline */}
      <path
        d="M30 100 Q100 46 170 100 Q100 154 30 100 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {/* Iris */}
      <circle cx="100" cy="100" r="28" fill="#3b82f6" />
      {/* Pupil */}
      <circle cx="100" cy="100" r="15" fill="#0f172a" />
      {/* Highlight */}
      <circle cx="108" cy="92" r="6" fill="white" />
    </svg>
  );
}
