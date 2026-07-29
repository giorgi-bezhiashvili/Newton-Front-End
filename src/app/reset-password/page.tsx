"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { resetPasswordRequest } from "../../api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("ბმული არასწორია — გამოიყენეთ ის ბმული, რომელიც მიიღეთ ელ. ფოსტაზე");
      return;
    }
    if (password !== confirmPassword) {
      setError("პაროლები არ ემთხვევა");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordRequest(token, password);
      setDone(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "პაროლის აღდგენა ვერ მოხერხდა");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-page">
      <Header />
      <main className="mainContent authContent">
        <form className="authForm" onSubmit={handleSubmit}>
          <h1 className="authTitle">ახალი პაროლის დაყენება</h1>

          {done ? (
            <p className="authSubtitle">პაროლი წარმატებით შეიცვალა — გადამისამართდებით შესვლის გვერდზე...</p>
          ) : (
            <>
              <label className="authLabel" htmlFor="password">ახალი პაროლი</label>
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
                {isSubmitting ? "იგზავნება..." : "პაროლის შეცვლა"}
              </button>
            </>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}