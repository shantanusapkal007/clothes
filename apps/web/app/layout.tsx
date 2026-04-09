import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Serif, Inter } from "next/font/google";
import { Navigation } from "../components/Navigation";
import "./globals.css";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Friends Boutique POS",
  description: "Fast clothing store POS with editable pricing, stock, tax, and discount."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body text-on-background selection:bg-primary-fixed">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
