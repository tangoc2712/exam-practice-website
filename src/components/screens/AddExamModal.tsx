import React, { useState, useRef } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { X, FileText, UploadCloud, Download, AlertTriangle } from 'lucide-react';
import type { Exam } from '../../types';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExam: (exam: Exam) => void;
}

type ModalMode = 'selection' | 'text-input' | 'file-upload';

export const AddExamModal: React.FC<AddExamModalProps> = ({ isOpen, onClose, onAddExam }) => {
  const [mode, setMode] = useState<ModalMode>('selection');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setMode('selection');
    setTextInput('');
    setError(null);
    onClose();
  };

  const validateAndAddExam = (data: any) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure. Must be an object.');
      }
      if (!data.title || typeof data.title !== 'string') {
        throw new Error('Exam must have a valid "title" (string).');
      }
      if (!Array.isArray(data.questions)) {
        throw new Error('Exam must have a "questions" array.');
      }
      
      const questions = data.questions.map((q: any) => {
        if (!q.text || typeof q.text !== 'string') throw new Error('Each question must have "text".');
        if (q.type !== 'single' && q.type !== 'multiple') throw new Error('Question type must be "single" or "multiple".');
        if (!Array.isArray(q.options) || q.options.length === 0) throw new Error('Each question must have an "options" array.');
        
        q.options.forEach((opt: any) => {
          if (!opt.text || typeof opt.text !== 'string') throw new Error('Each option must have "text".');
          if (typeof opt.isCorrect !== 'boolean') throw new Error('Each option must have a boolean "isCorrect".');
          if (!opt.explanation || typeof opt.explanation !== 'string') throw new Error('Each option must have an "explanation".');
        });

        return {
          id: q.id || crypto.randomUUID(),
          domain: q.domain || 'General',
          text: q.text,
          type: q.type,
          options: q.options.map((opt: any) => ({
            id: opt.id || crypto.randomUUID(),
            text: opt.text,
            isCorrect: opt.isCorrect,
            explanation: opt.explanation,
          })),
          hint: q.hint || '',
        };
      });

      const newExam: Exam = {
        id: data.id || crypto.randomUUID(),
        title: data.title,
        description: data.description || '',
        questions: questions,
      };

      onAddExam(newExam);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Invalid exam format');
    }
  };

  const handleTextSubmit = () => {
    setError(null);
    try {
      const parsed = JSON.parse(textInput);
      validateAndAddExam(parsed);
    } catch {
      setError('Invalid JSON format. Please check your syntax.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        validateAndAddExam(parsed);
      } catch {
        setError('Invalid JSON file. Please ensure it is properly formatted.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = {
      title: "My Custom Exam",
      description: "A customized exam downloaded from the template.",
      questions: [
        {
          domain: "General Knowledge",
          text: "What is 2 + 2?",
          type: "single",
          hint: "Basic math",
          options: [
            { text: "3", isCorrect: false, explanation: "Incorrect calculation" },
            { text: "4", isCorrect: true, explanation: "2 + 2 equals 4" }
          ]
        }
      ]
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-2xl relative p-6 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-bold text-white mb-6">
          {mode === 'selection' ? 'Add Your Own Exam' : mode === 'text-input' ? 'Input Exam JSON' : 'Upload Exam File'}
        </h2>

        {mode === 'selection' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('text-input')}
                className="group relative flex flex-col items-center justify-center p-8 rounded-xl border border-[#333344] bg-[#222233]/50 hover:bg-[#333344] hover:border-cyan-500 transition-all duration-300"
              >
                <FileText size={48} className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-white">Input Text</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/80 rounded-xl transition-opacity p-4 text-center">
                  <span className="text-sm text-slate-200">Paste your exam questions directly as a JSON text.</span>
                </div>
              </button>

              <button 
                onClick={() => setMode('file-upload')}
                className="group relative flex flex-col items-center justify-center p-8 rounded-xl border border-[#333344] bg-[#222233]/50 hover:bg-[#333344] hover:border-neon-pink transition-all duration-300"
              >
                <UploadCloud size={48} className="text-neon-pink mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-white">Upload File</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/80 rounded-xl transition-opacity p-4 text-center">
                  <span className="text-sm text-slate-200">Upload a properly formatted JSON file containing your exam.</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col items-center mt-8 gap-3">
              <Button variant="secondary" size="sm" onClick={downloadTemplate} className="flex items-center gap-2">
                <Download size={16} />
                Download Standard Format
              </Button>
              <p className="text-xs text-slate-500 italic text-center max-w-sm">
                Tips: download example format, put it in any AI chat with your question bank, and ask AI to convert into example format
              </p>
            </div>
          </div>
        )}

        {mode === 'text-input' && (
          <div className="space-y-4">
            <textarea
              className="w-full h-64 p-4 rounded-xl bg-[#1a1a24] border border-[#333344] text-slate-200 font-mono text-sm focus:border-cyan-500 focus:outline-none resize-none"
              placeholder='{"title": "My Exam", "questions": [...]}'
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#333344]">
              <Button variant="ghost" onClick={() => setMode('selection')}>Back</Button>
              <Button onClick={handleTextSubmit}>Submit Exam</Button>
            </div>
          </div>
        )}

        {mode === 'file-upload' && (
          <div className="space-y-6">
             <div 
              className="border-2 border-dashed border-[#333344] rounded-xl p-12 flex flex-col items-center justify-center hover:border-neon-pink transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} className="text-slate-400 mb-4" />
              <p className="text-slate-200 font-medium mb-2">Click to select a JSON file</p>
              <p className="text-slate-500 text-sm">Only .json files are supported</p>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#333344]">
              <Button variant="ghost" onClick={() => setMode('selection')}>Back</Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
