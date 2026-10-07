import React from 'react';
import { X, HelpCircle, Lightbulb, Target, Sparkles } from 'lucide-react';
import { TERMS_KNOWLEDGE } from '../data/termsKnowledge';
import { useTheme } from '../context/ThemeContext';

interface TermExplainerModalProps {
  termId: string | null;
  onClose: () => void;
}

export const TermExplainerModal: React.FC<TermExplainerModalProps> = ({ termId, onClose }) => {
  const { isDark, cardBg, cardSubtle, btnOutlineSm, btnActive } = useTheme();

  if (!termId) return null;

  const item = TERMS_KNOWLEDGE.find(t => t.id === termId) || TERMS_KNOWLEDGE[0];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in ${
      isDark ? 'bg-black/75' : 'bg-black/40'
    }`}>
      <div className={`${cardBg} rounded-3xl max-w-lg w-full p-6 shadow-2xl relative transition-colors`}>
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 ${btnOutlineSm}`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
            isDark ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-900 border-zinc-900 text-white'
          }`}>
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[11px] font-bold tracking-wider uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Справочник для абонента
            </span>
            <h3 className={`text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {item.term}
            </h3>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Простыми словами */}
          <div className={`p-3.5 rounded-2xl border ${cardSubtle}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Простыми словами:</span>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              {item.simpleExplanation}
            </p>
          </div>

          {/* Жизненная аналогия */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-500">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Наглядная аналогия из жизни:</span>
            </div>
            <p className="italic leading-relaxed">
              «{item.analogy}»
            </p>
          </div>

          {/* Нормальные значения */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${cardSubtle}`}>
            <Target className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold block mb-0.5 text-emerald-500">
                Какое значение считается нормой:
              </span>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {item.idealRange}
              </p>
            </div>
          </div>

          {/* Практические советы */}
          {item.practicalTips.length > 0 && (
            <div className={`p-3.5 rounded-2xl border ${cardSubtle}`}>
              <span className={`text-xs font-semibold block mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                💡 Что можно сделать абоненту:
              </span>
              <ul className={`space-y-1.5 text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {item.practicalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={`mt-5 pt-3 border-t flex justify-end ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={onClose}
            className={btnActive}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
