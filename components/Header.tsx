"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("is-locked");
    } else {
      document.body.classList.remove("is-locked");
    }
    return () => document.body.classList.remove("is-locked");
  }, [isMobileMenuOpen]);

  const isGardenActive = pathname === "/" || pathname.startsWith("/garden");

  return (
    <>
      <header className="header">
        <div className="header__container">
          <a href="https://kikelopez.es/" className="header__logo" aria-label="Go to home">
            <img src="/header-logo.svg" alt="KL Logo" width={32} height={32} />
          </a>

          <nav className="header__nav">
            <a href="https://kikelopez.es/" className="header__nav-link">Home</a>
            <a href="https://kikelopez.es/work.html" className="header__nav-link">Work</a>
            <a href="https://kikelopez.es/about.html" className="header__nav-link">About</a>
            <a href="https://kikelopez.es/contact.html" className="header__nav-link">Contact</a>
          </nav>

          <div className="header__right">
            <Link
              href="/"
              className={`header__nav-link header__garden-link ${isGardenActive ? "header__nav-link--active" : ""}`}
            >
              🌱 Garden
            </Link>
            <button
              className={`header__menu-btn ${isMobileMenuOpen ? "is-open" : ""}`}
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <img
                className="header__menu-icon"
                src="/hamburger.svg"
                alt="Menu"
                width={44}
                height={44}
              />
              <svg
                className="header__close-icon"
                width={44}
                height={44}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <nav
        className={`header__mobile-nav ${isMobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="header__mobile-top">
          <div className="header__container">
            <a href="https://kikelopez.es/" className="header__mobile-logo" aria-label="Go to home">
              <img src="/header-logo.svg" alt="KL Logo" width={32} height={32} />
            </a>
            <button
              className="header__mobile-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <img src="/close-button.svg" alt="" width={32} height={32} />
            </button>
          </div>
        </div>

        <div className="header__mobile-links">
          <a href="https://kikelopez.es/" className="header__mobile-link">Home</a>
          <a href="https://kikelopez.es/work.html" className="header__mobile-link">Work</a>
          <a href="https://kikelopez.es/about.html" className="header__mobile-link">About</a>
          <a href="https://kikelopez.es/contact.html" className="header__mobile-link">Contact</a>
          <Link
            href="/"
            className={`header__mobile-link ${isGardenActive ? "header__mobile-link--active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Garden 🌱
          </Link>
        </div>

        <div className="header__mobile-footer">
          <a
            href="https://www.linkedin.com/in/enriquelopezdeandres/"
            className="header__mobile-social"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/social-footer-linkedin.svg" alt="" />
          </a>
          <a
            href="https://www.behance.net/enriquelopez"
            className="header__mobile-social"
            aria-label="Behance"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/social-footer-behance.svg" alt="" />
          </a>
          <a
            href="https://dribbble.com/enriquelop"
            className="header__mobile-social"
            aria-label="Dribbble"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/social-footer-dribble.svg" alt="" />
          </a>
        </div>
      </nav>
    </>
  );
}
