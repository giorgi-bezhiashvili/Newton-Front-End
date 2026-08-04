"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE, fetchDoneQuizzes } from "../api";
import { QuizCard } from "./QuizCard";
import { AddQuizForm } from "./AddQuizForm";
import { GradeFilter } from "./gradeFilter";
import { useAuth } from "../contexts/AuthContext";
import { fetchDailyStreak, recordDailyStreakHit } from "../utils/streak";
import type { QuizData } from "../types";
import { markQuizDone } from "../api";
const ANIMATION_MS = 350;

type ViewMode = "new" | "completed";

function QuizCardSkeleton() {
  return (
    <div className="card quizCard cardSkeleton">
      <div>
        <div
          className="skeletonLine skeletonTag"
          style={{ marginBottom: 20 }}
        />
        <div className="skeletonLine skeletonTitle" />
        <div className="skeletonLine" />
        <div className="skeletonLine skeletonShort" />
        <div className="skeletonAnswerGrid">
          <div className="skeletonAnswerBtn" />
          <div className="skeletonAnswerBtn" />
          <div className="skeletonAnswerBtn" />
          <div className="skeletonAnswerBtn" />
        </div>
      </div>
      <div className="cardFooter">
        <div className="skeletonLine skeletonTag" />
      </div>
    </div>
  );
}

export function QuizRunner() {
  const { auth } = useAuth();
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [doneQuizIds, setDoneQuizIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Toggle view mode: "new" or "completed"
  const [viewMode, setViewMode] = useState<ViewMode>("new");

  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const [dailyStreak, setDailyStreak] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [bestSessionStreak, setBestSessionStreak] = useState(0);

  // Load user completed quizzes and streak data
  useEffect(() => {
    if (!auth) {
      setDoneQuizIds(new Set());
      return;
    }

    fetchDoneQuizzes()
      .then((doneQuizzes) => {
        const ids = new Set(doneQuizzes.map((q) => q._id));
        setDoneQuizIds(ids);
      })
      .catch((err) => console.error("Error loading completed quizzes:", err));

    fetchDailyStreak()
      .then(setDailyStreak)
      .catch(() => {});
  }, [auth]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/quiz`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: QuizData[] = await response.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 200);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Filter quizzes according to viewMode, grade, and search query
  const filteredQuizzes = quizzes.filter((q) => {
    const isDone = doneQuizIds.has(q._id);

    // Switch between New vs Completed quizzes
    if (viewMode === "new" && isDone) return false;
    if (viewMode === "completed" && !isDone) return false;

    if (gradeFilter !== "all" && q.grade !== gradeFilter) return false;

    if (searchQuery.trim()) {
      const searchLower = searchQuery.trim().toLowerCase();
      const matches =
        q.topic?.toLowerCase().includes(searchLower) ||
        q.grade?.toString().includes(searchLower) ||
        q.assignment?.toLowerCase().includes(searchLower) ||
        q.answers?.some((a) => a?.toLowerCase().includes(searchLower));

      if (!matches) return false;
    }

    return true;
  });

  // Reset slider position when view mode or filters change
  useEffect(() => {
    setCurrentIndex(0);
    setExiting(false);
    setSessionStreak(0);
    setBestSessionStreak(0);
  }, [viewMode, gradeFilter, searchQuery]);

  const handleAnswered = useCallback(
    (correct: boolean) => {
      setSessionStreak((s) => {
        const next = correct ? s + 1 : 0;
        setBestSessionStreak((best) => Math.max(best, next));
        return next;
      });

      if (auth) {
        recordDailyStreakHit()
          .then(setDailyStreak)
          .catch(() => {});
      }
    },
    [auth],
  );

  const handleNext = () => {
    setExiting(true);
    setTimeout(() => {
      const currentQuiz = filteredQuizzes[currentIndex];
      if (currentQuiz && auth && viewMode === "new") {
        setDoneQuizIds((prev) => new Set([...prev, currentQuiz._id]));
        markQuizDone(currentQuiz._id).catch((err) =>
          console.error("Error marking quiz done:", err),
        );
      }

      setCurrentIndex((i) => i + 1);
      setExiting(false);
    }, ANIMATION_MS);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setExiting(false);
    setSessionStreak(0);
    setBestSessionStreak(0);
  };

  const handleChanged = () => {
    fetchQuizzes();
    setCurrentIndex(0);
    setExiting(false);
    setSessionStreak(0);
    setBestSessionStreak(0);
  };

  return (
    <div className="quizRunnerWrapper">
      {auth?.role === "teacher" && <AddQuizForm onAdded={handleChanged} />}

      <div className="quizStreaksRow">
        <div className="streakBadge daily">
          <span className="streakIcon">🔥</span>
          <span>{dailyStreak} დღიანი სერია</span>
        </div>
        <div className="streakBadge session">
          <span className="streakIcon">⚡</span>
          <span>{sessionStreak} ზედიზედ სწორი</span>
        </div>
      </div>

      {/* Mode Toggle Switch (Shown if logged in) */}
      {auth && (
        <div className="quizToggleWrap">
          <button
            type="button"
            className={`quizToggleBtn ${viewMode === "new" ? "active" : ""}`}
            onClick={() => setViewMode("new")}
          >
            ✨ ახალი ქვიზები (
            {quizzes.filter((q) => !doneQuizIds.has(q._id)).length})
          </button>
          <button
            type="button"
            className={`quizToggleBtn ${viewMode === "completed" ? "active" : ""}`}
            onClick={() => setViewMode("completed")}
          >
            ✅ შესრულებული ({doneQuizIds.size})
          </button>
        </div>
      )}

      <GradeFilter value={gradeFilter} onChange={setGradeFilter} />

      <div className="searchWrapper">
        <input
          type="text"
          className="searchInput"
          placeholder="ძებნა ქვიზებში (მაგ: თემა, კლასი)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {isLoading ? (
        <QuizCardSkeleton />
      ) : filteredQuizzes.length === 0 ? (
        <div className="noResults">
          <p>
            {viewMode === "completed"
              ? "შესრულებული ქვიზები ჯერ არ გაქვთ."
              : doneQuizIds.size > 0 && quizzes.length > 0
                ? "ყველა ხელმისაწვდომი ქვიზი შეასრულეთ! 🎉"
                : searchQuery.trim()
                  ? "შესაბამისი ქვიზი ვერ მოიძებნა"
                  : "ამ კლასისთვის ქვიზები არ მოიძებნა"}
          </p>
        </div>
      ) : currentIndex >= filteredQuizzes.length ? (
        <div className="quizFinishedCard">
          <h2>🎉 დასრულებულია!</h2>
          <p>თქვენ გაიარეთ ყველა ქვიზი ({filteredQuizzes.length} კითხვა).</p>
          <div className="quizFinishedStats">
            <div>
              <strong>{bestSessionStreak}</strong>
              საუკეთესო სერია
            </div>
            <div>
              <strong>{dailyStreak}</strong>
              დღიანი სერია
            </div>
          </div>
          <button
            type="button"
            className="authSubmitBtn"
            onClick={handleRestart}
          >
            თავიდან დაწყება
          </button>
        </div>
      ) : (
        <>
          <div className="quizProgressWrap">
            <div className="quizProgressTrack">
              <div
                className="quizProgressBar"
                style={{
                  width: `${(currentIndex / filteredQuizzes.length) * 100}%`,
                }}
              />
            </div>
            <span className="quizProgressLabel">
              {currentIndex + 1} / {filteredQuizzes.length}
            </span>
          </div>
          <div
            className={`quizSlide ${exiting ? "exiting" : ""}`}
            key={filteredQuizzes[currentIndex]._id}
          >
            <QuizCard
              card={filteredQuizzes[currentIndex]}
              onChanged={handleChanged}
              onNext={handleNext}
              onAnswered={handleAnswered}
              timerEnabled={timerEnabled}
              onTimerEnabledChange={setTimerEnabled}
            />
          </div>
        </>
      )}
    </div>
  );
}
