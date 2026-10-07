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
  Heart,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { TERMS_KNOWLEDGE } from '../data/termsKnowledge';
import { SBER_CARD_NUMBER, SBER_CARD_FORMATTED } from './DonateModal';
import { useTheme } from '../context/ThemeContext';

interface KnowledgeBaseViewProps {
  onSelectTermModal?: (termId: string) => void;
  onOpenDonate?: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onOpenDonate
}) => {
  const { isDark, cardBg, cardSubtle, inputClass, btnOutlineSm, btnActive } = useTheme();
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
      <div className={`${cardBg} rounded-3xl p-6 transition-colors`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Обучающий справочник для абонента
              </h3>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Простые и понятные объяснения терминов сети, радиоэфира и работы роутеров без сложного технического жаргона
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по терминам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs ${inputClass}`}
            />
          </div>
        </div>

        {/* СПЕЦИАЛЬНЫЕ ВЫДЕЛЕННЫЕ БЛОКИ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* БЛОК 1: ВПН */}
          <div className={`rounded-2xl p-4 border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-300'}`}>
            <div className="flex items-center gap-2 font-bold text-sm mb-1.5 text-amber-500">
              <ShieldAlert className="w-4 h-4" />
              <span>Главное о ВПН (VPN):</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              При включенном ВПН скорость интернета <strong>ВСЕГДА ограничивается мощностью и каналом сервера VPN</strong>, а не провайдером. Замер скорости с включенным ВПН показывает только скорость туннеля шифрования.
            </p>
          </div>

          {/* БЛОК 2: ЗАМЕР ПО WI-FI */}
          <div className={`rounded-2xl p-4 border ${isDark ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}>
            <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className={isDark ? 'text-white' : 'text-zinc-900'}>Почему замер по Wi-Fi недостоверен:</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
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
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpened
                  ? isDark
                    ? 'border-white bg-zinc-900 shadow-md'
                    : 'border-zinc-900 bg-white shadow-md'
                  : `${cardBg} hover:border-zinc-500`
              }`}
            >
              <button
                onClick={() => setExpandedId(isOpened ? null : item.id)}
                className="w-full p-4 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-white' : 'bg-zinc-900'}`} />
                  <div>
                    <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.term}</h4>
                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.simpleExplanation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-mono border px-2 py-0.5 rounded ${
                    isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                  }`}>
                    {item.shortName}
                  </span>
                  {isOpened ? (
                    <ChevronUp className="w-4 h-4 opacity-70" />
                  ) : (
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  )}
                </div>
              </button>

              {isOpened && (
                <div className={`px-5 pb-5 pt-2 border-t space-y-3 text-xs ${
                  isDark ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50'
                }`}>
                  {/* Простое объяснение */}
                  <div className={`p-3 rounded-xl border ${cardSubtle}`}>
                    <span className="font-bold block mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Что это такое:</span>
                    </span>
                    <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.simpleExplanation}</p>
                  </div>

                  {/* Аналогия */}
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
                    <span className="font-bold block mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Аналогия из жизни:</span>
                    </span>
                    <p className="italic leading-relaxed">«{item.analogy}»</p>
                  </div>

                  {/* Норма */}
                  <div className={`p-3 rounded-xl border flex items-start gap-2 ${cardSubtle}`}>
                    <Target className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5 text-emerald-500">Какая норма:</span>
                      <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{item.idealRange}</p>
                    </div>
                  </div>

                  {/* Советы */}
                  {item.practicalTips.length > 0 && (
                    <div className={`p-3 rounded-xl border ${cardSubtle}`}>
                      <span className="font-bold block mb-1.5">💡 Практические советы:</span>
                      <ul className="space-y-1">
                        {item.practicalTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{tip}</span>
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
      <div className={`${cardBg} rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isDark ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-900 border-zinc-900 text-white'
            }`}>
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>Поддержать развитие проекта</h4>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                }`}>
                  Сбербанк
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed max-w-xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Если приложение помогло вам настроить Wi-Fi или решить проблему со связью, вы можете поддержать автора переводом любой суммы на карту Сбербанка.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className={`font-mono text-sm sm:text-base font-bold px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                  isDark ? 'bg-zinc-950 border-white text-white' : 'bg-zinc-50 border-zinc-900 text-zinc-900'
                }`}>
                  <CreditCard className="w-4 h-4" />
                  <span>{SBER_CARD_FORMATTED}</span>
                </div>
                <button
                  onClick={handleCopyCard}
                  className={btnActive}
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
                    className={btnOutlineSm}
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
