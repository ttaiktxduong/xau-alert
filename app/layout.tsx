import type { Metadata } from "next";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { Providers } from "./components/auth/Providers";
import { Atmosphere } from "./components/layout/Atmosphere";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAU Alert",
  description: "XAUUSD signal tickets. Not financial advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="relative isolate min-h-screen bg-[#0b0906] antialiased">
        <Atmosphere />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Providers>
            <Header />
            <main className="flex-1 bg-transparent">{children}</main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}