"use client";

import { useMemo, useState } from "react";

import {
  COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS,
} from "../../lib/learning-game/copper-aluminum-heat-exchanger-quiz-data";
import styles from "./copper-aluminum-heat-exchanger-quiz.module.css";

function getCompetenceBand(score: number): "Beginner" | "Operator" | "Specialist" {
  if (score <= 3) {
    return "Beginner";
  }

  if (score <= 7) {
    return "Operator";
  }

  return "Specialist";
}

export function CopperAluminumHeatExchangerQuiz() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const questionsCount = COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS.length;
  const isFinished = questionIndex >= questionsCount;

  const currentQuestion = isFinished
    ? null
    : COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS[questionIndex];

  const answered = selectedIndex !== null;

  const answerState = useMemo(() => {
    if (!currentQuestion || selectedIndex === null) {
      return null;
    }

    return selectedIndex === currentQuestion.correctIndex ? "correct" : "incorrect";
  }, [currentQuestion, selectedIndex]);

  function selectAnswer(index: number) {
    if (!currentQuestion || selectedIndex !== null) {
      return;
    }

    setSelectedIndex(index);

    if (index === currentQuestion.correctIndex) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (!answered) {
      return;
    }

    setQuestionIndex((previous) => previous + 1);
    setSelectedIndex(null);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelectedIndex(null);
    setScore(0);
  }

  if (isFinished) {
    const competenceBand = getCompetenceBand(score);

    return (
      <div className={styles.quizCard}>
        <p className={styles.resultLabel}>Quiz completed</p>
        <h3 className={styles.resultTitle}>Your result: {score}/{questionsCount}</h3>
        <p className={styles.competenceBand}>Competence band: {competenceBand}</p>
        <p className={styles.resultSummary}>
          You reviewed construction basics, airflow-side risks, and practical maintenance
          awareness for copper-aluminum heat exchangers.
        </p>
        <div className={styles.resultActions}>
          <button type="button" className={styles.primaryButton} onClick={restartQuiz}>
            Restart quiz
          </button>
          <a className={styles.secondaryButton} href="/wikimarket/hvac/heat-exchangers">
            Go to HVAC heat exchangers
          </a>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className={styles.quizCard}>
      <p className={styles.progress} aria-live="polite">
        Question {questionIndex + 1} of {questionsCount}
      </p>
      <h3 className={styles.prompt}>{currentQuestion.prompt}</h3>

      <div className={styles.options} role="list" aria-label="Answer options">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === currentQuestion.correctIndex;

          let optionClassName = styles.optionButton;
          if (answered && isCorrectOption) {
            optionClassName = `${optionClassName} ${styles.optionCorrect}`;
          } else if (answered && isSelected && !isCorrectOption) {
            optionClassName = `${optionClassName} ${styles.optionIncorrect}`;
          } else if (isSelected) {
            optionClassName = `${optionClassName} ${styles.optionSelected}`;
          }

          return (
            <button
              key={option}
              type="button"
              className={optionClassName}
              onClick={() => selectAnswer(index)}
              disabled={answered}
              aria-pressed={isSelected}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`${styles.feedback} ${
            answerState === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect
          }`}
          aria-live="polite"
        >
          <p className={styles.feedbackTitle}>
            {answerState === "correct" ? "Correct" : "Incorrect"}
          </p>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}

      <button
        type="button"
        className={styles.primaryButton}
        onClick={nextQuestion}
        disabled={!answered}
      >
        Next question
      </button>
    </div>
  );
}
