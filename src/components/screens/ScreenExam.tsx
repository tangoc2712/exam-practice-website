import React, { useState } from 'react';
import type { Exam } from '../../types';
import { GlassCard, GlassPanel } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import classNames from 'classnames';
import { Lightbulb, Flag, ChevronRight, ChevronLeft, CheckCircle2, Eye, ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';

interface ScreenExamProps {
  exam: Exam;
  onSubmit: (userAnswers: Record<string, string[]>) => void;
}

export const ScreenExam: React.FC<ScreenExamProps> = ({ exam, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const question = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const currentAnswers = userAnswers[question.id] || [];
  const correctOptionIds = question.options.filter(option => option.isCorrect).map(option => option.id);
  const hasAnswered = currentAnswers.length > 0;
  const isCorrectlyAnswered =
    hasAnswered &&
    currentAnswers.length === correctOptionIds.length &&
    currentAnswers.every(id => correctOptionIds.includes(id));

  const toggleOption = (optionId: string) => {
    if (question.type === 'single') {
      setUserAnswers(prev => ({ ...prev, [question.id]: [optionId] }));
    } else {
      setUserAnswers(prev => {
        const current = prev[question.id] || [];
        if (current.includes(optionId)) {
          return { ...prev, [question.id]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [question.id]: [...current, optionId] };
        }
      });
    }
  };

  const toggleMarked = () => {
    setMarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(question.id)) {
        newSet.delete(question.id);
      } else {
        newSet.add(question.id);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowPreview(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHint(false);
    }
  };

  const handleConfirmSubmit = () => {
    onSubmit(userAnswers);
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowPreview(false);
    setShowHint(false);
  };

  const answeredCount = exam.questions.filter(q => (userAnswers[q.id] || []).length > 0).length;
  const flaggedCount = exam.questions.filter(q => markedQuestions.has(q.id)).length;

  // Confirm Submit Dialog
  if (showConfirmSubmit) {
    return (
      <div className="animate-fade-in w-full max-w-lg mx-auto px-0 py-4 sm:px-2">
        <GlassPanel className="text-center p-8">
          <div className="text-neon-cyan mb-6 flex justify-center drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-display text-white tracking-widest font-bold mb-4">Submit Exam?</h2>
          <p className="text-slate-400 mb-8">
            You are about to submit your exam. Please confirm if you are ready to be graded.
          </p>
          <div className="flex gap-4 max-w-xs mx-auto">
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={() => setShowConfirmSubmit(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleConfirmSubmit}
            >
              Submit
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // Preview Page
  if (showPreview) {
    return (
      <div className="animate-fade-in w-full max-w-4xl mx-auto px-0 py-4 md:px-4 md:py-8">
        {/* Header */}
        <div className="mb-6 border-b border-neon-cyan/30 pb-3 md:mb-8 md:pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-widest">{exam.title}</h1>
            <span className="text-xs sm:text-sm text-neon-pink font-medium uppercase tracking-wider">
              Exam Preview
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded-sm">
              {answeredCount}/{exam.questions.length} Answered
            </span>
            {flaggedCount > 0 && (
              <span className="px-3 py-1 bg-red-500/10 border border-red-500 text-red-400 rounded-sm">
                {flaggedCount} Flagged
              </span>
            )}
          </div>
          </div>
        </div>

        {/* Summary Table */}
        <GlassCard className="mb-8 p-0 md:p-0 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="border-b border-[#333344] bg-[#161625]/50">
                <th className="text-left px-6 py-4 text-xs font-display uppercase tracking-wider text-neon-cyan">#</th>
                <th className="text-left px-6 py-4 text-xs font-display uppercase tracking-wider text-neon-cyan">Question</th>
                <th className="text-center px-6 py-4 text-xs font-display uppercase tracking-wider text-neon-cyan">Answered</th>
                <th className="text-center px-6 py-4 text-xs font-display uppercase tracking-wider text-neon-cyan">Flagged for Review</th>
              </tr>
            </thead>
            <tbody>
              {exam.questions.map((q, index) => {
                const isAnswered = (userAnswers[q.id] || []).length > 0;
                const isFlagged = markedQuestions.has(q.id);
                return (
                  <tr
                    key={q.id}
                    onClick={() => handleGoToQuestion(index)}
                    className="border-b border-[#333344]/50 cursor-pointer transition-all duration-200 hover:bg-neon-cyan/5 hover:shadow-[inset_0_0_20px_rgba(0,255,255,0.05)] group"
                    data-testid={`preview-row-${index}`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-400 group-hover:text-neon-cyan transition-colors">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 group-hover:text-white transition-colors max-w-md">
                      <span className="line-clamp-2">{q.text}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isAnswered ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 text-green-400 shadow-[0_0_8px_rgba(74,222,128,0.3)]">
                          <Check size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700/50 text-slate-500">
                          <X size={16} />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isFlagged ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          <Flag size={16} />
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </GlassCard>

        {/* Unanswered warning */}
        {answeredCount < exam.questions.length && (
          <div className="mb-6 p-4 rounded-sm bg-amber-500/10 border border-amber-500/50 text-amber-200 text-sm flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 text-amber-400 flex-shrink-0" />
            <p>You have {exam.questions.length - answeredCount} unanswered question(s). You can click any row to go back and answer.</p>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
          <Button
            variant="ghost"
            onClick={() => setShowPreview(false)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Questions
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={() => setShowConfirmSubmit(true)}
            className="w-full sm:w-auto sm:min-w-[160px]"
          >
            Submit Exam
          </Button>
        </div>
      </div>
    );
  }

  // Normal Question View
  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto px-0 py-4 md:px-4 md:py-8">
      {/* Header Info */}
      <div className="mb-6 border-b border-neon-cyan/30 pb-3 md:mb-8 md:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-widest">{exam.title}</h1>
          <span className="text-xs sm:text-sm text-neon-pink font-medium uppercase tracking-wider leading-relaxed block">
            Question {currentQuestionIndex + 1} of {exam.questions.length} • Domain: {question.domain}
          </span>
        </div>
        <div className="self-start text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded-sm uppercase tracking-wider drop-shadow-md">
          {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
        </div>
        </div>
      </div>

      {/* Main Question Card */}
      <GlassCard className="mb-6 md:mb-8 p-4 sm:p-5 md:p-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-6 md:mb-8 text-white text-justify">
          {question.text}
        </h2>

        <div className="mb-6 md:mb-8 flex items-center justify-end gap-2 border-y border-[#333344] py-3">
          <button 
            onClick={() => setShowHint(!showHint)}
            className={classNames(
              "inline-flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-200 border",
              showHint
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:text-amber-500 hover:border-amber-200"
            )}
            title="Toggle Hint"
          >
            <Lightbulb size={17} />
            <span className="text-xs font-bold uppercase tracking-wider">Hint</span>
          </button>
          <button 
            onClick={toggleMarked}
            className={classNames(
              "inline-flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-200 border",
              markedQuestions.has(question.id)
                ? "bg-red-100 text-red-700 border-red-200"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:text-red-500 hover:border-red-200"
            )}
            title="Mark for Review"
          >
            <Flag size={17} />
            <span className="text-xs font-bold uppercase tracking-wider">Flag</span>
          </button>
        </div>

        {showHint && question.hint && (
          <div className="mb-6 md:mb-8 p-3.5 md:p-4 rounded-sm bg-neon-cyan/10 border border-neon-cyan text-cyan-100 text-xs sm:text-sm animate-fade-in flex items-start gap-3 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
             <Lightbulb size={18} className="mt-0.5 text-neon-cyan" />
             <p>{question.hint}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 md:gap-4">
          {question.options.map((option) => {
            const isSelected = currentAnswers.includes(option.id);
            return (
              <div 
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={classNames(
                  "p-3.5 md:p-4 rounded-sm border transition-all duration-300 cursor-pointer flex items-center gap-3 md:gap-4 group",
                  isSelected 
                    ? "bg-neon-cyan/10 border-neon-cyan text-white shadow-[var(--shadow-neon-cyan)]" 
                    : "bg-[#161625] border-[#333344] text-slate-300 hover:border-neon-pink/70 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:-translate-y-0.5"
                )}
              >
                <div className={classNames(
                  "flex-shrink-0 w-6 h-6 border flex items-center justify-center transition-all duration-300",
                  question.type === 'single' ? 'rounded-full' : 'rounded-sm',
                  isSelected ? 'border-neon-cyan bg-neon-cyan/20 shadow-[0_0_8px_rgba(0,255,255,0.5)]' : 'border-[#444455] bg-transparent group-hover:border-neon-pink/50'
                )}>
                  {isSelected && <div className={classNames("bg-neon-cyan shadow-[0_0_5px_rgba(0,255,255,1)]", question.type === 'single' ? "w-2.5 h-2.5 rounded-full" : "w-3 h-3 rounded-sm")} />}
                </div>
                <span className="text-base sm:text-lg leading-snug">{option.text}</span>
              </div>
            );
          })}
        </div>

        {hasAnswered && (
          <div
            className={classNames(
              "mt-6 md:mt-8 p-4 md:p-5 rounded-sm border animate-fade-in",
              isCorrectlyAnswered
                ? "border-neon-cyan/40 bg-neon-cyan/5"
                : "border-neon-pink/40 bg-neon-pink/5"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              {isCorrectlyAnswered ? (
                <CheckCircle2 className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]" size={20} />
              ) : (
                <AlertTriangle className="text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" size={20} />
              )}
              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-widest text-white">Answer & Explanation</h3>
                <p className={classNames("text-xs tracking-wider uppercase", isCorrectlyAnswered ? "text-neon-cyan" : "text-neon-pink")}>
                  {isCorrectlyAnswered ? "Correct" : "Not Correct"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {question.options.map(option => {
                const isSelected = currentAnswers.includes(option.id);
                const isCorrect = option.isCorrect;

                let optionStyle = "border-[#333344] text-slate-400 bg-transparent";
                let indicator = null;

                if (isCorrect) {
                  optionStyle = "bg-neon-cyan/10 border-neon-cyan/50 text-cyan-100 shadow-[0_0_10px_rgba(0,255,255,0.15)]";
                  indicator = (
                    <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest ml-auto border border-neon-cyan px-2 py-0.5 rounded-sm">
                      Correct
                    </span>
                  );
                } else if (isSelected) {
                  optionStyle = "bg-neon-pink/10 border-neon-pink/50 text-pink-100 shadow-[0_0_10px_rgba(255,0,255,0.15)]";
                  indicator = (
                    <span className="text-[10px] font-bold text-neon-pink uppercase tracking-widest ml-auto border border-neon-pink px-2 py-0.5 rounded-sm">
                      Your Answer
                    </span>
                  );
                }

                return (
                  <div key={option.id} className={classNames("p-3.5 rounded-sm border", optionStyle)}>
                    <div className="flex items-center gap-3">
                      <div
                        className={classNames(
                          "w-4 h-4 rounded-sm border flex-shrink-0 shadow-inner",
                          isCorrect
                            ? "border-neon-cyan bg-neon-cyan"
                            : isSelected
                              ? "border-neon-pink bg-neon-pink"
                              : "border-[#444455]"
                        )}
                      />
                      <span className="text-sm leading-relaxed">{option.text}</span>
                      {indicator}
                    </div>
                  </div>
                );
              })}
            </div>

            {question.explanation && (
              <div className="mt-4 p-4 rounded-sm border border-neon-cyan/30 bg-neon-cyan/5 text-cyan-100 text-sm leading-relaxed shadow-inner">
                <h4 className="font-bold text-neon-cyan mb-2 tracking-wide uppercase text-xs">Explanation</h4>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Footer Controls */}
      <div
        className={classNames(
          "flex flex-col-reverse gap-3 sm:flex-row sm:items-center",
          isFirstQuestion ? "sm:justify-end" : "sm:justify-between"
        )}
      >
        {!isFirstQuestion && (
          <Button 
            variant="ghost"
            size="lg"
            onClick={handlePrevious}
            className="w-full sm:w-auto sm:min-w-[160px]"
          >
            <ChevronLeft className="mr-2 w-5 h-5" />
            Previous Question
          </Button>
        )}
        <Button 
          variant={isLastQuestion ? "success" : "primary"}
          size="lg"
          onClick={handleNext}
          className="w-full sm:w-auto sm:min-w-[160px]"
        >
          {isLastQuestion ? (
            <>
              Review & Submit
              <Eye className="ml-2 w-5 h-5" />
            </>
          ) : (
            <>
              Next Question
              <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
