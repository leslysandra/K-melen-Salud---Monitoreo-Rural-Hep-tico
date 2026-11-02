import React, { useState } from 'react';
import { Activity, RefreshCw, QrCode, Stethoscope, CloudCheck, ShieldCheck } from 'lucide-react';
import { DailyRecord, AscitesRecord, Language } from '../types';
import { renderQrSvg } from '../utils/qrGenerator';
import { playTactileClick, playSuccessChime, speakText } from '../utils/audio';

interface PasePostaTabProps {
  records: DailyRecord[];
  ascitesStatus: AscitesRecord;
  isOnline: boolean;
  onSyncAll: () => void;
  language: Language;
}

export const PasePostaTab: React.FC<PasePostaTabProps> = ({
  records,
  ascitesStatus,
  isOnline,
  onSyncAll,
  language,
}) => {
  const [syncedMsg, setSyncedMsg] = useState<string | null>(null);

  const last7Days = records.slice(0, 7);
  const totalDays = last7Days.length || 1;
  const daysLactuloseTaken = last7Days.filter(r => r.lactuloseTaken).length;
  const adherencePct = Math.round((daysLactuloseTaken / totalDays) * 100);

  let stoolSum = 0;
  last7Days.forEach(r => {
    if (r.stoolFrequency === '0') stoolSum += 0;
    else if (r.stoolFrequency === '1') stoolSum += 1;
    else if (r.stoolFrequency === '2-3') stoolSum += 2.5;
    else if (r.stoolFrequency === '4+') stoolSum += 4.5;
  });
  const avgStools = (stoolSum / totalDays).toFixed(1);

  const latestRecord = records[0];
  const currentRisk = latestRecord ? latestRecord.riskLevel : 'GREEN';

  // Compact QR payload
  const telemetrySummary = last7Days
    .map(r => `${r.date.slice(5)}:L${r.lactuloseTaken ? 1 : 0}-D${r.stoolFrequency}-N${r.neurologicalState[0]}`)
    .join('|');
  const qrPayload = `ARAU_SALUD|PAC:ROSA_HUENCHULLAN|EDAD:68|CP:B8|BOROA_18KM|ASC:${ascitesStatus.status === 'MORE_SWOLLEN' ? 'EDEMA' : 'OK'}|7D:${telemetrySummary}`;

  const qrSvgHtml = renderQrSvg(qrPayload, 200);

  const handleSyncClick = () => {
    playTactileClick();
    onSyncAll();
    playSuccessChime();
    speakText('Registros sincronizados con la posta y CESFAM.');
    setSyncedMsg('¡Sincronizado con el sistema de salud rural!');
    setTimeout(() => setSyncedMsg(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 px-1 space-y-3 overflow-y-auto">
      {/* 1. Tarjeta Blanca con Código QR Offline */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm text-center">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Pase Posta · Ficha Médica QR</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            100% Sin Internet
          </span>
        </div>

        {/* QR SVG render */}
        <div
          className="mx-auto flex justify-center items-center py-2"
          dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
        />

        <p className="text-xs text-slate-500 mt-1">
          Muestre este código al médico o TENS en la Posta Rural de Boroa.
        </p>

        {/* Datos Clínicos de Identificación */}
        <div className="mt-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-left text-xs space-y-0.5">
          <div className="flex justify-between font-bold text-slate-800">
            <span>Rosa Huenchullán (68a)</span>
            <span className="text-blue-700">Child-Pugh B (8 pts)</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            📍 Sector Boroa · 18 km al CESFAM Nueva Imperial
          </span>
        </div>
      </div>

      {/* 2. Tres Tarjetas de Métricas Médicas Limpias */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block px-1">
          Resumen Médico de los Últimos 7 Días:
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Adherencia */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 text-center shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Adherencia</span>
            <span className="text-lg font-extrabold text-blue-700 block mt-0.5">
              {adherencePct}%
            </span>
            <span className="text-[10px] text-slate-400 block">
              {daysLactuloseTaken}/{totalDays} días
            </span>
          </div>

          {/* Promedio deposiciones */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 text-center shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Baño / Día</span>
            <span className="text-lg font-extrabold text-slate-800 block mt-0.5">
              {avgStools}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              Meta: 2 - 3
            </span>
          </div>

          {/* Estado Encefalopatía */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 text-center shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Estado EH</span>
            <span className={`text-xs font-bold block mt-1.5 ${
              currentRisk === 'RED'
                ? 'text-red-700'
                : currentRisk === 'YELLOW'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}>
              {currentRisk === 'RED' ? 'Alerta Roja' : currentRisk === 'YELLOW' ? 'Precaución' : 'Estable'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {ascitesStatus.status === 'MORE_SWOLLEN' ? '⚠️ Edema' : 'Sin edema'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Botón de Sincronización Manual */}
      <div>
        {syncedMsg && (
          <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-800 animate-in fade-in">
            {syncedMsg}
          </div>
        )}
        <button
          onClick={handleSyncClick}
          type="button"
          className="w-full min-h-[46px] rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Simular Sincronización con CESFAM</span>
        </button>
      </div>
    </div>
  );
};
