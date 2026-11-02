import React from 'react';
import { Globe, User, Users, Wifi, WifiOff } from 'lucide-react';
import { Language, UserMode } from '../types';
import { playTactileClick } from '../utils/audio';

interface TopStatusBarProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  userMode: UserMode;
  onToggleUserMode: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onSetLanguage?: (lang: Language) => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  isOnline,
  onToggleOnline,
  userMode,
  onToggleUserMode,
  language,
  onToggleLanguage,
  onSetLanguage,
}) => {
  return (
    <header className="px-5 pt-5 pb-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2 select-none">
      {/* 1. Bilingual Pill: Explicit ESP and MAP options */}
      <button
        onClick={() => {
          playTactileClick();
          onToggleLanguage();
        }}
        type="button"
        title="Cambiar idioma entre Español (ESP) y Mapuzungun (MAP)"
        className="bg-slate-100 hover:bg-slate-200/90 text-slate-700 rounded-full py-1 pl-2 pr-1.5 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-slate-200 shadow-2xs"
      >
        <Globe className="w-3.5 h-3.5 text-blue-700 shrink-0" strokeWidth={2.2} />
        <span className="inline-flex items-center gap-0.5 tracking-tight font-extrabold text-[11px]">
          <span
            onClick={(e) => {
              if (onSetLanguage && language !== 'ES') {
                e.stopPropagation();
                playTactileClick();
                onSetLanguage('ES');
              }
            }}
            className={`px-1.5 py-0.5 rounded-full transition-all ${
              language === 'ES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ESP
          </span>
          <span className="text-slate-300 font-normal select-none">/</span>
          <span
            onClick={(e) => {
              if (onSetLanguage && language !== 'MAP') {
                e.stopPropagation();
                playTactileClick();
                onSetLanguage('MAP');
              }
            }}
            className={`px-1.5 py-0.5 rounded-full transition-all ${
              language === 'MAP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            MAP
          </span>
        </span>
      </button>

      {/* 2. Center Title: Araucanía Salud + Offline/Online state indicator */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-blue-700 font-extrabold text-lg leading-tight tracking-tight">
          Araucanía Salud
        </h1>
        {/* Discrete clickable connection indicator */}
        <button
          onClick={() => {
            playTactileClick();
            onToggleOnline();
          }}
          type="button"
          title="Tocar para simular conexión con CESFAM"
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-blue-700 transition-colors mt-0.5"
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isOnline ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="truncate max-w-[130px]">
            {isOnline ? 'Sincronizado CESFAM' : 'Guardado en teléfono'}
          </span>
        </button>
      </div>

      {/* 3. Role Selector Pill: Paciente / Cuidador */}
      <button
        onClick={() => {
          playTactileClick();
          onToggleUserMode();
        }}
        type="button"
        title="Cambiar entre modo Paciente y Cuidador"
        className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-blue-100"
      >
        {userMode === 'PATIENT' ? (
          <>
            <User className="w-3.5 h-3.5 text-blue-700" strokeWidth={2.2} />
            <span>Rosa</span>
          </>
        ) : (
          <>
            <Users className="w-3.5 h-3.5 text-blue-700" strokeWidth={2.2} />
            <span>Marta</span>
          </>
        )}
      </button>
    </header>
  );
};
