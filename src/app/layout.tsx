import type { Metadata } from "next";
import { Geist, Geist_Mono, Metal_Mania } from "next/font/google";
import "./globals.css";
import Logo from "@/components/Logo";

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
        className={`${geistSans.variable} ${geistMono.variable} ${metal.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
