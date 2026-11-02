export type Language = 'ES' | 'MAP';

export type UserMode = 'PATIENT' | 'CAREGIVER';

export type StoolFrequency = '0' | '1' | '2-3' | '4+';

export type NeuroState = 'CLEAR' | 'DROWSY' | 'CONFUSED';

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string;
  lactuloseTaken: boolean;
  stoolFrequency: StoolFrequency;
  neurologicalState: NeuroState;
  riskLevel: RiskLevel;
  syncStatus: 'PENDING' | 'SYNCED';
  timestamp: number;
  modeUsed: UserMode;
  notes?: string;
  reflexTest?: {
    avgReactionMs: number;
    missedClicks: number;
    completed: boolean;
  };
}

export interface AscitesRecord {
  weekId: string;
  date: string;
  status: 'EQUAL_BETTER' | 'MORE_SWOLLEN';
  syncStatus: 'PENDING' | 'SYNCED';
}

export interface ClinicalEvaluation {
  riskLevel: RiskLevel;
  titleEs: string;
  titleMap: string;
  messageEs: string;
  messageMap: string;
  recommendationEs: string;
  recommendationMap: string;
  urgentCallRequired: boolean;
  details: string[];
}
