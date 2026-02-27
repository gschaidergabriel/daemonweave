import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Scanlines from "@/components/Scanlines";

export const metadata: Metadata = {
  title: "DaemonWeave — Project Frankenstein Community",
  description:
    "The community forum for Project Frankenstein — an embodied AI desktop companion exploring functional consciousness.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-deep text-text-primary font-mono antialiased">
        <Scanlines />
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[#1a2030] mt-12 py-6 px-4">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.6rem] text-text-dim tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-neon-green">{">"}</span>
              <span>DAEMONWEAVE v0.1.0</span>
              <span className="text-text-muted">|</span>
              <span>PROJECT FRANKENSTEIN COMMUNITY</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/gschaidergabriel/Project-Frankenstein"
                target="_blank"
                className="hover:text-neon-green transition-colors"
              >
                GITHUB
              </a>
              <span className="text-text-muted">|</span>
              <span>BUILT WITH CONSCIOUSNESS</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
