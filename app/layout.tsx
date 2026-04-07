import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FaceShapeAI — Face Shape Detector",
    template: "%s | FaceShapeAI",
  },
  description:
    "Upload your photo to detect your face shape instantly. Get personalized hairstyle, glasses, and makeup recommendations. Free, private, no signup required.",
  metadataBase: new URL("https://faceshapeai.org"),
  openGraph: {
    siteName: "FaceShapeAI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
