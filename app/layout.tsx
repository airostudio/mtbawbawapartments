import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mt Baw Baw Apartments – Alpine Accommodation",
  description: "Premium apartment rentals at Mt Baw Baw Alpine Resort, Victoria. Book direct for the best rates on ski season and year-round mountain escapes.",
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg' }],
  },
  manifest: '/site.webmanifest',
};

/* ─── Mountain logo SVG ─────────────────────────────────────────── */
function MountainLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* back peak */}
      <path d="M28 34L20 10L12 34Z" fill="#4a8fd4" />
      {/* front-left peak */}
      <path d="M16 34L8 18L0 34Z" fill="#2d6abf" />
      {/* front-right peak */}
      <path d="M40 34L32 16L24 34Z" fill="#2d6abf" />
      {/* snow caps */}
      <path d="M20 10L16.5 19H23.5L20 10Z" fill="white" opacity="0.95" />
      <path d="M8 18L5.5 23H10.5L8 18Z" fill="white" opacity="0.85" />
      <path d="M32 16L29.5 22H34.5L32 16Z" fill="white" opacity="0.85" />
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
      <body className="antialiased bg-slate-50 text-slate-900">

        {/* ─── Navigation ──────────────────────────────────────────── */}
        <nav className="bg-mountain-900 text-white sticky top-0 z-50 shadow-xl shadow-mountain-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <MountainLogo size={34} />
                <div className="leading-none">
                  <span className="block text-base font-bold tracking-tight text-white group-hover:text-blue-200 transition-colors">
                    Mt Baw Baw
                  </span>
                  <span className="block text-[10px] font-medium text-blue-300/80 tracking-widest uppercase mt-0.5">
                    Alpine Apartments
                  </span>
                </div>
              </Link>

              {/* Centre nav */}
              <div className="hidden md:flex items-center gap-1">
                {[
                  { href: '/', label: 'Properties' },
                  { href: '/#why', label: 'About' },
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-500/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Link>
                <Link
                  href="/admin"
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1"
                >
                  Admin
                </Link>
              </div>

            </div>
          </div>
        </nav>

        {/* ─── Page content ────────────────────────────────────────── */}
        <main>{children}</main>

        {/* ─── Footer ──────────────────────────────────────────────── */}
        <footer className="bg-mountain-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <MountainLogo size={30} />
                  <div className="leading-none">
                    <span className="block text-sm font-bold text-white">Mt Baw Baw Apartments</span>
                    <span className="block text-[10px] text-blue-400/80 tracking-widest uppercase mt-0.5">Alpine Accommodation</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Premium apartments at Mt Baw Baw Alpine Resort — Victoria&apos;s most accessible
                  ski destination, just 2.5 hours from Melbourne.
                </p>
              </div>

              {/* Quick links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Explore</h4>
                <ul className="space-y-2.5">
                  {['Properties', 'Ski Conditions', 'Getting There', 'Contact Us'].map((l) => (
                    <li key={l}>
                      <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Contact</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li>Mt Baw Baw VIC 3833</li>
                  <li>hello@mtbawbawpts.com.au</li>
                  <li>1800 000 000</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
              <p>© 2026 Mt Baw Baw Apartments Pty Ltd. All rights reserved.</p>
              <p>Mt Baw Baw Alpine Resort, Victoria, Australia</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
