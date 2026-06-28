import React from 'react';

interface CompanionCardProps {
  type: 'male' | 'female';
  name: string;
  emoji: string;
  description: React.ReactNode;
  onSelect: () => void;
}

export function CompanionCard({ type, name, emoji, description, onSelect }: CompanionCardProps) {
  const isMale = type === 'male';

  return (
    <div 
      onClick={onSelect}
      className={`
        w-[220px] bg-ivory border-[1.5px] border-divider rounded-[28px] 
        pt-[36px] px-[26px] pb-[26px] flex flex-col items-center gap-[13px] 
        cursor-pointer relative overflow-hidden text-center 
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        hover:-translate-y-2 hover:scale-[1.025] group
        ${isMale 
          ? 'hover:border-m/40 hover:shadow-[0_20px_54px_rgba(160,98,26,0.15),0_4px_12px_rgba(90,70,30,0.08)]' 
          : 'hover:border-f/40 hover:shadow-[0_20px_54px_rgba(158,61,90,0.12),0_4px_12px_rgba(90,70,30,0.08)]'
        }
      `}
    >
      {/* Background radial gradient on hover */}
      <div 
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none
          ${isMale ? 'bg-[radial-gradient(ellipse_at_50%_-10%,rgba(160,98,26,.12),transparent_65%)]' : 'bg-[radial-gradient(ellipse_at_50%_-10%,rgba(158,61,90,.1),transparent_65%)]'}
          group-hover:opacity-100
        `} 
      />

      {/* Avatar Circle */}
      <div 
        className={`
          w-[86px] h-[86px] rounded-full flex items-center justify-center text-[43px] relative
          ${isMale ? 'bg-m-pale border-2 border-m/20' : 'bg-f-pale border-2 border-f/20'}
        `}
      >
        <div 
          className={`
            absolute -inset-[8px] rounded-full border border-dashed animate-ring-rot
            ${isMale ? 'border-m/20' : 'border-f/20'}
          `}
        />
        {emoji}
      </div>

      {/* Name & Desc */}
      <div className={`font-serif text-[26px] font-bold tracking-tight ${isMale ? 'text-m' : 'text-f'}`}>
        {name}
      </div>
      <p className="text-[12.5px] text-ink-soft leading-[1.7]">
        {description}
      </p>

      {/* Button */}
      <button 
        className={`
          w-full py-[12px] border-none rounded-full cursor-pointer 
          font-sans text-[13.5px] font-semibold tracking-wide transition-all duration-200 
          relative z-10 text-white
          group-hover:scale-105 group-hover:brightness-105
          ${isMale 
            ? 'bg-gradient-to-br from-[#A0621A] to-[#C07828] shadow-[0_4px_18px_rgba(160,98,26,.32)]' 
            : 'bg-gradient-to-br from-[#9E3D5A] to-[#C05070] shadow-[0_4px_18px_rgba(158,61,90,.28)]'
          }
        `}
      >
        Talk to {name}
      </button>
    </div>
  );
}
