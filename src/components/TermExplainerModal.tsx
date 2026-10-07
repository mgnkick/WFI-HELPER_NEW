import React from 'react';
import { X, HelpCircle, Lightbulb, Target, Sparkles } from 'lucide-react';
import { TermExplanation } from '../types/wifi';
import { TERMS_KNOWLEDGE } from '../data/termsKnowledge';

interface TermExplainerModalProps {
  termId: string | null;
  onClose: () => void;
}

export const TermExplainerModal: React.FC<TermExplainerModalProps> = ({ termId, onClose }) => {
  if (!termId) return null;

  const item = TERMS_KNOWLEDGE.find(t => t.id === termId) || TERMS_KNOWLEDGE[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
              Справочник для абонента
            </span>
            <h3 className="text-xl font-bold text-white leading-tight">
              {item.term}
            </h3>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Простыми словами */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Простыми словами:</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {item.simpleExplanation}
            </p>
          </div>

          {/* Жизненная аналогия */}
          <div className="bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/30">
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Наглядная аналогия из жизни:</span>
            </div>
            <p className="text-amber-100/90 leading-relaxed italic">
              «{item.analogy}»
            </p>
          </div>

          {/* Нормальные значения */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-emerald-400 block mb-0.5">
                Какое значение считается нормой:
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {item.idealRange}
              </p>
            </div>
          </div>

          {/* Практические советы */}
          {item.practicalTips.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                💡 Что можно сделать абоненту:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {item.practicalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
