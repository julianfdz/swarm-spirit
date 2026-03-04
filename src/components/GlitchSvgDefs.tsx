export function GlitchSvgDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <defs>
        <filter id="glitch-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="linearRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65 0.85" numOctaves={3} seed={0} stitchTiles="stitch" result="noise">
            <animate attributeName="seed" values="0;2;5;1;7;3;6;4;0" dur="0.22s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" in="noise" result="greyNoise" />
          <feBlend in="SourceGraphic" in2="greyNoise" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="glitch-alpha-red" x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="glitch-alpha-green" x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="glitch-alpha-blue" x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 1 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  );
}
