import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, CheckCircle2, XCircle } from 'lucide-react';
import { Language, UserMode } from '../types';
import { playTactileClick, playSuccessChime, playWarningBeep, speakText, stopSpeaking } from '../utils/audio';

interface Step1MedicationProps {
  onSelect: (taken: boolean) => void;
  onBack: () => void;
  language: Language;
  userMode: UserMode;
  currentValue?: boolean;
}

export const Step1Medication: React.FC<Step1MedicationProps> = ({
  onSelect,
  onBack,
  language,
  userMode,
  currentValue,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const question = language === 'MAP'
    ? '¿Pütokoymi tami lawen (Lactulosa) fachantü?'
    : userMode === 'CAREGIVER'
    ? '¿La Sra. Rosa tomó su jarabe (Lactulosa) y remedios hoy?'
    : '¿Tomó su jarabe (Lactulosa) y remedios hoy?';

  const note = language === 'MAP'
    ? 'Lifeltuy tami mongen ka kuñiwtukuy tami longko.'
    : 'Ayuda a eliminar toxinas y proteger su memoria.';

  const handleReadQuestion = () => {
    playTactileClick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = language === 'MAP'
      ? `${question}. ${note}.`
      : `${question}. ${note}. Toque verde para sí, o rojo para no.`;

    speakText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleChoice = (taken: boolean) => {
    playTactileClick();
    if (taken) {
      playSuccessChime();
      speakText(language === 'MAP' ? 'May, pütokoymi tami lawen.' : 'Marcado: Sí, ya lo tomé. Muy bien.');
    } else {
      playWarningBeep();
      speakText(language === 'MAP' ? 'Femlan, pütokolaymi.' : 'Marcado: No pude tomarlo.');
    }
    setTimeout(() => {
      onSelect(taken);
    }, 450);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 px-1 animate-in fade-in duration-200">
      {/* Top Header del Wizard */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <button
          onClick={() => {
            playTactileClick();
            onBack();
          }}
          type="button"
          aria-label="Volver"
          className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
        </button>

        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {language === 'MAP' ? 'Paso 1 de 3' : 'Paso 1 de 3'}
        </span>

        <button
          onClick={handleReadQuestion}
          type="button"
          aria-label={isSpeaking ? 'Detener voz' : 'Escuchar pregunta en español de Chile'}
          title={isSpeaking ? 'Detener voz' : 'Escuchar pregunta (Español de Chile)'}
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            isSpeaking
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-5 h-5" strokeWidth={2.2} />
          ) : (
            <Volume2 className="w-5 h-5" strokeWidth={2.2} />
          )}
        </button>
      </div>

      {/* Pregunta Central y Nota */}
      <div className="my-auto py-3 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {question}
        </h2>
        <p className="text-slate-600 font-medium text-base mt-2 max-w-xs mx-auto">
          {note}
        </p>
      </div>

      {/* 2 Tarjetas Grandes y Limpias */}
      <div className="space-y-3.5 pb-2">
        {/* Opción 1: SÍ */}
        <button
          onClick={() => handleChoice(true)}
          type="button"
          className={`w-full rounded-2xl p-5 border-2 flex items-center justify-between transition-all active:scale-98 shadow-sm ${
            currentValue === true
              ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-emerald-50/80 hover:bg-emerald-100/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3.5 text-left">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" strokeWidth={2.2} />
            <div>
              <span className="text-xl font-bold text-emerald-950 block leading-tight">
                {language === 'MAP' ? 'May, pütokon' : 'Sí, ya lo tomé'}
              </span>
              <span className="text-xs font-medium text-emerald-700 mt-0.5 block">
                {language === 'MAP' ? 'Pütokon tañi lawen' : 'Remedio y jarabe al día'}
              </span>
            </div>
          </div>
          <span className="text-emerald-700 font-bold text-sm">➔</span>
        </button>

        {/* Opción 2: NO */}
        <button
          onClick={() => handleChoice(false)}
          type="button"
          className={`w-full rounded-2xl p-5 border-2 flex items-center justify-between transition-all active:scale-98 shadow-sm ${
            currentValue === false
              ? 'bg-red-100/90 border-red-500 ring-2 ring-red-500/20'
              : 'bg-red-50/80 hover:bg-red-100/60 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3.5 text-left">
            <XCircle className="w-9 h-9 text-red-600 shrink-0" strokeWidth={2.2} />
            <div>
              <span className="text-xl font-bold text-red-950 block leading-tight">
                {language === 'MAP' ? 'Femlan, pütokolan' : 'No pude tomarlo'}
              </span>
              <span className="text-xs font-medium text-red-700 mt-0.5 block">
                {language === 'MAP' ? 'Pütokolan lawen' : 'Se acabó, náuseas u olvido'}
              </span>
            </div>
          </div>
          <span className="text-red-700 font-bold text-sm">➔</span>
        </button>
      </div>
    </div>
  );
};
