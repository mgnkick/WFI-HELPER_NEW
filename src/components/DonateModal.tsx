import React, { useState } from 'react';
import { Heart, CreditCard, Copy, Check, X, Sparkles, ShieldCheck } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SBER_CARD_NUMBER = '5336690304351846';
export const SBER_CARD_FORMATTED = '5336 6903 0435 1846';

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(SBER_CARD_NUMBER);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = SBER_CARD_NUMBER;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Heart className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                Поддержать автора
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Благодарность за развитие приложения
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card display */}
        <div className="relative my-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Сбербанк
              </span>
            </div>
            <CreditCard className="w-5 h-5 text-emerald-400/80" />
          </div>

          <div className="mb-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Номер карты
            </span>
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white select-all">
              {SBER_CARD_FORMATTED}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              copied
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-emerald-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Номер карты скопирован!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Скопировать номер карты</span>
              </>
            )}
          </button>
        </div>

        {/* Description */}
        <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
          <p className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Перевод можно совершить в приложении «СберБанк Онлайн» или через любой банк по номеру карты.
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            Любая сумма помогает поддерживать работу приложения, оплачивать сервера и добавлять полезные функции. Большое спасибо за поддержку!
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
