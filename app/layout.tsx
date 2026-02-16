import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mt Baw Baw Apartments - Book Your Mountain Getaway",
  description: "Premium apartment rentals at Mt Baw Baw. Find and book the perfect accommodation for your ski trip or mountain escape.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Mt Baw Baw Apartments
                </h1>
              </div>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Search
                </a>
                <a href="/admin" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-400">
              © 2026 Mt Baw Baw Apartments. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
