import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cascade Apartments – Mt Baw Baw Alpine Resort",
  description: "Three premium ski apartments at Mt Baw Baw Alpine Resort, Victoria. Cascade Apartments 3, 4 & 6 — your alpine escape.",
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg' }],
  },
  manifest: '/site.webmanifest',
};

/* ─── Snowflake logo ──────────────────────────────────────────── */
function SnowflakeLogo({ size = 36 }: { size?: number }) {
  const arm = (
    <>
      <line x1="0" y1="0"   x2="0" y2="-38" strokeWidth="5.5" />
      <line x1="0" y1="-22" x2="-9.5" y2="-27.5" strokeWidth="3.5" />
      <line x1="0" y1="-22" x2=" 9.5" y2="-27.5" strokeWidth="3.5" />
      <line x1="0" y1="-31" x2="-5.2" y2="-33.6" strokeWidth="2.5" />
      <line x1="0" y1="-31" x2=" 5.2" y2="-33.6" strokeWidth="2.5" />
    </>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50,50)" stroke="#c8deff" strokeLinecap="round">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>{arm}</g>
        ))}
      </g>
      <circle cx="50" cy="50" r="5.5" fill="#c8deff" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-mountain-950 text-slate-900">

        {/* ─── Navigation ──────────────────────────────────────── */}
        <nav className="bg-mountain-950/80 backdrop-blur-md text-white sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              <Link href="/" className="flex items-center gap-3 group">
                <SnowflakeLogo size={34} />
                <div className="leading-none">
                  <span className="block text-base font-bold tracking-tight text-white group-hover:text-blue-200 transition-colors">
                    Cascade Apartments
                  </span>
                  <span className="block text-[10px] font-medium text-blue-300/80 tracking-widest uppercase mt-0.5">
                    Mt Baw Baw
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── Page content ────────────────────────────────────── */}
        <main>{children}</main>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer className="bg-mountain-950 text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-3">
                <SnowflakeLogo size={26} />
                <span className="text-sm font-bold text-white">Cascade Apartments</span>
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                Premium alpine apartments at Mt Baw Baw Alpine Resort —
                Victoria&apos;s most accessible ski destination.
              </p>
              <p className="text-xs text-slate-600 mt-2">
                © 2026 Cascade Apartments. Mt Baw Baw Alpine Resort, Victoria, Australia.
              </p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
