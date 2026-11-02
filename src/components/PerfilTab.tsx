import React from 'react';
import { User, Phone, MapPin, Activity, Wifi, WifiOff, ShieldCheck, Heart } from 'lucide-react';
import { Language, UserMode } from '../types';
import { playTactileClick } from '../utils/audio';

interface PerfilTabProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  userMode: UserMode;
  onToggleUserMode: () => void;
  language: Language;
}

export const PerfilTab: React.FC<PerfilTabProps> = ({
  isOnline,
  onToggleOnline,
  userMode,
  onToggleUserMode,
  language,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between py-1 px-1 space-y-3 overflow-y-auto">
      {/* 1. Tarjeta Principal de la Paciente */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
            RH
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
              Sra. Rosa Huenchullán
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              68 años · RUT: 9.421.314-K
            </p>
            <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
              Child-Pugh B (8 pts)
            </span>
          </div>
        </div>

        {/* Datos Rurales */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" strokeWidth={2.2} />
            <div>
              <span className="font-bold text-slate-800 block">Comunidad Boroa</span>
              <span className="text-slate-500 text-[11px]">
                A 18 km del CESFAM Nueva Imperial por camino de ripio.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
            <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.2} />
            <div>
              <span className="font-bold text-slate-800 block">Tratamiento Crítico</span>
              <span className="text-slate-500 text-[11px]">
                Lactulosa 15 ml c/8-12 hrs (titular a 2-3 deposiciones/día) + Rifaximina.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interruptor Interactivo de Conectividad Rural */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
          Simulador de Conectividad Rural:
        </span>

        <button
          onClick={() => {
            playTactileClick();
            onToggleOnline();
          }}
          type="button"
          className={`w-full p-3 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-98 ${
            isOnline
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-amber-50/80 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-emerald-600" strokeWidth={2.2} />
            ) : (
              <WifiOff className="w-6 h-6 text-amber-600" strokeWidth={2.2} />
            )}
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isOnline ? 'Con Señal Celular' : 'Sin Señal Rural'}
              </span>
              <span className="text-[11px] text-slate-600 block">
                {isOnline
                  ? 'Sincronizando automáticamente con CESFAM'
                  : 'Guardando datos en el teléfono sin internet'}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            Cambiar
          </span>
        </button>
      </div>

      {/* 3. Contactos de Red de Apoyo Rural */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
          Contactos Rápidos de Emergencia:
        </span>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:+56984521190"
            onClick={() => playTactileClick()}
            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center hover:bg-slate-100 active:scale-95 transition-all block"
          >
            <span className="text-xs font-bold text-slate-800 block">Hija Marta</span>
            <span className="text-[10px] text-slate-500 block">+56 9 8452 1190</span>
            <span className="mt-1 text-[11px] font-bold text-blue-700 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> Llamar
            </span>
          </a>

          <a
            href="tel:+56452883400"
            onClick={() => playTactileClick()}
            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center hover:bg-slate-100 active:scale-95 transition-all block"
          >
            <span className="text-xs font-bold text-slate-800 block">Posta Boroa</span>
            <span className="text-[10px] text-slate-500 block">+56 45 288 3400</span>
            <span className="mt-1 text-[11px] font-bold text-blue-700 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> Llamar
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
