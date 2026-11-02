import React, { useState } from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking, playTactileClick } from '../utils/audio';
import { Language } from '../types';

interface AudioAssistantBarProps {
  textToSpeak: string;
  transcriptLabel: string;
  language: Language;
}

export const AudioAssistantBar: React.FC<AudioAssistantBarProps> = ({
  textToSpeak,
  transcriptLabel,
  language,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeak = () => {
    playTactileClick();
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(
        textToSpeak,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  return (
    <div className="w-full bg-neutral-900 border-2 border-yellow-400/90 rounded-2xl p-2.5 shadow-lg shadow-yellow-500/10 mb-4 transition-all">
      <div className="flex items-center gap-3">
        {/* Giant high-contrast pulse button */}
        <button
          onClick={handleToggleSpeak}
          type="button"
          aria-label={isPlaying ? 'Detener voz' : 'Escuchar en voz alta'}
          className={`shrink-0 min-h-[54px] min-w-[54px] px-3.5 py-2.5 rounded-xl flex items-center justify-center font-bold text-base transition-all active:scale-95 shadow-md ${
            isPlaying
              ? 'bg-red-500 text-white animate-pulse border-2 border-white'
              : 'bg-amber-400 text-black hover:bg-amber-300 border-2 border-amber-300'
          }`}
        >
          {isPlaying ? (
            <div className="flex items-center gap-1.5 font-bold">
              <Square className="w-6 h-6 fill-current" />
              <span className="text-sm font-extrabold tracking-wide uppercase">PARAR</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-bold">
              <Volume2 className="w-6 h-6 animate-bounce" />
              <span className="text-sm font-extrabold tracking-wide uppercase">
                {language === 'ES' ? 'ESCUCHAR' : 'ALLKÜTUN'}
              </span>
            </div>
          )}
        </button>

        {/* Live speech transcription text */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{language === 'ES' ? 'ASISTENTE DE VOZ RURAL' : 'DUNGUN KÜZAW (VOZ)'}</span>
          </div>
          <p className="text-sm text-neutral-100 font-medium truncate mt-0.5 leading-snug">
            "{transcriptLabel}"
          </p>
        </div>
      </div>
    </div>
  );
};
