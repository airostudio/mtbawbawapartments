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
    url: 'https://www.cascade6.com.au',
    display: 'www.cascade6.com.au',
    image: '/Cascade-Apartment-6-www-cascade6-com.png',
  },
];

export default function HomePage() {
  return (
    <div style={{ background: '#0a1929', minHeight: '100vh' }}>

      {/* ══════════════════ HERO ══════════════════════════════════ */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #050d1a 0%, #0a1929 40%, #102a43 100%)',
        paddingTop: '5rem',
        paddingBottom: '8rem',
        textAlign: 'center',
        color: 'white',
      }}>

        {/* Snowfall layers */}
        <div className="snow-layer" aria-hidden="true" />
        <div className="snow-layer snow-layer-2" aria-hidden="true" />

        {/* Mountain silhouette */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'block' }}
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Far mountains */}
          <path
            d="M0,220 L0,160 L120,90 L240,140 L380,60 L520,130 L620,40 L740,110 L860,35 L980,100 L1080,45 L1200,95 L1310,50 L1440,80 L1440,220 Z"
            fill="#122a45"
          />
          {/* Snow on far peaks */}
          <path d="M380,60 L395,52 L410,60 Z" fill="white" opacity="0.8" />
          <path d="M620,40 L635,32 L650,40 Z" fill="white" opacity="0.8" />
          <path d="M860,35 L875,27 L890,35 Z" fill="white" opacity="0.9" />
          <path d="M1080,45 L1095,37 L1110,45 Z" fill="white" opacity="0.8" />
          <path d="M1310,50 L1325,42 L1340,50 Z" fill="white" opacity="0.7" />

          {/* Near mountains */}
          <path
            d="M0,220 L0,180 L100,130 L200,170 L320,105 L440,160 L560,90 L680,150 L800,115 L920,160 L1020,100 L1140,155 L1260,120 L1380,160 L1440,140 L1440,220 Z"
            fill="#162f4a"
          />
          {/* Snow on near peaks */}
          <path d="M320,105 L333,97 L346,105 Z" fill="white" opacity="0.85" />
          <path d="M560,90 L573,82 L586,90 Z" fill="white" opacity="0.9" />
          <path d="M1020,100 L1033,92 L1046,100 Z" fill="white" opacity="0.85" />

          {/* Foreground ridge */}
          <path
            d="M0,220 L0,200 L180,185 L360,195 L540,178 L720,192 L900,180 L1080,194 L1260,182 L1440,190 L1440,220 Z"
            fill="#1a3a5c"
          />
        </svg>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 1rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#bfdbfe',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
          }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Mt Baw Baw Alpine Resort · Victoria · Snow Season
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1rem',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            Cascade Apartments
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
            color: '#bfdbfe',
            fontWeight: 300,
            marginBottom: '0.75rem',
          }}>
            Mt Baw Baw Alpine Resort
          </p>

          <p style={{
            fontSize: '0.9375rem',
            color: 'rgba(147,197,253,0.65)',
            maxWidth: '36rem',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Three premium ski apartments nestled in Victoria&apos;s alpine village,
            just 2.5 hours from Melbourne.
          </p>
        </div>
      </section>

      {/* ══════════════════ APARTMENT CARDS ══════════════════════ */}
      <section style={{
        background: '#102a43',
        padding: '5rem 1rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <h2 style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.5rem',
          }}>
            Our Apartments
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'rgba(147,197,253,0.6)',
            marginBottom: '3rem',
          }}>
            Hover to explore each website
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {apartments.map((apt) => (
              <a
                key={apt.name}
                href={apt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div style={{
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  background: '#1e3a52',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                  className="apt-card"
                >
                  {/* Screenshot viewport */}
                  <div style={{
                    height: '320px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#0f1f2e',
                  }}>
                    <Image
                      src={apt.image}
                      alt={`Screenshot of ${apt.name} website`}
                      width={800}
                      height={2400}
                      unoptimized
                      className="screenshot-scroll"
                    />
                    {/* Bottom fade */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '80px',
                      background: 'linear-gradient(to top, #1e3a52, transparent)',
                      pointerEvents: 'none',
                    }} />
                  </div>

                  {/* Card label */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                        {apt.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(147,197,253,0.7)', marginTop: '0.125rem' }}>
                        {apt.display}
                      </div>
                    </div>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      background: 'rgba(59,130,246,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#93c5fd" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
