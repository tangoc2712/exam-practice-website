import React, { useState } from 'react';
import type { Exam } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import classNames from 'classnames';
import { CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface ScreenResultsProps {
  exam: Exam;
  userAnswers: Record<string, string[]>;
  onRetake: () => void;
  onBackToSelection: () => void;
}

export const ScreenResults: React.FC<ScreenResultsProps> = ({ 
  exam, 
  userAnswers, 
  onRetake,
  onBackToSelection
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Calculate score
  let correctCount = 0;
  
  exam.questions.forEach(question => {
    const selectedOptions = userAnswers[question.id] || [];
    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id);
    
    // Check if arrays are identical (ignoring order)
    const isCorrect = 
      selectedOptions.length === correctOptions.length &&
      selectedOptions.every(id => correctOptions.includes(id));
      
    if (isCorrect) correctCount++;
  });

  const scorePercentage = Math.round((correctCount / exam.questions.length) * 100);

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto p-4 py-12">
      {/* Score Header */}
      <GlassCard className="mb-8 text-center border-neon-purple shadow-[0_0_30px_rgba(123,97,255,0.2)]">
        <h1 className="text-3xl font-display font-bold mb-2 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Exam Completed</h1>
        <p className="text-neon-cyan tracking-widest uppercase mb-6">{exam.title}</p>
        
        <div className="inline-block relative shadow-[0_0_40px_rgba(0,255,255,0.1)] rounded-full">
          <svg className="w-32 h-32 transform -rotate-90 filter drop-shadow-[0_0_5px_currentColor]">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#2a2a40]" />
            <circle 
              cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray={377} 
              strokeDashoffset={377 - (377 * scorePercentage) / 100}
              className={scorePercentage >= 70 ? 'text-neon-cyan drop-shadow-[0_0_10px_rgba(0,255,255,1)]' : scorePercentage >= 40 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,1)]' : 'text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,1)]'} 
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-display font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{scorePercentage}%</span>
          </div>
        </div>
        <div className="mt-6 text-lg text-slate-300 font-medium">
          <span className="text-neon-cyan font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">{correctCount}</span> out of {exam.questions.length} correct
        </div>
      </GlassCard>

      {/* Review Section */}
      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-display font-bold mb-6 px-2 text-white uppercase tracking-widest border-l-4 border-neon-pink pl-4 drop-shadow-md">Detailed Review</h2>
        
        {exam.questions.map((question, index) => {
          const selectedOptions = userAnswers[question.id] || [];
          const correctOptionsList = question.options.filter(o => o.isCorrect).map(o => o.id);
          const isCorrectlyAnswered = 
            selectedOptions.length === correctOptionsList.length &&
            selectedOptions.every(id => correctOptionsList.includes(id));
            
          const isExpanded = expandedQuestions.has(question.id);

          return (
            <GlassCard key={question.id} className={classNames("p-0 overflow-hidden transition-all duration-300 border", !isCorrectlyAnswered ? "border-neon-pink/50 shadow-[0_0_15px_rgba(255,0,255,0.1)]" : "border-[#333344]")}>
              {/* Question Header */}
              <div 
                className={classNames(
                  "p-6 flex items-start gap-4 cursor-pointer hover:bg-[#252540] transition-colors",
                  isCorrectlyAnswered ? "bg-[#161625]" : "bg-neon-pink/10"
                )}
                onClick={() => !isCorrectlyAnswered && toggleExpand(question.id)}
              >
                <div className="mt-1">
                  {isCorrectlyAnswered ? (
                    <CheckCircle2 className="text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" size={24} />
                  ) : (
                    <XCircle className="text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]" size={24} />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1 drop-shadow-sm">Question {index + 1}</div>
                  <h3 className="text-lg font-medium leading-relaxed text-slate-200">{question.text}</h3>
                </div>
                {!isCorrectlyAnswered && (
                  <div className="text-neon-pink">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                )}
              </div>

              {/* Expansion Details (Only for incorrect answers) */}
              {!isCorrectlyAnswered && isExpanded && (
                <div className="p-6 pt-0 border-t border-[#333344] animate-slide-up bg-[#0F0F23]">
                  <div className="mt-4 space-y-3">
                    {question.options.map(option => {
                      const isSelected = selectedOptions.includes(option.id);
                      const isCorrect = option.isCorrect;
                      
                      let optionStyle = "border-[#333344] text-slate-400 bg-transparent";
                      let indicator = null;
                      
                      if (isCorrect) {
                        optionStyle = "bg-neon-cyan/10 border-neon-cyan/50 text-cyan-100 shadow-[0_0_10px_rgba(0,255,255,0.15)]";
                        indicator = <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest ml-auto drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] border border-neon-cyan px-2 py-0.5 rounded-sm">Correct</span>;
                      } else if (isSelected && !isCorrect) {
                        optionStyle = "bg-neon-pink/10 border-neon-pink/50 text-pink-100 shadow-[0_0_10px_rgba(255,0,255,0.15)]";
                        indicator = <span className="text-[10px] font-bold text-neon-pink uppercase tracking-widest ml-auto drop-shadow-[0_0_5px_rgba(255,0,255,0.8)] border border-neon-pink px-2 py-0.5 rounded-sm">Your Answer</span>;
                      }

                      return (
                        <div key={option.id} className={classNames("p-4 rounded-sm border", optionStyle)}>
                           <div className="flex items-center gap-3 mb-2">
                             <div className={classNames(
                                "w-4 h-4 rounded-sm border flex-shrink-0 shadow-inner",
                                isCorrect ? "border-neon-cyan bg-neon-cyan" : isSelected ? "border-neon-pink bg-neon-pink" : "border-[#444455]"
                             )} />
                             <span className="font-medium text-sm leading-relaxed">{option.text}</span>
                             {indicator}
                          </div>
                          {(isCorrect || isSelected) && option.explanation && (
                            <div className={classNames(
                              "mt-3 pt-3 border-t text-xs leading-relaxed border-opacity-30",
                              isCorrect ? "border-neon-cyan text-cyan-200" : "border-neon-pink text-pink-200"
                            )}>
                              {option.explanation}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button variant="ghost" size="lg" onClick={onBackToSelection}>
          Choose Another Exam
        </Button>
        <Button variant="primary" size="lg" onClick={onRetake}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Retake Exam
        </Button>
      </div>
    </div>
  );
};
