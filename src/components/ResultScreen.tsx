import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Volume2, VolumeX, QrCode, ArrowLeft, Phone } from 'lucide-react';
import { ClinicalEvaluation, Language, UserMode, DailyRecord } from '../types';
import { playTactileClick, speakText, stopSpeaking } from '../utils/audio';

interface ResultScreenProps {
  evaluation: ClinicalEvaluation;
  todayRecord: DailyRecord;
  isOnline: boolean;
  language: Language;
  userMode: UserMode;
  onGoToPasePosta: () => void;
  onResetToday: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  evaluation,
  todayRecord,
  isOnline,
  language,
  userMode,
  onGoToPasePosta,
  onResetToday,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isRed = evaluation.riskLevel === 'RED';
  const isYellow = evaluation.riskLevel === 'YELLOW';
  const isGreen = evaluation.riskLevel === 'GREEN';

  const title = language === 'MAP' ? evaluation.titleMap : evaluation.titleEs;
  const message = language === 'MAP' ? evaluation.messageMap : evaluation.messageEs;
  const recommendation = language === 'MAP' ? evaluation.recommendationMap : evaluation.recommendationEs;

  const handleReadResult = () => {
    playTactileClick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = `${title}. ${message}. Indicación médica: ${recommendation}`;
    speakText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 px-1 animate-in fade-in duration-200">
      {/* Top Header con Botón de Voz */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          onClick={() => {
            playTactileClick();
            onResetToday();
          }}
          type="button"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
          <span>Volver a Inicio</span>
        </button>

        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          Reporte de Hoy
        </span>

        <button
          onClick={handleReadResult}
          type="button"
          aria-label={isSpeaking ? 'Detener voz' : 'Escuchar resultado en español de Chile'}
          title={isSpeaking ? 'Detener voz' : 'Escuchar resultado (Español de Chile)'}
          className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            isSpeaking
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4" strokeWidth={2.2} />
          ) : (
            <Volume2 className="w-4 h-4" strokeWidth={2.2} />
          )}
        </button>
      </div>

      {/* Tarjeta de Diagnóstico Limpia */}
      <div className="my-auto py-3 space-y-3">
        <div
          className={`rounded-3xl p-5 border-2 text-center shadow-lg ${
            isRed
              ? 'bg-red-50/80 border-red-300 text-red-950'
              : isYellow
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          }`}
        >
          {/* Icono de Estado */}
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 bg-white shadow-sm border border-slate-100">
            {isRed ? (
              <AlertOctagon className="w-9 h-9 text-red-600" strokeWidth={2.2} />
            ) : isYellow ? (
              <AlertTriangle className="w-9 h-9 text-amber-600" strokeWidth={2.2} />
            ) : (
              <CheckCircle2 className="w-9 h-9 text-emerald-600" strokeWidth={2.2} />
            )}
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {title}
          </h2>

          <p className="text-sm font-medium mt-1.5 leading-relaxed text-slate-700">
            {message}
          </p>

          {/* Caja de Recomendación */}
          <div className="mt-3.5 p-3 rounded-2xl bg-white border border-slate-200 text-left shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
              Indicación Médica:
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>

        {/* Resumen de Datos Registrados */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Jarabe</span>
              <span className="font-bold text-slate-800">
                {todayRecord.lactuloseTaken ? 'Tomado' : 'No'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Baño</span>
              <span className="font-bold text-slate-800">
                {todayRecord.stoolFrequency} veces
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Mente</span>
              <span className="font-bold text-slate-800">
                {todayRecord.neurologicalState === 'CLEAR' ? 'Clara' : todayRecord.neurologicalState === 'DROWSY' ? 'Sueño' : 'Confuso'}
              </span>
            </div>
          </div>
        </div>

        {/* Llamada de Urgencia si es Alerta Roja */}
        {isRed && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 space-y-2">
            <span className="text-xs font-bold text-red-800 block text-center uppercase tracking-wide">
              Contacto de Urgencia Rural:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+56984521190"
                onClick={() => playTactileClick()}
                className="min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Hija Marta</span>
              </a>
              <a
                href="tel:+56452883400"
                onClick={() => playTactileClick()}
                className="min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Posta Boroa</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Botón Principal: Ver Pase QR Médico */}
      <div className="pt-2">
        <button
          onClick={() => {
            playTactileClick();
            onGoToPasePosta();
          }}
          type="button"
          className="w-full min-h-[54px] rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
        >
          <QrCode className="w-5 h-5" strokeWidth={2.2} />
          <span>Ver Pase QR Médico</span>
        </button>
      </div>
    </div>
  );
};
