import React, { useState } from 'react';
import type { Exam } from '../../types';
import { GlassCard, GlassPanel } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import classNames from 'classnames';
import { Lightbulb, Flag, ChevronRight, CheckCircle2 } from 'lucide-react';

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

  const question = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

  const currentAnswers = userAnswers[question.id] || [];

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
      setShowConfirmSubmit(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false); // Reset hint for next question
    }
  };

  const handleConfirmSubmit = () => {
    onSubmit(userAnswers);
  };

  if (showConfirmSubmit) {
    return (
      <div className="animate-fade-in w-full max-w-lg mx-auto p-4">
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

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto p-4 py-8">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neon-cyan/30">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-widest">{exam.title}</h1>
          <span className="text-sm text-neon-pink font-medium uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {exam.questions.length} • Domain: {question.domain}
          </span>
        </div>
        <div className="text-xs font-bold px-3 py-1 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded-sm uppercase tracking-wider drop-shadow-md">
          {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
        </div>
      </div>

      {/* Main Question Card */}
      <GlassCard className="mb-8 p-6 md:p-10 relative">
        <div className="absolute top-6 right-6 flex gap-2">
          <button 
            onClick={() => setShowHint(!showHint)}
            className={classNames(
              "p-2 rounded-full transition-all duration-200",
              showHint ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-slate-100"
            )}
            title="Toggle Hint"
          >
            <Lightbulb size={20} />
          </button>
          <button 
            onClick={toggleMarked}
            className={classNames(
              "p-2 rounded-full transition-all duration-200",
              markedQuestions.has(question.id) ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-slate-100"
            )}
            title="Mark for Review"
          >
            <Flag size={20} />
          </button>
        </div>

        <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-8 pr-20 text-white">
          {question.text}
        </h2>

        {showHint && question.hint && (
          <div className="mb-8 p-4 rounded-sm bg-neon-cyan/10 border border-neon-cyan text-cyan-100 text-sm animate-fade-in flex items-start gap-3 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
             <Lightbulb size={18} className="mt-0.5 text-neon-cyan" />
             <p>{question.hint}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {question.options.map((option) => {
            const isSelected = currentAnswers.includes(option.id);
            return (
              <div 
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={classNames(
                  "p-4 rounded-sm border transition-all duration-300 cursor-pointer flex items-center gap-4 group",
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
                <span className="text-lg leading-snug">{option.text}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Footer Controls */}
      <div className="flex justify-between items-center">
        {/* Simple pagination dots could go here, omitting for minimalism */}
        <div /> 
        <Button 
          variant={isLastQuestion ? "success" : "primary"}
          size="lg"
          onClick={handleNext}
          className="min-w-[160px]"
        >
          {isLastQuestion ? 'Submit Exam' : 'Next Question'}
          {!isLastQuestion && <ChevronRight className="ml-2 w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
};
