import { useState } from 'react';
import { ScreenSelection } from './components/screens/ScreenSelection';
import { ScreenExam } from './components/screens/ScreenExam';
import { ScreenResults } from './components/screens/ScreenResults';
import type { Exam } from './types';
import examsData from './data/exams.json';

type AppState = 'selection' | 'exam' | 'results';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('selection');
  
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem('customExams');
      if (saved) {
        return [...(examsData as Exam[]), ...JSON.parse(saved)];
      }
    } catch (e) {
      console.error('Failed to parse custom exams', e);
    }
    return examsData as Exam[];
  });

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});

  const handleAddExam = (newExam: Exam) => {
    setExams(prev => {
      const updated = [...prev, newExam];
      const customOnly = updated.filter(e => !(examsData as Exam[]).find(d => d.id === e.id));
      localStorage.setItem('customExams', JSON.stringify(customOnly));
      return updated;
    });
  };

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setUserAnswers({});
    setCurrentScreen('exam');
  };

  const handleSubmitExam = (answers: Record<string, string[]>) => {
    setUserAnswers(answers);
    setCurrentScreen('results');
  };

  const handleRetake = () => {
    if (selectedExam) {
      setUserAnswers({});
      setCurrentScreen('exam');
    }
  };

  const handleBackToSelection = () => {
    setSelectedExam(null);
    setUserAnswers({});
    setCurrentScreen('selection');
  };

  return (
    <div className="min-h-screen bg-deep-space text-slate-200 selection:bg-neon-pink/30 font-sans relative overflow-hidden">
      {/* Background synthwave grid decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(transparent 95%, #00FFFF 100%), linear-gradient(90deg, transparent 95%, #00FFFF 100%)',
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2.5)',
             transformOrigin: 'bottom'
           }} 
      />
      <div className="relative z-10 p-6 md:p-12 lg:p-16 pt-16 md:pt-24 min-h-screen flex flex-col">
        {currentScreen === 'selection' && (
          <ScreenSelection 
            exams={exams} 
            onSelectExam={handleSelectExam} 
            onAddExam={handleAddExam} 
          />
        )}
        
        {currentScreen === 'exam' && selectedExam && (
          <ScreenExam 
            exam={selectedExam} 
            onSubmit={handleSubmitExam} 
          />
        )}

        {currentScreen === 'results' && selectedExam && (
          <ScreenResults 
            exam={selectedExam} 
            userAnswers={userAnswers}
            onRetake={handleRetake}
            onBackToSelection={handleBackToSelection}
          />
        )}
      </div>
    </div>
  );
}

export default App;
