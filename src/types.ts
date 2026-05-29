export interface Note {
  id: string;
  title: string;
  content: string; // This will be stored encrypted in localStorage
  createdAt: number;
  category?: string;
  section?: 'field' | 'intel' | 'assets';
  color?: string;
  isFavorite?: boolean;
  shredAt?: number;
  threatLevel?: 'none' | 'low' | 'elevated' | 'high' | 'severe';
  reliability?: string; // A1, B2, etc.
  classification?: string; // Secret, Top Secret, etc.
  isRedacted?: boolean;
  burnAfterView?: boolean;
  hasBeenViewed?: boolean;
}

export type Language = 'en' | 'fa';

export interface Settings {
  stealthMode: boolean;
  lowProfile: boolean;
  decoyType: 'console' | 'calculator' | 'weather';
  language: Language;
  faFont: 'vazir' | 'vazirmatn' | 'samim' | 'shabnam' | 'sahel' | 'gandom' | 'inter';
  theme: 'dark' | 'light' | 'matrix' | 'brutalist' | 'nord' | 'solarized' | 'retro';
  nightVision: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  duressHash?: string | null;
  autoLockMinutes?: number;
  autoStealthMinutes?: number;
  panicTrigger?: boolean;
  vaultVersion: string;
  isMapInstalled?: boolean;
}

export type View = 'vault' | 'guides' | 'tools' | 'security' | 'contacts' | 'journal' | 'mesh' | 'chat' | 'settings' | 'map' | 'files' | 'library' | 'dictionary' | 'emergency' | 'broadcasts' | 'intel' | 'signal' | 'intel_lab' | 'neural' | 'kanban' | 'manifest' | 'planner' | 'frequency' | 'locked' | 'inventory' | 'duress' | 'advanced' | 'forensics';
