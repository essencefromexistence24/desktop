type DxLogoProps = {
  size?: number;
  className?: string;
};

export default function DxLogo({ size = 20, className = "" }: DxLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="dx-rainbow"
          x1="96"
          y1="128"
          x2="928"
          y2="896"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#00E5FF" />
          <stop offset="0.14285714" stopColor="#0A84FF" />
          <stop offset="0.28571429" stopColor="#BF5AF2" />
          <stop offset="0.42857143" stopColor="#FF2D55" />
          <stop offset="0.57142857" stopColor="#FF9500" />
          <stop offset="0.71428571" stopColor="#FFD60A" />
          <stop offset="0.85714286" stopColor="#32D74B" />
          <stop offset="1" stopColor="#00E5FF" />
        </linearGradient>
        <mask id="dx-glyph-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
          <path d="M0 0H1024V1024H0Z" fill="#000000" />
          <g color="#FFFFFF">
            <g
              color="currentColor"
              fill="none"
              stroke="currentColor"
              strokeWidth="112"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M512 190V812M344 190H680M344 812H680" />
              <path d="M512 240L784 512L512 784L240 512Z" />
              <path d="M512 366L658 512L512 658L366 512Z" strokeWidth="56" />
            </g>
          </g>
        </mask>
      </defs>
      <g mask="url(#dx-glyph-mask)">
        <g opacity="1">
          <path d="M-160 -120H1184V1144H-160Z" fill="url(#dx-rainbow)" />
        </g>
      </g>
    </svg>
  );
}
