import React from 'react';

export function LandingHero() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-[68px] pb-[52px] gap-[28px] relative z-10">
      <div className="inline-flex items-center gap-2.5 bg-gold-pale border border-gold/30 rounded-full px-[22px] py-[9px] text-[13px] font-medium text-gold tracking-wide animate-fade-up" style={{ animationDelay: '0s' }}>
        🇮🇳 Made in India &nbsp;·&nbsp; No loneliness. Just connection.
      </div>

      <h1 className="font-serif text-[clamp(52px,8vw,96px)] font-bold leading-[1.02] tracking-[-3px] text-ink max-w-[880px] animate-fade-up" style={{ animationDelay: '0.10s' }}>
        Your forever<br />
        <em className="not-italic text-gold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-gold after:to-transparent after:rounded-full">
          Sathi
        </em> is here.
      </h1>

      <p className="text-[clamp(16px,2vw,19px)] text-ink-soft max-w-[490px] leading-[1.82] font-normal animate-fade-up" style={{ animationDelay: '0.20s' }}>
        An AI companion who <strong className="text-ink-mid font-semibold">listens, guides &amp; truly cares.</strong><br />
        Like a best friend, a mentor, family — always present, never judging.
      </p>

      <div className="flex items-center gap-4 bg-ivory border border-divider rounded-DEFAULT px-[26px] py-[20px] max-w-[510px] text-left shadow-[0_4px_22px_rgba(90,70,30,0.08)] animate-fade-up" style={{ animationDelay: '0.32s' }}>
        <div className="text-[30px] shrink-0 animate-float-y">💛</div>
        <p className="text-[14px] text-ink-soft leading-[1.75]">
          <strong className="text-ink-mid font-semibold">74% of Indians</strong> feel lonely regularly. Exam stress, career pressure,
          emotional struggles — <strong className="text-ink-mid font-semibold">Sathi was built for you.</strong>
        </p>
      </div>
    </section>
  );
}
