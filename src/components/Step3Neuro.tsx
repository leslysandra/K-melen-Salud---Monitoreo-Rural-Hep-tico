import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Smile, Moon, AlertCircle, Play } from 'lucide-react';
import { Language, UserMode, NeuroState } from '../types';
import { playTactileClick, playSuccessChime, playWarningBeep, playAlertSiren, speakText, stopSpeaking } from '../utils/audio';

interface Step3NeuroProps {
  onSelect: (state: NeuroState) => void;
  onBack: () => void;
  onOpenMiniTest: () => void;
  language: Language;
  userMode: UserMode;
  currentValue?: NeuroState;
  miniTestResult?: { avgReactionMs: number; missedClicks: number };
}

export const Step3Neuro: React.FC<Step3NeuroProps> = ({
  onSelect,
  onBack,
  onOpenMiniTest,
  language,
  userMode,
  currentValue,
  miniTestResult,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const question = language === 'MAP'
    ? '¿Chumley tami longko ka tami kuwü fachantü?'
    : userMode === 'CAREGIVER'
    ? '¿Cómo siente la mente y las manos la Sra. Rosa hoy?'
    : '¿Cómo siente su mente y el pulso de sus manos hoy?';

  const handleReadQuestion = () => {
    playTactileClick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = language === 'MAP'
      ? `${question}. Mente clara, mucho sueño, kam desorientado.`
      : `${question}. Toque la opción que mejor describa su estado de hoy: mente clara, mucho sueño de día, o desorientado.`;

    speakText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleChoice = (state: NeuroState) => {
    playTactileClick();
    if (state === 'CLEAR') {
      playSuccessChime();
      speakText(language === 'MAP' ? 'Küme longko. Kümelen.' : 'Marcado: Mente clara y manos firmes.');
    } else if (state === 'DROWSY') {
      playWarningBeep();
      speakText(language === 'MAP' ? 'Umawtulen.' : 'Marcado: Mucho sueño de día o lento.');
    } else {
      playAlertSiren();
      speakText(language === 'MAP' ? 'Goyman kam tremor kuwü mew.' : 'Marcado: Desorientado o temblor en las manos.');
    }
    setTimeout(() => {
      onSelect(state);
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
          Paso 3 de 3
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

      {/* Pregunta Central */}
      <div className="my-auto py-2 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {question}
        </h2>
        <p className="text-slate-600 font-medium text-sm mt-1.5">
          Pesquisa precoz de encefalopatía hepática y reflejos.
        </p>
      </div>

      {/* 3 Tarjetas limpias de ancho completo */}
      <div className="space-y-2.5 pb-2">
        {/* 1. Mente clara */}
        <button
          onClick={() => handleChoice('CLEAR')}
          type="button"
          className={`w-full rounded-2xl p-3.5 border-2 flex items-center justify-between text-left transition-all active:scale-98 shadow-sm ${
            currentValue === 'CLEAR'
              ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-emerald-50/80 hover:bg-emerald-100/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
              <Smile className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-base font-bold text-emerald-950 block leading-tight">
                {language === 'MAP' ? 'Mente clara (Küme longko)' : 'Mente clara y manos firmes'}
              </span>
              <span className="text-xs text-emerald-700 font-medium block mt-0.5">
                Despejado, buena memoria y pulso firme
              </span>
            </div>
          </div>
          <span className="text-emerald-700 font-bold text-sm">➔</span>
        </button>

        {/* 2. Drowsy */}
        <button
          onClick={() => handleChoice('DROWSY')}
          type="button"
          className={`w-full rounded-2xl p-3.5 border-2 flex items-center justify-between text-left transition-all active:scale-98 shadow-sm ${
            currentValue === 'DROWSY'
              ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-amber-50/80 hover:bg-amber-100/60 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <Moon className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-base font-bold text-amber-950 block leading-tight">
                {language === 'MAP' ? 'Umawtulen (Mucho sueño)' : 'Mucho sueño de día o lento'}
              </span>
              <span className="text-xs text-amber-700 font-medium block mt-0.5">
                Cuesta concentrarse o sueño invertido
              </span>
            </div>
          </div>
          <span className="text-amber-700 font-bold text-sm">➔</span>
        </button>

        {/* 3. Confused */}
        <button
          onClick={() => handleChoice('CONFUSED')}
          type="button"
          className={`w-full rounded-2xl p-3.5 border-2 flex items-center justify-between text-left transition-all active:scale-98 shadow-sm ${
            currentValue === 'CONFUSED'
              ? 'bg-red-100 border-red-500 ring-2 ring-red-500/20'
              : 'bg-red-50/80 hover:bg-red-100/60 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-800 shrink-0">
              <AlertCircle className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-base font-bold text-red-950 block leading-tight">
                {language === 'MAP' ? 'Goyman (Desorientado)' : 'Desorientado o temblor en manos'}
              </span>
              <span className="text-xs text-red-700 font-medium block mt-0.5">
                Tiemblan las manos (aleteo) o confusión
              </span>
            </div>
          </div>
          <span className="text-red-700 font-bold text-sm">➔</span>
        </button>

        {/* Botón secundario limpio para el mini-test */}
        <button
          onClick={() => {
            playTactileClick();
            onOpenMiniTest();
          }}
          type="button"
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl p-3 flex items-center justify-between transition-all active:scale-98 mt-2"
        >
          <div className="flex items-center gap-2 text-left">
            <Sparkles className="w-4 h-4 text-blue-700" strokeWidth={2.2} />
            <div>
              <span className="text-xs font-bold block leading-tight">
                Realizar prueba rápida de reflejos (10 seg)
              </span>
              <span className="text-[11px] text-blue-600 block">
                {miniTestResult
                  ? `Último resultado: ${miniTestResult.avgReactionMs} ms`
                  : 'Toca 5 círculos para medir agilidad motora'}
              </span>
            </div>
          </div>
          <Play className="w-4 h-4 text-blue-700 fill-blue-700" />
        </button>
      </div>
    </div>
  );
};
