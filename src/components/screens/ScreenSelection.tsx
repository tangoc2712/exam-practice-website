import React, { useEffect, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BookOpen, ChevronDown, ChevronUp, FolderTree, PlusCircle } from 'lucide-react';
import type { Exam } from '../../types';
import { AddExamModal } from './AddExamModal';

export interface ExamSelectionItem {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
}

export interface ExamCourseGroup {
  id: string;
  title: string;
  exams: ExamSelectionItem[];
}

interface ScreenSelectionProps {
  examGroups: ExamCourseGroup[];
  onSelectExam: (examId: string) => void;
  onAddExam: (exam: Exam) => void;
}

export const ScreenSelection: React.FC<ScreenSelectionProps> = ({ examGroups, onSelectExam, onAddExam }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(
    new Set(examGroups.map((group) => group.id))
  );

  useEffect(() => {
    setExpandedCourseIds((prev) => {
      const next = new Set(prev);
      examGroups.forEach((group) => next.add(group.id));
      return next;
    });
  }, [examGroups]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-widest text-white mb-2">Choose A Course</h1>
        <p className="text-slate-400">Expand a course, then pick a practice exam inside it.</p>
      </div>

      <div className="space-y-5">
        {examGroups.map((group) => {
          const isExpanded = expandedCourseIds.has(group.id);
          return (
            <GlassCard key={group.id} className="p-0 overflow-hidden">
              <button
                onClick={() => toggleCourse(group.id)}
                className="w-full px-6 py-5 flex items-center justify-between bg-[#151528] hover:bg-[#1a1a2d] transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
                    <FolderTree size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-display font-bold tracking-wider text-white">{group.title}</h2>
                    <p className="text-xs md:text-sm text-slate-400 uppercase tracking-widest">
                      {group.exams.length} exam{group.exams.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="text-neon-pink">
                  {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 md:p-5 border-t border-[#333344] bg-[#111122]/70 space-y-3">
                  {group.exams.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => onSelectExam(exam.id)}
                      className="p-4 rounded-sm border transition-all duration-300 cursor-pointer flex items-center gap-4 group bg-[#161625] border-[#333344] text-slate-300 hover:border-neon-pink/70 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:-translate-y-0.5"
                    >
                      <div className="text-neon-cyan drop-shadow-[0_0_6px_rgba(0,255,255,0.7)]">
                        <BookOpen size={20} strokeWidth={1.75} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-base md:text-lg font-display tracking-wide font-semibold text-white truncate">{exam.title}</h3>
                        {exam.description && (
                          <p className="text-xs md:text-sm text-slate-400 line-clamp-1">{exam.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-neon-pink tracking-widest uppercase block">
                          {exam.questionCount} Questions
                        </span>
                        <span className="text-xs text-slate-500">Start →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8">
        <GlassCard 
          interactive 
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center justify-center min-h-[180px] animate-slide-up border-dashed border-2 hover:border-cyan-500 bg-[#222233]/30"
          style={{ animationFillMode: 'both' }}
        >
          <div className="text-cyan-400 group-hover:scale-110 transition-transform mb-4">
            <PlusCircle size={40} strokeWidth={1} />
          </div>
          <h2 className="text-xl font-display tracking-wider font-bold text-slate-300">
            Add Your Own Exam
          </h2>
          <p className="text-slate-500 text-sm mt-2 text-center max-w-[80%]">
            Create an exam from a JSON file or paste your list of questions.
          </p>
        </GlassCard>
      </div>

      <AddExamModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddExam={onAddExam} 
      />
    </div>
  );
};
