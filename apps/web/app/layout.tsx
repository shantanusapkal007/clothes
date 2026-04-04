import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friends Clothing POS",
  description: "Fast clothing store POS with editable pricing, stock, tax, and discount."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div>
              <p className="eyebrow">Friends</p>
              <h1>Clothing Store POS</h1>
            </div>
            <nav className="topnav">
              <Link href="/">POS</Link>
              <Link href="/inventory">Inventory</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
