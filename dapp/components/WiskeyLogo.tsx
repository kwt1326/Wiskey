import svgPaths from "../imports/svg-ma27x3m68b";

export function WiskeyLogo() {
  return (
    <div className="h-[28px] w-[100px]" data-name="Wiskey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 56">
        <defs>
          <linearGradient id="copperGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8611E" />
            <stop offset="100%" stopColor="#D08C3A" />
          </linearGradient>
        </defs>
        <g id="Wiskey">
          <path d={svgPaths.p17504380} fill="url(#copperGradientHome)" id="Vector" style={{ filter: 'drop-shadow(0 2px 4px rgba(184, 98, 31, 0.3))' }} />
          <path d={svgPaths.p167744b0} fill="white" id="Vector_2" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.15))' }} />
          <path d={svgPaths.p4802d00} fill="white" id="Vector_3" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.15))' }} />
          <path d={svgPaths.p27284c00} fill="white" id="Vector_4" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.15))' }} />
          <path d={svgPaths.pda2c0c0} fill="white" id="Vector_5" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.15))' }} />
          <path d={svgPaths.p187e74c0} fill="white" id="Vector_6" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.15))' }} />
        </g>
      </svg>
    </div>
  );
}

export default WiskeyLogo
