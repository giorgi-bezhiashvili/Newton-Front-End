"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="mainHeader">
      <Link href="/">
        <Image src="/logo.png" className="imgLogo" alt="logo" width={48} height={48} priority />
      </Link>

      <button
        className={`hamburger ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle Navigation"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <nav className={`navMenu ${isOpen ? "open" : ""}`}>
        <ul className="navList">
          <li><Link href="/">მთავარი</Link></li>
          <li><Link href="/formulas">ფორმულები</Link></li>
          <li><Link href="/resources">რესურსები</Link></li>
          <li><Link href="/quiz">ქვიზები</Link></li>
        </ul>

        <ul className="navActions">
          {mounted && isAuthenticated && (
            <li>
              <Link href="/account" className="navUserBtn" aria-label="ჩემი ანგარიში">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </li>
          )}
          {mounted && !isAuthenticated && (
            <li><Link className="navActionLink" href="/login">შესვლა</Link></li>
          )}
          {mounted && !isAuthenticated && (
            <li><Link className="navActionLink navActionPrimary" href="/register">რეგისტრაცია</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;