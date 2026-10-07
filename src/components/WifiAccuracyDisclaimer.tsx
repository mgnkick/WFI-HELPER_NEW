import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Radio, Cable } from 'lucide-react';
import { WIFI_ACCURACY_DISCLAIMER } from '../data/termsKnowledge';
import { useTheme } from '../context/ThemeContext';

interface WifiAccuracyDisclaimerProps {
  currentBand: string;
}

export const WifiAccuracyDisclaimer: React.FC<WifiAccuracyDisclaimerProps> = ({ currentBand }) => {
  const { isDark, cardBg, cardSubtle, btnOutlineSm } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const is24GHz = currentBand.includes('2.4');

  return (
    <div
      className={`rounded-2xl border transition-all ${
        is24GHz
          ? isDark
            ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
            : 'bg-amber-50 border-amber-300 text-amber-950'
          : cardBg
      } p-4 sm:p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
              is24GHz
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-amber-200 text-amber-900 border-amber-400'
                : isDark
                  ? 'bg-zinc-800 text-white border-white'
                  : 'bg-zinc-900 text-white border-zinc-900'
            }`}
          >
            {is24GHz ? <AlertTriangle className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider ${is24GHz ? 'text-amber-500' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {is24GHz ? '⚠️ Внимание: Подключение 2.4 ГГц' : 'ℹ️ Памятка абоненту'}
              </span>
              <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                • Замер по воздуху
              </span>
            </div>

            <h4 className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {WIFI_ACCURACY_DISCLAIMER.title}
            </h4>

            <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {WIFI_ACCURACY_DISCLAIMER.shortWarning}
              {is24GHz && (
                <strong className={`block mt-1 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                  На частоте 2.4 ГГц скорость редко превышает 40–70 Мбит/с даже на тарифе 500 Мбит/с из-за физических помех и соседских роутеров!
                </strong>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={btnOutlineSm}
        >
          <span>{isOpen ? 'Свернуть' : 'Подробнее'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className={`mt-4 pt-3 border-t space-y-3 text-xs ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WIFI_ACCURACY_DISCLAIMER.reasons.map((r, i) => (
              <div key={i} className={`p-3 rounded-xl border ${cardSubtle}`}>
                <div className={`font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                    isDark ? 'border-white text-white' : 'border-zinc-900 text-zinc-900'
                  }`}>
                    {i + 1}
                  </span>
                  <span>{r.title}</span>
                </div>
                <p className={`leading-relaxed pl-5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{r.desc}</p>
              </div>
            ))}
          </div>

          <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
            isDark ? 'bg-zinc-800/80 border-white text-white' : 'bg-zinc-100 border-zinc-900 text-zinc-900'
          }`}>
            <Cable className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Золотое правило диагностики:</span>
              <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {WIFI_ACCURACY_DISCLAIMER.verdictRule}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
