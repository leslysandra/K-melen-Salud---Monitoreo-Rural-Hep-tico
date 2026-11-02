import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Target } from 'lucide-react';
import { Language, UserMode, StoolFrequency } from '../types';
import { playTactileClick, playSuccessChime, playWarningBeep, speakText, stopSpeaking } from '../utils/audio';

interface Step2StoolsProps {
  onSelect: (stools: StoolFrequency) => void;
  onBack: () => void;
  language: Language;
  userMode: UserMode;
  currentValue?: StoolFrequency;
}

export const Step2Stools: React.FC<Step2StoolsProps> = ({
  onSelect,
  onBack,
  language,
  userMode,
  currentValue,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const question = language === 'MAP'
    ? '¿Tunten rupa amuymi baño mew fachantü?'
    : userMode === 'CAREGIVER'
    ? '¿Cuántas veces fue al baño la Sra. Rosa hoy?'
    : '¿Cuántas veces fue al baño hoy?';

  const targetNote = language === 'MAP'
    ? 'Meta ideal: Epu kam küla rupa (2 a 3 veces)'
    : 'Meta ideal con jarabe: 2 a 3 veces al día';

  const handleReadQuestion = () => {
    playTactileClick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = language === 'MAP'
      ? `${question}. Meta ideal epu kam küla rupa.`
      : `${question}. La meta ideal con su jarabe es de 2 a 3 veces al día. Elija una de las cuatro opciones.`;

    speakText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleChoice = (stools: StoolFrequency) => {
    playTactileClick();
    if (stools === '2-3') {
      playSuccessChime();
      speakText(language === 'MAP' ? 'Epu kam küla rupa. Kümelen.' : 'Marcado: 2 a 3 veces. Meta ideal con su jarabe.');
    } else if (stools === '0') {
      playWarningBeep();
      speakText(language === 'MAP' ? 'Chem no rume. Kuñiwtunge.' : 'Marcado: Ninguna vez. Riesgo de acumular toxinas.');
    } else {
      playWarningBeep();
      speakText(stools === '1' ? 'Marcado: Una sola vez. Puede ser insuficiente.' : 'Marcado: Cuatro o más veces. Recuerde beber agua.');
    }
    setTimeout(() => {
      onSelect(stools);
    }, 450);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 px-1 animate-in fade-in duration-200">
      {/* Top Header del Wizard */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
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
          Paso 2 de 3
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

      {/* Pregunta Central y Píldora Informativa */}
      <div className="my-auto py-2 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {question}
        </h2>

        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-3 py-1 text-xs font-semibold">
          <Target className="w-3.5 h-3.5 text-blue-700 shrink-0" strokeWidth={2.2} />
          <span>{targetNote}</span>
        </div>
      </div>

      {/* Cuadrícula 2x2 de tarjetas limpias */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        {/* 1. Cero veces */}
        <button
          onClick={() => handleChoice('0')}
          type="button"
          className={`rounded-2xl p-4 border-2 text-center flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm min-h-[120px] ${
            currentValue === '0'
              ? 'bg-red-100 border-red-500 ring-2 ring-red-500/20'
              : 'bg-red-50/50 hover:bg-red-50 border-red-200'
          }`}
        >
          <span className="text-3xl font-black text-red-900 leading-none">0</span>
          <span className="text-sm font-bold text-red-950 mt-1 block">
            {language === 'MAP' ? 'Chem no rume' : 'Ninguna vez'}
          </span>
          <span className="text-[11px] font-medium text-red-700 mt-0.5 block">
            Riesgo estreñimiento
          </span>
        </button>

        {/* 2. 1 sola vez */}
        <button
          onClick={() => handleChoice('1')}
          type="button"
          className={`rounded-2xl p-4 border-2 text-center flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm min-h-[120px] ${
            currentValue === '1'
              ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-amber-50/50 hover:bg-amber-50 border-amber-200'
          }`}
        >
          <span className="text-3xl font-black text-amber-900 leading-none">1</span>
          <span className="text-sm font-bold text-amber-950 mt-1 block">
            {language === 'MAP' ? 'Kiñe rupa' : '1 sola vez'}
          </span>
          <span className="text-[11px] font-medium text-amber-700 mt-0.5 block">
            Poco efecto
          </span>
        </button>

        {/* 3. 2 a 3 veces (Meta Ideal) */}
        <button
          onClick={() => handleChoice('2-3')}
          type="button"
          className={`rounded-2xl p-4 border-2 text-center flex flex-col items-center justify-center transition-all active:scale-95 shadow-md min-h-[125px] relative ${
            currentValue === '2-3'
              ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500/30'
              : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/10'
          }`}
        >
          <span className="absolute -top-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
            Meta Ideal
          </span>
          <span className="text-3xl font-black text-emerald-900 leading-none">2 - 3</span>
          <span className="text-sm font-bold text-emerald-950 mt-1 block">
            {language === 'MAP' ? 'Epu kam küla' : '2 a 3 veces'}
          </span>
          <span className="text-[11px] font-medium text-emerald-700 mt-0.5 block">
            Dosis correcta
          </span>
        </button>

        {/* 4. 4 o más veces */}
        <button
          onClick={() => handleChoice('4+')}
          type="button"
          className={`rounded-2xl p-4 border-2 text-center flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm min-h-[120px] ${
            currentValue === '4+'
              ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-amber-50/50 hover:bg-amber-50 border-amber-300'
          }`}
        >
          <span className="text-3xl font-black text-amber-900 leading-none">4+</span>
          <span className="text-sm font-bold text-amber-950 mt-1 block">
            {language === 'MAP' ? 'Meli kam doy' : '4 o más veces'}
          </span>
          <span className="text-[11px] font-medium text-amber-700 mt-0.5 block">
            Riesgo deshidratación
          </span>
        </button>
      </div>
    </div>
  );
};
