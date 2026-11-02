import React, { useState } from 'react';
import { Volume2, VolumeX, CheckCircle2, AlertTriangle, Cloud, Smartphone, Calendar, AlertCircle } from 'lucide-react';
import { DailyRecord, AscitesRecord, Language } from '../types';
import { playTactileClick, playSuccessChime, playWarningBeep, speakText, stopSpeaking } from '../utils/audio';

interface AlertasTabProps {
  records: DailyRecord[];
  ascitesStatus: AscitesRecord;
  onUpdateAscites: (status: 'EQUAL_BETTER' | 'MORE_SWOLLEN') => void;
  language: Language;
}

export const AlertasTab: React.FC<AlertasTabProps> = ({
  records,
  ascitesStatus,
  onUpdateAscites,
  language,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const last7Days = records.slice(0, 7);

  const ascitesQuestion = language === 'MAP'
    ? '¿Doy wentruy tami namun kam tami pütra fachantü küyen mew?'
    : '¿Siente los tobillos o el abdomen más hinchados esta semana?';

  const handleReadAscites = () => {
    playTactileClick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = `${ascitesQuestion}. Monitoreo de retención de líquido o ascitis.`;
    speakText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleAscitesChoice = (status: 'EQUAL_BETTER' | 'MORE_SWOLLEN') => {
    playTactileClick();
    if (status === 'EQUAL_BETTER') {
      playSuccessChime();
      speakText('Registrado: Sin edema ni hinchazón nueva.');
      setFeedback('Sin hinchazón nueva registrada.');
    } else {
      playWarningBeep();
      speakText('Registrado: Hinchazón aumentada. Alerta añadida al Pase Médico.');
      setFeedback('Alerta de líquido añadida al Pase Médico.');
    }
    onUpdateAscites(status);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 px-1 space-y-3.5 overflow-y-auto">
      {/* 1. Tarjeta de Chequeo Semanal de Ascitis */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
            Chequeo Semanal · Retención de Líquido
          </span>

          <button
            onClick={handleReadAscites}
            type="button"
            aria-label={isSpeaking ? 'Detener voz' : 'Escuchar pregunta en español de Chile'}
            title={isSpeaking ? 'Detener voz' : 'Escuchar pregunta (Español de Chile)'}
            className={`w-8 h-8 rounded-full shadow-xs border flex items-center justify-center active:scale-95 transition-all ${
              isSpeaking
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" strokeWidth={2.2} />
            ) : (
              <Volume2 className="w-4 h-4" strokeWidth={2.2} />
            )}
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {ascitesQuestion}
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Detección temprana de ascitis y edema en piernas o abdomen.
        </p>

        {feedback && (
          <div className="my-2 p-2 bg-white rounded-xl text-center text-xs font-semibold text-amber-800 border border-amber-200 animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* 2 Botones limpios de respuesta */}
        <div className="grid grid-cols-2 gap-2.5 pt-2.5">
          <button
            onClick={() => handleAscitesChoice('EQUAL_BETTER')}
            type="button"
            className={`min-h-[50px] p-2 rounded-2xl font-bold text-xs flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xs ${
              ascitesStatus.status === 'EQUAL_BETTER'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>No, sin hinchazón</span>
            <span className={`text-[10px] font-normal ${ascitesStatus.status === 'EQUAL_BETTER' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Líquido bajo control
            </span>
          </button>

          <button
            onClick={() => handleAscitesChoice('MORE_SWOLLEN')}
            type="button"
            className={`min-h-[50px] p-2 rounded-2xl font-bold text-xs flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xs ${
              ascitesStatus.status === 'MORE_SWOLLEN'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>Sí, más hinchado</span>
            <span className={`text-[10px] font-normal ${ascitesStatus.status === 'MORE_SWOLLEN' ? 'text-amber-100' : 'text-slate-500'}`}>
              Tobillos o guatita
            </span>
          </button>
        </div>
      </div>

      {/* 2. Lista Limpia de Historial de los Últimos 7 Días */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-700" strokeWidth={2.2} />
            <span>Últimos 7 Días Registrados</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {last7Days.length} días
          </span>
        </div>

        <div className="space-y-2">
          {last7Days.map((record, index) => {
            const isRed = record.riskLevel === 'RED';
            const isYellow = record.riskLevel === 'YELLOW';

            return (
              <div
                key={record.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      isRed ? 'bg-red-500' : isYellow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800">
                        {index === 0 ? 'Hoy' : record.dayLabel}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({record.date})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                      <span>Jarabe: {record.lactuloseTaken ? 'Sí' : 'No'}</span>
                      <span>·</span>
                      <span>Baño: {record.stoolFrequency} veces</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {record.syncStatus === 'SYNCED' ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Cloud className="w-3 h-3" strokeWidth={2.2} />
                      <span>CESFAM</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" strokeWidth={2.2} />
                      <span>Teléfono</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
