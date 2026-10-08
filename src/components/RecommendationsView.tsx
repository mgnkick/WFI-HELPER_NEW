import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Lightbulb,
  Radio,
  Sparkles,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Router,
  Layers,
  Dices,
  RefreshCw,
  WifiOff,
  Settings
} from 'lucide-react';
import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';
import { buildRecommendations, score24GHz, score5GHz, AdviceItem } from '../utils/channelAdvice';
import { SignalValue } from './SignalValue';
import { useTheme } from '../context/ThemeContext';

interface RecommendationsViewProps {
  wifi: CurrentWifiMetrics;
  visibleAps: AccessPoint[];
  onOpenWifiSettings?: () => void;
}

// Перемешивание массива (алгоритм Фишера — Йетса)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ wifi, visibleAps, onOpenWifiSettings }) => {
  const { isDark, cardBg, cardSubtle, btnOutlineSm } = useTheme();

  const [activeCategory, setActiveCategory] = useState<'all' | 'hardware' | 'wifi' | 'cellular'>('all');
  const [showAllAdvice, setShowAllAdvice] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const scores24 = useMemo(() => score24GHz(visibleAps), [visibleAps]);
  const scores5 = useMemo(() => score5GHz(visibleAps), [visibleAps]);
  const allAdvice = useMemo(() => buildRecommendations(wifi, visibleAps), [wifi, visibleAps]);

  const best24 = scores24[0];
  const best5 = scores5[0];

  const max24 = Math.max(1, ...scores24.map(s => s.score));
  const max5 = Math.max(1, ...scores5.map(s => s.score));

  // Фильтрация пула по выбранной категории
  const categoryPool = useMemo(() => {
    if (activeCategory === 'all') return allAdvice;
    if (activeCategory === 'hardware') return allAdvice.filter(a => a.category === 'hardware');
    if (activeCategory === 'wifi') return allAdvice.filter(a => a.category === 'wifi' || !a.category);
    if (activeCategory === 'cellular') return allAdvice.filter(a => a.category === 'cellular');
    return allAdvice;
  }, [allAdvice, activeCategory]);

  // Статично зафиксированный перемешанный список для текущей сессии просмотра.
  // Советы НЕ должны переключаться сами по себе каждые 6 сек при фоновом обновлении RSSI!
  const [shuffledList, setShuffledList] = useState<AdviceItem[]>(() => shuffleArray(categoryPool));

  // Отслеживаем категорию: перемешиваем ТОЛЬКО если пользователь лично сменил категорию
  const prevCategoryRef = useRef(activeCategory);
  useEffect(() => {
    if (prevCategoryRef.current !== activeCategory) {
      prevCategoryRef.current = activeCategory;
      setShuffledList(shuffleArray(categoryPool));
      setCurrentPage(0);
    }
  }, [activeCategory, categoryPool]);

  // Ручное перемешивание по кнопке с анимацией кубика
  const handleShuffle = () => {
    setIsRotating(true);
    setShuffledList(shuffleArray(categoryPool));
    setCurrentPage(0);
    setTimeout(() => setIsRotating(false), 500);
  };

  const pageSize = 3;
  const totalPages = Math.ceil(shuffledList.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages - 1);

  // Отображаем ровно 3 случайных совета на единицу времени (или все при разворачивании)
  const displayedAdvice = showAllAdvice
    ? shuffledList
    : shuffledList.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleCategoryChange = (cat: 'all' | 'hardware' | 'wifi' | 'cellular') => {
    setActiveCategory(cat);
  };

  return (
    <div className="space-y-6">
      {/* Шапка рекомендаций */}
      <div className={`${cardBg} rounded-3xl p-5 sm:p-6 transition-colors`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-900 border-zinc-900 text-white'
          }`}>
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Экспертные рекомендации
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                3 совета статично
              </span>
            </div>
            <h3 className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Свободные каналы и практические советы
            </h3>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              При входе отображаются 3 случайные рекомендации. Они остаются на экране до тех пор, пока вы сами не нажмете «Другие 3 совета» или не перейдете на вкладку снова.
            </p>
            <div className={`text-xs mt-2 font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {wifi.wifiConnected ? (
                <>
                  Сейчас: {wifi.ssid} · {wifi.band} · канал {wifi.channel} · сигнал{' '}
                  <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
                </>
              ) : (
                <span className="text-amber-500 font-bold">
                  Сейчас: Wi‑Fi не подключен · {wifi.usingMobileInternet ? 'Активна мобильная связь' : 'Беспроводная сеть выключена'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Уведомление, если Wi-Fi не подключен */}
      {!wifi.wifiConnected && (
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
        }`}>
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm block">Wi‑Fi не подключен</strong>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                Ниже представлены практические советы по роутерам, Mesh и радиоэфиру. Подключитесь к Wi‑Fi для индивидуального подбора свободного канала для вашего дома.
              </p>
            </div>
          </div>
          {onOpenWifiSettings && (
            <button
              onClick={onOpenWifiSettings}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Подключиться к Wi‑Fi</span>
            </button>
          )}
        </div>
      )}

      {/* Карточки свободных каналов 2.4 ГГц и 5 ГГц */}
      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3 sm:gap-4">
        {/* 2.4 GHz Card */}
        <div className={`${cardBg} rounded-3xl p-5 border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5" />
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>2.4 ГГц — свободный канал</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{best24.channel}</span>
            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {best24.frequency} МГц · пересечений: {best24.apCount}
            </span>
          </div>
          <div className="mt-3.5 space-y-2">
            {scores24.map(s => (
              <div key={s.channel}>
                <div className={`flex justify-between text-[11px] font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <span className={s.channel === best24.channel ? `font-bold ${isDark ? 'text-white' : 'text-zinc-900'}` : ''}>
                    Канал {s.channel}
                  </span>
                  <span>{s.apCount} сетей</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div
                    className={`h-full ${s.channel === best24.channel ? (isDark ? 'bg-white' : 'bg-zinc-900') : (isDark ? 'bg-zinc-600' : 'bg-zinc-400')}`}
                    style={{ width: `${Math.max(8, (s.score / max24) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 GHz Card */}
        <div className={`${cardBg} rounded-3xl p-5 border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>5 ГГц — свободный канал</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{best5.channel}</span>
            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {best5.frequency} МГц · пересечений: {best5.apCount}
            </span>
          </div>
          <div className="mt-3.5 space-y-2">
            {scores5.map(s => (
              <div key={s.channel}>
                <div className={`flex justify-between text-[11px] font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <span className={s.channel === best5.channel ? `font-bold ${isDark ? 'text-white' : 'text-zinc-900'}` : ''}>
                    Канал {s.channel}
                  </span>
                  <span>{s.apCount} сетей</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div
                    className={`h-full ${s.channel === best5.channel ? (isDark ? 'bg-white' : 'bg-zinc-900') : (isDark ? 'bg-zinc-600' : 'bg-zinc-400')}`}
                    style={{ width: `${Math.max(8, (s.score / max5) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Блок практических рекомендаций: по 3 штуки со случайным чередованием */}
      <div className="space-y-4">
        {/* Панель фильтров категорий и кнопка перемешивания: горизонтальная прокрутка в стороны */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3 border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto pb-1.5 sm:pb-0 scroll-menu-x w-full sm:w-auto">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeCategory === 'all'
                  ? isDark
                    ? 'bg-white text-zinc-950 border-white font-bold shadow-sm'
                    : 'bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm'
                  : isDark
                    ? 'border-zinc-800 text-zinc-400 hover:text-white'
                    : 'border-zinc-300 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Все ({allAdvice.length})</span>
            </button>

            <button
              onClick={() => handleCategoryChange('hardware')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeCategory === 'hardware'
                  ? isDark
                    ? 'bg-white text-zinc-950 border-white font-bold shadow-sm'
                    : 'bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm'
                  : isDark
                    ? 'border-zinc-800 text-zinc-400 hover:text-white'
                    : 'border-zinc-300 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Router className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Оборудование и Mesh ({allAdvice.filter(a => a.category === 'hardware').length})</span>
            </button>

            <button
              onClick={() => handleCategoryChange('wifi')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeCategory === 'wifi'
                  ? isDark
                    ? 'bg-white text-zinc-950 border-white font-bold shadow-sm'
                    : 'bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm'
                  : isDark
                    ? 'border-zinc-800 text-zinc-400 hover:text-white'
                    : 'border-zinc-300 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Wi‑Fi радио ({allAdvice.filter(a => a.category === 'wifi' || !a.category).length})</span>
            </button>

            <button
              onClick={() => handleCategoryChange('cellular')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeCategory === 'cellular'
                  ? isDark
                    ? 'bg-white text-zinc-950 border-white font-bold shadow-sm'
                    : 'bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm'
                  : isDark
                    ? 'border-zinc-800 text-zinc-400 hover:text-white'
                    : 'border-zinc-300 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>4G/5G и связь ({allAdvice.filter(a => a.category === 'cellular').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scroll-menu-x flex-shrink-0">
            {/* Кнопка "Перемешать (другие 3)" */}
            <button
              onClick={handleShuffle}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 ${
                isDark
                  ? 'border-zinc-700 bg-zinc-800/80 text-white hover:bg-zinc-700'
                  : 'border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
              }`}
              title="Перемешать и показать другие 3 случайные рекомендации"
            >
              <Dices className={`w-3.5 h-3.5 flex-shrink-0 ${isRotating ? 'animate-spin text-amber-500' : ''}`} />
              <span>Другие 3 совета</span>
            </button>

            {/* Кнопка переключения: Показать все / Свернуть (по 3) */}
            <button
              onClick={() => setShowAllAdvice(!showAllAdvice)}
              className={`${btnOutlineSm} text-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0`}
            >
              {showAllAdvice ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Свернуть (по 3)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Все советы ({categoryPool.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Список подсказок (3 случайные на единицу времени или все при разворачивании) */}
        <div className="space-y-3">
          {displayedAdvice.map(item => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-md ${
                item.priority === 'high'
                  ? isDark
                    ? 'bg-amber-950/25 border-amber-500/40'
                    : 'bg-amber-50/80 border-amber-300'
                  : cardSubtle
              }`}
            >
              <div className="flex items-start gap-2.5">
                {item.priority === 'high' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`} />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.title}</h5>
                    <div className="flex items-center gap-1.5">
                      {item.tag && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
                          isDark
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                      {item.priority === 'high' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 border border-amber-500/40">
                          Важно
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {item.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Панель пагинации (когда отображаются по 3 штуки) */}
        {!showAllAdvice && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 px-1 text-xs">
            <span className={`font-mono text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Показано {displayedAdvice.length} из {categoryPool.length} • Набор {safePage + 1} из {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={safePage === 0}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  safePage === 0
                    ? 'opacity-30 cursor-not-allowed border-zinc-800'
                    : isDark
                      ? 'border-white text-white hover:bg-white/10'
                      : 'border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
                }`}
                title="Предыдущие 3 совета"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Точки-индикаторы наборов */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(8, totalPages) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === safePage
                        ? isDark ? 'bg-white w-4' : 'bg-zinc-900 w-4'
                        : isDark ? 'bg-zinc-700 w-2' : 'bg-zinc-300 w-2'
                    }`}
                    title={`Набор советов ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={safePage >= totalPages - 1}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  safePage >= totalPages - 1
                    ? 'opacity-30 cursor-not-allowed border-zinc-800'
                    : isDark
                      ? 'border-white text-white hover:bg-white/10'
                      : 'border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
                }`}
                title="Следующие 3 совета"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
