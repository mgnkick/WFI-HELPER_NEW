import React from 'react';
import { Lightbulb, Radio, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';
import { buildRecommendations, score24GHz, score5GHz } from '../utils/channelAdvice';
import { SignalValue } from './SignalValue';

interface RecommendationsViewProps {
  wifi: CurrentWifiMetrics;
  visibleAps: AccessPoint[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ wifi, visibleAps }) => {
  const scores24 = score24GHz(visibleAps);
  const scores5 = score5GHz(visibleAps);
  const advice = buildRecommendations(wifi, visibleAps);
  const best24 = scores24[0];
  const best5 = scores5[0];

  const max24 = Math.max(1, ...scores24.map(s => s.score));
  const max5 = Math.max(1, ...scores5.map(s => s.score));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              Рекомендации WiFi-Helper
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              Свободные каналы и советы по эфиру
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Список строится по текущему скану сетей. Самый свободный канал — с наименьшей суммой помех (учитываются пересечения и сила соседних сигналов).
            </p>
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Сейчас: {wifi.ssid} · {wifi.band} · канал {wifi.channel} · сигнал{' '}
              <SignalValue rssi={wifi.rssi} percent={wifi.signalPercent} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-white">2.4 ГГц — самый свободный канал</h4>
          </div>
          <div className="text-4xl font-black text-cyan-300 font-mono">{best24.channel}</div>
          <p className="text-xs text-slate-400 mt-1">
            {best24.frequency} МГц · пересечений: {best24.apCount}
          </p>
          <div className="mt-4 space-y-2">
            {scores24.map(s => (
              <div key={s.channel}>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span className={s.channel === best24.channel ? 'text-cyan-300 font-bold' : ''}>
                    Канал {s.channel}
                  </span>
                  <span>{s.apCount} сетей</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.channel === best24.channel ? 'bg-emerald-400' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(8, (s.score / max24) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white">5 ГГц — самый свободный канал</h4>
          </div>
          <div className="text-4xl font-black text-emerald-300 font-mono">{best5.channel}</div>
          <p className="text-xs text-slate-400 mt-1">
            {best5.frequency} МГц · пересечений: {best5.apCount}
          </p>
          <div className="mt-4 space-y-2">
            {scores5.map(s => (
              <div key={s.channel}>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span className={s.channel === best5.channel ? 'text-emerald-300 font-bold' : ''}>
                    Канал {s.channel}
                  </span>
                  <span>{s.apCount} сетей</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.channel === best5.channel ? 'bg-emerald-400' : 'bg-slate-500'}`}
                    style={{ width: `${Math.max(8, (s.score / max5) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white">Все рекомендации</h4>
        {advice.map(item => (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 ${
              item.priority === 'high'
                ? 'bg-amber-950/30 border-amber-500/40'
                : item.priority === 'medium'
                  ? 'bg-slate-900 border-cyan-500/20'
                  : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start gap-2">
              {item.priority === 'high' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h5 className="text-sm font-bold text-white">{item.title}</h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
