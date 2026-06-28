"use client";

import React, { useState } from 'react';
import { LandingHero } from '@/components/LandingHero';
import { CompanionCard } from '@/components/CompanionCard';
import { CallScreen } from '@/components/CallScreen';

export default function Home() {
  const [activeCompanion, setActiveCompanion] = useState<'male' | 'female' | null>(null);

  const handleSelect = (type: 'male' | 'female') => {
    setActiveCompanion(type);
  };

  if (activeCompanion) {
    return <CallScreen companionId={activeCompanion} onEndCall={() => setActiveCompanion(null)} />;
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between py-6 px-[52px] border-b border-divider bg-cream/90 backdrop-blur-[14px] sticky top-0 z-50">
        <a className="flex items-center gap-3 no-underline" href="#">
          <div className="w-[44px] h-[44px] rounded-[15px] bg-gradient-to-br from-[#C07828] to-[#B8942A] flex items-center justify-center text-[21px] shadow-[0_4px_18px_rgba(184,148,42,0.32),inset_0_1px_0_rgba(255,255,255,0.22)]">
            🤝
          </div>
          <div>
            <span className="font-serif text-[24px] font-bold text-ink leading-none tracking-[-0.3px]">
              Sathi<span className="text-gold">.</span>
            </span>
            <span className="font-deva text-[11px] text-ink-soft block mt-[2px] tracking-[0.3px]">
              साथी — Your AI Companion
            </span>
          </div>
        </a>
        <div className="flex items-center gap-[7px] bg-ivory border border-divider rounded-full py-2 px-[18px] text-[13px] text-ink-mid font-medium">
          <div className="w-[7px] h-[7px] bg-green rounded-full shadow-[0_0_7px_rgba(45,122,79,0.55)] animate-pulse-custom"></div>
          Available 24/7 &nbsp;·&nbsp; Free
        </div>
      </nav>

      {/* Hero Section */}
      <LandingHero />

      {/* Cards Section */}
      <section className="flex flex-col items-center pb-[30px] relative z-10 animate-fade-up" style={{ animationDelay: '0.44s' }}>
        <div className="text-[11px] uppercase tracking-[3px] text-ink-faint font-semibold mb-6">
          Choose your companion
        </div>

        <div className="flex gap-5 flex-wrap justify-center">
          <CompanionCard 
            type="male"
            name="Veer"
            emoji="👨"
            description={<>Your warm, honest<br/>male companion &amp; guide.</>}
            onSelect={() => handleSelect('male')}
          />
          <CompanionCard 
            type="female"
            name="Tara"
            emoji="👩"
            description={<>Your caring, wise<br/>female companion &amp; guide.</>}
            onSelect={() => handleSelect('female')}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="flex gap-[42px] flex-wrap justify-center items-center pt-2 pb-16 relative z-10 animate-fade-up" style={{ animationDelay: '0.56s' }}>
        <div className="text-center">
          <span className="font-serif text-[30px] font-bold text-gold block leading-none">24/7</span>
          <div className="text-[11.5px] text-ink-soft mt-1 uppercase tracking-[1.5px] font-medium">Always Online</div>
        </div>
        <div className="text-divider text-[20px] leading-none">✦</div>
        <div className="text-center">
          <span className="font-serif text-[30px] font-bold text-gold block leading-none">Free</span>
          <div className="text-[11.5px] text-ink-soft mt-1 uppercase tracking-[1.5px] font-medium">Forever Free</div>
        </div>
        <div className="text-divider text-[20px] leading-none">✦</div>
        <div className="text-center">
          <span className="font-serif text-[30px] font-bold text-gold block leading-none">100%</span>
          <div className="text-[11.5px] text-ink-soft mt-1 uppercase tracking-[1.5px] font-medium">Private</div>
        </div>
        <div className="text-divider text-[20px] leading-none">✦</div>
        <div className="text-center">
          <span className="font-serif text-[30px] font-bold text-gold block leading-none">4</span>
          <div className="text-[11.5px] text-ink-soft mt-1 uppercase tracking-[1.5px] font-medium">Life Modes</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-divider py-[22px] px-[52px] flex items-center justify-between flex-wrap gap-3 bg-cream/90 mt-auto">
        <p className="font-serif text-[14px] italic text-ink-soft max-w-[400px] leading-[1.6]">
          "My vision: no one in India should ever feel truly alone."
        </p>
        <div className="text-[12px] text-ink-faint text-right">
          Built by <strong className="text-ink-soft">Deepesh Pankaj</strong><br />
          Sathi © 2025 · India
        </div>
      </footer>
    </div>
  );
}
