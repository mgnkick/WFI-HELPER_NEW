import { AccessPoint, CurrentWifiMetrics } from '../types/wifi';

export interface ChannelScore {
  channel: number;
  frequency: number;
  score: number;
  apCount: number;
  overlappingSsids: string[];
}

export interface AdviceItem {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'info';
}

function apOccupies24(apChannel: number, width: string): [number, number] {
  const half = width.includes('40') ? 4 : 2;
  return [apChannel - half, apChannel + half];
}

function overlaps(a1: number, a2: number, b1: number, b2: number): boolean {
  return a1 <= b2 && b1 <= a2;
}

export function score24GHz(aps: AccessPoint[]): ChannelScore[] {
  const candidates = [
    { channel: 1, frequency: 2412 },
    { channel: 6, frequency: 2437 },
    { channel: 11, frequency: 2462 }
  ];
  const bandAps = aps.filter(ap => ap.band === '2.4GHz' || (ap.frequency >= 2400 && ap.frequency < 2500));

  return candidates
    .map(c => {
      const [c1, c2] = apOccupies24(c.channel, '20MHz');
      const overlapping = bandAps.filter(ap => {
        const [a1, a2] = apOccupies24(ap.channel, ap.channelWidth);
        return overlaps(c1, c2, a1, a2);
      });
      const score = overlapping.reduce((sum, ap) => sum + Math.max(4, ap.rssi + 100), 0);
      return {
        channel: c.channel,
        frequency: c.frequency,
        score,
        apCount: overlapping.length,
        overlappingSsids: overlapping.map(ap => ap.ssid || 'Скрытая сеть')
      };
    })
    .sort((a, b) => a.score - b.score || a.apCount - b.apCount);
}

export function score5GHz(aps: AccessPoint[]): ChannelScore[] {
  const candidates = [
    { channel: 36, frequency: 5180 },
    { channel: 40, frequency: 5200 },
    { channel: 44, frequency: 5220 },
    { channel: 48, frequency: 5240 },
    { channel: 149, frequency: 5745 },
    { channel: 153, frequency: 5765 },
    { channel: 157, frequency: 5785 },
    { channel: 161, frequency: 5805 }
  ];
  const bandAps = aps.filter(ap => ap.band === '5GHz' || (ap.frequency >= 5000 && ap.frequency < 5900));

  return candidates
    .map(c => {
      const overlapping = bandAps.filter(ap => {
        const span = ap.channelWidth.includes('160')
          ? 16
          : ap.channelWidth.includes('80')
            ? 8
            : ap.channelWidth.includes('40')
              ? 4
              : 2;
        return Math.abs(ap.channel - c.channel) < span;
      });
      const score = overlapping.reduce((sum, ap) => sum + Math.max(4, ap.rssi + 100), 0);
      return {
        channel: c.channel,
        frequency: c.frequency,
        score,
        apCount: overlapping.length,
        overlappingSsids: overlapping.map(ap => ap.ssid || 'Скрытая сеть')
      };
    })
    .sort((a, b) => a.score - b.score || a.apCount - b.apCount);
}

export function buildRecommendations(wifi: CurrentWifiMetrics, aps: AccessPoint[]): AdviceItem[] {
  const best24 = score24GHz(aps)[0];
  const best5 = score5GHz(aps)[0];
  const items: AdviceItem[] = [];

  items.push({
    id: 'ch24',
    title: `Самый свободный канал 2.4 ГГц: ${best24.channel}`,
    detail: `Канал ${best24.channel} (${best24.frequency} МГц) сейчас наименее загружен: ${best24.apCount} пересечений. В роутере зафиксируйте 20 МГц и каналы 1, 6 или 11 — не используйте авто-канал, если соседи постоянно прыгают.`,
    priority: best24.apCount === 0 ? 'info' : 'high'
  });

  items.push({
    id: 'ch5',
    title: `Самый свободный канал 5 ГГц: ${best5.channel}`,
    detail: `Канал ${best5.channel} (${best5.frequency} МГц) — лучший выбор в диапазоне 5 ГГц по текущему эфиру (${best5.apCount} пересечений). Для скорости держите ширину 80 МГц, если рядом мало сетей.`,
    priority: 'high'
  });

  if (!wifi.wifiConnected) {
    items.push({
      id: 'nowifi',
      title: 'Подключитесь к Wi‑Fi',
      detail: 'Сейчас нет активного Wi‑Fi. Рекомендации по каналу применяйте в настройках роутера, а замер скорости делайте уже в домашней сети 5 ГГц.',
      priority: 'high'
    });
  }

  if (wifi.usingMobileInternet) {
    items.push({
      id: 'lte',
      title: 'Используется мобильный интернет',
      detail: 'Замер скорости по LTE/5G не показывает качество домашнего Wi‑Fi. Отключите мобильные данные или подключитесь к Wi‑Fi, иначе результат будет про оператора сотовой связи.',
      priority: 'high'
    });
  }

  if (wifi.band.includes('2.4')) {
    items.push({
      id: 'use5',
      title: 'Перейдите на сеть 5 ГГц',
      detail: '2.4 ГГц удобен для дальности, но для замера скорости и 4K-видео почти всегда хуже из‑за помех соседей, Bluetooth и микроволновок. На телефоне выберите SSID с «5G» / «5 ГГц».',
      priority: 'high'
    });
  } else {
    items.push({
      id: 'stay5',
      title: 'Оставайтесь на 5 ГГц рядом с роутером',
      detail: 'Для честного спидтеста стойте в 1–3 метрах от роутера без бетонных стен. 5 ГГц быстро затухает — в дальней комнате телефон сам уйдёт на 2.4 ГГц.',
      priority: 'medium'
    });
  }

  if (wifi.rssi < -78) {
    items.push({
      id: 'weak',
      title: 'Слабый сигнал — подойдите ближе',
      detail: `RSSI ${wifi.rssi} дБм. Уберите роутер от стен и металла, поднимите антенны, не ставьте его в тумбу. Если стены несущие — mesh или репитер, либо Ethernet до проблемной комнаты.`,
      priority: 'high'
    });
  } else if (wifi.rssi < -65) {
    items.push({
      id: 'mid',
      title: 'Сигнал средний — проверьте место',
      detail: 'Нормальный уровень для быта, но для максимальной скорости сядьте ближе к роутеру и уберите препятствия на прямой видимости.',
      priority: 'medium'
    });
  }

  if (wifi.vpn.isActive) {
    items.push({
      id: 'vpn',
      title: 'Выключите VPN для замера',
      detail: 'VPN ограничивает скорость сервером туннеля. Для проверки тарифа провайдера VPN должен быть выключен.',
      priority: 'high'
    });
  }

  if (wifi.band === '2.4GHz' && wifi.channelWidth.includes('40')) {
    items.push({
      id: 'width24',
      title: 'На 2.4 ГГц поставьте 20 МГц',
      detail: 'Ширина 40 МГц в многоквартирном доме почти всегда даёт коллизии. 20 МГц на канале 1, 6 или 11 стабильнее.',
      priority: 'medium'
    });
  }

  if (wifi.coChannelApCount > 2) {
    items.push({
      id: 'coch',
      title: 'Смените канал: на вашем эфире слишком много сетей',
      detail: `На канале ${wifi.channel} ещё ${wifi.coChannelApCount} точек доступа. Зафиксируйте в роутере самый свободный канал из карточек выше.`,
      priority: 'high'
    });
  }

  items.push({
    id: 'ssid-split',
    title: 'Разведите имена сетей 2.4 и 5 ГГц',
    detail: 'Если у роутера одно имя на оба диапазона, телефон часто «липнет» к 2.4 ГГц. Дайте разные SSID: Home_24 и Home_5G.',
    priority: 'info'
  });

  items.push({
    id: 'place',
    title: 'Поставьте роутер в центр квартиры',
    detail: 'Высоко, на открытой полке, не на полу и не за телевизором. Антенны — вертикально. Микроволновка и Bluetooth-колонки — подальше от роутера.',
    priority: 'info'
  });

  items.push({
    id: 'ethernet',
    title: 'ПК, ТВ и приставку лучше по кабелю',
    detail: 'Гигабитный Ethernet снимает радиопомехи. Wi‑Fi оставьте смартфонам и ноутбукам, которые двигаются по квартире.',
    priority: 'info'
  });

  items.push({
    id: 'firmware',
    title: 'Обновите прошивку роутера',
    detail: 'Новые прошивки чинят DFS, автоканал и Wi‑Fi 6. Перезагружайте роутер раз в несколько недель, если эфир «забивается».',
    priority: 'info'
  });

  items.push({
    id: 'clients',
    title: 'Отключите лишние клиенты на время замера',
    detail: 'Загрузки торрентов, облако, умные камеры и соседние телефоны делят канал. Для спидтеста оставьте одно устройство у роутера.',
    priority: 'info'
  });

  items.push({
    id: 'dfs',
    title: 'На 5 ГГц осторожнее с DFS-каналами',
    detail: 'Каналы 52–144 могут внезапно меняться из‑за радаров. Если связь пропадает раз в час — зафиксируйте 36–48 или 149–161.',
    priority: 'info'
  });

  items.push({
    id: 'security',
    title: 'Используйте WPA2/WPA3 и отдельный гостевой Wi‑Fi',
    detail: 'Открытая сеть и WEP режут скорость и опасны. Гостей и IoT вынесите в гостевую сеть, чтобы не засорять основной канал.',
    priority: 'info'
  });

  return items;
}
