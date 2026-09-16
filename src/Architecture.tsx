import { useId } from 'react';

export default function Architecture({ className = '' }: { className?: string }) {
  const id = useId().replaceAll(':', '');
  const ref = (name: string) => `url(#${id}-${name})`;
  return <svg className={`architecture ${className}`} viewBox="0 0 900 1100" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-sky`} x1="60" y1="100" x2="750" y2="1020" gradientUnits="userSpaceOnUse"><stop stopColor="#89968e" /><stop offset=".45" stopColor="#b8b9a6" /><stop offset="1" stopColor="#efddbb" /></linearGradient>
      <linearGradient id={`${id}-face`} x1="260" y1="200" x2="760" y2="920" gradientUnits="userSpaceOnUse"><stop stopColor="#ddd5bc" /><stop offset=".5" stopColor="#a6997e" /><stop offset="1" stopColor="#7b7967" /></linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="430" y2="450" gradientUnits="userSpaceOnUse"><stop stopColor="#1f3939" /><stop offset="1" stopColor="#50605a" /></linearGradient>
      <linearGradient id={`${id}-glass`} x1="780" y1="0" x2="670" y2="1100" gradientUnits="userSpaceOnUse"><stop stopColor="#79928b" /><stop offset=".5" stopColor="#354d4b" /><stop offset="1" stopColor="#152f31" /></linearGradient>
      <linearGradient id={`${id}-shade`} x1="50" y1="0" x2="820" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#102b2d" stopOpacity=".5" /><stop offset=".6" stopColor="#14292d" stopOpacity="0" /><stop offset="1" stopColor="#14292d" stopOpacity=".2" /></linearGradient>
      <radialGradient id={`${id}-light`} cx=".65" cy=".12" r=".85"><stop stopColor="#fff1cf" stopOpacity=".33" /><stop offset="1" stopColor="#fff1cf" stopOpacity="0" /></radialGradient>
      <filter id={`${id}-grain`}><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope=".065" /></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light" /></filter>
      <clipPath id={`${id}-tower`}><path d="M260 174 758 0 805 1100H46Z" /></clipPath>
      <clipPath id={`${id}-left`}><path d="M-80 0 260 174 46 1100H-80Z" /></clipPath>
      <clipPath id={`${id}-right`}><path d="m866 260 140-80v920H588Z" /></clipPath>
    </defs>
    <rect width="900" height="1100" fill={ref('sky')} />
    <path d="M-80 0 260 174 46 1100H-80Z" fill={ref('side')} />
    <g clipPath={ref('left')}>
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${-90 + i * 22} 0 ${-300 + i * 23} 1100`} stroke="#0e292c" strokeWidth="9" />)}
      {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M-90 ${i * 50} 300 ${130 + i * 48}`} stroke="#bbc0ae" strokeOpacity=".2" strokeWidth="2" />)}
    </g>
    <path d="M260 174 758 0 805 1100H46Z" fill={ref('face')} />
    <g clipPath={ref('tower')}>
      {Array.from({ length: 31 }, (_, i) => {
        const x1 = 264 + i * 16.6;
        const y1 = 174 - i * 5.8;
        const x2 = 51 + i * 25.15;
        return <g key={i}>
          <path d={`M${x1} ${y1} ${x2} 1100`} stroke="#4b5147" strokeWidth={i > 22 ? 11 : 10} />
          <path d={`M${x1 + 6} ${y1} ${x2 + 9} 1100`} stroke="#e4d9bc" strokeWidth="4" />
          <path d={`M${x1 - 5} ${y1} ${x2 - 7} 1100`} stroke="#1f3938" strokeOpacity=".58" strokeWidth="3" />
        </g>;
      })}
      {Array.from({ length: 27 }, (_, i) => {
        const t = i / 26;
        const yLeft = 174 + Math.pow(t, 1.35) * 950;
        const yRight = Math.pow(t, 1.35) * 1125;
        return <g key={i}><path d={`M-40 ${yLeft + 80} 860 ${yRight - 15}`} stroke="#313e39" strokeWidth="8" opacity=".8" /><path d={`M-40 ${yLeft + 86} 860 ${yRight - 9}`} stroke="#d2c6a9" strokeWidth="3" /></g>;
      })}
    </g>
    <path d="m866 260 140-80v920H588Z" fill={ref('glass')} />
    <g clipPath={ref('right')} stroke="#a1ada0" strokeOpacity=".5">
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${858 + i * 17} ${270 - i * 10} ${570 + i * 40} 1100`} strokeWidth="3" />)}
      {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M600 ${430 + i * 41} 1020 ${220 + i * 53}`} strokeWidth="2" />)}
    </g>
    <path d="M256 174 43 1100M758 0l47 1100" stroke="#e6ddc4" strokeWidth="5" />
    <rect width="900" height="1100" fill={ref('shade')} />
    <rect width="900" height="1100" fill={ref('light')} />
    <rect width="900" height="1100" filter={ref('grain')} opacity=".6" />
  </svg>;
}
