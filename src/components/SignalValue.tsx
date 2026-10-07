import React from 'react';
import { signalLabel, signalTextClass } from '../utils/signalQuality';

interface SignalValueProps {
  rssi: number;
  percent?: number;
  className?: string;
}

export const SignalValue: React.FC<SignalValueProps> = ({ rssi, percent, className = '' }) => {
  return (
    <span
      className={`font-mono font-bold ${signalTextClass(rssi)} ${className}`}
      title={signalLabel(rssi)}
    >
      {rssi} дБм{typeof percent === 'number' ? ` (${percent}%)` : ''}
    </span>
  );
};
