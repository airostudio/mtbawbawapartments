import Image from 'next/image';

const apartments = [
  {
    name: 'Cascade Apartment 3',
    url: 'https://www.mtbawbawcascade3.com',
    display: 'www.mtbawbawcascade3.com',
    image: '/Cascade-Apartment3-www-mtbawbawcascade3.png',
  },
  {
    name: 'Cascade Apartment 4',
    url: 'https://www.cascadeskiapartments.com',
    display: 'www.cascadeskiapartments.com',
    image: '/Cascade-Apartment-4-www-cascadeskiapartments.png',
  },
  {
    name: 'Cascade Apartment 6',
    url: 'https://www.cascade6.online',
    display: 'www.cascade6.online',
    image: '/Cascade-Apartment-6-www-cascade6-com.png',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ═══════════ HERO — snow mountain background ═══════════ */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-mountain-950 text-white">

        {/* Animated snowfall (CSS only) */}
        <div className="snow-layer" aria-hidden="true" />
        <div className="snow-layer snow-layer-2" aria-hidden="true" />

        {/* Stars */}
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: [
            'radial-gradient(1px 1px at 8% 18%, white 50%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 22% 55%, white 50%, transparent 100%)',
            'radial-gradient(1px 1px at 38% 8%, white 50%, transparent 100%)',
            'radial-gradient(1px 1px at 54% 72%, white 50%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 68% 35%, white 50%, transparent 100%)',
            'radial-gradient(1px 1px at 80% 15%, white 50%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 92% 62%, white 50%, transparent 100%)',
            'radial-gradient(1px 1px at 14% 85%, white 50%, transparent 100%)',
            'radial-gradient(1px 1px at 46% 42%, white 50%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 76% 88%, white 50%, transparent 100%)',
          ].join(', '),
        }} />

        {/* Gradient sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08111e] via-[#0e2236] to-[#1a3a5c]/60 pointer-events-none" />

        {/* Mountain silhouette — SVG layers */}
        <svg
          className="absolute bottom-0 w-full pointer-events-none"
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Back range */}
          <path
            d="M0,280 L0,200 Q90,155 180,175 Q270,110 390,145 Q450,55 570,105 Q630,30 750,90 Q820,15 930,65 Q990,25 1095,60 Q1170,5 1290,50 Q1360,75 1440,40 L1440,280 Z"
            fill="#1a3a5c"
            opacity="0.55"
          />
          {/* Mid range */}
          <path
            d="M0,280 L0,230 Q130,185 260,215 Q380,130 500,175 Q560,90 680,135 Q800,55 920,115 Q1040,75 1160,105 Q1270,125 1380,95 L1440,110 L1440,280 Z"
            fill="#243b53"
            opacity="0.75"
          />
          {/* Foreground ridge */}
          <path
            d="M0,280 L0,258 Q110,232 220,248 Q340,215 460,242 Q540,198 660,228 Q760,192 880,222 Q980,205 1100,238 Q1210,216 1330,248 L1440,232 L1440,280 Z"
            fill="#243b53"
          />
          {/* Snow caps */}
          <path
            d="M390,150 L410,145 L430,153 Z
               M570,110 L590,105 L610,113 Z
               M750,95 L770,90 L790,98 Z
               M930,70 L950,65 L970,73 Z
               M1095,65 L1115,60 L1135,68 Z
               M1290,55 L1310,50 L1330,58 Z"
            fill="white"
            opacity="0.88"
          />
        </svg>

        {/* Hero text */}
        <div className="relative z-10 text-center px-4 pb-28 pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-blue-200 text-xs font-medium tracking-wider mb-7">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Mt Baw Baw Alpine Resort · Victoria · Snow Season
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-lg">
            Cascade Apartments
          </h1>
          <p className="text-xl sm:text-2xl text-blue-200/85 font-light mb-3">
            Mt Baw Baw Alpine Resort
          </p>
          <p className="text-blue-300/65 text-sm sm:text-base max-w-lg mx-auto">
            Three premium ski apartments nestled in Victoria&apos;s alpine village,
            just 2.5 hours from Melbourne.
          </p>
        </div>
      </section>

      {/* ═══════════ APARTMENT CARDS ═══════════ */}
      <section className="bg-mountain-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <h2 className="text-center text-2xl font-bold text-white mb-2">Our Apartments</h2>
          <p className="text-center text-blue-300/60 text-sm mb-12">Hover to explore each website</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {apartments.map((apt) => (
              <a
                key={apt.name}
                href={apt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="rounded-2xl overflow-hidden bg-mountain-800 shadow-2xl shadow-black/50 border border-white/10 transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-blue-500/40">
                  {/* Screenshot window — scrolls on hover */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-900">
                    <Image
                      src={apt.image}
                      alt={`Screenshot of ${apt.name} website`}
                      width={800}
                      height={2400}
                      unoptimized
                      className="absolute top-0 left-0 w-full screenshot-scroll"
                      style={{ objectFit: 'cover', objectPosition: 'top' }}
                    />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-mountain-800 to-transparent pointer-events-none" />
                    {/* Hover CTA overlay */}
                    <div className="absolute inset-0 bg-mountain-950/0 group-hover:bg-mountain-950/10 transition-colors duration-300 pointer-events-none" />
                  </div>

                  {/* Card footer */}
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{apt.name}</h3>
                      <span className="text-xs text-blue-400/80">{apt.display}</span>
                    </div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 group-hover:bg-blue-600/40 transition-colors">
                      <svg className="w-4 h-4 text-blue-300 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
