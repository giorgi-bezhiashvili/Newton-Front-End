"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { FormulaCard } from "../../components/FormulaCard";
import { QuizCard } from "../../components/QuizCard";
import { ProjectCard } from "../../components/ProjectCard";
import { RevealOnScroll } from "../../components/RevealOnScroll";
import { useAuth } from "../../contexts/AuthContext";
import { useSaved } from "../../contexts/SavedContext";

type TabKey = "all" | "formula" | "quiz" | "project";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "ყველა" },
  { key: "formula", label: "ფორმულები" },
  { key: "quiz", label: "ქვიზები" },
  { key: "project", label: "რესურსები" },
];

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const { savedData, isLoading, refetchSaved } = useSaved();
  const [searchInput, setSearchInput] = useState("");
  const [tab, setTab] = useState<TabKey>("all");

  const searchLower = searchInput.trim().toLowerCase();

  const filteredFormulas = useMemo(() => {
    if (tab !== "all" && tab !== "formula") return [];
    if (!searchLower) return savedData.formulas;
    return savedData.formulas.filter((f) => {
      const equationString = Array.isArray(f.equation)
        ? f.equation.join(" ").toLowerCase()
        : String(f.equation).toLowerCase();
      return (
        f.topic.toLowerCase().includes(searchLower) ||
        f.grade.toString().includes(searchLower) ||
        equationString.includes(searchLower)
      );
    });
  }, [savedData.formulas, searchLower, tab]);

  const filteredQuizzes = useMemo(() => {
    if (tab !== "all" && tab !== "quiz") return [];
    if (!searchLower) return savedData.quizzes;
    return savedData.quizzes.filter(
      (q) =>
        q.topic.toLowerCase().includes(searchLower) ||
        q.grade.toString().includes(searchLower) ||
        q.assignment.toLowerCase().includes(searchLower)
    );
  }, [savedData.quizzes, searchLower, tab]);

  const filteredProjects = useMemo(() => {
    if (tab !== "all" && tab !== "project") return [];
    if (!searchLower) return savedData.projects;
    return savedData.projects.filter(
      (p) =>
        p.topic.toLowerCase().includes(searchLower) ||
        p.grade.toString().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        (p.projectAuthor?.toLowerCase().includes(searchLower) ?? false)
    );
  }, [savedData.projects, searchLower, tab]);

  const totalResults = filteredFormulas.length + filteredQuizzes.length + filteredProjects.length;

  return (
    <>
      <title>შენახულები — Newton</title>
      <meta name="description" content="თქვენს მიერ შენახული ფორმულები, ქვიზები და რესურსები" />

      <div className="space-page">
        <Header />
        <main className="mainContent">
          <h1 className="savedPageTitle">⭐ შენახულები</h1>

          {!isAuthenticated ? (
            <div className="noResults">
              <p>
                შენახული მასალის სანახავად გთხოვთ{" "}
                <Link href="/login" className="cardLink">
                  შეხვიდეთ სისტემაში
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="searchWrapper">
                <input
                  type="text"
                  className="searchInput"
                  placeholder="ძებნა შენახულებში (მაგ: თემა, კლასი)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="gradeFilterWrapper">
                <span className="gradeFilterLabel">ტიპი</span>
                <div className="gradeFilterButtons">
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`gradeFilterBtn ${tab === t.key ? "active" : ""}`}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="noResults">
                  <p>იტვირთება...</p>
                </div>
              ) : totalResults === 0 ? (
                <div className="noResults">
                  <p>შენახული მასალა ვერ მოიძებნა</p>
                </div>
              ) : (
                <div className="cardsContainer">
                  {filteredFormulas.map((card) => (
                    <RevealOnScroll key={`formula-${card._id}`}>
                      <FormulaCard card={card} onChanged={refetchSaved} />
                    </RevealOnScroll>
                  ))}
                  {filteredQuizzes.map((card) => (
                    <RevealOnScroll key={`quiz-${card._id}`}>
                      <QuizCard
                        card={card}
                        onChanged={refetchSaved}
                        onNext={() => {}}
                        onAnswered={() => {}}
                      />
                    </RevealOnScroll>
                  ))}
                  {filteredProjects.map((card) => (
                    <RevealOnScroll key={`project-${card._id}`}>
                      <ProjectCard card={card} onChanged={refetchSaved} />
                    </RevealOnScroll>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
