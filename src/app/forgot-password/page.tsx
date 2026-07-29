"use client";

import { useState, type FormEvent } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { forgotPasswordRequest } from "../../api";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "მოთხოვნის გაგზავნა ვერ მოხერხდა");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-page">
      <Header />
      <main className="mainContent authContent">
        <form className="authForm" onSubmit={handleSubmit}>
          <h1 className="authTitle">პაროლის აღდგენა</h1>
          <p className="authSubtitle">შეიყვანეთ თქვენი ელ. ფოსტა და გამოგიგზავნით აღდგენის ბმულს</p>

          {submitted ? (
            <p className="authSubtitle">
              თუ ეს ელ. ფოსტა რეგისტრირებულია, აღდგენის ბმული უკვე გამოგზავნილია. შეამოწმეთ თქვენი ინბოქსი.
            </p>
          ) : (
            <>
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

              {error && <p className="authError">{error}</p>}

              <button type="submit" className="authSubmitBtn" disabled={isSubmitting}>
                {isSubmitting ? "იგზავნება..." : "ბმულის გაგზავნა"}
              </button>
            </>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default ForgotPasswordPage;