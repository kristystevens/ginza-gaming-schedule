import type { Metadata } from "next";
import "./globals.css";
import FontLoader from "@/components/FontLoader";

export const metadata: Metadata = {
  title: "Ginza Gaming - Online Poker, Perfected",
  description: "Crypto-backed invite-only poker community schedule",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <FontLoader />
        {children}
      </body>
    </html>
  );
}
