"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import Footer from "../../components/footer";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import { useAuth } from "../../contexts/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("პაროლები არ ემთხვევა");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ userName, email, password });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "რეგისტრაცია ვერ მოხერხდა");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-page">
      <Header />
      <main className="mainContent authContent">
        <form className="authForm" onSubmit={handleSubmit}>
          <h1 className="authTitle">რეგისტრაცია</h1>
          <p className="authSubtitle">შექმენით ანგარიში სერიისთვის, რესურსების , ქვიზებისა და ფორმულების შესანახად. </p>

          <label className="authLabel" htmlFor="userName">მომხმარებლის სახელი</label>
          <input
            id="userName"
            className="searchInput"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            required
          />

          <label className="authLabel" htmlFor="email">ელ. ფოსტა</label>
          <input
            id="email"
            className="searchInput"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="authLabel" htmlFor="password">პაროლი</label>
          <input
            id="password"
            className="searchInput"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={30}
            required
          />

          <label className="authLabel" htmlFor="confirmPassword">გაიმეორეთ პაროლი</label>
          <input
            id="confirmPassword"
            className="searchInput"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && <p className="authError">{error}</p>}

          <button type="submit" className="authSubmitBtn" disabled={isSubmitting}>
            {isSubmitting ? "იტვირთება..." : "რეგისტრაცია"}
          </button>

          <div className="authDivider">
            <span>ან</span>
          </div>

          <GoogleAuthButton />

          <p className="authSubtitle" style={{ marginTop: "1rem" }}>
            უკვე გაქვთ ანგარიში? <Link href="/login">შედით სისტემაში</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default RegisterPage;