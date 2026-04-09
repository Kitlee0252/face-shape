"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Face Shapes", href: "/#shapes" },
  { label: "How It Works", href: "/#how" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMobileMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/80 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0 text-xl font-bold">
          <span className="font-heading">FaceShape</span>
          <span className="font-heading text-accent">AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#try"
            className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try Now
          </Link>
        </nav>

        {/* Mobile menu — uses native <details> so it works without JS */}
        <details ref={detailsRef} className="md:hidden relative" suppressHydrationWarning>
          <summary className="p-2 list-none cursor-pointer [&::-webkit-details-marker]:hidden">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </summary>
          <nav className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-2xl shadow-lg p-4 flex flex-col gap-3 z-50">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="text-sm text-text-secondary hover:text-primary transition-colors px-2 py-1"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#try"
              onClick={closeMobileMenu}
              className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold text-center hover:opacity-90 transition-opacity mt-1"
            >
              Try Now
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
