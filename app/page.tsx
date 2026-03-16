'use client';

import Image from 'next/image';

export default function HomePage() {
  const apartments = [
    {
      name: 'Cascade Apartment 3',
      url: 'https://www.mtbawbawcascade3.com',
      image: '/Cascade-Apartment3-www-mtbawbawcascade3.png',
    },
    {
      name: 'Cascade Apartment 4',
      url: 'https://www.cascadeskiapartments.com',
      image: '/Cascade-Apartment-4-www-cascadeskiapartments.png',
    },
    {
      name: 'Cascade Apartment 6',
      url: 'https://www.cascade6.com.au',
      image: '/Cascade-Apartment-6-www-cascade6-com.png',
    },
  ];

  return (
    <>
      {/* ═══════════ HERO with snow mountain background ═══════════ */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-mountain-950 text-white">
        {/* Animated snowfall */}
        <div className="snow-layer" aria-hidden="true" />
        <div className="snow-layer snow-layer-2" aria-hidden="true" />

        {/* Mountain silhouette */}
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,320 L0,220 Q80,180 160,200 Q240,120 360,160 Q420,60 540,120 Q600,40 720,100 Q800,20 900,80 Q960,30 1060,70 Q1140,10 1260,60 Q1340,90 1440,50 L1440,320 Z"
            fill="#1a3a5c"
            opacity="0.5"
          />
          <path
            d="M0,320 L0,250 Q120,200 240,230 Q360,140 480,190 Q540,100 660,150 Q780,60 900,130 Q1020,80 1140,110 Q1260,140 1380,100 L1440,120 L1440,320 Z"
            fill="#243b53"
            opacity="0.7"
          />
          <path
            d="M0,320 L0,270 Q100,240 200,260 Q320,220 440,250 Q520,200 640,230 Q740,190 860,220 Q960,200 1080,240 Q1200,210 1320,250 L1440,230 L1440,320 Z"
            fill="#243b53"
          />
          {/* Snow caps */}
          <path
            d="M340,165 L360,160 L380,168 Z M520,125 L540,120 L560,128 Z M700,105 L720,100 L740,108 Z M880,85 L900,80 L920,88 Z M1040,75 L1060,70 L1080,78 Z M1240,65 L1260,60 L1280,68 Z"
            fill="white"
            opacity="0.9"
          />
        </svg>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1a2e] via-[#102a43] to-transparent" />

        {/* Stars */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(1px 1px at 10% 20%, white 50%, transparent 100%), radial-gradient(1px 1px at 30% 60%, white 50%, transparent 100%), radial-gradient(1px 1px at 50% 10%, white 50%, transparent 100%), radial-gradient(1px 1px at 70% 40%, white 50%, transparent 100%), radial-gradient(1px 1px at 90% 70%, white 50%, transparent 100%), radial-gradient(1.5px 1.5px at 15% 80%, white 50%, transparent 100%), radial-gradient(1.5px 1.5px at 85% 15%, white 50%, transparent 100%), radial-gradient(1px 1px at 40% 90%, white 50%, transparent 100%), radial-gradient(1px 1px at 60% 30%, white 50%, transparent 100%), radial-gradient(1px 1px at 25% 45%, white 50%, transparent 100%)',
        }} />

        <div className="relative z-10 text-center px-4 pb-24 pt-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-lg">
            Cascade Apartments
          </h1>
          <p className="text-xl sm:text-2xl text-blue-200/90 font-light mb-2">
            Mt Baw Baw Alpine Resort
          </p>
          <p className="text-blue-300/70 text-sm sm:text-base max-w-lg mx-auto">
            Three premium ski apartments nestled in Victoria&apos;s alpine village.
            Your mountain escape awaits.
          </p>
        </div>
      </section>

      {/* ═══════════ APARTMENT CARDS ═══════════ */}
      <section className="relative bg-mountain-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {apartments.map((apt) => (
              <a
                key={apt.name}
                href={apt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="rounded-2xl overflow-hidden bg-mountain-800 shadow-2xl shadow-black/40 border border-white/10 transition-transform duration-300 group-hover:scale-[1.02]">
                  {/* Screenshot container with scroll-on-hover */}
                  <div className="relative h-72 sm:h-80 overflow-hidden">
                    <Image
                      src={apt.image}
                      alt={`Screenshot of ${apt.name} website`}
                      width={800}
                      height={2000}
                      unoptimized
                      className="absolute top-0 left-0 w-full object-cover object-top screenshot-scroll"
                    />
                    {/* Fade overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-mountain-800 to-transparent" />
                  </div>
                  {/* Label */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1">{apt.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-sm text-blue-300 group-hover:text-blue-200 transition-colors">
                      {apt.url.replace('https://', '')}
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
