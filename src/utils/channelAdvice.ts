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
  category?: 'wifi' | 'cellular' | 'hardware' | 'general';
  tag?: string;
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

  // 1. Динамические рекомендации по текущему эфиру и состоянию подключения
  items.push({
    id: 'ch24',
    title: `Самый свободный канал 2.4 ГГц: ${best24.channel}`,
    detail: `Канал ${best24.channel} (${best24.frequency} МГц) сейчас наименее загружен: ${best24.apCount} пересечений. В роутере зафиксируйте ширину 20 МГц и каналы 1, 6 или 11 — избегайте авто-выбора, если соседские роутеры часто меняют частоты.`,
    priority: best24.apCount === 0 ? 'info' : 'high',
    category: 'wifi',
    tag: 'Каналы 2.4G'
  });

  items.push({
    id: 'ch5',
    title: `Самый свободный канал 5 ГГц: ${best5.channel}`,
    detail: `Канал ${best5.channel} (${best5.frequency} МГц) — оптимальный выбор в диапазоне 5 ГГц (${best5.apCount} пересечений). Для максимальной скорости выберите ширину 80 МГц на каналах 36–48.`,
    priority: 'high',
    category: 'wifi',
    tag: 'Каналы 5G'
  });

  if (!wifi.wifiConnected) {
    items.push({
      id: 'nowifi',
      title: 'Устройство не подключено к Wi‑Fi',
      detail: 'Сейчас нет активного подключения к Wi‑Fi. Для проверки тарифа домашнего интернета подключитесь к домашней сети 5 ГГц. При замере через сотовую сеть трафик будет списан с вашего мобильного пакета.',
      priority: 'high',
      category: 'cellular',
      tag: 'Подключение'
    });
  }

  if (wifi.usingMobileInternet) {
    items.push({
      id: 'lte',
      title: 'Используется мобильный интернет (LTE/5G)',
      detail: 'Замер скорости по LTE/5G показывает пропускную способность сотовой вышки оператора, а не домашнего роутера. Скорость мобильной сети зависит от категории модема смартфона (Cat. LTE), агрегации частот и нагрузки сектора БС.',
      priority: 'high',
      category: 'cellular',
      tag: '4G/5G'
    });
  }

  if (wifi.band.includes('2.4')) {
    items.push({
      id: 'use5',
      title: 'Перейдите на диапазон 5 ГГц',
      detail: '2.4 ГГц удобен для дальности, но для замера скорости и 4K-видео почти всегда хуже из‑за помех соседей, Bluetooth и микроволновок. На телефоне выберите SSID с «5G» или «5 ГГц».',
      priority: 'high',
      category: 'wifi',
      tag: 'Диапазоны'
    });
  } else {
    items.push({
      id: 'stay5',
      title: 'Оставайтесь на 5 ГГц рядом с роутером',
      detail: 'Для честного спидтеста стойте в 1–3 метрах от роутера без бетонных стен. 5 ГГц быстро затухает — в дальней комнате телефон может сам уйти на медленный 2.4 ГГц.',
      priority: 'medium',
      category: 'wifi',
      tag: 'Диапазоны'
    });
  }

  if (wifi.rssi < -78) {
    items.push({
      id: 'weak',
      title: 'Слабый сигнал — подойдите ближе к роутеру',
      detail: `RSSI ${wifi.rssi} дБм. Уберите роутер от стен и металла, поднимите антенны на высоту 1.5–2 м, не прячьте его в металлический щиток. Если стены несущие — используйте Mesh-систему с кабельным бэкхолом.`,
      priority: 'high',
      category: 'hardware',
      tag: 'Сигнал'
    });
  } else if (wifi.rssi < -65) {
    items.push({
      id: 'mid',
      title: 'Сигнал средний — проверьте место замера',
      detail: 'Нормальный уровень для серфинга, но для максимальной скорости сядьте ближе к роутеру и уберите препятствия на прямой видимости.',
      priority: 'medium',
      category: 'wifi',
      tag: 'Сигнал'
    });
  }

  if (wifi.vpn.isActive) {
    items.push({
      id: 'vpn',
      title: 'Выключите VPN для проверки тарифа',
      detail: 'VPN ограничивает скорость сервером туннеля и шифрованием. Для проверки реального тарифа провайдера VPN должен быть временно отключен.',
      priority: 'high',
      category: 'general',
      tag: 'VPN'
    });
  }

  if (wifi.band === '2.4GHz' && wifi.channelWidth.includes('40')) {
    items.push({
      id: 'width24',
      title: 'На 2.4 ГГц поставьте ширину 20 МГц',
      detail: 'Ширина 40 МГц в многоквартирном доме захватывает почти весь эфир и создаёт коллизии со всеми соседями. Режим 20 МГц на каналах 1, 6 или 11 работает намного стабильнее.',
      priority: 'medium',
      category: 'wifi',
      tag: 'Ширина канала'
    });
  }

  if (wifi.coChannelApCount > 2) {
    items.push({
      id: 'coch',
      title: 'Смените канал: на вашей частоте слишком много чужих сетей',
      detail: `На канале ${wifi.channel} работают ещё ${wifi.coChannelApCount} соседских точек доступа. Зафиксируйте в роутере самый свободный канал из сводки выше.`,
      priority: 'high',
      category: 'wifi',
      tag: 'Помехи'
    });
  }

  // 2. Практические рекомендации по MESH-СИСТЕМАМ
  items.push({
    id: 'mesh_ethernet_backhaul',
    title: 'Mesh-системы: Кабельное соединение узлов (Ethernet Backhaul)',
    detail: 'Золотой стандарт Mesh-сети: соедините узлы кабелем «витая пара» Cat.5e/6 через гигабитный коммутатор. Беспроводной бэкхол (по воздуху) забирает до половины радиоресурса 5 ГГц на связь между нодами. С Ethernet Backhaul клиенты получают 100% скорости, а пинг между комнатами падает до 0.5 мс.',
    priority: 'high',
    category: 'hardware',
    tag: 'Mesh'
  });

  items.push({
    id: 'mesh_placement_sweetspot',
    title: 'Mesh-системы: Правило «золотой середины» размещения сателлита',
    detail: 'Не ставьте дополнительный узел Mesh в глухую «мертвую зону», где Wi-Fi уже не ловит — сателлит сам не сможет связаться с главным роутером! Устанавливайте ноду ровно на полпути между базовым роутером и дальней комнатой, в точке уверенного приема (не слабее -65 дБм / 3 палочки).',
    priority: 'high',
    category: 'hardware',
    tag: 'Mesh'
  });

  items.push({
    id: 'mesh_triband',
    title: 'Mesh-системы: Tri-Band (трехдиапазонные) при связи по воздуху',
    detail: 'Если проложить сетевой кабель между комнатами невозможно, выбирайте трехдиапазонные Mesh-системы (Tri-Band). В них работают две независимые сети 5 ГГц: одна выделена исключительно для служебного канала связи между узлами (Wireless Backhaul), а вторая полностью свободна для смартфонов и ТВ.',
    priority: 'info',
    category: 'hardware',
    tag: 'Mesh'
  });

  items.push({
    id: 'mesh_roaming_protocols',
    title: 'Mesh и бесшовный роуминг: Стандарты 802.11k, 802.11v, 802.11r',
    detail: 'Для незаметного переключения между узлами без обрыва Telegram-звонков и видеоконференций включите в роутере протоколы быстрой передачи: 802.11k (карта соседних точек), 802.11v (балансировка нагрузки) и 802.11r (Fast Transition без повторной аутентификации).',
    priority: 'info',
    category: 'hardware',
    tag: 'Mesh'
  });

  items.push({
    id: 'mesh_density_warning',
    title: 'Mesh: Опасность избыточного количества узлов в квартире',
    detail: 'Слишком много узлов на небольшой площади — частая ошибка. Точки глушат друг друга на одних и тех же частотах, а смартфон начинает хаотично «метаться» между нодами. На квартиру 60–80 м² достаточно 1–2 качественных точек, на 100–120 м² — 2–3 точек.',
    priority: 'medium',
    category: 'hardware',
    tag: 'Mesh'
  });

  // 3. Практические рекомендации по РЕПИТЕРАМ (Wi-Fi Повторителям)
  items.push({
    id: 'repeater_half_speed',
    title: 'Wi-Fi Репитеры: Закон падения скорости в 2 раза (Half-Duplex)',
    detail: 'Обычный репитер работает в полудуплексе: он принимает пакет от роутера, а затем отправляет его вам на той же радиочастоте. В результате реальная скорость падает минимум на 50%, а сетевая задержка (пинг) удваивается. Не используйте репитеры для онлайн-игр и 4K-стриминга.',
    priority: 'high',
    category: 'hardware',
    tag: 'Репитеры'
  });

  items.push({
    id: 'repeater_ap_mode',
    title: 'Репитеры: Переключение в режим проводной «Точки доступа» (AP Mode)',
    detail: 'Практически у всех репитеров на корпусе есть порт RJ-45 (LAN). Подключите репитер кабелем от роутера и в настройках переключите режим с «Повторитель» (Extender) на «Точка доступа» (Access Point). Скорость перестанет резаться пополам, а соединение станет монолитно стабильным.',
    priority: 'high',
    category: 'hardware',
    tag: 'Репитеры'
  });

  items.push({
    id: 'repeater_sticky_client',
    title: 'Репитеры: Проблема «залипания» клиентов (Sticky Client)',
    detail: 'Простые репитеры не умеют бесшовно передавать смартфон на главный роутер. Телефон будет держаться за слабый сигнал роутера (-85 дБм) до полного обрыва, игнорируя репитер в двух метрах. Решение — дать сети репитера отдельное имя или перейти на Mesh с поддержкой 802.11k/v.',
    priority: 'medium',
    category: 'hardware',
    tag: 'Репитеры'
  });

  // 4. Практические рекомендации по ТОЧКАМ ДОСТУПА (Access Points)
  items.push({
    id: 'ap_ceiling_mount',
    title: 'Точки доступа: Потолочный монтаж и диаграмма направленности',
    detail: 'Профессиональные точки доступа (UniFi, Keenetic, TP-Link Omada, MikroTik) рассчитаны на установку на потолке. Их антенны излучают радиоволны широким куполом вниз и в стороны, обеспечивая равномерный прием без глухих зон от мебели и перегородок.',
    priority: 'info',
    category: 'hardware',
    tag: 'Точки доступа'
  });

  items.push({
    id: 'ap_poe_power',
    title: 'Точки доступа: Питание по кабелю витой пары (PoE 802.3af/at)',
    detail: 'Технология Power over Ethernet (PoE) передает гигабитный интернет и электропитание по одному сетевому кабелю на расстояние до 100 метров. Это избавляет от необходимости вести розетку 220В на потолок или в коридор — нужен лишь PoE-коммутатор или инжектор у электрощитка.',
    priority: 'info',
    category: 'hardware',
    tag: 'Точки доступа'
  });

  items.push({
    id: 'ap_tx_power_balance',
    title: 'Точки доступа и роутеры: Баланс мощности передачи (Tx Power)',
    detail: 'Не ставьте мощность Wi-Fi в роутере на максимум (100% / 23–27 dBm)! Роутер докричится до телефона сквозь стены, но крошечная антенна смартфона (12–14 dBm) не сможет ответить обратно. Возникает иллюзия «5 палочек, но ничего не грузится». Снизьте мощность до Medium (14–17 dBm) для симметрии связи.',
    priority: 'high',
    category: 'hardware',
    tag: 'Мощность Tx'
  });

  // 5. Практические рекомендации по РОУТЕРАМ (Keenetic, ASUS, TP-Link, MikroTik)
  items.push({
    id: 'router_antenna_orientation',
    title: 'Роутеры: Правильная ориентация внешних антенн',
    detail: 'Антенны роутера излучают сигнал в форме «бублика» (перпендикулярно оси штыря). Не направляйте все антенны ровно вверх: поставьте часть вертикально (для устройств в горизонтальной плоскости), а часть наклоните под углом 45–60° (для смартфонов в руках в альбомной и книжной ориентации).',
    priority: 'info',
    category: 'hardware',
    tag: 'Роутеры'
  });

  items.push({
    id: 'router_hardware_nat',
    title: 'Роутеры: Аппаратное ускорение NAT (Hardware NAT / Offload)',
    detail: 'При тарифах интернета 200–1000 Мбит/с убедитесь, что в прошивке роутера включено аппаратное ускорение (Hardware NAT / HW Acceleration). Без него процессор роутера нагружается на 100% при скачивании тяжелых файлов, что вызывает троттлинг, нагрев и скачки пинга.',
    priority: 'high',
    category: 'hardware',
    tag: 'Роутеры'
  });

  items.push({
    id: 'router_disable_legacy_b',
    title: 'Роутеры: Отключение устаревшего режима 802.11b (Legacy Rates)',
    detail: 'В настройках 2.4 ГГц отключите поддержку древнего стандарта 802.11b (выберите «802.11n/ac/ax only»). Если включен 802.11b, роутер вынужден непрерывно слать служебные маяки (Beacon) на архаичной скорости 1–2 Мбит/с, съедая до 15–20% полезной емкости радиоэфира.',
    priority: 'medium',
    category: 'hardware',
    tag: 'Роутеры'
  });

  items.push({
    id: 'router_bufferbloat_sqm',
    title: 'Роутеры: Борьба с Bufferbloat (Умные очереди SQM / fq_codel)',
    detail: 'Если во время загрузки файлов или видео пинг в играх взлетает с 15 до 300+ мс — виновато переполнение очередей буферов (Bufferbloat). В роутерах Keenetic, OpenWrt или ASUS включите шейпер SQM (CAKE / fq_codel) и ограничьте скорость на 5% ниже максимума тарифа.',
    priority: 'medium',
    category: 'hardware',
    tag: 'Роутеры'
  });

  items.push({
    id: 'router_weekly_reboot',
    title: 'Роутеры: Регулярный перезапуск и перегрев чипсета',
    detail: 'Многие роутеры со временем накапливают фрагментацию оперативной памяти и забивают таблицы NAT. Настройте в расписании роутера автоматическую перезагрузку раз в неделю (например, в понедельник в 04:00 утра). Не закрывайте решетки охлаждения роутера книгами и бумагами.',
    priority: 'info',
    category: 'hardware',
    tag: 'Роутеры'
  });

  items.push({
    id: 'router_iot_isolation',
    title: 'Роутеры: Изоляция умного дома (IoT) в отдельную гостевую сеть',
    detail: 'Десятки умных ламп, розеток и роботов-пылесосов часто имеют уязвимые прошивки и забивают эфир широковещательным трафиком. Выделите для них отдельную гостевую сеть Wi-Fi 2.4 ГГц с включенной изоляцией клиентов, защитив ваши личные смартфоны, ПК и NAS-накопители.',
    priority: 'info',
    category: 'hardware',
    tag: 'Безопасность'
  });

  // 6. Практические рекомендации по ФИЗИКЕ РАДИОВОЛН И ПРОВОДАМ
  items.push({
    id: 'powerline_plc',
    title: 'Powerline (PLC): Интернет через электрическую сеть 220В',
    detail: 'Если стены монолитные и кабель протянуть нельзя, адаптеры Powerline передают интернет по бытовой электропроводке. Важные правила: включайте адаптеры строго напрямую в настенную розетку (не через фильтры или сетевые удлинители) и убедитесь, что обе розетки на одной фазе.',
    priority: 'info',
    category: 'hardware',
    tag: 'Оборудование'
  });

  items.push({
    id: 'materials_attenuation',
    title: 'Радиофизика: Как стены, аквариумы и зеркала гасят Wi‑Fi',
    detail: 'Гипсокартон отнимает 3–5 дБм сигнала, кирпич — 6–10 дБм, а железобетонная армированная стена гасит до 15–25 дБм (снижая мощность в 30–100 раз!). Большие аквариумы поглощают радиоволны на 90%, а зеркала шкафов-купе с металлическим напылением работают как экраны-отражатели.',
    priority: 'medium',
    category: 'wifi',
    tag: 'Препятствия'
  });

  items.push({
    id: 'beamforming_advice',
    title: 'Технология Beamforming: Направленный радиолуч вместо круга',
    detail: 'Современные роутеры Wi-Fi 5 (802.11ac) и Wi-Fi 6 (802.11ax) поддерживают Beamforming: фазированная решетка антенн определяет точные координаты вашего смартфона и фокусирует радиолуч прямо в его сторону, поднимая скорость передачи на 30–50%.',
    priority: 'info',
    category: 'hardware',
    tag: 'Технологии'
  });

  items.push({
    id: 'usb3_noise',
    title: 'Помехи: Внешние диски USB 3.0 глушат диапазон 2.4 ГГц',
    detail: 'Внешние жесткие диски и флешки в порту USB 3.0 роутера без качественного экранирования излучают шум точно на частоте 2.4–2.5 ГГц. Это может сократить радиус 2.4 ГГц в 3 раза. Включите в роутере режим «Уменьшить скорость USB до USB 2.0» или используйте экранированный кабель.',
    priority: 'medium',
    category: 'hardware',
    tag: 'Помехи'
  });

  items.push({
    id: 'ssid_split',
    title: 'Разделите имена сетей 2.4 и 5 ГГц (Smart Connect vs Split SSID)',
    detail: 'Единое имя сети (Smart Connect) часто ошибается и загоняет смартфоны в медленный 2.4 ГГц даже рядом с роутером. Назовите сети по-разному: например, MyHome_2.4G и MyHome_5G. Подключите смартфоны и ТВ только к 5G, а 2.4G оставьте для пылесосов и датчиков.',
    priority: 'info',
    category: 'wifi',
    tag: 'Настройка'
  });

  items.push({
    id: 'place',
    title: 'Поставьте роутер в геометрический центр квартиры',
    detail: 'Устанавливайте роутер на высоте 1.5–2 метра от пола, на открытом пространстве. Не прячьте его в металлический электрощиток в прихожей — металл блокирует радиоволны на 99%, оставляя комнаты без покрытия.',
    priority: 'info',
    category: 'hardware',
    tag: 'Размещение'
  });

  items.push({
    id: 'ethernet',
    title: 'Стационарные устройства (ПК, ТВ, консоли) подключайте кабелем',
    detail: 'Гигабитный Ethernet-кабель дает гарантированный 0% потерь пакетов и пинг 1 мс, разгружая радиоэфир для смартфонов и планшетов. Один проводной телевизор с 4K освобождает до половины пропускной способности Wi-Fi в комнате.',
    priority: 'info',
    category: 'hardware',
    tag: 'Кабель'
  });

  items.push({
    id: 'dfs',
    title: 'На 5 ГГц учитывайте радарные DFS-каналы (52–144)',
    detail: 'Каналы с 52 по 144 делят частоту с метеорадарами и системами аэропортов. При обнаружении импульса радара роутер обязан заглушить передатчик на 30–60 секунд и сменить канал. Если 5 ГГц периодически на минуту пропадает — зафиксируйте каналы 36–48.',
    priority: 'info',
    category: 'wifi',
    tag: 'Каналы 5G'
  });

  items.push({
    id: 'channel_width_80_160',
    title: 'Ширина канала 5 ГГц: 80 МГц vs 160 МГц',
    detail: 'Полоса 160 МГц в Wi-Fi 6 дает гигабитную скорость по воздуху, но занимает весь диапазон 5 ГГц и крайне чувствительна к помехам и радарам DFS. В городской многоэтажке ширина 80 МГц работает значительно стабильнее и обеспечивает отличные 500–800 Мбит/с.',
    priority: 'info',
    category: 'wifi',
    tag: 'Ширина канала'
  });

  items.push({
    id: 'security_wpa',
    title: 'Используйте шифрование WPA2-AES или WPA3',
    detail: 'Устаревшие протоколы WEP и WPA-TKIP аппаратно ограничивают скорость до 54 Мбит/с на уровне чипсета роутера, независимо от тарифа. WPA2-PSK (AES) или WPA3 обеспечивают максимальную скорость и надежную защиту.',
    priority: 'info',
    category: 'hardware',
    tag: 'Безопасность'
  });

  // 7. Практические рекомендации по МОБИЛЬНОМУ ИНТЕРНЕТУ
  items.push({
    id: 'carrier_agg',
    title: 'Мобильный интернет: Агрегация частот (4G+ / LTE-A)',
    detail: 'Значок 4G+ на телефоне означает, что устройство объединяет 2 или 3 диапазона сотовой связи (например, B3 1800 МГц + B7 2600 МГц + B20 800 МГц). Это удваивает или утраивает скорость мобильного интернета по сравнению с базовым 4G.',
    priority: 'info',
    category: 'cellular',
    tag: '4G/5G'
  });

  items.push({
    id: 'vowifi_advice',
    title: 'VoWi-Fi: Звонки по мобильной связи через домашний Wi‑Fi',
    detail: 'Если в квартире или цокольном этаже плохо ловит сотовая связь, включите в настройках телефона «Вызовы по Wi-Fi» (VoWi-Fi). Смартфон будет принимать звонки на ваш обычный сотовый номер через интернет домашнего роутера без задержек и помех.',
    priority: 'info',
    category: 'cellular',
    tag: 'Связь'
  });

  items.push({
    id: 'rsrp_sinr_advice',
    title: 'Мобильный интернет: Почему 5 «палочек» не гарантируют скорость',
    detail: '«Палочки» на экране показывают силу сигнала (RSRP), но не качество (SINR) и не нагрузку базовой станции. Если на вышке сидят сотни пользователей, скорость может упасть до 2 Мбит/с даже при максимальном индикаторе приёма.',
    priority: 'info',
    category: 'cellular',
    tag: '4G/5G'
  });

  return items;
}
