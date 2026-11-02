import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Play, RefreshCw, Sparkles } from 'lucide-react';
import { playTactileClick, playSuccessChime, playWarningBeep, speakText } from '../utils/audio';
import { Language } from '../types';

interface AsterixisMiniTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (avgReactionMs: number, missedClicks: number) => void;
  language: Language;
}

export const AsterixisMiniTestModal: React.FC<AsterixisMiniTestModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  language,
}) => {
  const [stage, setStage] = useState<'INTRO' | 'TESTING' | 'DONE'>('INTRO');
  const [currentTarget, setCurrentTarget] = useState<number>(1);
  const [targetPositions, setTargetPositions] = useState<Array<{ x: number; y: number }>>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [misses, setMisses] = useState<number>(0);
  const targetStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setStage('INTRO');
      setCurrentTarget(1);
      setReactionTimes([]);
      setMisses(0);
      const msg = language === 'ES'
        ? 'Prueba rápida de reflejos. Cuando aparezca cada círculo azul, tóquelo con su dedo lo más rápido que pueda.'
        : 'Pichi küzaw tami kuwü mew. Tukunge tami kuwü tüfachi kura mew.';
      speakText(msg);
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const startTest = () => {
    playTactileClick();
    const positions = [
      { x: 28, y: 32 },
      { x: 72, y: 26 },
      { x: 50, y: 54 },
      { x: 26, y: 74 },
      { x: 74, y: 72 },
    ];
    setTargetPositions(positions);
    setCurrentTarget(1);
    setReactionTimes([]);
    setMisses(0);
    setStage('TESTING');
    targetStartTimeRef.current = Date.now();
  };

  const handleTargetClick = (targetNumber: number) => {
    playTactileClick();
    const now = Date.now();
    const delta = now - targetStartTimeRef.current;
    const newTimes = [...reactionTimes, delta];
    setReactionTimes(newTimes);

    if (targetNumber >= 5) {
      const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
      setStage('DONE');
      playSuccessChime();
      onComplete(avg, misses);

      const feedback = avg < 1400 && misses === 0
        ? (language === 'ES' ? 'Excelente pulso y reflejos normales sin temblor.' : 'Kümelen tami kuwü.')
        : (language === 'ES' ? 'Reflejos un poco lentos. Prestar atención a temblor en manos.' : 'Allkütunge tami kuwü.');
      speakText(feedback);
    } else {
      setCurrentTarget(targetNumber + 1);
      targetStartTimeRef.current = Date.now();
    }
  };

  const handleMissClick = (e: React.MouseEvent) => {
    if (stage === 'TESTING' && e.target === e.currentTarget) {
      playWarningBeep();
      setMisses(prev => prev + 1);
    }
  };

  const avgReaction = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const isSlow = avgReaction > 1800 || misses >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 relative text-slate-800 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            playTactileClick();
            onClose();
          }}
          type="button"
          aria-label="Cerrar modal"
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center active:scale-95 transition-all z-10"
        >
          <X className="w-5 h-5" strokeWidth={2.2} />
        </button>

        {/* Modal Title */}
        <div className="pr-10 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full inline-block mb-1 border border-blue-100">
            Prueba de reflejos (10 seg)
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {language === 'ES' ? 'Control de Manos y Reflejos' : 'Küzaw Kuwü mew'}
          </h3>
        </div>

        {/* Test Content Area */}
        <div className="flex-1 min-h-[290px] flex flex-col justify-center">
          {stage === 'INTRO' && (
            <div className="text-center py-3 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-700 shadow-md">
                <Sparkles className="w-10 h-10" strokeWidth={2.2} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                {language === 'ES'
                  ? 'Esta prueba detecta si el pulso está lento o hay temblor en las manos por toxinas acumuladas. Toque cada círculo que aparezca.'
                  : 'Kimnge tami kuwü tüfachi pichi küzaw mew.'}
              </p>

              <button
                onClick={startTest}
                type="button"
                className="w-full min-h-[52px] rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{language === 'ES' ? 'Comenzar Prueba' : 'Llitun'}</span>
              </button>
            </div>
          )}

          {stage === 'TESTING' && (
            <div
              onClick={handleMissClick}
              className="relative w-full h-[270px] bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 overflow-hidden select-none"
            >
              <div className="absolute top-2 left-3 text-xs font-semibold text-slate-500 pointer-events-none">
                Punto {currentTarget} de 5 {misses > 0 && `(Fuera: ${misses})`}
              </div>

              {targetPositions[currentTarget - 1] && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTargetClick(currentTarget);
                  }}
                  style={{
                    left: `${targetPositions[currentTarget - 1].x}%`,
                    top: `${targetPositions[currentTarget - 1].y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute w-[68px] h-[68px] rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 border-4 border-white active:scale-90 transition-transform animate-soft-pulse"
                >
                  {currentTarget}
                </button>
              )}
            </div>
          )}

          {stage === 'DONE' && (
            <div className="text-center py-2 space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${
                isSlow
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              }`}>
                {isSlow ? <AlertTriangle className="w-8 h-8" strokeWidth={2.2} /> : <CheckCircle className="w-8 h-8" strokeWidth={2.2} />}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {isSlow ? 'Reflejos Lentos / Posible Temblor' : 'Excelente Control de Manos'}
                </h4>
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 max-w-xs mx-auto">
                  <div className="flex justify-between text-slate-600">
                    <span>Tiempo promedio:</span>
                    <span className="font-bold text-blue-700">{avgReaction} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pulsos fuera:</span>
                    <span className="font-bold text-amber-700">{misses}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={startTest}
                  type="button"
                  className="flex-1 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repetir</span>
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="flex-1 min-h-[44px] rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/20"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
