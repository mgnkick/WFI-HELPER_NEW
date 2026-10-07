import { CurrentWifiMetrics, AccessPoint, PingResult, SpeedTestRun } from '../types/wifi';

export async function fetchPublicIp(): Promise<{ ip: string; isp?: string } | null> {
  try {
    const res = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      return { ip: data.ip };
    }
  } catch {
    // offline or blocked
  }
  return null;
}

export function generateSupportReport(
  wifi: CurrentWifiMetrics,
  pings: PingResult[],
  aps: AccessPoint[],
  speedRun?: SpeedTestRun
): { text: string; json: string } {
  const now = new Date().toLocaleString('ru-RU');

  const pingGateway = pings.find(p => p.name.includes('Шлюз') || p.target === wifi.gateway);
  const pingPublic = pings.find(p => p.target === '77.88.8.8') || pings[1];

  let verdict = 'Соединение стабильно (потери 1–2% в беспроводной сети передачи данных допустимы и не являются проблемой)';
  if (wifi.vpn.isActive) {
    verdict = 'АКТИВЕН ВПН! Скорость ограничена сервером VPN, а не провайдером.';
  } else if ((pingGateway?.lossPercent || 0) > 5) {
    verdict = 'Проблема в домашнем радиоэфире или роутере (систематические потери >5% до шлюза)';
  } else if ((pingPublic?.lossPercent || 0) > 5 && (pingGateway?.lossPercent || 0) <= 2) {
    verdict = 'Проблема на линии провайдера (потери на внешнем канале при чистом Wi-Fi шлюзе; 1–2% на шлюзе — норма беспроводной сети)';
  } else if (wifi.rssi < -75) {
    verdict = 'Слабый сигнал Wi-Fi (-' + Math.abs(wifi.rssi) + ' дБм). Препятствия на пути сигнала.';
  } else if (wifi.band === '2.4GHz' && wifi.coChannelApCount > 3) {
    verdict = 'Высокая зашумленность диапазона 2.4 ГГц соседями. Рекомендуется 5 ГГц.';
  }

  const lines = [
    '====================================================',
    '📊 ОТЧЕТ ДИАГНОСТИКИ СЕТИ ДЛЯ ТЕХПОДДЕРЖКИ ПРОВАЙДЕРА',
    '====================================================',
    `Дата и время: ${now}`,
    `Диагностический вердикт: ${verdict}`,
    '',
    '--- 1. СТАТУС VPN ---',
    `VPN статус: ${wifi.vpn.isActive ? '⚠️ ВКЛЮЧЕН' : '✅ ВЫКЛЮЧЕН'}`,
    wifi.vpn.isActive ? `Интерфейс: ${wifi.vpn.interfaceName || 'tun0'}` : '',
    wifi.vpn.isActive ? `Приложение/Протокол: ${wifi.vpn.vpnAppName || 'VPN Client'}` : '',
    wifi.vpn.isActive ? `Примечание: Скорость спидтеста ограничена сервером VPN!` : 'Примечание: Прямое подключение к провайдеру.',
    '',
    '--- 2. ПАРАМЕТРЫ ТЕКУЩЕГО WI-FI ---',
    `Имя сети (SSID): ${wifi.ssid}`,
    `MAC точки (BSSID): ${wifi.bssid}`,
    `Диапазон и канал: ${wifi.band}, Канал ${wifi.channel} (${wifi.frequency} МГц)`,
    `Ширина полосы: ${wifi.channelWidth}`,
    `Стандарт Wi-Fi: ${wifi.standard}`,
    `Мощность сигнала (RSSI): ${wifi.rssi} дБм (${wifi.signalPercent}%)`,
    `Скорость линка (Link Speed): Tx: ${wifi.linkSpeedTxMbps} Мбит/с / Rx: ${wifi.linkSpeedRxMbps} Мбит/с`,
    `Отношение сигнал/шум (SNR): ${wifi.snrDb} дБ`,
    `Соседних сетей на том же канале: ${wifi.coChannelApCount}`,
    '',
    '--- 3. СЕТЕВЫЕ НАСТРОЙКИ КЛИЕНТА (L3/DHCP) ---',
    `Локальный IP: ${wifi.ipAddress}`,
    `Шлюз (роутер): ${wifi.gateway}`,
    `Маска подсети: ${wifi.subnetMask}`,
    `DNS-серверы: ${wifi.dnsServers.join(', ')}`,
    `Внешний IP: ${wifi.externalIp || 'Определяется'} (${wifi.ispName || 'Провайдер'})`,
    '',
    '--- 4. ТЕСТ СТАБИЛЬНОСТИ И ЗАДЕРЖЕК (PING & JITTER) ---',
    'ℹ️ ПРАВИЛО РАДИОЭФИРА: Потери пакетов 1–2% в беспроводной сети передачи данных (Wi-Fi) являются нормальными и допустимыми из-за физики радиоволн (микропомехи, эфирные коллизии CSMA/CA, работа энергосбережения смартфона). Это не является неисправностью линии или роутера. Критичными считаются стабильные потери от 3–5% и выше.'
  ];

  for (const p of pings) {
    const isTolerableWirelessLoss = p.lossPercent > 0 && p.lossPercent <= 2;
    lines.push(
      `• [${p.name}] ${p.target}:`,
      `    Потери: ${p.lossPercent}% ${isTolerableWirelessLoss ? '(ДОПУСТИМО для Wi-Fi: 1–2% норма радиоэфира)' : ''} | Мин: ${p.minRtt} мс | Средн: ${p.avgRtt} мс | Макс: ${p.maxRtt} мс | Джиттер: ${p.jitter} мс`
    );
  }

  if (speedRun) {
    lines.push(
      '',
      '--- 5. ПОСЛЕДНИЙ ЗАМЕР СКОРОСТИ ---',
      `Входящая (Download): ${speedRun.downloadMbps.toFixed(1)} Мбит/с`,
      `Исходящая (Upload): ${speedRun.uploadMbps.toFixed(1)} Мбит/с`,
      `Пинг при замере: ${speedRun.pingMs.toFixed(1)} мс (Джиттер: ${speedRun.jitterMs.toFixed(1)} мс)`,
      `Источник замера: ${speedRun.source === 'yandex' ? 'Яндекс Интернетометр' : 'Встроенный тест скорости'}`,
      `VPN при замере: ${speedRun.vpnActive ? 'ВКЛЮЧЕН (скорость урезана VPN)' : 'ВЫКЛЮЧЕН'}`
    );
  }

  lines.push(
    '',
    '--- 6. ВИДИМЫЕ СОСЕДНИЕ ТОЧКИ ДОСТУПА В ЭФИРЕ ---',
    aps.slice(0, 8).map(a => `• ${a.ssid} (${a.bssid}) | Ch: ${a.channel} | RSSI: ${a.rssi} дБм | ${a.band}`).join('\n') || 'Нет данных',
    '',
    (() => {
      const counts = new Map<string, number>();
      for (const a of aps) {
        const k = a.ssid || 'Скрытая';
        counts.set(k, (counts.get(k) || 0) + 1);
      }
      const multi = Array.from(counts.entries()).filter(([_, c]) => c > 1);
      if (multi.length > 0) {
        return `* Обнаружены одноименные сети с несколькими устройствами (Mesh/Репитеры): ${multi.map(([s, c]) => `«${s}» (${c} устройства)`).join(', ')}`;
      }
      return '';
    })(),
    '',
    '====================================================',
    'Сформировано приложением «Wi-Fi Эксперт» для Android',
    '===================================================='
  );

  const cleanText = lines.filter(l => l !== '').join('\n');

  const reportObject = {
    generatedAt: now,
    verdict,
    vpn: wifi.vpn,
    wifi,
    pings,
    speedRun: speedRun || null,
    visibleAps: aps
  };

  return {
    text: cleanText,
    json: JSON.stringify(reportObject, null, 2)
  };
}
