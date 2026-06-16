export function Logo({ color = "currentColor", animate = false }: { color?: string; animate?: boolean } = {}) {
  return (
    <div className="w-full h-full p-1.5 flex items-center justify-center">
      {animate && (
        <style>{`
          @keyframes logoPathIn {
            0% { opacity: 0; transform: translateY(6px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .logo-path-anim {
            opacity: 0;
            animation: logoPathIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      )}
      <svg width="100%" height="100%" viewBox="0 0 84 77" fill="none" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <path
          className={animate ? 'logo-path-anim' : ''}
          style={animate ? { animationDelay: '0ms' } as React.CSSProperties : undefined}
          d="M0 18.4091C0 7.36364 6.25532 0 14.2979 0H68.8085C76.8511 0 84 0 84 0C84 11.0455 77.7447 19.6364 69.7021 19.6364H15.1915C8.04255 19.6364 3.57447 23.3182 0 27V18.4091Z"
          fill={color}
          opacity="1"
        />
        <path
          className={animate ? 'logo-path-anim' : ''}
          style={animate ? { animationDelay: '150ms' } as React.CSSProperties : undefined}
          d="M3.05176e-05 44.8943C3.05176e-05 36.0521 5.37316 29.7364 11.6418 29.7364H45.6717C52.8358 29.7364 60 29.7364 60 29.7364C60 38.5785 54.6269 46.1574 48.3582 46.1574H10.5C5.1269 46.1574 3.58212 49.9469 3.05176e-05 53.7364V44.8943Z"
          fill={color}
          opacity="0.65"
        />
        <path
          className={animate ? 'logo-path-anim' : ''}
          style={animate ? { animationDelay: '300ms' } as React.CSSProperties : undefined}
          d="M0 69.1765C0 62.4706 4.21053 58 9.26316 58H21.0526C26.9474 58 32 58 32 58C32 64.7059 26.1053 76.5 21.0526 76.5H10C10 76.5 5 76.5 0 76.5V69.1765Z"
          fill={color}
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
