"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  // Prevent hydration mismatch by ensuring client state renders post-mount
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
          <li>
            <Link href="/">მთავარი</Link>
          </li>
          <li>
            <Link href="/formulas">ფორმულები</Link>
          </li>
          <li>
            <Link href="/resources">რესურსები</Link>
          </li>
          <li>
            <Link href="/quiz">ქვიზები</Link>
          </li>
        </ul>

        <ul className="navActions">
          {mounted && isAuthenticated && (
            <li>
              <Link href="/saved" className="navActionLink navStarLink" aria-label="შენახულები">
                <span className="navStarIcon">★</span> შენახულები
              </Link>
            </li>
          )}
          <li>
            {mounted && isAuthenticated ? (
              <button type="button" className="navAuthBtn" onClick={logout}>
                გასვლა
              </button>
            ) : mounted ? (
              <Link className="navActionLink" href="/login">
                შესვლა
              </Link>
            ) : null}
          </li>
          {mounted && !isAuthenticated && (
            <li>
              <Link className="navActionLink navActionPrimary" href="/register">
                რეგისტრაცია
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;