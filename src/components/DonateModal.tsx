import React, { useState } from 'react';
import { Heart, CreditCard, Copy, Check, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SBER_CARD_NUMBER = '5336690304351846';
export const SBER_CARD_FORMATTED = '5336 6903 0435 1846';

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const { isDark, cardBg, btnOutlineSm, btnActive, btnOutline } = useTheme();
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
      isDark ? 'bg-black/75' : 'bg-black/40'
    }`}>
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className={`relative w-full max-w-md ${cardBg} rounded-3xl p-6 shadow-2xl z-10 overflow-hidden transition-colors`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 relative">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isDark ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-900 border-zinc-900 text-white'
            }`}>
              <Heart className="w-5 h-5 fill-current stroke-[2.5]" />
            </div>
            <div>
              <h3 className={`font-bold text-base flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Поддержать автора
                <Sparkles className="w-3.5 h-3.5" />
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Благодарность за развитие приложения
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={btnOutlineSm}
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card display */}
        <div className={`relative my-4 p-5 rounded-2xl border ${
          isDark ? 'bg-zinc-950 border-white/30 text-white' : 'bg-zinc-50 border-zinc-900/30 text-zinc-900'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-zinc-900'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Сбербанк
              </span>
            </div>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>

          <div className="mb-4">
            <span className={`text-[10px] uppercase tracking-wider block mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Номер карты
            </span>
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider select-all">
              {SBER_CARD_FORMATTED}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 px-4 ${btnActive} text-xs`}
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
        <div className={`space-y-2 text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <p className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Перевод можно совершить в приложении «СберБанк Онлайн» или через любой банк по номеру карты.
            </span>
          </p>
          <p className="text-[11px] opacity-80">
            Любая сумма помогает поддерживать работу приложения, оплачивать сервера и добавлять полезные функции. Большое спасибо за поддержку!
          </p>
        </div>

        {/* Close Button */}
        <div className={`mt-5 pt-4 border-t flex justify-end ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={onClose}
            className={btnOutlineSm}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
