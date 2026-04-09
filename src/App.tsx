import { useState } from 'react';
import { ScreenSelection } from './components/screens/ScreenSelection';
import type { ExamCourseGroup, ExamSelectionItem } from './components/screens/ScreenSelection';
import { ScreenExam } from './components/screens/ScreenExam';
import { ScreenResults } from './components/screens/ScreenResults';
import type { Exam, ExamIndexEntry } from './types';
import examsIndex from './data/exams-index.json';

type AppState = 'selection' | 'exam' | 'results';

const builtInExamModules = import.meta.glob('./data/exams/*.json');

const extractExamNumber = (title: string): number | null => {
  const match = title.match(/(?:Practice\s+)?Exam #(\d+)/i);
  return match ? Number(match[1]) : null;
};

const toExamLabel = (title: string): string => {
  const examNumber = extractExamNumber(title);
  return examNumber ? `Exam #${examNumber}` : title;
};

const toCourseName = (title: string): string => {
  const match = title.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : 'Other Courses';
};

const toCourseId = (courseName: string): string =>
  `course-${courseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

const normalizeWhitespace = (value: string): string => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

const cleanText = (value?: string): string => {
  if (!value) {
    return '';
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  const decoded = textarea.value;

  const parsed = new DOMParser().parseFromString(decoded, 'text/html');
  const text = parsed.body.textContent ?? decoded;
  return normalizeWhitespace(text);
};

const normalizeExam = (exam: Exam): Exam => ({
  ...exam,
  title: cleanText(exam.title),
  description: exam.description ? cleanText(exam.description) : exam.description,
  questions: exam.questions.map((question) => ({
    ...question,
    domain: cleanText(question.domain),
    text: cleanText(question.text),
    hint: cleanText(question.hint),
    explanation: question.explanation ? cleanText(question.explanation) : question.explanation,
    options: question.options.map((option) => ({
      ...option,
      text: cleanText(option.text),
      explanation: cleanText(option.explanation)
    }))
  }))
});

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('selection');

  const [customExams, setCustomExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem('customExams');
      if (saved) {
        const parsed = JSON.parse(saved) as Exam[];
        return parsed.map(normalizeExam);
      }
    } catch (e) {
      console.error('Failed to parse custom exams', e);
    }
    return [];
  });

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});

  const builtInGroupsById = new Map<string, ExamCourseGroup>();

  (examsIndex as ExamIndexEntry[]).forEach((entry) => {
    const courseName = toCourseName(entry.title);
    const courseId = toCourseId(courseName);
    const group = builtInGroupsById.get(courseId) || {
      id: courseId,
      title: courseName,
      exams: [] as ExamSelectionItem[]
    };

    group.exams.push({
      id: entry.id,
      title: toExamLabel(entry.title),
      description: entry.description,
      questionCount: entry.questionCount
    });

    builtInGroupsById.set(courseId, group);
  });

  const builtInGroups = Array.from(builtInGroupsById.values()).map((group) => ({
    ...group,
    exams: [...group.exams].sort((a, b) => {
      const aNum = extractExamNumber(a.title) ?? Number.MAX_SAFE_INTEGER;
      const bNum = extractExamNumber(b.title) ?? Number.MAX_SAFE_INTEGER;
      return aNum - bNum;
    })
  }));

  const customGroup: ExamCourseGroup | null = customExams.length
    ? {
        id: 'course-custom',
        title: 'Custom Exams',
        exams: customExams.map((exam, index) => ({
          id: exam.id,
          title: exam.title || `Custom Exam #${index + 1}`,
          description: exam.description,
          questionCount: exam.questions.length
        }))
      }
    : null;

  const examGroups: ExamCourseGroup[] = customGroup
    ? [...builtInGroups, customGroup]
    : builtInGroups;

  const handleAddExam = (newExam: Exam) => {
    const normalizedExam = normalizeExam(newExam);
    setCustomExams(prev => {
      const updated = [...prev, normalizedExam];
      localStorage.setItem('customExams', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectExam = async (examId: string) => {
    const customExam = customExams.find((exam) => exam.id === examId);
    if (customExam) {
      setSelectedExam(customExam);
      setUserAnswers({});
      setCurrentScreen('exam');
      return;
    }

    const builtInEntry = (examsIndex as ExamIndexEntry[]).find((entry) => entry.id === examId);
    if (!builtInEntry) {
      return;
    }

    const modulePath = `./data/${builtInEntry.file.replace(/^\.\//, '')}`;
    const loader = builtInExamModules[modulePath] as (() => Promise<{ default: Exam }>) | undefined;
    if (!loader) {
      console.error('No exam module found for path', modulePath);
      return;
    }

    const loaded = await loader();
    setSelectedExam(normalizeExam(loaded.default));
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
      <div className="relative z-10 min-h-screen flex flex-col px-3 pt-6 pb-8 sm:px-4 sm:pt-8 sm:pb-10 md:p-12 md:pt-24 lg:p-16">
        {currentScreen === 'selection' && (
          <ScreenSelection 
            examGroups={examGroups}
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
