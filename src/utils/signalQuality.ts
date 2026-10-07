export type SignalTone = 'good' | 'ok' | 'bad';

/** Зелёный — хороший, жёлтый — нормальный, красный — плохой сигнал. */
export function signalTone(rssi: number): SignalTone {
  if (rssi >= -65) return 'good';
  if (rssi >= -78) return 'ok';
  return 'bad';
}

export function signalTextClass(rssi: number): string {
  const tone = signalTone(rssi);
  if (tone === 'good') return 'text-emerald-400';
  if (tone === 'ok') return 'text-amber-400';
  return 'text-red-400';
}

export function signalBarClass(rssi: number): string {
  const tone = signalTone(rssi);
  if (tone === 'good') return 'bg-emerald-400';
  if (tone === 'ok') return 'bg-amber-400';
  return 'bg-red-500';
}

export function signalLabel(rssi: number): string {
  const tone = signalTone(rssi);
  if (tone === 'good') return 'Хороший сигнал';
  if (tone === 'ok') return 'Нормальный сигнал';
  return 'Плохой сигнал';
}

export function signalBadgeClass(rssi: number): string {
  const tone = signalTone(rssi);
  if (tone === 'good') return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
  if (tone === 'ok') return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
  return 'bg-red-500/20 border-red-500/30 text-red-400';
}

export function signalSvgFill(rssi: number): string {
  const tone = signalTone(rssi);
  if (tone === 'good') return '#34d399';
  if (tone === 'ok') return '#fbbf24';
  return '#f87171';
}

export function rssiToPercent(rssi: number): number {
  if (rssi <= -100) return 0;
  if (rssi >= -50) return 100;
  return Math.round(2 * (rssi + 100));
}
