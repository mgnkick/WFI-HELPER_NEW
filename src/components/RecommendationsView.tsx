import React from 'react';
import { Lightbulb, Radio, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';
import { buildRecommendations, score24GHz, score5GHz } from '../utils/channelAdvice';
import { SignalValue } from './SignalValue';
import { useTheme } from '../context/ThemeContext';

interface RecommendationsViewProps {
  wifi: CurrentWifiMetrics;
  visibleAps: AccessPoint[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ wifi, visibleAps }) => {
  const { isDark, cardBg, cardSubtle } = useTheme();

  const scores24 = score24GHz(visibleAps);
  const scores5 = score5GHz(visibleAps);
  const advice = buildRecommendations(wifi, visibleAps);
  const best24 = scores24[0];
  const best5 = scores5[0];

  const max24 = Math.max(1, ...scores24.map(s => s.score));
  const max5 = Math.max(1, ...scores5.map(s => s.score));

  return (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-3xl p-6 transition-colors`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-900 border-zinc-900 text-white'
          }`}>
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Рекомендации WiFi-Helper
            </span>
            <h3 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Свободные каналы и советы по эфиру
            </h3>
            <p className={`text-xs mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Список строится по текущему скану сетей. Самый свободный канал — с наименьшей суммой помех (учитываются пересечения и сила соседних сигналов).
            </p>
            <div className={`text-xs mt-2 font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Сейчас: {wifi.ssid} · {wifi.band} · канал {wifi.channel} · сигнал{' '}
              <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3 sm:gap-4">
        {/* 2.4 GHz Card */}
        <div className={`${cardBg} rounded-3xl p-5 border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-5 h-5" />
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>2.4 ГГц — самый свободный канал</h4>
          </div>
          <div className={`text-4xl font-black font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{best24.channel}</div>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {best24.frequency} МГц · пересечений: {best24.apCount}
          </p>
          <div className="mt-4 space-y-2">
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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>5 ГГц — самый свободный канал</h4>
          </div>
          <div className={`text-4xl font-black font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{best5.channel}</div>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {best5.frequency} МГц · пересечений: {best5.apCount}
          </p>
          <div className="mt-4 space-y-2">
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

      <div className="space-y-3">
        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Все рекомендации</h4>
        {advice.map(item => (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 ${
              item.priority === 'high'
                ? isDark
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-amber-50 border-amber-300'
                : cardSubtle
            }`}
          >
            <div className="flex items-start gap-2.5">
              {item.priority === 'high' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
              )}
              <div>
                <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.title}</h5>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
