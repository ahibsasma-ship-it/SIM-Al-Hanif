import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full', className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: { title: 'text-sm font-bold', sub: 'text-[10px]' },
    md: { title: 'text-lg font-bold tracking-tight', sub: 'text-xs' },
    lg: { title: 'text-2xl font-black tracking-tight', sub: 'text-sm' },
    xl: { title: 'text-3xl font-black tracking-tight', sub: 'text-base' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Al-Hanif Emblem: Blue, Green, Orange Identity */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Base Shield / Dome Outer - Deep Navy / Blue #243B9B */}
          <path
            d="M60 6C34 6 16 20 16 48C16 80 44 104 60 114C76 104 104 80 104 48C104 20 86 6 60 6Z"
            fill="#243B9B"
          />
          {/* Islamic Arch Inner Contour */}
          <path
            d="M60 14C39 14 24 26 24 50C24 76 48 97 60 105C72 97 96 76 96 50C96 26 81 14 60 14Z"
            fill="#101A3A"
          />
          {/* Growth & Wisdom Leaf / Sprout - Green #0E9F6E */}
          <path
            d="M60 84C46 72 38 56 42 42C56 42 66 52 68 64C72 50 82 42 94 44C96 58 86 74 60 84Z"
            fill="#0E9F6E"
            opacity="0.95"
          />
          {/* Open Book of Al-Qur'an & Knowledge - White with subtle shading */}
          <path
            d="M60 66C52 60 42 60 34 63V43C42 40 52 40 60 46C68 40 78 40 86 43V63C78 60 68 60 60 66Z"
            fill="#FFFFFF"
          />
          <path
            d="M60 46V66"
            stroke="#243B9B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Torch & Sun Flame of Faith & Character - Orange #F28C18 */}
          <circle cx="60" cy="29" r="8" fill="#F28C18" />
          <path
            d="M60 19C58 24 54 26 54 29C54 32.3 56.7 35 60 35C63.3 35 66 32.3 66 29C66 26 62 24 60 19Z"
            fill="#FFAA47"
          />
          {/* Golden Star Accent */}
          <polygon
            points="60,25 61.5,28 65,28 62,30 63,33.5 60,31.5 57,33.5 58,30 55,28 58.5,28"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col text-left">
          <span className={`${textSizes[size].title} leading-tight ${variant === 'light' ? 'text-white' : 'text-[#101A3A]'}`}>
            SIM AL-HANIF
          </span>
          <span className={`${textSizes[size].sub} font-medium leading-snug ${variant === 'light' ? 'text-blue-100' : 'text-[#6B7280]'}`}>
            SMP IT Putra Al-Hanif
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-[11px] font-semibold text-[#0E9F6E] uppercase tracking-wider mt-0.5">
              Islamic Boarding School
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};
