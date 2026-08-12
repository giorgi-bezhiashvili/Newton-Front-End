"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../contexts/AuthContext";
import { useSaved } from "../../contexts/SavedContext";
import { fetchDailyStreak } from "../../utils/streak";
import { deleteWithAuth } from "../../api";

const ROLE_LABELS: Record<string, string> = {
  teacher: "მასწავლებელი",
  student: "მოსწავლე",
};

export default function AccountPage() {
  const { auth, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { savedData, isLoading: savedLoading } = useSaved();
  const router = useRouter();

  const [dailyStreak, setDailyStreak] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmUserName, setConfirmUserName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDailyStreak().then(setDailyStreak).catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setConfirmUserName("");
    setDeleteError(null);
  };

  const handleDeleteAccount = async () => {
    if (confirmUserName !== auth?.userName) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteWithAuth("auth/user/delete");
      logout();
      router.replace("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "ანგარიშის წაშლა ვერ მოხერხდა");
      setIsDeleting(false);
    }
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
              <button
                type="button"
                className="navAuthBtn"
                onClick={() => setShowDeleteModal(true)}
              >
                ანგარიშის წაშლა
              </button>
            </div>
          </div>

          {showDeleteModal && (
            <div className="modalOverlay" onClick={closeDeleteModal}>
              <div
                className="modalCard"
                role="dialog"
                aria-modal="true"
                aria-labelledby="deleteAccountTitle"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="deleteAccountTitle">ანგარიშის წაშლა</h2>
                <p className="accountEmptyText">
                  ეს მოქმედება შეუქცევადია და წაშლის თქვენს ყველა მონაცემს. დასადასტურებლად ჩაწერეთ
                  თქვენი მომხმარებლის სახელი — <strong>{auth?.userName}</strong>
                </p>
                <input
                  className="authInput"
                  type="text"
                  value={confirmUserName}
                  onChange={(e) => setConfirmUserName(e.target.value)}
                  placeholder={auth?.userName}
                  autoFocus
                  disabled={isDeleting}
                />
                {deleteError && <p className="authError">{deleteError}</p>}
                <div className="modalActions">
                  <button
                    type="button"
                    className="navActionLink"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    გაუქმება
                  </button>
                  <button
                    type="button"
                    className="authSubmitBtn dangerSubmitBtn"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || confirmUserName !== auth?.userName}
                  >
                    {isDeleting ? "იშლება..." : "სამუდამოდ წაშლა"}
                  </button>
                </div>
              </div>
            </div>
          )}

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