/**
 * Araucanía Salud (Kümelen) - App Médica Domiciliaria para Cirrosis Hepática
 * Diseñada para Pacientes Adultos Mayores en Zonas Rurales de La Araucanía, Chile
 * Sra. Rosa Huenchullán (Sector Boroa, a 18 km del CESFAM)
 */

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertCircle, Activity, User } from 'lucide-react';
import { DailyRecord, AscitesRecord, ClinicalEvaluation, Language, UserMode, StoolFrequency, NeuroState, RiskLevel } from './types';
import {
  getDailyRecords,
  saveDailyRecord,
  getAscitesStatus,
  saveAscitesStatus,
  getOnlineMode,
  setOnlineMode,
  syncAllPending,
  evaluateClinicalRisk,
} from './utils/storage';
import { playTactileClick, speakText } from './utils/audio';
import { TopStatusBar } from './components/TopStatusBar';
import { ReportCover } from './components/ReportCover';
import { Step1Medication } from './components/Step1Medication';
import { Step2Stools } from './components/Step2Stools';
import { Step3Neuro } from './components/Step3Neuro';
import { ResultScreen } from './components/ResultScreen';
import { AlertasTab } from './components/AlertasTab';
import { PasePostaTab } from './components/PasePostaTab';
import { PerfilTab } from './components/PerfilTab';
import { AsterixisMiniTestModal } from './components/AsterixisMiniTestModal';

export default function App() {
  // Navigation State (4 Tabs)
  const [activeTab, setActiveTab] = useState<'REPORTE' | 'ALERTAS' | 'MEDICO' | 'PERFIL'>('REPORTE');

  // Wizard flow in Reporte tab
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(false);

  // User Settings & Offline Mode
  const [language, setLanguage] = useState<Language>('ES');
  const [userMode, setUserMode] = useState<UserMode>('PATIENT');
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Data State
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [ascitesStatus, setAscitesStatus] = useState<AscitesRecord>({
    weekId: 'SEM-ACTUAL',
    date: new Date().toISOString().split('T')[0],
    status: 'EQUAL_BETTER',
    syncStatus: 'SYNCED',
  });

  // Today's Form Inputs
  const [todayLactulose, setTodayLactulose] = useState<boolean | undefined>(undefined);
  const [todayStools, setTodayStools] = useState<StoolFrequency | undefined>(undefined);
  const [todayNeuro, setTodayNeuro] = useState<NeuroState | undefined>(undefined);
  const [miniTestResult, setMiniTestResult] = useState<{ avgReactionMs: number; missedClicks: number } | undefined>(undefined);
  const [isMiniTestOpen, setIsMiniTestOpen] = useState<boolean>(false);

  // Clinical Evaluation
  const [currentEvaluation, setCurrentEvaluation] = useState<ClinicalEvaluation | null>(null);

  useEffect(() => {
    const loadedRecords = getDailyRecords();
    const loadedAscites = getAscitesStatus();
    const loadedOnline = getOnlineMode();

    setRecords(loadedRecords);
    setAscitesStatus(loadedAscites);
    setIsOnline(loadedOnline);

    const todayStr = new Date().toISOString().split('T')[0];
    const foundToday = loadedRecords.find(r => r.date === todayStr);

    if (foundToday) {
      setTodayLactulose(foundToday.lactuloseTaken);
      setTodayStools(foundToday.stoolFrequency);
      setTodayNeuro(foundToday.neurologicalState);
      if (foundToday.reflexTest) {
        setMiniTestResult({
          avgReactionMs: foundToday.reflexTest.avgReactionMs,
          missedClicks: foundToday.reflexTest.missedClicks,
        });
      }

      const yesterday = loadedRecords.find(r => r.date !== todayStr);
      const evalResult = evaluateClinicalRisk(
        {
          lactuloseTaken: foundToday.lactuloseTaken,
          stoolFrequency: foundToday.stoolFrequency,
          neurologicalState: foundToday.neurologicalState,
        },
        yesterday
      );
      setCurrentEvaluation(evalResult);
      setIsCompletedToday(true);
    }
  }, []);

  // Handlers
  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    setOnlineMode(nextState);
    if (nextState) {
      syncAllPending();
      setRecords(getDailyRecords());
      setAscitesStatus(getAscitesStatus());
      speakText('Conexión establecida. Registros sincronizados con CESFAM.');
    } else {
      speakText('Modo sin señal rural activado. Registros guardados en el teléfono.');
    }
  };

  const handleToggleUserMode = () => {
    setUserMode(prev => (prev === 'PATIENT' ? 'CAREGIVER' : 'PATIENT'));
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'ES' ? 'MAP' : 'ES'));
  };

  // Start daily check wizard
  const handleStartWizard = () => {
    setIsWizardActive(true);
    setWizardStep(1);
  };

  const handleSelectStep1 = (taken: boolean) => {
    setTodayLactulose(taken);
    setWizardStep(2);
  };

  const handleSelectStep2 = (stools: StoolFrequency) => {
    setTodayStools(stools);
    setWizardStep(3);
  };

  const handleSelectStep3 = (neuro: NeuroState) => {
    setTodayNeuro(neuro);

    const todayStr = new Date().toISOString().split('T')[0];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const d = new Date();
    const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;

    const yesterday = records.find(r => r.date !== todayStr);
    const evalResult = evaluateClinicalRisk(
      {
        lactuloseTaken: todayLactulose ?? true,
        stoolFrequency: todayStools ?? '2-3',
        neurologicalState: neuro,
      },
      yesterday
    );

    const newRecord: DailyRecord = {
      id: `rec-${todayStr}`,
      date: todayStr,
      dayLabel,
      lactuloseTaken: todayLactulose ?? true,
      stoolFrequency: todayStools ?? '2-3',
      neurologicalState: neuro,
      riskLevel: evalResult.riskLevel,
      syncStatus: isOnline ? 'SYNCED' : 'PENDING',
      timestamp: Date.now(),
      modeUsed: userMode,
      reflexTest: miniTestResult ? { ...miniTestResult, completed: true } : undefined,
    };

    saveDailyRecord(newRecord);
    setRecords(getDailyRecords());
    setCurrentEvaluation(evalResult);
    setIsCompletedToday(true);
  };

  const handleResetToday = () => {
    setIsWizardActive(false);
    setWizardStep(1);
  };

  const handleUpdateAscites = (status: 'EQUAL_BETTER' | 'MORE_SWOLLEN') => {
    const updated = saveAscitesStatus(status, isOnline ? 'SYNCED' : 'PENDING');
    setAscitesStatus(updated);
  };

  const handleSyncAll = () => {
    syncAllPending();
    setRecords(getDailyRecords());
    setAscitesStatus(getAscitesStatus());
  };

  // Count active alerts for badge on 'Alertas' tab
  const hasAscitesAlert = ascitesStatus.status === 'MORE_SWOLLEN';
  const hasRiskAlert = records[0]?.riskLevel === 'RED' || records[0]?.riskLevel === 'YELLOW';
  const totalAlertsCount = (hasAscitesAlert ? 1 : 0) + (hasRiskAlert ? 1 : 0);

  // Today record
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr) || {
    id: `rec-${todayStr}`,
    date: todayStr,
    dayLabel: 'Hoy',
    lactuloseTaken: todayLactulose ?? true,
    stoolFrequency: todayStools ?? '2-3',
    neurologicalState: todayNeuro ?? 'CLEAR',
    riskLevel: (currentEvaluation?.riskLevel || 'GREEN') as RiskLevel,
    syncStatus: isOnline ? ('SYNCED' as const) : ('PENDING' as const),
    timestamp: Date.now(),
    modeUsed: userMode,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Phone container frame: max-w-[400px] mx-auto min-h-[820px] bg-white rounded-[36px] shadow-2xl border border-slate-200 */}
      <div className="w-full max-w-[400px] min-h-[820px] bg-white rounded-none sm:rounded-[36px] shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden relative">
        
        {/* 1. Encabezado Superior Minimalista */}
        <TopStatusBar
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          userMode={userMode}
          onToggleUserMode={handleToggleUserMode}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onSetLanguage={setLanguage}
        />

        {/* 2. Área Central de Contenido */}
        <main className="flex-1 p-4 flex flex-col overflow-y-auto">
          {/* TAB 1: REPORTE */}
          {activeTab === 'REPORTE' && (
            <div className="flex-1 flex flex-col">
              {!isWizardActive ? (
                /* Vista Inicial de Portada */
                <ReportCover
                  onStartWizard={handleStartWizard}
                  lastRecord={records[0]}
                  language={language}
                  userMode={userMode}
                />
              ) : isCompletedToday && currentEvaluation && wizardStep === 3 ? (
                /* Pantalla de Resultado Clínico */
                <ResultScreen
                  evaluation={currentEvaluation}
                  todayRecord={todayRecord}
                  isOnline={isOnline}
                  language={language}
                  userMode={userMode}
                  onGoToPasePosta={() => {
                    playTactileClick();
                    setIsWizardActive(false);
                    setActiveTab('MEDICO');
                  }}
                  onResetToday={handleResetToday}
                />
              ) : (
                /* Wizard Lineal de 3 Pasos */
                <div className="flex-1 flex flex-col">
                  {wizardStep === 1 && (
                    <Step1Medication
                      onSelect={handleSelectStep1}
                      onBack={() => setIsWizardActive(false)}
                      language={language}
                      userMode={userMode}
                      currentValue={todayLactulose}
                    />
                  )}

                  {wizardStep === 2 && (
                    <Step2Stools
                      onSelect={handleSelectStep2}
                      onBack={() => setWizardStep(1)}
                      language={language}
                      userMode={userMode}
                      currentValue={todayStools}
                    />
                  )}

                  {wizardStep === 3 && (
                    <Step3Neuro
                      onSelect={handleSelectStep3}
                      onBack={() => setWizardStep(2)}
                      onOpenMiniTest={() => setIsMiniTestOpen(true)}
                      language={language}
                      userMode={userMode}
                      currentValue={todayNeuro}
                      miniTestResult={miniTestResult}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALERTAS */}
          {activeTab === 'ALERTAS' && (
            <AlertasTab
              records={records}
              ascitesStatus={ascitesStatus}
              onUpdateAscites={handleUpdateAscites}
              language={language}
            />
          )}

          {/* TAB 3: MÉDICO / QR */}
          {activeTab === 'MEDICO' && (
            <PasePostaTab
              records={records}
              ascitesStatus={ascitesStatus}
              isOnline={isOnline}
              onSyncAll={handleSyncAll}
              language={language}
            />
          )}

          {/* TAB 4: PERFIL */}
          {activeTab === 'PERFIL' && (
            <PerfilTab
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              userMode={userMode}
              onToggleUserMode={handleToggleUserMode}
              language={language}
            />
          )}
        </main>

        {/* 3. Navegación Inferior Estilo iOS/Android Moderno (4 Pestañas) */}
        <nav
          aria-label="Navegación principal"
          className="bg-slate-50/90 backdrop-blur border-t border-slate-100 px-3 py-2.5 flex justify-around items-center"
        >
          {/* 1. Reporte */}
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('REPORTE');
            }}
            type="button"
            className={`transition-all active:scale-95 flex items-center justify-center ${
              activeTab === 'REPORTE'
                ? 'bg-blue-600 text-white rounded-full px-4 py-2 shadow-md gap-1.5'
                : 'text-slate-600 hover:text-slate-900 flex-col gap-0.5 px-2 py-1'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" strokeWidth={2.2} />
            <span className="text-[11px] font-bold">Reporte</span>
          </button>

          {/* 2. Alertas */}
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('ALERTAS');
            }}
            type="button"
            className={`transition-all active:scale-95 relative flex items-center justify-center ${
              activeTab === 'ALERTAS'
                ? 'bg-blue-600 text-white rounded-full px-4 py-2 shadow-md gap-1.5'
                : 'text-slate-600 hover:text-slate-900 flex-col gap-0.5 px-2 py-1'
            }`}
          >
            <div className="relative">
              <AlertCircle className="w-5 h-5" strokeWidth={2.2} />
              {totalAlertsCount > 0 && activeTab !== 'ALERTAS' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
              )}
            </div>
            <span className="text-[11px] font-bold">Alertas</span>
          </button>

          {/* 3. Médico / QR */}
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('MEDICO');
            }}
            type="button"
            className={`transition-all active:scale-95 flex items-center justify-center ${
              activeTab === 'MEDICO'
                ? 'bg-blue-600 text-white rounded-full px-4 py-2 shadow-md gap-1.5'
                : 'text-slate-600 hover:text-slate-900 flex-col gap-0.5 px-2 py-1'
            }`}
          >
            <Activity className="w-5 h-5" strokeWidth={2.2} />
            <span className="text-[11px] font-bold">Médico/QR</span>
          </button>

          {/* 4. Perfil */}
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('PERFIL');
            }}
            type="button"
            className={`transition-all active:scale-95 flex items-center justify-center ${
              activeTab === 'PERFIL'
                ? 'bg-blue-600 text-white rounded-full px-4 py-2 shadow-md gap-1.5'
                : 'text-slate-600 hover:text-slate-900 flex-col gap-0.5 px-2 py-1'
            }`}
          >
            <User className="w-5 h-5" strokeWidth={2.2} />
            <span className="text-[11px] font-bold">Perfil</span>
          </button>
        </nav>

        {/* Modal de Prueba Rápida de Reflejos (10 segundos) */}
        <AsterixisMiniTestModal
          isOpen={isMiniTestOpen}
          onClose={() => setIsMiniTestOpen(false)}
          onComplete={(avgReactionMs, missedClicks) => {
            setMiniTestResult({ avgReactionMs, missedClicks });
            setIsMiniTestOpen(false);
          }}
          language={language}
        />
      </div>
    </div>
  );
}
