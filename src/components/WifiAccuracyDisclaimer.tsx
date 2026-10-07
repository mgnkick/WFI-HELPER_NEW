import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Radio, Cable, ShieldAlert } from 'lucide-react';
import { WIFI_ACCURACY_DISCLAIMER } from '../data/termsKnowledge';

interface WifiAccuracyDisclaimerProps {
  currentBand: string;
}

export const WifiAccuracyDisclaimer: React.FC<WifiAccuracyDisclaimerProps> = ({ currentBand }) => {
  const [isOpen, setIsOpen] = useState(false);

  const is24GHz = currentBand.includes('2.4');

  return (
    <div
      className={`rounded-2xl border transition-all ${
        is24GHz
          ? 'bg-orange-950/20 border-orange-500/40 text-orange-200'
          : 'bg-slate-900/60 border-slate-800 text-slate-300'
      } p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              is24GHz ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}
          >
            {is24GHz ? <AlertTriangle className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                {is24GHz ? '⚠️ Внимание: Подключение 2.4 ГГц' : 'ℹ️ Памятка абоненту'}
              </span>
              <span className="text-xs text-slate-400">
                • Замер по воздуху
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white mt-0.5">
              {WIFI_ACCURACY_DISCLAIMER.title}
            </h4>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {WIFI_ACCURACY_DISCLAIMER.shortWarning}
              {is24GHz && (
                <strong className="block text-orange-300 mt-1">
                  На частоте 2.4 ГГц скорость редко превышает 40–70 Мбит/с даже на тарифе 500 Мбит/с из-за физических помех и соседских роутеров!
                </strong>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 flex-shrink-0 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
        >
          <span>{isOpen ? 'Свернуть' : 'Подробнее'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WIFI_ACCURACY_DISCLAIMER.reasons.map((r, i) => (
              <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span>{r.title}</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-5">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200">
            <Cable className="w-5 h-5 flex-shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <span className="font-bold text-white block mb-0.5">Золотое правило диагностики:</span>
              <p className="leading-relaxed text-slate-300">
                {WIFI_ACCURACY_DISCLAIMER.verdictRule}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
