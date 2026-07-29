"use client";

import { useEffect, useState } from "react";
import type { QuizData } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { patchWithAuth, deleteWithAuth, checkQuizAnswer } from "../api";
import { StarButton } from "./StarButton";

const GRADES = [7, 8, 9, 10, 11, 12];
const TIMER_SECONDS = 20;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizCard({
  card,
  onChanged,
  onNext,
  onAnswered,
}: {
  card: QuizData;
  onChanged?: () => void;
  onNext: () => void;
  onAnswered: (correct: boolean) => void;
}) {
  const { auth, setAccessToken, logout } = useAuth();
  const isMultipleChoice = card.answers.length > 1;

  // --- quiz-taking state ---
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  
  // Dynamic state populated from server response
  const [revealedRealAnswer, setRevealedRealAnswer] = useState<string>("");
  const [revealedExplanation, setRevealedExplanation] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);

  // --- timer state ---
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  // Submit answer to backend API
  const submitAnswer = async (answerToSubmit: string, isTimeout = false) => {
    if (submitted || isChecking) return;
    setIsChecking(true);
    try {
      const res = await checkQuizAnswer(card._id, answerToSubmit);
      setIsCorrect(res.correct);
      setRevealedRealAnswer(res.realAnswer);
      setRevealedExplanation(res.explanation);
      setTimedOut(isTimeout);
      setSubmitted(true);
      onAnswered(res.correct);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!timerEnabled || submitted || isChecking) return;
    if (timeLeft <= 0) {
      submitAnswer(textAnswer, true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timerEnabled, submitted, timeLeft, textAnswer, isChecking]);

  const handleChoice = (answer: string) => {
    setSelected(answer);
    submitAnswer(answer);
  };

  const handleTextSubmit = () => {
    if (!textAnswer.trim()) return;
    submitAnswer(textAnswer);
  };

  const handleRetry = () => {
    setSelected(null);
    setTextAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
    setTimedOut(false);
    setRevealedRealAnswer("");
    setRevealedExplanation("");
    setTimeLeft(TIMER_SECONDS);
  };

  // --- teacher edit state ---
  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState(card.topic);
  const [assignment, setAssignment] = useState(card.assignment);
  const [answersText, setAnswersText] = useState(card.answers.join("\n"));
  const [realAnswer, setRealAnswer] = useState(card.realAnswer || "");
  const [grade, setGrade] = useState(card.grade);
  const [explanation, setExplanation] = useState(card.explanation || "");
  const [url, setUrl] = useState(card.url || "");
  const [urlName, setUrlName] = useState(card.urlName || "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    const answers = answersText.split("\n").map((l) => l.trim()).filter(Boolean);
    setIsSaving(true);
    try {
      await patchWithAuth(
        `quiz/${card._id}`,
        auth!.accessToken,
        { topic, assignment, answers, realAnswer, grade, explanation, url: url || undefined, urlName: urlName || undefined },
        auth!.refreshToken,
        setAccessToken
      );
      setIsEditing(false);
      onChanged?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "განახლება ვერ მოხერხდა";
      if (message.includes("სესია ამოიწურა")) logout();
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("წავშალო ეს ქვიზი?")) return;
    setError(null);
    setIsSaving(true);
    try {
      await deleteWithAuth(`quiz/${card._id}`, auth!.accessToken, auth!.refreshToken, setAccessToken);
      onChanged?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "წაშლა ვერ მოხერხდა";
      if (message.includes("სესია ამოიწურა")) logout();
      setError(message);
      setIsSaving(false);
    }
  };

  if (auth?.role === "teacher" && isEditing) {
    return (
      <div className="card quizCard">
        <form className="addCardForm" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <input className="searchInput" placeholder="თემა" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          <textarea className="searchInput addCardTextarea" placeholder="კითხვა" value={assignment} onChange={(e) => setAssignment(e.target.value)} required />
          <textarea
            className="searchInput addCardTextarea"
            placeholder="ვარიანტები (თითო ხაზზე ერთი; ცარიელი — თავისუფალი პასუხისთვის)"
            value={answersText}
            onChange={(e) => setAnswersText(e.target.value)}
          />
          <input className="searchInput" placeholder="სწორი პასუხი" value={realAnswer} onChange={(e) => setRealAnswer(e.target.value)} required />
          <textarea className="searchInput addCardTextarea" placeholder="ახსნა" value={explanation} onChange={(e) => setExplanation(e.target.value)} required />
          <div className="addCardRow">
            <select className="searchInput" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
              {GRADES.map((g) => <option key={g} value={g}>{g}-ე კლასი</option>)}
            </select>
          </div>
          <div className="addCardRow">
            <input className="searchInput" placeholder="ბმული" value={url} onChange={(e) => setUrl(e.target.value)} />
            <input className="searchInput" placeholder="ბმულის სახელი" value={urlName} onChange={(e) => setUrlName(e.target.value)} />
          </div>
          {error && <p className="authError">{error}</p>}
          <div className="addCardRow">
            <button type="submit" className="authSubmitBtn" disabled={isSaving}>{isSaving ? "იტვირთება..." : "შენახვა"}</button>
            <button type="button" className="addCardToggle" onClick={() => setIsEditing(false)}>გაუქმება</button>
          </div>
        </form>
      </div>
    );
  }

  const timerLow = timeLeft <= 5;
  const activeRealAnswer = card.realAnswer || revealedRealAnswer;
  const activeExplanation = card.explanation || revealedExplanation;

  return (
    <div className="card quizCard">
      <StarButton itemType="quiz" itemId={card._id} />
      <div>
        <div className="quizTimerRow">
          {timerEnabled && !submitted ? (
            <div className={`quizTimerWrap ${timerLow ? "low" : ""}`}>
              <div className="quizTimerTrack">
                <div className="quizTimerBar" style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }} />
              </div>
              <span className="quizTimerLabel">{timeLeft}წმ</span>
            </div>
          ) : (
            <span className="quizTimerOffLabel">
              {submitted ? "" : "დროის ლიმიტი გამორთულია"}
            </span>
          )}
          <button type="button" className="timerToggleBtn" onClick={() => setTimerEnabled((v) => !v)}>
            {timerEnabled ? "⏱ ტაიმერის გამორთვა" : "⏱ ტაიმერის ჩართვა"}
          </button>
        </div>

        <h2 className="quizQuestion">{card.topic}</h2>
        <p className="quizAssignmentText">{card.assignment}</p>

        {isMultipleChoice ? (
          <div className="quizAnswerGrid">
            {card.answers.map((answer, i) => {
              const isThisSelected = selected === answer;
              let stateClass = "";
              if (submitted) {
                if (activeRealAnswer && answer.trim().toLowerCase() === activeRealAnswer.trim().toLowerCase()) {
                  stateClass = "correct";
                } else if (isThisSelected) {
                  stateClass = "incorrect";
                } else {
                  stateClass = "dimmed";
                }
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={`quizAnswerBtn ${stateClass}`}
                  onClick={() => handleChoice(answer)}
                  disabled={submitted || isChecking}
                >
                  <span className="quizAnswerBadge">{LETTERS[i % LETTERS.length]}</span>
                  <span>{answer}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="quizTextAnswer">
            <input
              type="text"
              className="searchInput"
              placeholder="დაწერეთ პასუხი..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={submitted || isChecking}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            />
            <button type="button" className="authSubmitBtn" onClick={handleTextSubmit} disabled={submitted || isChecking}>
              {isChecking ? "მოწმდება..." : "შემოწმება"}
            </button>
          </div>
        )}

        {submitted && (
          <>
            <div className={`quizFeedback ${isCorrect ? "correct" : "incorrect"}`}>
              {timedOut
                ? `⏱ დრო ამოიწურა — სწორი პასუხია: ${activeRealAnswer}`
                : isCorrect
                ? "✓ სწორია!"
                : `✗ არასწორია — სწორი პასუხია: ${activeRealAnswer}`}
            </div>
            {activeExplanation && <div className="quizExplanation">{activeExplanation}</div>}
            <div className="quizPostActions">
              <button type="button" className="addCardToggle" onClick={handleRetry}>
                თავიდან ცდა
              </button>
              <button type="button" className="authSubmitBtn" onClick={onNext}>
                შემდეგი →
              </button>
            </div>
          </>
        )}
      </div>

      <div className="cardFooter">
        <span className="gradeTag">{card.grade}-ე კლასი</span>
        {card.url && (
          <a href={card.url} className="cardLink" target="_blank" rel="noreferrer">
            {card.urlName || "იხილეთ მეტი"}
          </a>
        )}
      </div>

      {auth?.role === "teacher" && (
        <>
          {error && <p className="authError">{error}</p>}
          <div className="addCardRow">
            <button type="button" className="addCardToggle" onClick={() => setIsEditing(true)}>რედაქტირება</button>
            <button type="button" className="addCardToggle" onClick={handleDelete} disabled={isSaving}>წაშლა</button>
          </div>
        </>
      )}
    </div>
  );
}