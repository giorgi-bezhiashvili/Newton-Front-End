"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useAuth } from "../../../contexts/AuthContext";


function GoogleCallbackPage() {
  const { loginWithTokens } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(rawHash);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const role = params.get("role");
    const userName = params.get("userName");

    if (!accessToken || !refreshToken || !role || !userName) {
      setError("Google-ით შესვლა ვერ მოხერხდა");
      return;
    }

    loginWithTokens(userName, accessToken, refreshToken, role);
    window.history.replaceState(null, "", "/auth/callback");
    router.replace("/");
  }, [loginWithTokens, router]);

  if (!error) return null;

  return (
    <div className="space-page">
      <Header />
      <main className="mainContent authContent">
        <p className="authError">{error}</p>
        <p className="authSubtitle">
          <Link href="/login">დაბრუნდით შესვლის გვერდზე</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default GoogleCallbackPage;