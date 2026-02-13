import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Agentation } from "agentation";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Garden | Kike López",
  description: "Digital garden with experiments, design reflections, and UX thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        <Header />
        {children}
        {process.env.NODE_ENV === "development" && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
            <Agentation />
          </div>
        )}
      </body>
    </html>
  );
}
