"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../contexts/AuthContext";
import { useSaved } from "../../contexts/SavedContext";
import { fetchDailyStreak } from "../../utils/streak";

const ROLE_LABELS: Record<string, string> = {
  teacher: "მასწავლებელი",
  student: "მოსწავლე",
};

export default function AccountPage() {
  const { auth, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { savedData, isLoading: savedLoading } = useSaved();
  const router = useRouter();

  const [dailyStreak, setDailyStreak] = useState(0);

  useEffect(() => {
    fetchDailyStreak().then(setDailyStreak).catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  if (authLoading) {
    return (
      <div className="space-page">
        <Header />
        <main className="mainContent">
          <div className="noResults"><p>იტვირთება...</p></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <title>ჩემი ანგარიში — Newton</title>
        <div className="space-page">
          <Header />
          <main className="mainContent">
            <h1 className="savedPageTitle">ჩემი ანგარიში</h1>
            <div className="noResults">
              <p>
                ანგარიშის სანახავად გთხოვთ{" "}
                <Link href="/login" className="cardLink">შეხვიდეთ სისტემაში</Link>{" "}
                ან{" "}
                <Link href="/register" className="cardLink">დარეგისტრირდით</Link>.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const roleLabel = auth ? ROLE_LABELS[auth.role] ?? auth.role : "";

  return (
    <>
      <title>ჩემი ანგარიში — Newton</title>
      <meta name="description" content="თქვენი ანგარიშის მონაცემები, შენახული და დასრულებული ქვიზები" />

      <div className="space-page">
        <Header />
        <main className="mainContent">
          <h1 className="savedPageTitle">ჩემი ანგარიში</h1>

          <div className="card accountProfileCard">
            <div className="accountProfileTop">
              <div className="accountAvatar" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="accountName">{auth?.userName}</p>
                {roleLabel && <span className="gradeTag">{roleLabel}</span>}
              </div>
            </div>

            <div className="accountProfileBottom">
              <div className="streakBadge daily">
                <span className="streakIcon">🔥</span>
                <span>{dailyStreak} დღიანი სერია</span>
              </div>
              <button type="button" className="navAuthBtn" onClick={handleLogout}>
                გასვლა
              </button>
            </div>
          </div>

          <div className="accountSectionsGrid">
            <section className="card accountSection">
              <div className="accountSectionHeader">
                <h2>⭐ შენახული ქვიზები</h2>
                <Link href="/saved" className="cardLink">ყველას ნახვა</Link>
              </div>
              {savedLoading ? (
                <p className="accountEmptyText">იტვირთება...</p>
              ) : savedData.quizzes.length === 0 ? (
                <p className="accountEmptyText">შენახული ქვიზები ჯერ არ გაქვთ.</p>
              ) : (
                <ul className="accountList">
                  {savedData.quizzes.slice(0, 5).map((q) => (
                    <li key={q._id} className="accountListItem">
                      <span>{q.topic}</span>
                      <span className="gradeTag">{q.grade}-ე კლასი</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}