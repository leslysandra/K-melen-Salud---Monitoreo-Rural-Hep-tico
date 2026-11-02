import { DailyRecord, AscitesRecord, ClinicalEvaluation, StoolFrequency, NeuroState, RiskLevel } from '../types';

const STORAGE_KEY_RECORDS = 'kumelen_daily_records_v1';
const STORAGE_KEY_ASCITES = 'kumelen_ascites_v1';
const STORAGE_KEY_ONLINE = 'kumelen_online_mode_v1';

// Seed realistic prior 6 days for Sra. Rosa Huenchullán (Child-Pugh B, Sector Boroa)
function getInitialRecords(): DailyRecord[] {
  const now = new Date();
  const dayNamesEs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const records: DailyRecord[] = [];

  const pastSamples: Array<{
    daysAgo: number;
    lactulose: boolean;
    stools: StoolFrequency;
    neuro: NeuroState;
    risk: RiskLevel;
  }> = [
    { daysAgo: 6, lactulose: true, stools: '2-3', neuro: 'CLEAR', risk: 'GREEN' },
    { daysAgo: 5, lactulose: true, stools: '2-3', neuro: 'CLEAR', risk: 'GREEN' },
    { daysAgo: 4, lactulose: true, stools: '1', neuro: 'DROWSY', risk: 'YELLOW' },
    { daysAgo: 3, lactulose: true, stools: '2-3', neuro: 'CLEAR', risk: 'GREEN' },
    { daysAgo: 2, lactulose: true, stools: '2-3', neuro: 'CLEAR', risk: 'GREEN' },
    { daysAgo: 1, lactulose: true, stools: '2-3', neuro: 'CLEAR', risk: 'GREEN' },
  ];

  for (const sample of pastSamples) {
    const d = new Date(now);
    d.setDate(d.getDate() - sample.daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${dayNamesEs[d.getDay()]} ${d.getDate()}`;

    records.push({
      id: `rec-${dateStr}`,
      date: dateStr,
      dayLabel,
      lactuloseTaken: sample.lactulose,
      stoolFrequency: sample.stools,
      neurologicalState: sample.neuro,
      riskLevel: sample.risk,
      syncStatus: 'SYNCED',
      timestamp: d.getTime(),
      modeUsed: 'PATIENT',
    });
  }

  return records;
}

export function getDailyRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      const seeded = getInitialRecords();
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading records:', e);
    return getInitialRecords();
  }
}

export function saveDailyRecord(newRec: DailyRecord): void {
  try {
    const records = getDailyRecords();
    const existingIndex = records.findIndex(r => r.date === newRec.date);
    if (existingIndex >= 0) {
      records[existingIndex] = newRec;
    } else {
      records.push(newRec);
    }
    // Sort descending by date
    records.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving record:', e);
  }
}

export function getAscitesStatus(): AscitesRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASCITES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  const defaultAscites: AscitesRecord = {
    weekId: 'SEM-ACTUAL',
    date: new Date().toISOString().split('T')[0],
    status: 'EQUAL_BETTER',
    syncStatus: 'SYNCED',
  };
  return defaultAscites;
}

export function saveAscitesStatus(status: 'EQUAL_BETTER' | 'MORE_SWOLLEN', syncStatus: 'PENDING' | 'SYNCED' = 'PENDING'): AscitesRecord {
  const rec: AscitesRecord = {
    weekId: `SEM-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    status,
    syncStatus,
  };
  localStorage.setItem(STORAGE_KEY_ASCITES, JSON.stringify(rec));
  return rec;
}

export function getOnlineMode(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ONLINE);
    // By default: FALSE (Modo Sin Señal rural)
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

export function setOnlineMode(online: boolean): void {
  localStorage.setItem(STORAGE_KEY_ONLINE, JSON.stringify(online));
}

export function syncAllPending(): { syncedCount: number } {
  const records = getDailyRecords();
  let count = 0;
  const updated = records.map(r => {
    if (r.syncStatus === 'PENDING') {
      count++;
      return { ...r, syncStatus: 'SYNCED' as const };
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));

  const ascites = getAscitesStatus();
  if (ascites.syncStatus === 'PENDING') {
    ascites.syncStatus = 'SYNCED';
    localStorage.setItem(STORAGE_KEY_ASCITES, JSON.stringify(ascites));
    count++;
  }

  return { syncedCount: count };
}

/**
 * Clinical Evaluation Engine (Rule-based decision tree for Hepatic Encephalopathy)
 * Cross-references today's input with yesterday's stored record.
 */
export function evaluateClinicalRisk(
  today: { lactuloseTaken: boolean; stoolFrequency: StoolFrequency; neurologicalState: NeuroState },
  yesterday?: DailyRecord
): ClinicalEvaluation {
  const details: string[] = [];

  // 1. CRITICAL RED CONDITIONS:
  // - Patient is CONFUSED / has tremor (asterixis)
  // - 0 stools today AND (didn't take lactulose OR yesterday had <= 1 stool)
  const isZeroStools = today.stoolFrequency === '0';
  const yesterdayStoolsLow = yesterday ? (yesterday.stoolFrequency === '0' || yesterday.stoolFrequency === '1') : false;

  if (
    today.neurologicalState === 'CONFUSED' ||
    (isZeroStools && (!today.lactuloseTaken || yesterdayStoolsLow))
  ) {
    if (today.neurologicalState === 'CONFUSED') {
      details.push('Desorientación o temblor en manos (sospecha asterixis / Encefalopatía grado II-III)');
    }
    if (isZeroStools) {
      details.push('0 deposiciones con acumulación progresiva de amonio y toxinas');
    }

    return {
      riskLevel: 'RED',
      titleEs: '🚨 ALERTA ROJA: RIESGO DE ENCEFALOPATÍA',
      titleMap: '🚨 LLÜGKAWÜN: WEZA LONGKO / GOYMAN',
      messageEs: 'Alerta de toxinas en la cabeza. Las manos tiemblan o no ha podido evacuar el cuerpo.',
      messageMap: 'Mülelay küme newen. Tami longko goymay kam tami kuwü tremi. Peafuymi tami Posta.',
      recommendationEs: 'Avise de inmediato a su familiar (Marta) y acuda a la Posta Rural de Boroa o CESFAM. Tenga a mano el Pase QR.',
      recommendationMap: 'Nütramkange tami pu che (Marta) ka amunge Posta Boroa mew. Yenie tüfachi Pase QR.',
      urgentCallRequired: true,
      details,
    };
  }

  // 2. CAUTION YELLOW CONDITIONS:
  // - Sub-titration: 1 stool only
  // - Over-titration: 4+ stools (risk of hypovolemia, electrolyte imbalance, renal failure)
  // - Neuro: Drowsy / Daytime sleepiness (Inversion of sleep pattern - Grade I HE)
  // - Medication: Did not take Lactulose today
  if (
    today.stoolFrequency === '1' ||
    today.stoolFrequency === '4+' ||
    today.neurologicalState === 'DROWSY' ||
    !today.lactuloseTaken
  ) {
    if (today.stoolFrequency === '1') {
      details.push('1 sola deposición: Dosis de Lactulosa puede ser insuficiente para eliminar amonio');
    } else if (today.stoolFrequency === '4+') {
      details.push('4 o más deposiciones: Exceso de efecto laxante. Riesgo de deshidratación y desbalance electrolítico');
    }

    if (today.neurologicalState === 'DROWSY') {
      details.push('Mucho sueño de día: Signo precoz de alteración del ritmo circadiano / Encefalopatía Grado I');
    }

    if (!today.lactuloseTaken) {
      details.push('No tomó el jarabe hoy: El amonio puede acumularse rápidamente en las próximas 24 horas');
    }

    let recEs = 'Tome abundante agua pura. ';
    if (today.stoolFrequency === '4+') {
      recEs += 'Beba agua o sales de rehidratación y consulte a su TENS si suspender temporalmente media dosis.';
    } else if (today.stoolFrequency === '1') {
      recEs += 'Asegúrese de tomar su dosis prescrita de jarabe hoy para lograr 2 a 3 idas al baño.';
    } else if (!today.lactuloseTaken) {
      recEs += 'Si puede, tómese su jarabe ahora para limpiar las toxinas de la sangre.';
    } else {
      recEs += 'Descanse y observe si empeora la somnolencia en las próximas horas.';
    }

    return {
      riskLevel: 'YELLOW',
      titleEs: '⚠️ PRECAUCIÓN: CONTROLAR EN CASA',
      titleMap: '⚠️ KÜME PEWÜN: KÜZAW ÜY',
      messageEs: 'Hay cambios leves en las idas al baño o somnolencia. Requiere prestar atención.',
      messageMap: 'Mülechi küzaw tami kalül mew. Allkütunge tami lof ka pütokonge ko.',
      recommendationEs: recEs,
      recommendationMap: 'Pütokonge ko. Kimnge chumley tami kalül wüle mew.',
      urgentCallRequired: false,
      details,
    };
  }

  // 3. GREEN CONDITIONS:
  // - Took lactulose, 2-3 stools, clear mind
  details.push('Meta terapéutica óptima: 2 a 3 deposiciones logradas');
  details.push('Adherencia farmacológica completa hoy');
  details.push('Estado neurológico y psicomotor preservado');

  return {
    riskLevel: 'GREEN',
    titleEs: '🟢 ESTABLE: ¡MUY BUEN DÍA!',
    titleMap: '🟢 KÜMELEN: ¡TAMI KALÜL KÜMEY!',
    messageEs: 'Su cabeza está clara, tomó sus remedios y el jarabe limpió las toxinas justo en la meta (2 a 3 veces).',
    messageMap: 'Kümelen tami longko, pütokoymi tami lawen ka küme amuy tami kalül. Küme feyentun.',
    recommendationEs: 'Siga cuidándose igual mañana. Siga tomando agua limpia y comiendo liviano con poca sal.',
    recommendationMap: 'Femuechi amulepe wüle mew. Pütokonge ko ka anümka yagel.',
    urgentCallRequired: false,
    details,
  };
}
