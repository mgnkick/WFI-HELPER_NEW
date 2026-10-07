import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Header,
  ActiveTab
} from './components/Header';
import { SpeedtestDashboard } from './components/SpeedtestDashboard';
import { WifiAnalyzerView } from './components/WifiAnalyzerView';
import { SupportReportView } from './components/SupportReportView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { RecommendationsView } from './components/RecommendationsView';
import { TermExplainerModal } from './components/TermExplainerModal';
import { VpnBanner } from './components/VpnBanner';
import { SCENARIO_PROFILES } from './data/mockScenarios';
import { CurrentWifiMetrics, AccessPoint, PingResult, SpeedTestRun } from './types/wifi';
import { Capacitor } from '@capacitor/core';
import { fetchPublicIp } from './services/networkTester';
import { WifiHelper } from './plugins/wifiHelper';
import {
  fetchNativeWifiSnapshot,
  jitterAccessPoints,
  jitterCurrentWifi,
  mergeNativeIntoWifi
} from './services/wifiScan';

function withTransportDefaults(wifi: CurrentWifiMetrics): CurrentWifiMetrics {
  return {
    ...wifi,
    wifiConnected: wifi.wifiConnected !== false,
    usingMobileInternet: wifi.usingMobileInternet === true
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const selectedScenarioId = 'clean_5g_novpn';

  const currentScenario =
    SCENARIO_PROFILES.find(s => s.id === selectedScenarioId) || SCENARIO_PROFILES[0];

  const [wifiMetrics, setWifiMetrics] = useState<CurrentWifiMetrics>(
    withTransportDefaults(currentScenario.wifi)
  );
  const [visibleAps, setVisibleAps] = useState<AccessPoint[]>(currentScenario.visibleAps);
  const [pings, setPings] = useState<PingResult[]>(currentScenario.pings);
  // Изначально история замеров абсолютно чистая (пустая)
  const [speedHistory, setSpeedHistory] = useState<SpeedTestRun[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeModalTermId, setActiveModalTermId] = useState<string | null>(null);
  const scenarioRef = useRef(currentScenario);
  scenarioRef.current = currentScenario;

  const refreshNetworks = useCallback(async () => {
    const snap = await fetchNativeWifiSnapshot();
    if (snap) {
      setVisibleAps(snap.accessPoints);
      setWifiMetrics(prev =>
        mergeNativeIntoWifi(
          prev,
          snap.current,
          snap.wifiConnected,
          snap.usingMobileInternet,
          snap.accessPoints,
          snap.vpnActive,
          snap.vpnInterfaceName
        )
      );
      setLastUpdated(new Date());
      return;
    }

    const baseAps = scenarioRef.current.visibleAps;
    const jittered = jitterAccessPoints(baseAps);
    setVisibleAps(jittered);
    setWifiMetrics(prev => jitterCurrentWifi(withTransportDefaults(prev), jittered));
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    setPings(currentScenario.pings);
    if (!Capacitor.isNativePlatform()) {
      setWifiMetrics(withTransportDefaults(currentScenario.wifi));
      setVisibleAps(currentScenario.visibleAps);
    }
    void refreshNetworks();
  }, [currentScenario, refreshNetworks]);

  // Фоновое автоматическое обновление сетей раз в 6 секунд
  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshNetworks();
    }, 6000);
    return () => window.clearInterval(id);
  }, [refreshNetworks]);

  useEffect(() => {
    fetchPublicIp().then(res => {
      if (res && res.ip) {
        setWifiMetrics(prev => ({
          ...prev,
          externalIp: res.ip
        }));
      }
    });
  }, []);

  const handleOpenVpnSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await WifiHelper.openVpnSettings();
      } catch (e) {
        console.warn('Не удалось открыть настройки VPN', e);
      }
    } else {
      window.alert('В вашей системе обнаружен активный VPN! Откройте сетевые настройки вашей операционной системы или клиент VPN и выключите соединение для честного замера скорости.');
    }
  };

  const handleSaveSpeedRun = (run: SpeedTestRun) => {
    // Сохраняем до 15 замеров в истории
    setSpeedHistory(prev => [run, ...prev].slice(0, 15));
  };

  const handleClearHistory = () => {
    setSpeedHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentWifi={wifiMetrics}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Предупреждение о включенном в системе VPN (появляется только если VPN активен) */}
        {wifiMetrics.vpn.isActive && (
          <div className="mb-6">
            <VpnBanner vpn={wifiMetrics.vpn} onOpenSettings={handleOpenVpnSettings} />
          </div>
        )}

        {/* Вкладка замера скорости сохраняется в DOM, чтобы замер не прерывался при переключении */}
        <div className={activeTab === 'speedtest' || activeTab === 'yandex' ? 'block' : 'hidden'}>
          <SpeedtestDashboard
            wifi={wifiMetrics}
            history={speedHistory}
            onOpenTerm={setActiveModalTermId}
            onSaveSpeedRun={handleSaveSpeedRun}
            onClearHistory={handleClearHistory}
            onOpenVpnSettings={handleOpenVpnSettings}
          />
        </div>

        {activeTab === 'analyzer' && (
          <WifiAnalyzerView
            wifi={wifiMetrics}
            visibleAps={visibleAps}
            onOpenTerm={setActiveModalTermId}
            lastUpdated={lastUpdated}
            onRefresh={refreshNetworks}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView wifi={wifiMetrics} visibleAps={visibleAps} />
        )}

        {activeTab === 'report' && (
          <SupportReportView
            wifi={wifiMetrics}
            visibleAps={visibleAps}
            pings={pings}
            lastSpeedRun={speedHistory[0]}
            onOpenTerm={setActiveModalTermId}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView onSelectTermModal={setActiveModalTermId} />
        )}
      </main>

      <TermExplainerModal
        termId={activeModalTermId}
        onClose={() => setActiveModalTermId(null)}
      />

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Wi-Fi Эксперт • Диагностика и анализатор Wi‑Fi</span>
          <span className="font-mono text-[11px] text-slate-400">
            Фоновое автообновление сетей каждые 6 сек
          </span>
        </div>
      </footer>
    </div>
  );
}
