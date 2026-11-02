import React, { useState } from 'react';
import { Calendar, Volume2, Check, AlertTriangle, ShieldCheck, Cloud, Smartphone, HelpCircle } from 'lucide-react';
import { DailyRecord, AscitesRecord, Language } from '../types';
import { playTactileClick, playSuccessChime, playWarningBeep, speakText } from '../utils/audio';

interface MiSemanaTabProps {
  records: DailyRecord[];
  ascitesStatus: AscitesRecord;
  onUpdateAscites: (status: 'EQUAL_BETTER' | 'MORE_SWOLLEN') => void;
  language: Language;
}

export const MiSemanaTab: React.FC<MiSemanaTabProps> = ({
  records,
  ascitesStatus,
  onUpdateAscites,
  language,
}) => {
  const [ascitesFeedback, setAscitesFeedback] = useState<string | null>(null);

  // Take the last 7 days
  const last7Days = records.slice(0, 7);

  const ascitesQuestion = language === 'ES'
    ? '¿Siente los tobillos o el abdomen (guatita) más hinchados esta semana?'
    : '¿Doy wentruy tami namun kam tami pütra fachantü küyen mew?';

  const handleAscitesVoice = () => {
    playTactileClick();
    speakText(ascitesQuestion);
  };

  const handleAscitesChoice = (status: 'EQUAL_BETTER' | 'MORE_SWOLLEN') => {
    playTactileClick();
    if (status === 'EQUAL_BETTER') {
      playSuccessChime();
      speakText(
        language === 'ES'
          ? 'Registrado: Tobillos y abdomen sin hinchazón nueva. Buen control de líquidos.'
          : 'Kümelen tami namun. Küme amuy.'
      );
      setAscitesFeedback(language === 'ES' ? '✅ Sin edema nuevo registrado' : '✅ Kümelen namun');
    } else {
      playWarningBeep();
      speakText(
        language === 'ES'
          ? 'Registrado: Tobillos o guatita más hinchados. Se alertará en el Pase Posta para evaluar retención de líquido.'
          : 'Mülelay küme newen. Küzaw tami namun.'
      );
      setAscitesFeedback(language === 'ES' ? '⚠️ Alerta de líquido agregada al Pase' : '⚠️ Kuñiwtunge');
    }
    onUpdateAscites(status);
    setTimeout(() => setAscitesFeedback(null), 3500);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Weekly Ascites Check Card (Once per week low fatigue) */}
      <div className="bg-neutral-900 border-2 border-yellow-400/80 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950 border border-yellow-400 text-yellow-300 font-mono text-xs font-black">
            <span>🦵🏽 CHEQUEO SEMANAL · ASCITIS / LÍQUIDO</span>
          </div>
          <button
            onClick={handleAscitesVoice}
            type="button"
            className="min-h-[36px] px-2.5 rounded-lg bg-yellow-400 text-black font-extrabold text-xs flex items-center gap-1 active:scale-95 shadow"
            title="Escuchar pregunta en voz alta"
          >
            <Volume2 className="w-4 h-4" />
            <span>ESCUCHAR</span>
          </button>
        </div>

        <h3 className="text-xl font-black text-white leading-snug">
          {ascitesQuestion}
        </h3>
        <p className="text-xs text-neutral-300 mt-1">
          {language === 'ES'
            ? 'Monitoreo de retención de agua y sal (edema en piernas o líquido en el abdomen).'
            : 'Allkütunge tami ancaküyen ka namun.'}
        </p>

        {ascitesFeedback && (
          <div className="my-2 p-2 bg-neutral-800 rounded-xl text-center text-xs font-bold text-yellow-300 border border-yellow-500/50 animate-in fade-in">
            {ascitesFeedback}
          </div>
        )}

        {/* 2 Big Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-3">
          <button
            onClick={() => handleAscitesChoice('EQUAL_BETTER')}
            type="button"
            className={`min-h-[60px] p-2.5 rounded-2xl font-black text-xs sm:text-sm text-center flex flex-col items-center justify-center border-2 transition-all active:scale-95 shadow-md ${
              ascitesStatus.status === 'EQUAL_BETTER'
                ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-600'
            }`}
          >
            <div className="text-xl mb-0.5">✅😊</div>
            <span>{language === 'ES' ? 'NO, IGUAL O MEJOR' : 'FEMLAY, KÜMELEN'}</span>
            <span className="text-[10px] font-normal text-emerald-200 mt-0.5">Sin hinchazón</span>
          </button>

          <button
            onClick={() => handleAscitesChoice('MORE_SWOLLEN')}
            type="button"
            className={`min-h-[60px] p-2.5 rounded-2xl font-black text-xs sm:text-sm text-center flex flex-col items-center justify-center border-2 transition-all active:scale-95 shadow-md ${
              ascitesStatus.status === 'MORE_SWOLLEN'
                ? 'bg-amber-500 text-black border-white ring-2 ring-amber-400'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-600'
            }`}
          >
            <div className="text-xl mb-0.5">⚠️🦵🏽</div>
            <span>{language === 'ES' ? 'SÍ, MÁS HINCHADO' : 'MAY, KÜZAWTOY'}</span>
            <span className="text-[10px] font-normal text-amber-200 mt-0.5">Retención de líquido</span>
          </button>
        </div>
      </div>

      {/* 7-Day Visual History Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>HISTORIAL DE LOS ÚLTIMOS 7 DÍAS</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono">
          {last7Days.length} días cargados
        </span>
      </div>

      {/* 7-Day History Cards List */}
      <div className="space-y-2.5">
        {last7Days.map((record, index) => {
          const isRed = record.riskLevel === 'RED';
          const isYellow = record.riskLevel === 'YELLOW';
          const isGreen = record.riskLevel === 'GREEN';

          return (
            <div
              key={record.id}
              className={`p-3.5 rounded-2xl border-2 transition-all bg-neutral-900 shadow-md ${
                isRed
                  ? 'border-rose-500/80 bg-rose-950/20'
                  : isYellow
                  ? 'border-amber-400/80 bg-amber-950/20'
                  : 'border-emerald-500/60 bg-emerald-950/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    isRed ? 'bg-rose-500' : isYellow ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className="font-bold text-sm text-white">
                    {index === 0 ? 'Hoy' : record.dayLabel}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    ({record.date})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {record.syncStatus === 'SYNCED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      <Cloud className="w-3 h-3 text-cyan-400" />
                      <span>CESFAM</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      <Smartphone className="w-3 h-3 text-amber-400" />
                      <span>Teléfono</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Day metrics summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-neutral-800">
                <div className="bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Jarabe</span>
                  <span className="font-extrabold text-neutral-200">
                    {record.lactuloseTaken ? '💊 Sí' : '❌ No'}
                  </span>
                </div>

                <div className="bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Baño</span>
                  <span className={`font-extrabold ${record.stoolFrequency === '2-3' ? 'text-emerald-400' : 'text-amber-300'}`}>
                    🚽 {record.stoolFrequency} veces
                  </span>
                </div>

                <div className="bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Cabeza/Manos</span>
                  <span className="font-extrabold text-neutral-200 truncate block">
                    {record.neurologicalState === 'CLEAR'
                      ? '😊 Claro'
                      : record.neurologicalState === 'DROWSY'
                      ? '😴 Sueño'
                      : '😵‍💫 Confuso'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
