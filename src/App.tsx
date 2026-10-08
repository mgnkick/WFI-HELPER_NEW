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
import { DonateModal } from './components/DonateModal';
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
import { ThemeProvider, useTheme } from './context/ThemeContext';

function withTransportDefaults(wifi: CurrentWifiMetrics): CurrentWifiMetrics {
  return {
    ...wifi,
    wifiConnected: wifi.wifiConnected !== false,
    usingMobileInternet: wifi.usingMobileInternet === true
  };
}

function MainApp() {
  const { isDark } = useTheme();
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
  const [isDonateOpen, setIsDonateOpen] = useState(false);
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

  const handleOpenWifiSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await WifiHelper.openWifiSettings();
      } catch (e) {
        console.warn('Не удалось открыть настройки Wi-Fi', e);
      }
    } else {
      // Веб-окружение: сообщаем о необходимости подключиться к Wi-Fi в настройках устройства
      window.alert('Устройство не подключено к Wi‑Fi. Откройте системные настройки устройства (Wi‑Fi) и выберите вашу домашнюю беспроводную сеть.');
    }
  };

  const handleSaveSpeedRun = (run: SpeedTestRun) => {
    // Сохраняем до 15 замеров в истории
    setSpeedHistory(prev => [run, ...prev].slice(0, 15));
  };

  const handleClearHistory = () => {
    setSpeedHistory([]);
  };

  // Слушатель сообщений от встроенного фрейма Яндекс Интернетометра
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'SAVE_SPEED_TO_HISTORY' || e.data.type === 'SPEED_RESULT') {
        const { download, upload, ping } = e.data;
        if (typeof download === 'number' && download > 0) {
          const run: SpeedTestRun = {
            id: 'run-' + Date.now(),
            timestamp: new Date().toISOString(),
            downloadMbps: Number(download.toFixed(1)),
            uploadMbps: typeof upload === 'number' ? Number(upload.toFixed(1)) : Number((download * 0.85).toFixed(1)),
            pingMs: typeof ping === 'number' ? Number(ping.toFixed(1)) : 12,
            jitterMs: Number(((ping || 12) * 0.2).toFixed(1)),
            lossPercent: 0,
            source: 'yandex',
            ispName: wifiMetrics.ispName || 'Провайдер',
            serverLocation: 'Яндекс Интернетометр',
            externalIp: wifiMetrics.externalIp || wifiMetrics.ipAddress,
            wifiSsid: wifiMetrics.ssid,
            wifiBssid: wifiMetrics.bssid,
            wifiBand: wifiMetrics.band,
            wifiRssi: wifiMetrics.rssi,
            vpnActive: wifiMetrics.vpn?.isActive || false,
            vpnName: wifiMetrics.vpn?.interfaceName,
            note: 'Замер из встроенного Яндекс Интернетометра'
          };
          if (e.data.type === 'SAVE_SPEED_TO_HISTORY') {
            handleSaveSpeedRun(run);
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [wifiMetrics]);

  return (
    <div className={`min-h-dvh flex flex-col font-sans transition-colors w-full overflow-x-hidden ${
      isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
    }`}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentWifi={wifiMetrics}
        onOpenDonate={() => setIsDonateOpen(true)}
        onOpenWifiSettings={handleOpenWifiSettings}
      />

      <main className="flex-1 max-w-[540px] sm:max-w-[560px] w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 transition-all">
        {/* Предупреждение о включенном в системе VPN (появляется только если VPN активен) */}
        {wifiMetrics.vpn.isActive && (
          <div className="mb-4 sm:mb-5">
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
            onOpenWifiSettings={handleOpenWifiSettings}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            wifi={wifiMetrics}
            visibleAps={visibleAps}
            onOpenWifiSettings={handleOpenWifiSettings}
          />
        )}

        {activeTab === 'report' && (
          <SupportReportView
            wifi={wifiMetrics}
            visibleAps={visibleAps}
            pings={pings}
            lastSpeedRun={speedHistory[0]}
            onOpenTerm={setActiveModalTermId}
            onOpenWifiSettings={handleOpenWifiSettings}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView
            onSelectTermModal={setActiveModalTermId}
            onOpenDonate={() => setIsDonateOpen(true)}
          />
        )}
      </main>

      <TermExplainerModal
        termId={activeModalTermId}
        onClose={() => setActiveModalTermId(null)}
      />

      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      <footer className={`border-t py-4 px-4 text-center text-xs transition-colors ${
        isDark ? 'border-zinc-800 bg-zinc-900/90 text-zinc-400' : 'border-zinc-200 bg-white/90 text-zinc-600'
      }`}>
        <div className="max-w-[540px] sm:max-w-[560px] mx-auto flex flex-col items-center justify-between gap-2.5">
          <span>Wi-Fi Эксперт • Диагностика и анализатор Wi‑Fi</span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className={`font-mono text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Книжная ориентация интерфейса
            </span>
            <button
              onClick={() => setIsDonateOpen(true)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                isDark
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900/10'
              }`}
            >
              <span>♥ Поддержать проект</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
