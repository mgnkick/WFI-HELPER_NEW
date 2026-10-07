import { CurrentWifiMetrics, AccessPoint, PingResult, SpeedTestRun } from '../types/wifi';

export interface ScenarioProfile {
  id: string;
  name: string;
  badge: 'excellent' | 'warning' | 'critical';
  shortDesc: string;
  wifi: CurrentWifiMetrics;
  visibleAps: AccessPoint[];
  pings: PingResult[];
  recommendedAdvice: {
    verdict: string;
    speedSteps: string[];
    stabilitySteps: string[];
  };
}

export const SCENARIO_PROFILES: ScenarioProfile[] = [
  {
    id: 'clean_5g_novpn',
    name: '5 ГГц Wi-Fi 6 (Чистый эфир, без VPN)',
    badge: 'excellent',
    shortDesc: 'Идеальные условия: 5 ГГц, ширина 80 МГц, задержка 1-2 мс до роутера, VPN выключен.',
    wifi: {
      ssid: 'Keenetic_Ultra_5G',
      bssid: '50:FF:20:AA:12:44',
      rssi: -48,
      signalPercent: 96,
      frequency: 5180,
      channel: 36,
      band: '5GHz',
      channelWidth: '80MHz',
      standard: '802.11ax',
      linkSpeedTxMbps: 1201,
      linkSpeedRxMbps: 1201,
      noiseEstimateDbm: -95,
      snrDb: 47,
      coChannelApCount: 0,
      ipAddress: '192.168.1.105',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.1', '77.88.8.8'],
      externalIp: '178.62.204.18',
      ispName: 'ПАО Ростелеком',
      vpn: {
        isActive: false,
        warningNote: 'VPN выключен. Трафик идет напрямую к вашему провайдеру без посредников.'
      }
    },
    visibleAps: [
      {
        bssid: '50:FF:20:AA:12:44',
        ssid: 'Keenetic_Ultra_5G',
        rssi: -48,
        frequency: 5180,
        channel: 36,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: true,
        security: 'WPA3-SAE'
      },
      {
        bssid: '50:FF:20:AA:12:55',
        ssid: 'Keenetic_Ultra_5G',
        rssi: -65,
        frequency: 5220,
        channel: 44,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA3-SAE'
      },
      {
        bssid: '50:FF:20:AA:12:43',
        ssid: 'Keenetic_Ultra_5G',
        rssi: -52,
        frequency: 2437,
        channel: 6,
        band: '2.4GHz',
        channelWidth: '40MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA3-SAE'
      },
      {
        bssid: 'E4:18:6B:78:90:12',
        ssid: 'Neighbor_5G_Home',
        rssi: -82,
        frequency: 5260,
        channel: 52,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ac',
        isCurrent: false,
        security: 'WPA2-PSK'
      },
      {
        bssid: '9C:A2:F4:11:22:33',
        ssid: 'TP-Link_Deco_Mesh',
        rssi: -79,
        frequency: 5180,
        channel: 36,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA2/WPA3'
      },
      {
        bssid: '9C:A2:F4:11:22:44',
        ssid: 'TP-Link_Deco_Mesh',
        rssi: -85,
        frequency: 5240,
        channel: 48,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA2/WPA3'
      }
    ],
    pings: [
      {
        target: '192.168.1.1',
        name: 'Шлюз (Домашний роутер)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 1.2,
        avgRtt: 1.7,
        maxRtt: 2.9,
        jitter: 0.4,
        status: 'excellent',
        statusNote: 'Шлюз отвечает мгновенно'
      },
      {
        target: '77.88.8.8',
        name: 'Яндекс DNS (РФ)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 6.8,
        avgRtt: 8.2,
        maxRtt: 10.4,
        jitter: 0.8,
        status: 'excellent',
        statusNote: 'Отличный магистральный пинг'
      },
      {
        target: '8.8.8.8',
        name: 'Google DNS (Глобальный)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 18.0,
        avgRtt: 20.4,
        maxRtt: 24.2,
        jitter: 1.1,
        status: 'excellent',
        statusNote: 'Стабильный отклик'
      }
    ],
    recommendedAdvice: {
      verdict: 'Все компоненты сети работают идеально. Узких мест не обнаружено.',
      speedSteps: ['Сеть уже настроена на максимальную скорость.'],
      stabilitySteps: ['Рекомендуется зафиксировать этот канал в настройках роутера.']
    }
  },
  {
    id: 'vpn_active_drop',
    name: 'ВКЛЮЧЕН ВПН (VPN Active: tun0 / WireGuard)',
    badge: 'warning',
    shortDesc: 'ВПН активен! Скорость ограничена сервером VPN (Амстердам), пинг вырос до 95 мс. Провайдер ни при чем.',
    wifi: {
      ssid: 'Keenetic_Ultra_5G',
      bssid: '50:FF:20:AA:12:44',
      rssi: -52,
      signalPercent: 92,
      frequency: 5180,
      channel: 36,
      band: '5GHz',
      channelWidth: '80MHz',
      standard: '802.11ax',
      linkSpeedTxMbps: 1201,
      linkSpeedRxMbps: 1201,
      noiseEstimateDbm: -95,
      snrDb: 43,
      coChannelApCount: 0,
      ipAddress: '10.14.0.2',
      subnetMask: '255.255.255.255',
      gateway: '192.168.1.1',
      dnsServers: ['10.14.0.1'],
      externalIp: '185.220.101.5',
      ispName: 'Mullvad / Datacenter NL',
      vpn: {
        isActive: true,
        interfaceName: 'tun0 (WireGuard Protocol)',
        vpnAppName: 'WireGuard / VPN Client',
        serverLocation: 'Амстердам (Нидерланды)',
        detectedIp: '185.220.101.5',
        warningNote: 'ВНИМАНИЕ: Включен ВПН! Скорость и задержка ограничены удаленным сервером шифрования и блокировками протокола, а НЕ вашим тарифом интернет-провайдера!'
      }
    },
    visibleAps: [
      {
        bssid: '50:FF:20:AA:12:44',
        ssid: 'Keenetic_Ultra_5G',
        rssi: -52,
        frequency: 5180,
        channel: 36,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: true,
        security: 'WPA3-SAE'
      }
    ],
    pings: [
      {
        target: '192.168.1.1',
        name: 'Шлюз (Домашний роутер)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 1.4,
        avgRtt: 1.9,
        maxRtt: 3.1,
        jitter: 0.5,
        status: 'excellent',
        statusNote: 'Локальный Wi-Fi в норме'
      },
      {
        target: '77.88.8.8',
        name: 'Яндекс DNS (через VPN)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 84.0,
        avgRtt: 92.5,
        maxRtt: 120.0,
        jitter: 18.2,
        status: 'warning',
        statusNote: 'Задержка выросла в 10 раз из-за крюка через Европу'
      },
      {
        target: '8.8.8.8',
        name: 'Google DNS (через VPN)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 72.0,
        avgRtt: 86.4,
        maxRtt: 114.0,
        jitter: 15.0,
        status: 'warning',
        statusNote: 'Трафик проходит шифрование'
      }
    ],
    recommendedAdvice: {
      verdict: 'Внимание: Активен VPN! Для корректной проверки интернета от провайдера обязательно отключите VPN.',
      speedSteps: [
        'Отключите приложение VPN на смартфоне.',
        'Повторите замер скорости — скорость возрастет в 3-5 раз, а пинг упадет до 5-10 мс.'
      ],
      stabilitySteps: [
        'Если VPN необходим по работе, выберите сервер ближе (например, Москва или Казахстан) вместо далеких европейских локаций.'
      ]
    }
  },
  {
    id: 'crowded_24g',
    name: '2.4 ГГц — Забитый эфир (Многоквартирный дом)',
    badge: 'warning',
    shortDesc: '8 соседских роутеров на 6-м канале, сильные коллизии, высокий джиттер, Link Speed упал до 54 Мбит/с.',
    wifi: {
      ssid: 'Flat45_WiFi_24G',
      bssid: '28:28:5D:89:C1:20',
      rssi: -66,
      signalPercent: 68,
      frequency: 2437,
      channel: 6,
      band: '2.4GHz',
      channelWidth: '40MHz',
      standard: '802.11n',
      linkSpeedTxMbps: 72,
      linkSpeedRxMbps: 54,
      noiseEstimateDbm: -78,
      snrDb: 12,
      coChannelApCount: 7,
      ipAddress: '192.168.0.45',
      subnetMask: '255.255.255.0',
      gateway: '192.168.0.1',
      dnsServers: ['192.168.0.1'],
      externalIp: '85.140.72.10',
      ispName: 'ПАО МТС',
      vpn: {
        isActive: false,
        warningNote: 'VPN выключен.'
      }
    },
    visibleAps: [
      {
        bssid: '28:28:5D:89:C1:20',
        ssid: 'Flat45_WiFi_24G',
        rssi: -66,
        frequency: 2437,
        channel: 6,
        band: '2.4GHz',
        channelWidth: '40MHz',
        standard: '802.11n',
        isCurrent: true,
        security: 'WPA2-PSK'
      },
      {
        bssid: '00:1A:2B:44:88:99',
        ssid: 'Flat45_WiFi_24G',
        rssi: -78,
        frequency: 2437,
        channel: 6,
        band: '2.4GHz',
        channelWidth: '20MHz',
        standard: '802.11n',
        isCurrent: false,
        security: 'WPA2-PSK'
      },
      {
        bssid: 'BC:F6:85:12:34:56',
        ssid: 'ASUS_Sosed_Apt42',
        rssi: -69,
        frequency: 2437,
        channel: 6,
        band: '2.4GHz',
        channelWidth: '40MHz',
        standard: '802.11n',
        isCurrent: false,
        security: 'WPA2-PSK'
      },
      {
        bssid: '14:CC:20:99:88:77',
        ssid: 'Rostelecom_Apt46',
        rssi: -71,
        frequency: 2437,
        channel: 6,
        band: '2.4GHz',
        channelWidth: '20MHz',
        standard: '802.11n',
        isCurrent: false,
        security: 'WPA2-PSK'
      },
      {
        bssid: '90:F6:52:43:21:00',
        ssid: 'Beeline_SmartBox',
        rssi: -74,
        frequency: 2437,
        channel: 6,
        band: '2.4GHz',
        channelWidth: '40MHz',
        standard: '802.11n',
        isCurrent: false,
        security: 'WPA2-PSK'
      },
      {
        bssid: '90:F6:52:43:21:11',
        ssid: 'Beeline_SmartBox',
        rssi: -82,
        frequency: 2412,
        channel: 1,
        band: '2.4GHz',
        channelWidth: '20MHz',
        standard: '802.11n',
        isCurrent: false,
        security: 'WPA2-PSK'
      }
    ],
    pings: [
      {
        target: '192.168.0.1',
        name: 'Шлюз (Домашний роутер)',
        sent: 10,
        received: 9,
        lossPercent: 10,
        minRtt: 3.2,
        avgRtt: 32.4,
        maxRtt: 120.0,
        jitter: 24.5,
        status: 'warning',
        statusNote: 'Джиттер до роутера из-за радиопомех'
      },
      {
        target: '77.88.8.8',
        name: 'Яндекс DNS (РФ)',
        sent: 10,
        received: 9,
        lossPercent: 10,
        minRtt: 14.5,
        avgRtt: 44.0,
        maxRtt: 140.0,
        jitter: 26.2,
        status: 'warning',
        statusNote: 'Потери на первом беспроводном участке'
      }
    ],
    recommendedAdvice: {
      verdict: 'Узкое место — диапазон 2.4 ГГц. Радиоканал переполнен соседскими роутерами.',
      speedSteps: [
        'Переключитесь на 5 ГГц сеть роутера (если роутер двухдиапазонный).',
        'В настройках роутера принудительно поставьте ширину канала 20 МГц вместо 40 МГц.'
      ],
      stabilitySteps: [
        'Зафиксируйте свободный канал 1 или 11 вместо перегруженного 6-го.'
      ]
    }
  },
  {
    id: 'weak_rssi_walls',
    name: 'Слабый сигнал (-85 dBm, 2 бетонные стены)',
    badge: 'critical',
    shortDesc: 'Телефон находится далеко от роутера. Мощность на грани срыва, 15% потерь пакетов, скорость падает до 10 Мбит/с.',
    wifi: {
      ssid: 'Keenetic_Ultra_5G',
      bssid: '50:FF:20:AA:12:44',
      rssi: -85,
      signalPercent: 20,
      frequency: 5180,
      channel: 36,
      band: '5GHz',
      channelWidth: '80MHz',
      standard: '802.11ax',
      linkSpeedTxMbps: 26,
      linkSpeedRxMbps: 13,
      noiseEstimateDbm: -92,
      snrDb: 7,
      coChannelApCount: 0,
      ipAddress: '192.168.1.105',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.1'],
      externalIp: '178.62.204.18',
      ispName: 'ПАО Ростелеком',
      vpn: {
        isActive: false,
        warningNote: 'VPN выключен.'
      }
    },
    visibleAps: [
      {
        bssid: '50:FF:20:AA:12:44',
        ssid: 'Keenetic_Ultra_5G',
        rssi: -85,
        frequency: 5180,
        channel: 36,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: true,
        security: 'WPA3-SAE'
      }
    ],
    pings: [
      {
        target: '192.168.1.1',
        name: 'Шлюз (Домашний роутер)',
        sent: 10,
        received: 8,
        lossPercent: 20,
        minRtt: 8.5,
        avgRtt: 96.0,
        maxRtt: 310.0,
        jitter: 52.0,
        status: 'critical',
        statusNote: '20% потерь на радиоканале до роутера'
      }
    ],
    recommendedAdvice: {
      verdict: 'Критически слабый сигнал Wi-Fi. Стены полностью глушат сигнал 5 ГГц.',
      speedSteps: [
        'Подойдите ближе к роутеру или вынесите роутер из шкафа/угла на открытое место.'
      ],
      stabilitySteps: [
        'На таком расстоянии переключитесь на 2.4 ГГц (он лучше пробивает стены) либо добавьте Wi-Fi Mesh-ретранслятор.'
      ]
    }
  },
  {
    id: 'isp_wan_cable_loss',
    name: 'Авария у провайдера (WAN/Оптика)',
    badge: 'critical',
    shortDesc: 'Wi-Fi и роутер в идеале (пинг до роутера 1.2 мс, 0% потерь), но на внешних серверах Яндекса 25% потерь. Это зона ответственности провайдера!',
    wifi: {
      ssid: 'Fiber_House_5G',
      bssid: 'AC:84:C6:11:90:33',
      rssi: -46,
      signalPercent: 97,
      frequency: 5200,
      channel: 40,
      band: '5GHz',
      channelWidth: '80MHz',
      standard: '802.11ax',
      linkSpeedTxMbps: 1201,
      linkSpeedRxMbps: 1201,
      noiseEstimateDbm: -96,
      snrDb: 50,
      coChannelApCount: 0,
      ipAddress: '192.168.1.67',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.1'],
      externalIp: '94.25.180.44',
      ispName: 'ЭР-Телеком (Дом.ру)',
      vpn: {
        isActive: false,
        warningNote: 'VPN выключен.'
      }
    },
    visibleAps: [
      {
        bssid: 'AC:84:C6:11:90:33',
        ssid: 'Fiber_House_5G',
        rssi: -46,
        frequency: 5200,
        channel: 40,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: true,
        security: 'WPA3-SAE'
      },
      {
        bssid: 'AC:84:C6:11:90:34',
        ssid: 'Fiber_House_5G',
        rssi: -62,
        frequency: 5240,
        channel: 48,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA3-SAE'
      },
      {
        bssid: 'E0:D5:5E:11:22:33',
        ssid: 'TP-Link_Deco_X20',
        rssi: -76,
        frequency: 5180,
        channel: 36,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA2/WPA3'
      },
      {
        bssid: 'E0:D5:5E:44:55:66',
        ssid: 'TP-Link_Deco_X20',
        rssi: -84,
        frequency: 5260,
        channel: 52,
        band: '5GHz',
        channelWidth: '80MHz',
        standard: '802.11ax',
        isCurrent: false,
        security: 'WPA2/WPA3'
      }
    ],
    pings: [
      {
        target: '192.168.1.1',
        name: 'Шлюз (Домашний роутер)',
        sent: 10,
        received: 10,
        lossPercent: 0,
        minRtt: 1.1,
        avgRtt: 1.5,
        maxRtt: 2.2,
        jitter: 0.3,
        status: 'excellent',
        statusNote: 'Домашняя сеть абонента 100% исправна'
      },
      {
        target: '77.88.8.8',
        name: 'Яндекс DNS (РФ)',
        sent: 10,
        received: 7,
        lossPercent: 30,
        minRtt: 12.0,
        avgRtt: 84.0,
        maxRtt: 280.0,
        jitter: 46.0,
        status: 'critical',
        statusNote: '30% потерь пакетов на внешнем канале провайдера'
      },
      {
        target: '8.8.8.8',
        name: 'Google DNS (Глобальный)',
        sent: 10,
        received: 7,
        lossPercent: 30,
        minRtt: 26.0,
        avgRtt: 96.0,
        maxRtt: 295.0,
        jitter: 48.0,
        status: 'critical',
        statusNote: 'Потери пакетов за пределами вашей квартиры'
      }
    ],
    recommendedAdvice: {
      verdict: 'Проблема на стороне интернет-провайдера! Домашний Wi-Fi и роутер работают безупречно.',
      speedSteps: [
        'Сформируйте отчет для техподдержки одной кнопкой и отправьте в чат провайдера.'
      ],
      stabilitySteps: [
        'Сообщите провайдеру: «До шлюза 0% потерь, за пределами шлюза 30% потерь. Проверьте оптическую линию и порт коммутатора в подъезде».'
      ]
    }
  }
];

export const INITIAL_SPEED_TEST_HISTORY: SpeedTestRun[] = [
  {
    id: 'run-1',
    timestamp: 'Сегодня, 18:24',
    downloadMbps: 482.5,
    uploadMbps: 310.2,
    pingMs: 7.2,
    jitterMs: 0.8,
    lossPercent: 1,
    source: 'network_test',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, IX',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -48,
    vpnActive: false,
    note: 'Идеальный замер 5 ГГц (потери 1% — норма радиоэфира, не проблема)'
  },
  {
    id: 'run-2',
    timestamp: 'Сегодня, 17:50',
    downloadMbps: 475.0,
    uploadMbps: 295.4,
    pingMs: 6.8,
    jitterMs: 0.9,
    lossPercent: 1,
    source: 'yandex',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, Яндекс',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -49,
    vpnActive: false,
    note: 'Замер через Яндекс Интернетометр (потери 1% — норма Wi-Fi)'
  },
  {
    id: 'run-3',
    timestamp: 'Сегодня, 17:10',
    downloadMbps: 460.2,
    uploadMbps: 280.0,
    pingMs: 8.1,
    jitterMs: 1.1,
    lossPercent: 0,
    source: '2ip',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Санкт-Петербург, 2IP',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -50,
    vpnActive: false,
    note: 'Замер скорости через сервис 2IP.ru (чистый канал)'
  },
  {
    id: 'run-4',
    timestamp: 'Сегодня, 15:45',
    downloadMbps: 215.4,
    uploadMbps: 165.1,
    pingMs: 12.4,
    jitterMs: 2.5,
    lossPercent: 2,
    source: '2ip',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, 2IP',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:55',
    wifiBand: '5GHz',
    wifiRssi: -65,
    vpnActive: false,
    note: 'Замер через Mesh-узел (потери 2% в Wi-Fi — штатная норма)'
  },
  {
    id: 'run-5',
    timestamp: 'Сегодня, 13:20',
    downloadMbps: 58.4,
    uploadMbps: 44.0,
    pingMs: 24.5,
    jitterMs: 12.0,
    lossPercent: 2,
    source: 'network_test',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, IX',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:43',
    wifiBand: '2.4GHz',
    wifiRssi: -52,
    vpnActive: false,
    note: 'Тест 2.4 ГГц диапазона (потери 2% допустимы для радиоэфира)'
  },
  {
    id: 'run-6',
    timestamp: 'Сегодня, 11:05',
    downloadMbps: 52.0,
    uploadMbps: 41.5,
    pingMs: 26.0,
    jitterMs: 14.2,
    lossPercent: 1,
    source: 'yandex',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, Яндекс',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:43',
    wifiBand: '2.4GHz',
    wifiRssi: -53,
    vpnActive: false,
    note: 'Яндекс Интернетометр на 2.4 ГГц (потери 1% — норма)'
  },
  {
    id: 'run-7',
    timestamp: 'Вчера, 23:40',
    downloadMbps: 490.1,
    uploadMbps: 320.0,
    pingMs: 6.5,
    jitterMs: 0.6,
    lossPercent: 0,
    source: 'network_test',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, IX',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -48,
    vpnActive: false,
    note: 'Ночной замер в пустом радиоэфире (максимальный тариф)'
  },
  {
    id: 'run-8',
    timestamp: 'Вчера, 21:15',
    downloadMbps: 42.1,
    uploadMbps: 18.4,
    pingMs: 88.4,
    jitterMs: 19.5,
    lossPercent: 2,
    source: 'yandex',
    ispName: 'Mullvad VPN / Datacenter NL',
    serverLocation: 'Амстердам (Нидерланды)',
    externalIp: '185.220.101.5',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -52,
    vpnActive: true,
    vpnName: 'WireGuard / tun0',
    note: 'Замер с активным ВПН (скорость ограничена туннелем в Нидерланды)'
  },
  {
    id: 'run-9',
    timestamp: 'Вчера, 19:30',
    downloadMbps: 39.8,
    uploadMbps: 16.0,
    pingMs: 92.0,
    jitterMs: 21.0,
    lossPercent: 2,
    source: '2ip',
    ispName: 'Mullvad VPN / Datacenter NL',
    serverLocation: 'Амстердам, 2IP',
    externalIp: '185.220.101.5',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -52,
    vpnActive: true,
    vpnName: 'WireGuard / tun0',
    note: '2IP тест скорости через европейский VPN (пинг вырос до 92 мс)'
  },
  {
    id: 'run-10',
    timestamp: 'Вчера, 16:15',
    downloadMbps: 430.0,
    uploadMbps: 270.5,
    pingMs: 9.4,
    jitterMs: 1.5,
    lossPercent: 1,
    source: 'network_test',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, IX',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -56,
    vpnActive: false,
    note: 'Дневной рабочий замер (1% потерь — норма для Wi-Fi)'
  },
  {
    id: 'run-11',
    timestamp: 'Вчера, 12:00',
    downloadMbps: 310.2,
    uploadMbps: 195.4,
    pingMs: 11.2,
    jitterMs: 2.2,
    lossPercent: 2,
    source: '2ip',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, 2IP',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:55',
    wifiBand: '5GHz',
    wifiRssi: -66,
    vpnActive: false,
    note: 'Проверка бесшовного роуминга 2IP (2% потерь — норма Wi-Fi)'
  },
  {
    id: 'run-12',
    timestamp: '2 дня назад, 20:10',
    downloadMbps: 54.8,
    uploadMbps: 48.0,
    pingMs: 34.0,
    jitterMs: 22.0,
    lossPercent: 5,
    source: 'yandex',
    ispName: 'ПАО МТС',
    serverLocation: 'Москва, Яндекс',
    externalIp: '85.140.72.10',
    wifiSsid: 'Flat45_WiFi_24G',
    wifiBssid: '28:28:5D:89:C1:20',
    wifiBand: '2.4GHz',
    wifiRssi: -66,
    vpnActive: false,
    note: 'Вечерний замер 2.4 ГГц в многоквартирном доме (шум соседей)'
  },
  {
    id: 'run-13',
    timestamp: '2 дня назад, 17:35',
    downloadMbps: 48.2,
    uploadMbps: 39.0,
    pingMs: 38.5,
    jitterMs: 26.4,
    lossPercent: 5,
    source: '2ip',
    ispName: 'ПАО МТС',
    serverLocation: 'Москва, 2IP',
    externalIp: '85.140.72.10',
    wifiSsid: 'Flat45_WiFi_24G',
    wifiBssid: '28:28:5D:89:C1:20',
    wifiBand: '2.4GHz',
    wifiRssi: -68,
    vpnActive: false,
    note: '2IP замер на загруженном канале 6 (2.4 ГГц перегружен)'
  },
  {
    id: 'run-14',
    timestamp: '2 дня назад, 14:02',
    downloadMbps: 51.0,
    uploadMbps: 42.1,
    pingMs: 36.0,
    jitterMs: 24.0,
    lossPercent: 4,
    source: 'network_test',
    ispName: 'ПАО МТС',
    serverLocation: 'Москва, IX',
    externalIp: '85.140.72.10',
    wifiSsid: 'Flat45_WiFi_24G',
    wifiBssid: '28:28:5D:89:C1:20',
    wifiBand: '2.4GHz',
    wifiRssi: -66,
    vpnActive: false,
    note: 'Коллизии в радиоэфире 2.4 ГГц (джиттер вырос до 24 мс)'
  },
  {
    id: 'run-15',
    timestamp: '3 дня назад, 10:15',
    downloadMbps: 12.4,
    uploadMbps: 6.8,
    pingMs: 78.0,
    jitterMs: 45.0,
    lossPercent: 15,
    source: 'network_test',
    ispName: 'ПАО Ростелеком',
    serverLocation: 'Москва, IX',
    externalIp: '178.62.204.18',
    wifiSsid: 'Keenetic_Ultra_5G',
    wifiBssid: '50:FF:20:AA:12:44',
    wifiBand: '5GHz',
    wifiRssi: -85,
    vpnActive: false,
    note: 'Критически слабый сигнал (-85 дБм за двумя несущими стенами)'
  }
];
