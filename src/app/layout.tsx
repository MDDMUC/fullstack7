import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import UserNav from "@/components/UserNav";
import Logo from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-dab",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DAB",
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
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased`}
      >
        <header className="site-header">
          <Logo />
          <UserNav />
        </header>
        {children}
      </body>
    </html>
  );
}
