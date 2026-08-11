"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import Footer from "../../components/footer";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import { useAuth } from "../../contexts/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(userName, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "შესვლა ვერ მოხერხდა");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    
    <div className="space-page">
      <main className="mainContent authContent">
        <form className="authForm" onSubmit={handleSubmit}>
          <h1 className="authTitle">შესვლა</h1>
          <p className="authSubtitle">
            შედით სისტემაში დავალებებისა და პროექტების დასამატებლად
          </p>

          <label className="authLabel" htmlFor="userName">
            მომხმარებლის სახელი
          </label>
          <input
            id="userName"
            className="searchInput"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="authLabel" htmlFor="password">
            პაროლი
          </label>
          <div className="passwordField">
            <input
              id="password"
              className="searchInput"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="passwordToggleBtn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "დამალე პაროლი" : "აჩვენე პაროლი"}
              tabIndex={-1}
            >
              {showPassword ? (
                // Eye-off icon
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.61 3.94M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                // Eye icon
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="authError">{error}</p>}

          <button
            type="submit"
            className="authSubmitBtn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "იტვირთება..." : "შესვლა"}
            
          </button>

          <div className="authDivider">
            <span>ან</span>
          </div>

          <GoogleAuthButton />

          <p className="authSubtitle" style={{ marginTop: "1rem" }}>
              <Link href="/forgot-password">დაგავიწყდათ პაროლი?</Link>
            </p>
            <p className="authSubtitle">
              არ გაქვთ ანგარიში? <Link href="/register">დარეგისტრირდით</Link>
            </p>
        </form>
      </main>
    </div>
  </>
  );
}

export default LoginPage;