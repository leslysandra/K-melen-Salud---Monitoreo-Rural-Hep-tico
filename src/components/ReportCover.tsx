import React, { useState } from 'react';
import { Heart, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { DailyRecord, Language, UserMode } from '../types';
import { playTactileClick, speakText, stopSpeaking } from '../utils/audio';

interface ReportCoverProps {
  onStartWizard: () => void;
  lastRecord?: DailyRecord;
  language: Language;
  userMode: UserMode;
}

export const ReportCover: React.FC<ReportCoverProps> = ({
  onStartWizard,
  lastRecord,
  language,
  userMode,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const greeting = language === 'MAP'
    ? 'Mari mari'
    : userMode === 'PATIENT'
    ? 'Buenos días, Sra. Rosa'
    : 'Buenos días, Marta';

  const subtitle = language === 'MAP'
    ? '¿Chumleymi fachantü?'
    : '¿Cómo se siente hoy?';

  const lastStatusText = lastRecord
    ? `${lastRecord.dayLabel} · ${
        lastRecord.riskLevel === 'GREEN'
          ? 'Estable (Sin molestias)'
          : lastRecord.riskLevel === 'YELLOW'
          ? 'En observación'
          : 'Alerta médica'
      }`
    : 'Ayer, 09:30 AM (Sin molestias)';

  const handleReadLastReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = language === 'MAP'
      ? `Mari mari. Tami küme mongen: ${lastStatusText}. Llitunge küzaw.`
      : `Buenos días. Último reporte registrado: ${lastStatusText}. Para iniciar el chequeo diario de hoy, presione el círculo central.`;
    
    speakText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 px-2 text-center animate-in fade-in duration-200">
      {/* 1. Saludo grande, cálido y centrado */}
      <div className="pt-2">
        <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight leading-tight">
          {greeting}
        </h2>
        <p className="text-slate-600 text-lg font-medium mt-1">
          {subtitle}
        </p>
      </div>

      {/* 2. Botón Circular Central Gigante */}
      <div className="my-auto py-4 flex justify-center">
        <button
          onClick={() => {
            playTactileClick();
            onStartWizard();
          }}
          type="button"
          aria-label="Empezar reporte diario"
          className="w-60 h-60 rounded-full bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-600/30 flex flex-col items-center justify-center active:scale-95 transition-all hover:from-blue-500 hover:to-blue-700 select-none group"
        >
          <Heart className="w-14 h-14 mb-3 text-white group-hover:scale-110 transition-transform" strokeWidth={2.2} />
          <span className="text-xl font-bold text-center px-4 leading-snug">
            {language === 'MAP' ? 'Llitun Küzaw' : 'Empezar Reporte Diario'}
          </span>
          <span className="bg-white/20 text-white rounded-full px-3 py-1 text-xs font-semibold mt-2 backdrop-blur-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'MAP' ? 'Tukunge kuwü' : 'Toca para iniciar'}</span>
          </span>
        </button>
      </div>

      {/* 3. Tarjeta Inferior de Último Reporte con Botón de Voz */}
      <div className="bg-slate-50 border-l-4 border-emerald-600 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 text-left mb-2">
        <div className="pr-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            {language === 'MAP' ? 'Rupachi Küzaw' : 'ÚLTIMO REPORTE'}
          </span>
          <span className="text-sm font-semibold text-slate-800 block mt-0.5">
            {lastStatusText}
          </span>
        </div>

        <button
          onClick={handleReadLastReport}
          type="button"
          aria-label={isSpeaking ? 'Detener lectura en voz alta' : 'Escuchar reporte en español de Chile'}
          title={isSpeaking ? 'Detener voz' : 'Escuchar en voz alta (Español de Chile)'}
          className={`w-12 h-12 rounded-full shadow-md border flex items-center justify-center active:scale-95 shrink-0 transition-all ${
            isSpeaking
              ? 'bg-red-500 text-white border-red-600 animate-pulse'
              : 'bg-white hover:bg-blue-50 text-blue-700 border-slate-200'
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-6 h-6" strokeWidth={2.2} />
          ) : (
            <Volume2 className="w-6 h-6" strokeWidth={2.2} />
          )}
        </button>
      </div>
    </div>
  );
};
