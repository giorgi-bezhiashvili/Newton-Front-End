"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE, fetchDoneQuizzes } from "../api";
import { QuizCard } from "./QuizCard";
import { AddQuizForm } from "./AddQuizForm";
import { GradeFilter } from "./gradeFilter";
import { QuizFilterPanel } from "./QuizFilterPanel";
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
  const [doneLoaded, setDoneLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle view mode: "new" or "completed"
  const [viewMode, setViewMode] = useState<ViewMode>("new");

 const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [topicFilter, setTopicFilter] = useState<string | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exiting, setExiting] = useState(false);

  // Quizzes stay hidden behind a start screen until the person presses
  // the start button.
  const [started, setStarted] = useState(false);

  // The play queue for the current session pass. Popped from the front as
  // quizzes are answered; a skipped quiz is pushed to the back instead, so
  // it only comes back up once every other queued quiz has been shown.
  const [queue, setQueue] = useState<QuizData[]>([]);
  const [queueTotal, setQueueTotal] = useState(0);

  const [dailyStreak, setDailyStreak] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [bestSessionStreak, setBestSessionStreak] = useState(0);

  // Load user completed quizzes and streak data
  useEffect(() => {
    if (!auth) {
      setDoneQuizIds(new Set());
      setDoneLoaded(true);
      return;
    }

    setDoneLoaded(false);
    fetchDoneQuizzes()
      .then((doneQuizzes) => {
        const ids = new Set(doneQuizzes.map((q) => q._id));
        setDoneQuizIds(ids);
      })
      .catch((err) => console.error("Error loading completed quizzes:", err))
      .finally(() => setDoneLoaded(true));

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

  // Unique topics available for the theme filter, in the order they first
  // appear in the loaded quiz set.
  const topicOptions = useMemo(() => {
    const seen = new Set<string>();
    const topics: string[] = [];
    for (const q of quizzes) {
      if (q.topic && !seen.has(q.topic)) {
        seen.add(q.topic);
        topics.push(q.topic);
      }
    }
    return topics;
  }, [quizzes]);

  const matchesFilters = useCallback(
    (q: QuizData) => {
      const isDone = doneQuizIds.has(q._id);

      if (viewMode === "new" && isDone) return false;
      if (viewMode === "completed" && !isDone) return false;

      if (gradeFilter !== "all" && q.grade !== gradeFilter) return false;
      if (topicFilter !== "all" && q.topic !== topicFilter) return false;

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
    },
    [doneQuizIds, viewMode, gradeFilter, topicFilter, searchQuery],
  );

  // Quizzes matching the current filters, independent of the in-progress
  // queue. Used for counts and empty-state messaging.
  const totalMatching = useMemo(
    () => quizzes.filter(matchesFilters),
    [quizzes, matchesFilters],
  );

  // (Re)build the play queue whenever the filters/mode change, or once the
  // done-quizzes list has finished loading for the first time. Deliberately
  // does NOT depend on doneQuizIds directly - marking a quiz done mid-session
  // shouldn't reshuffle the queue the person is already going through.
  useEffect(() => {
    const base = quizzes.filter(matchesFilters);
    setQueue(base);
    setQueueTotal(base.length);
    setExiting(false);
    setSessionStreak(0);
    setBestSessionStreak(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, gradeFilter, topicFilter, searchQuery, quizzes, doneLoaded]);

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

  // Only ever add a quiz to "done" once the person actually gets it right.
  const handleNext = (correct: boolean) => {
    setExiting(true);
    setTimeout(() => {
      setQueue((prev) => {
        const [current, ...rest] = prev;
        if (!current) return prev;

        if (correct && auth && viewMode === "new") {
          setDoneQuizIds((ids) => new Set(ids).add(current._id));
          markQuizDone(current._id).catch((err) =>
            console.error("Error marking quiz done:", err),
          );
        }

        return rest;
      });
      setExiting(false);
    }, ANIMATION_MS);
  };

  // Skip: send the current quiz to the back of the queue instead of
  // dropping it, so it resurfaces only after everything else in the
  // current pass has been shown.
  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      setQueue((prev) => {
        const [current, ...rest] = prev;
        if (!current) return prev;
        return [...rest, current];
      });
      setExiting(false);
    }, ANIMATION_MS);
  };

  const handleRestart = () => {
    const base = quizzes.filter(matchesFilters);
    setQueue(base);
    setQueueTotal(base.length);
    setExiting(false);
    setSessionStreak(0);
    setBestSessionStreak(0);
  };

  const handleChanged = () => {
    fetchQuizzes();
  };

  const currentQuiz = queue[0];
  const doneInQueue = queueTotal - queue.length;

  return (
    <div className="quizRunnerWrapper">
      {auth?.role === "teacher" && <AddQuizForm onAdded={handleChanged} />}

      <div className="quizLayout">
        <QuizFilterPanel
          topicFilter={topicFilter}
          onTopicChange={setTopicFilter}
          topicOptions={topicOptions}
        />

        <div className="quizMainColumn">
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
          ) : totalMatching.length === 0 ? (
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
          ) : !started ? (
            <div className="quizStartCard">
              <h2>მზად ხარ?</h2>
              <p>
                {totalMatching.length} ქვიზი გელოდება — დააჭირე დაწყებას და
                დაიწყე.
              </p>
              <button
                type="button"
                className="authSubmitBtn quizStartBtn"
                onClick={() => setStarted(true)}
              >
                ▶ დაწყება
              </button>
            </div>
          ) : !currentQuiz ? (
            <div className="quizFinishedCard">
              <h2>🎉 დასრულებულია!</h2>
              <p>თქვენ გაიარეთ ყველა ქვიზი ({queueTotal} კითხვა).</p>
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
                      width: `${(doneInQueue / queueTotal) * 100}%`,
                    }}
                  />
                </div>
                <span className="quizProgressLabel">
                  {doneInQueue + 1} / {queueTotal}
                </span>
              </div>
              <div
                className={`quizSlide ${exiting ? "exiting" : ""}`}
                key={currentQuiz._id}
              >
                <QuizCard
                  card={currentQuiz}
                  onChanged={handleChanged}
                  onNext={handleNext}
                  onSkip={handleSkip}
                  onAnswered={handleAnswered}
                  timerEnabled={timerEnabled}
                  onTimerEnabledChange={setTimerEnabled}
                />
              </div>
            </>
          )}
        </div>

        <div className="quizLayoutSpacer" aria-hidden="true" />
      </div>
    </div>
  );
}