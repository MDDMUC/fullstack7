import type { Metadata } from "next";
import { Geist, Geist_Mono, Metal_Mania } from "next/font/google";
import "./globals.css";
import Logo from "@/components/Logo";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metal = Metal_Mania({ variable: "--font-dab", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dab",
  description: "Dating for climbers who think in grades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${metal.variable} antialiased`}
      >
        <header className="site-header">
          <Logo />
          <nav className="nav-links" style={{ gap: "12px" }}>
            <Link className="cta" href="/signup" style={{ padding: "10px 16px", color: "#0c0e12" }}>Get Started</Link>
            <Link className="ghost" href="/login" style={{ padding: "10px 16px" }}>Login</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
