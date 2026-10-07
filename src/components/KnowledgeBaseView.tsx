import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Heart,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { TERMS_KNOWLEDGE, WIFI_ACCURACY_DISCLAIMER } from '../data/termsKnowledge';
import { SBER_CARD_NUMBER, SBER_CARD_FORMATTED } from './DonateModal';

interface KnowledgeBaseViewProps {
  onSelectTermModal?: (termId: string) => void;
  onOpenDonate?: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onOpenDonate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('rssi');
  const [copied, setCopied] = useState(false);

  const handleCopyCard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(SBER_CARD_NUMBER);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = SBER_CARD_NUMBER;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const filteredTerms = TERMS_KNOWLEDGE.filter(
    t =>
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. ПОИСК И ШАПКА БАЗЫ ЗНАНИЙ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">
                Обучающий справочник для абонента
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Простые и понятные объяснения терминов сети, радиоэфира и работы роутеров без сложного технического жаргона
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по терминам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* СПЕЦИАЛЬНЫЕ ВЫДЕЛЕННЫЕ БЛОКИ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* БЛОК 1: ВПН */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Главное о ВПН (VPN):</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              При включенном ВПН скорость интернета <strong>ВСЕГДА ограничивается мощностью и каналом сервера VPN</strong>, а не провайдером. Замер скорости с включенным ВПН показывает только скорость туннеля шифрования.
            </p>
          </div>

          {/* БЛОК 2: ЗАМЕР ПО WI-FI */}
          <div className="bg-orange-950/20 border border-orange-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Почему замер по Wi-Fi недостоверен:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              2.4 ГГц физически редко дает больше 40–70 Мбит/с из-за стен, микроволновок и роутеров соседей. Чтобы замерить тарифную скорость договора — подключитесь кабелем Ethernet!
            </p>
          </div>
        </div>
      </div>

      {/* 2. СПИСОК ТЕРМИНОВ (АККОРДЕОН) */}
      <div className="space-y-3">
        {filteredTerms.map(item => {
          const isOpened = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpened ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setExpandedId(isOpened ? null : item.id)}
                className="w-full p-4 flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.term}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{item.simpleExplanation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                    {item.shortName}
                  </span>
                  {isOpened ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpened && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3 text-xs bg-slate-950/40">
                  {/* Простое объяснение */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-cyan-300 font-bold block mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Что это такое:</span>
                    </span>
                    <p className="text-slate-200 leading-relaxed">{item.simpleExplanation}</p>
                  </div>

                  {/* Аналогия */}
                  <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
                    <span className="text-amber-300 font-bold block mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Аналогия из жизни:</span>
                    </span>
                    <p className="text-amber-100/90 italic leading-relaxed">«{item.analogy}»</p>
                  </div>

                  {/* Норма */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                    <Target className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-400 font-bold block mb-0.5">Какая норма:</span>
                      <p className="text-slate-300">{item.idealRange}</p>
                    </div>
                  </div>

                  {/* Советы */}
                  {item.practicalTips.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                      <span className="font-bold text-slate-300 block mb-1.5">💡 Практические советы:</span>
                      <ul className="space-y-1 text-slate-300">
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
              )}
            </div>
          );
        })}
      </div>

      {/* Блок поддержки проекта / Донат на карту Сбербанка в конце справочника */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Heart className="w-5 h-5 fill-emerald-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">Поддержать развитие проекта</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Сбербанк
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                Если приложение помогло вам настроить Wi-Fi или решить проблему со связью, вы можете поддержать автора переводом любой суммы на карту Сбербанка.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="font-mono text-sm sm:text-base font-bold text-white bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>{SBER_CARD_FORMATTED}</span>
                </div>
                <button
                  onClick={handleCopyCard}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Скопировать номер</span>
                    </>
                  )}
                </button>
                {onOpenDonate && (
                  <button
                    onClick={onOpenDonate}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Подробнее
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
