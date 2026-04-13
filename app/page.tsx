import Image from 'next/image';

// Revalidate the hero photo once per day
export const revalidate = 86400;

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

interface UnsplashPhoto {
  urls: { regular: string; full: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
}

async function getHeroPhoto(): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(
      'https://api.unsplash.com/photos/random?query=snowfield+alpine+ski+mountain&orientation=landscape&content_filter=high',
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        next: { revalidate: 86400 },
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const photo = await getHeroPhoto();

  const heroSrc = photo?.urls.regular
    ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80';

  const heroAlt = photo?.alt_description ?? 'Snow-capped mountains at Mt Baw Baw Alpine Resort';

  return (
    <div style={{ background: '#0a1929', minHeight: '100vh' }}>

      {/* ══════════════════ HERO ══════════════════════════════════ */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '65vh',
        paddingTop: '5rem',
        paddingBottom: '8rem',
        textAlign: 'center',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Unsplash hero photo */}
        <Image
          src={heroSrc}
          alt={heroAlt}
          fill
          priority
          unoptimized
          style={{ objectFit: 'cover', objectPosition: 'center 60%' }}
        />

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(5,13,26,0.55) 0%, rgba(10,25,41,0.45) 50%, rgba(16,42,67,0.80) 100%)',
        }} />

        {/* Snowfall layers */}
        <div className="snow-layer" aria-hidden="true" />
        <div className="snow-layer snow-layer-2" aria-hidden="true" />

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

        {/* Unsplash attribution (required by Unsplash guidelines) */}
        {photo && (
          <a
            href={`${photo.links.html}?utm_source=cascade_apartments&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              zIndex: 10,
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Photo by{' '}
            <a
              href={`${photo.user.links.html}?utm_source=cascade_apartments&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'underline' }}
            >
              {photo.user.name}
            </a>
            {' '}on Unsplash
          </a>
        )}
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
                <div className="apt-card" style={{
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  background: '#1e3a52',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
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
