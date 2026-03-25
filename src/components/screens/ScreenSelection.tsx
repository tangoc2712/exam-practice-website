import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { BookOpen, PlusCircle } from 'lucide-react';
import type { Exam } from '../../types';
import { AddExamModal } from './AddExamModal';

interface ScreenSelectionProps {
  exams: Exam[];
  onSelectExam: (exam: Exam) => void;
  onAddExam: (exam: Exam) => void;
}

export const ScreenSelection: React.FC<ScreenSelectionProps> = ({ exams, onSelectExam, onAddExam }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exams.map((exam) => (
          <GlassCard 
            key={exam.id} 
            interactive 
            onClick={() => onSelectExam(exam)}
            className="flex flex-col h-full animate-slide-up"
            style={{ animationFillMode: 'both' }}
          >
            <div className="mb-4 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              <BookOpen size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-display tracking-widest font-bold mb-3 text-white">
              {exam.title}
            </h2>
            <p className="text-slate-400 flex-grow mb-6">
              {exam.description}
            </p>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between border-t border-[#333344] pt-4 mt-4">
                <span className="text-sm font-bold text-neon-pink tracking-widest uppercase">
                  {exam.questions.length} Questions
                </span>
                <Button variant="ghost" size="sm" className="pointer-events-none">
                  Start Exam →
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
        
        <GlassCard 
          interactive 
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center justify-center min-h-[250px] animate-slide-up border-dashed border-2 hover:border-cyan-500 bg-[#222233]/30"
          style={{ animationFillMode: 'both' }}
        >
          <div className="text-cyan-400 group-hover:scale-110 transition-transform mb-4">
            <PlusCircle size={48} strokeWidth={1} />
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
