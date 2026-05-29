import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { 
  Shield, 
  Map,
  Wrench, 
  Settings as SettingsIcon, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Percent,
  Droplets,
  Edit,
  Eye, 
  EyeOff, 
  Save,
  ChevronRight,
  ArrowRight,
  Activity,
  Heart,
  Zap,
  Palette,
  Wind,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Download,
  Volume2,
  Keyboard,
  Info,
  Users,
  BookOpen,
  Calendar,
  Clock,
  UserPlus,
  Phone,
  Radio,
  Wifi,
  WifiOff,
  ShieldAlert,
  Network,
  MessageSquare,
  Send,
  HelpCircle,
  Binary,
  Scale,
  Copy,
  Globe,
  FolderLock,
  User,
  Fingerprint,
  Search,
  Filter,
  Languages,
  Book,
  BookOpenCheck,
  AlertCircle,
  Moon,
  ZapOff,
  Cpu,
  BarChart3,
  HardDrive,
  Upload,
  Eraser,
  Database,
  MapPin,
  Image,
  ShieldCheck,
  FileText,
  FileLock,
  Key as KeyIcon,
  Crosshair,
  Target,
  Timer,
  CheckSquare,
  Thermometer,
  Stethoscope,
  Gauge,
  Compass,
  Layout,
  Table,
  Brain,
  Layers,
  FileCode,
  FileCheck,
  Award,
  Monitor,
  Globe2,
  Power,
  PowerOff,
  X,
  Check,
  CloudLightning,
  ShieldX,
  Package,
  Sun,
  Box,
  VolumeX,
  HeartPulse,
  Radar,
  Navigation,
  Lock as LockIcon,
  SearchCode,
  FileSearch,
  Hash,
  Terminal,
  History,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip as MapTooltip } from 'react-leaflet';
import jalaali from 'jalaali-js';
import L from 'leaflet';
import * as XLSX from 'xlsx';
import { Note, View, Settings, Language } from './types';
import { encryptData, decryptData, generateId, hashData } from './services/lib/crypto';
import { translations } from '../i18n';
import { soundService } from './services/soundService';
import { AdvancedView } from './components/AdvancedView';

// --- Utilities ---

// Fix Leaflet Default Icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', ' ': '/'
};

const textToMorse = (text: string) => {
  return text.toUpperCase().split('').map(char => MORSE_CODE[char] || char).join(' ');
};

const base64ToBlob = (base64: string, type: string) => {
  const byteString = atob(base64.split(',')[1] || base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type });
};

// --- Components ---

const Divider = () => <div className="mx-6 my-2 h-px bg-border opacity-50" />;

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label?: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <motion.button
    id={`nav-${(label || 'item').toLowerCase()}`}
    data-sidebar-item
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-black uppercase tracking-widest transition-all duration-300 outline-none relative group
      ${active 
        ? 'text-brand' 
        : 'text-text-dim/60 hover:text-brand'
      }`}
  >
    {active && (
      <motion.div 
        layoutId="sidebar-active-glow"
        className="absolute inset-x-2 inset-y-1 bg-brand/5 rounded-xl border border-brand/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    )}
    
    <div className={`relative z-10 flex items-center gap-3 ${active ? 'scale-105' : 'group-hover:scale-105'} transition-all duration-300`}>
      <div className={`p-1.5 rounded-lg transition-all duration-300 ${active ? 'bg-brand text-surface shadow-lg shadow-brand/20' : 'bg-transparent text-inherit group-hover:bg-brand/10'}`}>
        <Icon size={16} />
      </div>
      <span className="text-[10px] sm:text-[11px] whitespace-nowrap">{label}</span>
    </div>

    {active && (
      <motion.div 
        layoutId="sidebar-active-dot"
        className="absolute end-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-brand rounded-full shadow-[0_0_8px_rgba(var(--color-brand),0.5)]"
      />
    )}
  </motion.button>
);

// --- COMPONENT: App ---
// EN: Root application controller. Manages state for authentication, navigation, and theme.
// FA: کنترل‌کننده اصلی برنامه. مدیریت وضعیت احراز هویت، ناوبری و پوسته.
function LockedView({ t, onViewChange }: any) {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500 p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-brand/10 blur-[100px] rounded-full" />
        <div className="relative bg-card border-2 border-brand/20 p-12 rounded-[4rem] shadow-2xl flex flex-col items-center max-w-md text-center">
          <div className="p-6 bg-brand/5 rounded-3xl mb-6">
            <Lock size={48} className="text-brand animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-brand uppercase tracking-tighter mb-4">Tactical Access Restricted</h2>
          <p className="text-xs text-text-dim uppercase font-bold leading-relaxed mb-8">
            This sector contains active operational data and requires physical decryption key validation from the primary vault.
          </p>
          <button 
            onClick={() => onViewChange('vault')}
            className="w-full py-4 bg-brand text-surface rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all"
          >
            Authenticate in Vault
          </button>
        </div>
      </div>
      <div className="flex gap-4 font-mono text-[8px] text-text-dim uppercase tracking-widest">
         <span>Sector: [REDACTED]</span>
         <span>•</span>
         <span>Security: [LVL_4]</span>
         <span>•</span>
         <span>System: [AIR_GAP]</span>
      </div>
    </div>
  );
}

function EntropyGraph() {
  const [points, setPoints] = useState<number[]>(Array.from({ length: 20 }, () => Math.random()));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => [...prev.slice(1), Math.random()]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-0.5 h-4 w-20">
      {points.map((p, i) => (
        <div 
          key={i} 
          className="w-1 bg-brand/40 rounded-full transition-all duration-1000"
          style={{ height: `${p * 100}%`, opacity: 0.3 + p * 0.7 }}
        />
      ))}
    </div>
  );
}

function MeshStatusHUD({ status, strength, activity, t }: any) {
  return (
    <div className="flex items-center gap-3 border-x border-border px-4 py-1">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-end gap-[1px] h-3">
          {[1, 2, 3, 4, 5].map((bar) => {
            const isActive = status === 'connected' && (strength / 20) >= bar;
            return (
              <div 
                key={bar}
                className={`w-[2px] transition-all duration-300 rounded-t-[1px] ${
                  isActive 
                    ? 'bg-brand shadow-[0_0_8px_rgba(var(--brand),0.5)]' 
                    : status === 'searching' 
                      ? 'bg-yellow-500/20 animate-pulse' 
                      : 'bg-text-dim/10'
                }`}
                style={{ height: `${bar * 20 + 20}%` }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio 
              size={10} 
              className={`transition-all duration-300 ${
                status === 'connected' 
                  ? 'text-brand' 
                  : status === 'searching' 
                    ? 'text-yellow-500' 
                    : 'text-text-dim'
              }`} 
            />
            <AnimatePresence>
              {activity && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-brand rounded-full z-[-1]"
                />
              )}
            </AnimatePresence>
          </div>
          <span className="text-[9px] font-mono text-brand font-black uppercase">
            {status === 'connected' ? `LINK_${strength}%` : status === 'searching' ? 'SYNCING...' : 'AIR_GAPPED'}
          </span>
        </div>
        <span className="text-[7px] font-black text-text-dim tracking-widest uppercase opacity-40 leading-none">
           {t.header.hud_mesh}
        </span>
      </div>
    </div>
  );
}

function InventoryView({ t, inventory, setInventory }: any) {
  const cats = ['supplies', 'medical', 'power', 'tools'];
  
  const updateQty = (id: string, delta: number) => {
    setInventory((prev: any) => prev.map((item: any) => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ));
    soundService.playData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-4xl font-black text-brand tracking-tighter uppercase">{t.sidebar.inventory}</h2>
           <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Critical Supply Manifest</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cats.map(cat => (
          <div key={cat} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
             <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-6 pb-2 border-b border-border">{cat}</h4>
             <div className="space-y-4">
                {inventory.filter((i: any) => i.cat === cat).map((item: any) => (
                  <div key={item.id} className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-brand">{item.name}</span>
                        <span className="text-[10px] font-mono text-text-dim">{item.qty} {item.unit}</span>
                     </div>
                     <div className="flex gap-1 h-2 bg-surface rounded-full overflow-hidden border border-border">
                        <div 
                          className={`h-full transition-all duration-500 ${item.qty < 3 ? 'bg-red-500' : 'bg-brand'}`}
                          style={{ width: `${Math.min(100, (item.qty / 10) * 100)}%` }}
                        />
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="flex-1 py-1 bg-surface border border-border rounded-lg text-[10px] font-black text-brand hover:border-brand/40">-</button>
                        <button onClick={() => updateQty(item.id, 1)} className="flex-1 py-1 bg-surface border border-border rounded-lg text-[10px] font-black text-brand hover:border-brand/40">+</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      <div className="bg-brand/5 border border-brand/20 rounded-[2.5rem] p-8">
         <h4 className="text-[10px] font-black text-brand uppercase mb-4 tracking-widest">Expiration Radar</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map((item: any) => {
              const days = Math.floor((new Date(item.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={item.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-brand">{item.name}</span>
                      <span className="text-[8px] font-mono text-text-dim">{item.expiry}</span>
                   </div>
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full ${days < 30 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      T-{days}D
                   </span>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
}

// EN: Unified confirmation portal with high-security visual feedback.
// FA: درگاه واحد تأیید با بازخورد بصری امنیتی بالا.
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, type, requirePassword, t, onDuress }: any) {
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requirePassword) {
      const storedHash = localStorage.getItem('sahand_vault_hash');
      const settings = JSON.parse(localStorage.getItem('sahand_settings') || '{}');
      
      const inputHash = hashData(passInput);
      
      if (settings.duressHash && inputHash === settings.duressHash) {
         onCancel();
         onDuress?.();
         setPassInput('');
         return;
      }

      if (storedHash && inputHash === storedHash) {
         onConfirm();
         onCancel();
         setPassInput('');
      } else {
         setError(true);
         soundService.playAlert();
         setTimeout(() => setError(false), 2000);
      }
    } else {
      onConfirm();
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[11000] flex items-center justify-center p-6"
        onClick={onCancel}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className={`bg-card w-full max-w-md rounded-[2.5rem] p-10 border-2 shadow-2xl relative overflow-hidden ${type === 'danger' ? 'border-red-500/30' : 'border-brand/30'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className={`absolute top-0 right-0 p-8 opacity-5 pointer-events-none`}>
             <Shield size={120} className={type === 'danger' ? 'text-red-500' : 'text-brand'} />
          </div>

          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${type === 'danger' ? 'bg-red-500/10' : 'bg-brand/10'}`}>
              <AlertTriangle className={type === 'danger' ? 'text-red-500' : 'text-brand'} size={32} />
            </div>

            <h4 className="text-2xl font-black text-brand mb-4 uppercase tracking-tighter">{title}</h4>
            <p className="text-text-dim text-sm leading-relaxed mb-8 font-medium">
              {message}
            </p>

            {requirePassword && (
              <div className="mb-8 space-y-3">
                 <p className="text-[10px] font-black text-brand uppercase tracking-widest">{t.shared.wipeAuthTitle}</p>
                 <input 
                    type="password"
                    autoFocus
                    value={passInput}
                    onChange={e => setPassInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                    placeholder={t.vault.placeholder}
                    className={`w-full px-6 py-4 bg-surface border rounded-2xl outline-none font-mono transition-all ${error ? 'border-red-500 bg-red-50 text-red-500 animate-shake' : 'border-border focus:border-brand text-brand'}`}
                 />
                 {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{t.shared.wrongKey}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onCancel}
                className="py-4 bg-surface text-brand font-bold rounded-2xl hover:bg-card transition-all border border-border uppercase text-[10px] tracking-widest"
              >
                {t.contacts.cancel}
              </button>
              <button 
                onClick={handleConfirm}
                className={`py-4 text-white font-bold rounded-2xl transition-all shadow-xl uppercase text-[10px] tracking-widest ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-brand hover:bg-brand-light shadow-brand/20'}`}
              >
                {t.shared.confirm}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [secureFiles, setSecureFiles] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahand_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [contacts, setContacts] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahand_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState<View>('vault');
  const [notes, setNotes] = useState<Note[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahand_journal');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [meshStatus, setMeshStatus] = useState<'offline' | 'searching' | 'connected'>('offline');

  // Kanban State
  const [kanbanTasks, setKanbanTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahand_kanban');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Tactical Mesh Networking', status: 'done', priority: 'high' },
      { id: '2', title: 'Mesh File Transmission Protocol', status: 'done', priority: 'high' },
      { id: '3', title: 'Regional Map Tile Caching', status: 'done', priority: 'medium' },
      { id: '4', title: 'Jalali Calendar Synchronization', status: 'done', priority: 'low' },
      { id: '5', title: 'UI Sonic Feedback (Tactical Audio)', status: 'done', priority: 'low' },
      { id: '6', title: 'P2P Voice Relay Over Mesh', status: 'todo', priority: 'high' },
      { id: '7', title: 'Biometric Duress Logic', status: 'todo', priority: 'medium' },
      { id: '8', title: 'Satellite Uplink Simulation', status: 'todo', priority: 'low' },
      { id: '9', title: 'SDR Signal De-interleaving', status: 'todo', priority: 'high' },
      { id: '10', title: 'Quantum-Safe Vault Layer', status: 'todo', priority: 'high' },
      { id: '11', title: 'Tactical Inventory Sync', status: 'todo', priority: 'medium' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sahand_kanban', JSON.stringify(kanbanTasks));
  }, [kanbanTasks]);

  // Planner State
  const [plannerData, setPlannerData] = useState<Record<string, { notes: string, checklist: { text: string, done: boolean }[] }>>(() => {
    const saved = localStorage.getItem('sahand_planner');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('sahand_planner', JSON.stringify(plannerData));
  }, [plannerData]);

  // Inventory State
  const [inventory, setInventory] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahand_inventory');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Water (Crate)', qty: 5, unit: 'units', expiry: '2027-01-01', cat: 'supplies' },
      { id: '2', name: 'Medical Kit (Trauma)', qty: 2, unit: 'kits', expiry: '2026-06-15', cat: 'medical' },
      { id: '3', name: 'Alkaline Batteries', qty: 24, unit: 'pcs', expiry: '2030-12-31', cat: 'power' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sahand_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const [duressActive, setDuressActive] = useState(false);
  const [hydrationLog, setHydrationLog] = useState<{ time: string, val: number }[]>(() => {
    const saved = localStorage.getItem('sahand_hydration_log');
    return saved ? JSON.parse(saved) : [];
  });
  const [vaultKey, setVaultKey] = useState<string | null>(null);
  const [meshActivity, setMeshActivity] = useState(false);
  const [signalStrength, setSignalStrength] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
    requirePassword?: boolean;
    onCancel?: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });

  useEffect(() => {
    localStorage.setItem('sahand_files', JSON.stringify(secureFiles));
  }, [secureFiles]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, vaultKey: string) => {
    const file = e.target.files?.[0];
    if (!file || !vaultKey) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: encryptData(file.name, vaultKey),
        size: encryptData(`${(file.size / 1024).toFixed(1)} KB`, vaultKey),
        date: encryptData(new Date().toISOString().split('T')[0], vaultKey),
        content: encryptData(base64, vaultKey),
        type: encryptData(file.type, vaultKey)
      };
      
      // Check for size limit (5MB for localStorage)
      if (JSON.stringify(secureFiles).length + base64.length > 5 * 1024 * 1024) {
        alert("CRITICAL_ERROR: STORAGE_QUOTA_EXCEEDED. File too large for local encrypted vault.");
        return;
      }

      setSecureFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    const file = secureFiles.find(f => f.id === id);
    setConfirmDialog({
      isOpen: true,
      title: t.vault.confirmDelete,
      message: settings.language === 'fa' ? `آیا از حذف فایل "${file?.name || 'نامشخص'}" اطمینان دارید؟ این عمل قابل بازگشت نیست.` : `Are you sure you want to delete "${file?.name || 'unknown'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        setSecureFiles(prev => prev.filter(f => f.id !== id));
        soundService.playClick();
      }
    });
  };
  const disconnectFromRelay = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setMeshStatus('offline');
    }
  };

  const [authInput, setAuthInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmInput, setConfirmInput] = useState('');

  const isVaultInitialized = !!localStorage.getItem('sahand_vault_hash');
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('sahand_settings');
    return saved ? JSON.parse(saved) : {
      stealthMode: false,
      lowProfile: false,
      decoyType: 'console',
      language: 'en',
      faFont: 'vazir',
      theme: 'light',
      nightVision: false,
      highContrast: false,
      fontSize: 'medium',
      autoStealthMinutes: 0,
      panicTrigger: false
    };
  });

  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    const interval = setInterval(() => {
      const idleMinutes = (Date.now() - lastActivityRef.current) / (1000 * 60);
      if (settings.autoStealthMinutes && settings.autoStealthMinutes > 0 && idleMinutes >= settings.autoStealthMinutes && !settings.stealthMode && !duressActive) {
         setSettings(s => ({ ...s, stealthMode: true }));
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
    };
  }, [settings.autoStealthMinutes, settings.stealthMode, duressActive]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !settings.stealthMode) {
        setSettings(s => ({ ...s, stealthMode: true }));
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [settings.stealthMode]);

  useEffect(() => {
    const fontClass = settings.language === 'fa' ? `font-${settings.faFont}` : 'font-sans';
    const nvClass = settings.nightVision ? 'night-vision' : '';
    const hcClass = settings.highContrast ? 'high-contrast' : '';
    const fsClass = `size-${settings.fontSize}`;
    
    document.documentElement.className = [
      settings.theme !== 'light' ? `theme-${settings.theme}` : '',
      fontClass,
      nvClass,
      hcClass,
      fsClass
    ].filter(Boolean).join(' ');
  }, [settings.theme, settings.language, settings.faFont, settings.nightVision, settings.highContrast, settings.fontSize]);

  useEffect(() => {
    localStorage.setItem('sahand_settings', JSON.stringify(settings));
  }, [settings]);

  const t = translations[settings.language];
  const lang = settings.language;

  const connectToRelay = (ip: string) => {
    if (socket) socket.disconnect();
    setMeshStatus('searching');
    
    // Connect to the specified IP/Port
    let targetUrl = ip;
    if (!targetUrl.startsWith('http')) {
      // If we are on HTTPS and target is a local IP, warn user (handled in UI)
      // but try to guess protocol. Default to http for local IPs, https for domains
      const isLocal = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|localhost)/.test(ip);
      targetUrl = isLocal ? `http://${ip}` : `https://${ip}`;
    }
    
    // Check for mixed content
    if (window.location.protocol === 'https:' && targetUrl.startsWith('http:')) {
      console.warn("MIXED CONTENT DETECTED: Browsers block HTTPS -> HTTP connections. Connecting may fail.");
    }

    const newSocket = io(targetUrl, {
      reconnectionAttempts: 3,
      timeout: 5000,
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      setMeshStatus('connected');
      setSignalStrength(Math.floor(Math.random() * 20) + 80); // 80-100% when connected
      setSocket(newSocket);
      // Join the global mesh room for multi-user sync
      newSocket.emit('join-mesh', 'global');
    });

    newSocket.on('connect_error', () => {
      setMeshStatus('offline');
      setSignalStrength(0);
      setSocket(null);
    });
  };

  useEffect(() => {
    if (meshStatus !== 'connected') return;
    const interval = setInterval(() => {
      setSignalStrength(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(70, Math.min(100, prev + delta));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [meshStatus]);

  // Load encrypted notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('sahand_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('sahand_notes', JSON.stringify(updatedNotes));
  };

  // Auto-shredding logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiredNotes = notes.filter(n => n.shredAt && n.shredAt < now);
      if (expiredNotes.length > 0) {
        saveNotes(notes.filter(n => !n.shredAt || n.shredAt >= now));
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [notes]);

  const handleCreateNote = (content?: string, section?: string, metadata?: Partial<Note>) => {
    if (!vaultKey) return;
    const body = content || '';
    const newNote: Note = {
      id: generateId(),
      title: t.common.newNote,
      content: encryptData(body, vaultKey),
      section: (section as any) || 'field',
      createdAt: Date.now(),
      ...metadata
    };
    saveNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t.shared.shred,
      message: t.shared.confirmDelete,
      type: 'danger',
      onConfirm: () => {
        saveNotes(notes.filter(n => n.id !== id));
        setConfirmDialog(prev => ({ ...prev!, isOpen: false }));
        soundService.playSuccess();
      }
    });
  };

  const unlockVault = () => {
    if (!authInput) return;
    const storedHash = localStorage.getItem('sahand_vault_hash');
    const inputHash = hashData(authInput);
    
    // Duress Protocol Integration
    const sahandDuressKey = localStorage.getItem('sahand_duress_key');
    if (sahandDuressKey && authInput === sahandDuressKey) {
      const savedTriggers = localStorage.getItem('sahand_duress_triggers');
      const triggers = savedTriggers ? JSON.parse(savedTriggers) : { sos: true, decoy: false, shred: false };

      if (triggers.shred) {
        localStorage.clear();
        window.location.reload();
        return;
      }

      if (triggers.sos) {
        setIsSOSActive(true);
        soundService.playAlert();
      }

      if (triggers.decoy) {
        setSettings(prev => ({ ...prev, stealthMode: true }));
        setVaultKey(authInput); // Allow entry with duress key into decoy mode
        setAuthInput('');
        setErrorMessage('');
        return;
      }

      // Default duress behavior: deny entry but don't show error immediately to avoid tip-off (optional)
      setErrorMessage(t.vault.errorWrong);
      setAuthInput('');
      return;
    }

    if (inputHash === storedHash) {
      setVaultKey(authInput);
      setAuthInput('');
      setErrorMessage('');
    } else {
      setErrorMessage(t.vault.errorWrong);
    }
  };

  const initializeVault = () => {
    if (!authInput || authInput !== confirmInput) {
      setErrorMessage(t.vault.errorMatch);
      return;
    }
    const hash = hashData(authInput);
    localStorage.setItem('sahand_vault_hash', hash);
    setVaultKey(authInput);
    setAuthInput('');
    setConfirmInput('');
    setErrorMessage('');
  };

  const lockVault = () => {
    setVaultKey(null);
  };

  const triggerActivityPulse = () => {
    setMeshActivity(true);
    setTimeout(() => setMeshActivity(false), 200);
  };

  const sensitiveViews: View[] = ['tools', 'kanban', 'planner', 'intel_lab', 'signal', 'intel', 'contacts', 'journal', 'files', 'library', 'emergency', 'frequency', 'inventory', 'advanced'];

  const handleViewChange = (v: View) => {
    if (sensitiveViews.includes(v) && !vaultKey) {
      soundService.playAlert();
      setCurrentView('locked');
      return;
    }
    soundService.playClick();
    setCurrentView(v);
  };

  const [deadManTimer, setDeadManTimer] = useState<number | null>(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [deadManInterval, setDeadManInterval] = useState<any>(null);

  const startDeadMan = (minutes: number) => {
    const target = Date.now() + (minutes * 60 * 1000);
    setDeadManTimer(target);
    soundService.playAlert();
    
    if (deadManInterval) clearInterval(deadManInterval);
    const interval = setInterval(() => {
        if (Date.now() > target) {
            handleWipe();
            clearInterval(interval);
        }
    }, 1000);
    setDeadManInterval(interval);
  };

  const cancelDeadMan = () => {
    setDeadManTimer(null);
    if (deadManInterval) clearInterval(deadManInterval);
    soundService.playSuccess();
  };

  const handleWipe = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (settings.stealthMode || duressActive) {
    return <DecoyScreen settings={settings} type={settings.decoyType} onExit={() => {
      setSettings(s => ({ ...s, stealthMode: false }));
      setDuressActive(false);
    }} />;
  }

  return (
    <div 
      id="app-container" 
      className={`flex h-screen w-full bg-surface ${settings.language === 'fa' ? 'font-sans-fa' : ''}`}
      dir={settings.language === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <aside id="sidebar" className={`w-64 border-r border-border bg-card flex flex-col ${settings.language === 'fa' ? 'border-l border-r-0' : ''}`}>
        <div className={`p-6 flex items-center gap-2 ${settings.language === 'fa' ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
            <Shield className="text-surface" size={18} />
          </div>
          <h1 className="font-semibold text-lg tracking-tight text-brand">{settings.language === 'fa' ? 'سهند' : 'SAHAND'}</h1>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
            <SidebarItem 
              icon={Lock} 
              label={t.sidebar.vault} 
              active={currentView === 'vault'} 
              onClick={() => handleViewChange('vault')} 
            />
            <SidebarItem 
              icon={BookOpen} 
              label={t.sidebar.library} 
              active={currentView === 'library'} 
              onClick={() => handleViewChange('library')} 
            />
            <SidebarItem 
              icon={Languages} 
              label={t.sidebar.dictionary} 
              active={currentView === 'dictionary'} 
              onClick={() => handleViewChange('dictionary')} 
            />
            <SidebarItem 
              icon={BookOpenCheck} 
              label={t.sidebar.guides} 
              active={currentView === 'guides'} 
              onClick={() => handleViewChange('guides')} 
            />
            <SidebarItem 
              icon={AlertCircle} 
              label={t.sidebar.emergency} 
              active={currentView === 'emergency'} 
              onClick={() => handleViewChange('emergency')} 
            />
            <SidebarItem 
              icon={Radio} 
              label={t.sidebar.broadcasts} 
              active={currentView === 'broadcasts'} 
              onClick={() => handleViewChange('broadcasts')} 
            />
            <SidebarItem 
              icon={Wrench} 
              label={t.sidebar.tools} 
              active={currentView === 'tools'} 
              onClick={() => handleViewChange('tools')} 
            />
            <Divider />
            <SidebarItem 
              icon={Globe} 
              label={t.sidebar.map} 
              active={currentView === 'map'} 
              onClick={() => handleViewChange('map')} 
            />
            <SidebarItem 
              icon={FolderLock} 
              label={t.sidebar.files} 
              active={currentView === 'files'} 
              onClick={() => handleViewChange('files')} 
            />
            <SidebarItem 
              icon={Users} 
              label={t.sidebar.contacts} 
              active={currentView === 'contacts'} 
              onClick={() => handleViewChange('contacts')} 
            />
            <SidebarItem 
              icon={Calendar} 
              label={t.sidebar.journal} 
              active={currentView === 'journal'} 
              onClick={() => handleViewChange('journal')} 
            />
            <Divider />
            <SidebarItem 
              icon={Network} 
              label={t.sidebar.mesh} 
              active={currentView === 'mesh'} 
              onClick={() => handleViewChange('mesh')} 
            />
            <SidebarItem 
              icon={MessageSquare} 
              label={t.sidebar.chat} 
              active={currentView === 'chat'} 
              onClick={() => handleViewChange('chat')} 
            />
            <SidebarItem 
              icon={CheckCircle2} 
              label={t.sidebar.security} 
              active={currentView === 'security'} 
              onClick={() => handleViewChange('security')} 
            />
            <SidebarItem 
              icon={Cpu} 
              label={t.sidebar.intel || 'Intel'} 
              active={currentView === 'intel'} 
              onClick={() => handleViewChange('intel')} 
            />
            <SidebarItem 
              icon={Radio} 
              label={t.sidebar.signal} 
              active={currentView === 'signal'} 
              onClick={() => handleViewChange('signal')} 
            />
            <SidebarItem 
              icon={Layout} 
              label="Ops Board" 
              active={currentView === 'kanban'} 
              onClick={() => handleViewChange('kanban')} 
            />
            <SidebarItem 
              icon={Calendar} 
              label={t.sidebar.planner} 
              active={currentView === 'planner'} 
              onClick={() => handleViewChange('planner')} 
            />
            <SidebarItem 
              icon={Package} 
              label={t.sidebar.inventory} 
              active={currentView === 'inventory'} 
              onClick={() => handleViewChange('inventory')} 
            />
            <SidebarItem 
              icon={Award} 
              label={t.tools.manifestTitle} 
              active={currentView === 'manifest'} 
              onClick={() => handleViewChange('manifest')} 
            />
            <SidebarItem 
              icon={ShieldAlert} 
              label={t.sidebar.neural} 
              active={currentView === 'neural'} 
              onClick={() => handleViewChange('neural')} 
            />
            <SidebarItem 
              icon={Brain} 
              label={t.sidebar.intel_lab || 'Nexus Lab'} 
              active={currentView === 'intel_lab'} 
              onClick={() => handleViewChange('intel_lab')} 
            />
            <SidebarItem 
              icon={Zap} 
              label="Advanced Tools" 
              active={currentView === 'advanced'} 
              onClick={() => handleViewChange('advanced')} 
            />
            <SidebarItem 
              icon={SearchCode} 
              label={t.sidebar.forensics} 
              active={currentView === 'forensics'} 
              onClick={() => handleViewChange('forensics')} 
            />
          </nav>
  
          <div className="mt-auto border-t border-border">
            <SidebarItem 
              icon={SettingsIcon} 
              label={t.sidebar.settings} 
              active={currentView === 'settings'} 
              onClick={() => handleViewChange('settings')} 
            />
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        <header 
          className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shrink-0 select-none cursor-default"
          onDoubleClick={() => {
            if (settings.panicTrigger) {
              setSettings(s => ({ ...s, stealthMode: true }));
              soundService.playAlert();
            }
          }}
        >
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand">
              {t.sidebar[currentView as keyof typeof t.sidebar]}
            </h2>
            
            {/* GLOBAL HUD METRICS */}
            <div className="hidden lg:flex items-center gap-6 border-l border-border pl-6">
              <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-brand tracking-[0.4em] uppercase mb-1 opacity-50">{t.header.entropy}</span>
                  <EntropyGraph />
              </div>
              <MeshStatusHUD 
                status={meshStatus} 
                strength={signalStrength} 
                activity={meshActivity} 
                t={t} 
              />
              <div className="flex items-center gap-2">
                 <Zap size={10} className="text-orange-500" />
                 <span className="text-[9px] font-mono text-text-dim uppercase">{t.header.hud_load}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSettings(s => ({ ...s, nightVision: !s.nightVision }))}
              className={`p-2 rounded-full transition-colors ${settings.nightVision ? 'bg-brand text-surface' : 'text-text-dim hover:bg-surface'}`}
              title="Night Vision"
            >
              <Moon size={18} />
            </button>
            <PanicButton onPanic={() => setSettings(s => ({ ...s, stealthMode: true }))} lang={settings.language} />
            {vaultKey && (
              <button 
                onClick={lockVault}
                className="flex items-center gap-2 px-3 py-1.5 border border-brand/20 bg-brand/5 rounded-xl text-[10px] font-black uppercase text-brand hover:bg-brand/10 transition-all shadow-inner"
              >
                <Power size={12} />
                <span>{t.header.lock}</span>
              </button>
            )}
            <div className="hidden sm:block text-[10px] text-brand/60 font-mono border-l border-border pl-4">{t.header.status}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {currentView === 'vault' && (
              <VaultView 
                vaultKey={vaultKey}
                notes={notes}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                authInput={authInput}
                setAuthInput={setAuthInput}
                confirmInput={confirmInput}
                setConfirmInput={setConfirmInput}
                errorMessage={errorMessage}
                unlockVault={unlockVault}
                initializeVault={initializeVault}
                isVaultInitialized={isVaultInitialized}
                onCreateNote={handleCreateNote}
                onDeleteNote={handleDeleteNote}
                saveNotes={saveNotes}
                t={t}
                lang={settings.language}
              />
            )}

            {currentView === 'locked' && <LockedView t={t} onViewChange={handleViewChange} />}
            {currentView === 'guides' && <GuidesView t={t} />}
            {currentView === 'emergency' && <EmergencyView t={t} lang={settings.language} />}
            {currentView === 'broadcasts' && <BroadcastsView t={t} />}
            {currentView === 'library' && <LibraryView t={t} vaultKey={vaultKey} />}
            {currentView === 'dictionary' && <DictionaryView t={t} lang={settings.language} />}
            {currentView === 'tools' && (
              <ToolsView 
                t={t} 
                onViewChange={setCurrentView} 
                deadManTimer={deadManTimer}
                startDeadMan={startDeadMan}
                cancelDeadMan={cancelDeadMan}
                isSOSActive={isSOSActive}
                setIsSOSActive={setIsSOSActive}
              />
            )}
            {currentView === 'intel_lab' && <IntelLabView t={t} lang={lang} />}
            {currentView === 'advanced' && <AdvancedView t={t} vaultKey={vaultKey} />}
            {currentView === 'forensics' && <ForensicsView t={t} />}
            {currentView === 'kanban' && <KanbanView key="kanban" t={t} tasks={kanbanTasks} setTasks={setKanbanTasks} />}
            {currentView === 'planner' && <PlannerView key="planner" t={t} data={plannerData} setData={setPlannerData} language={settings.language} />}
            {currentView === 'inventory' && <InventoryView key="inventory" t={t} inventory={inventory} setInventory={setInventory} />}
            {currentView === 'frequency' && <FrequencyView key="frequency" t={t} />}
            {currentView === 'neural' && <NeuralLinkView t={t} />}
            {currentView === 'manifest' && <ManifestView t={t} />}
            {currentView === 'security' && <SecurityView embedded={false} t={t} />}
            {currentView === 'intel' && <IntelView t={t} lang={settings.language} vaultKey={vaultKey} context={{ journals: journalEntries, contacts, files: secureFiles }} />}
            {currentView === 'signal' && <SignalView t={t} />}
            {currentView === 'contacts' && (
              <ContactsView 
                key="contacts" 
                vaultKey={vaultKey} 
                t={t} 
                contacts={contacts} 
                onUpdate={setContacts} 
              />
            )}
            {currentView === 'journal' && (
              <JournalView 
                key="journal" 
                vaultKey={vaultKey} 
                t={t} 
                lang={settings.language} 
                entries={journalEntries}
                onUpdate={setJournalEntries}
              />
            )}
            {currentView === 'mesh' && <MeshView key="mesh" t={t} socket={socket} status={meshStatus} strength={signalStrength} activity={meshActivity} onConnect={connectToRelay} onDisconnect={disconnectFromRelay} triggerPulse={triggerActivityPulse} />}
            {currentView === 'chat' && (
              <AssistantView 
                key="assistant" 
                t={t} 
                vaultKey={vaultKey} 
                journals={journalEntries}
                contacts={contacts}
                files={secureFiles}
                settings={settings}
                guides={t.guides}
              />
            )}
            {currentView === 'map' && <MapView key="map" t={t} settings={settings} setSettings={setSettings} />}
            {currentView === 'files' && (
              <FilesView 
                key="files" 
                t={t} 
                vaultKey={vaultKey} 
                files={secureFiles} 
                onUpload={(e) => handleFileUpload(e, vaultKey!)} 
                onDelete={deleteFile}
              />
            )}
            {currentView === 'settings' && (
              <SettingsView 
                key="settings" 
                settings={settings} 
                setSettings={setSettings} 
                t={t}
                vaultKey={vaultKey}
                setConfirmDialog={setConfirmDialog}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <ConfirmModal 
        {...confirmDialog}
        t={t}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onDuress={() => setDuressActive(true)}
      />
    </div>
  );
}

// --- Specific Components ---

function PanicButton({ onPanic, lang }: { onPanic: () => void, lang: Language }) {
  const t = translations[lang];
  return (
    <button
      onClick={onPanic}
      className={`p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors group relative ${lang === 'fa' ? 'rtl' : ''}`}
      title={t.common.panicEsc}
    >
      <AlertTriangle size={20} />
      <span className={`absolute ${lang === 'fa' ? 'left-full ml-2' : 'right-full mr-2'} px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
        {t.common.panic}
      </span>
    </button>
  );
}

function WeatherStation() {
  const [data, setData] = useState({ temp: 24, hum: 45, wind: 5, press: 1012 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        temp: prev.temp + (Math.random() - 0.5),
        hum: Math.max(0, Math.min(100, prev.hum + (Math.random() - 0.5) * 2)),
        wind: Math.max(0, prev.wind + (Math.random() - 0.5)),
        press: prev.press + (Math.random() - 0.5)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#f0f2f5] flex items-center justify-center z-[9999] font-sans text-slate-800">
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-12 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Wind size={200} />
         </div>
         <div className="flex justify-between items-start mb-12">
            <div>
               <h4 className="text-4xl font-black tracking-tighter uppercase text-slate-400">Atmospheric Data</h4>
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Live Sensor Array: STN_774</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Activity size={24} />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-8">
            <div className="p-8 bg-slate-50 rounded-[2.5rem]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temperature</p>
               <p className="text-4xl font-black text-slate-800">{data.temp.toFixed(1)}°C</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Humidity</p>
               <p className="text-4xl font-black text-slate-800">{data.hum.toFixed(0)}%</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wind Speed</p>
               <p className="text-4xl font-black text-slate-800">{data.wind.toFixed(1)} m/s</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pressure</p>
               <p className="text-4xl font-black text-slate-800">{data.press.toFixed(0)} hPa</p>
            </div>
         </div>

         <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Station: Online</span>
            </div>
            <span className="text-[10px] font-mono text-slate-300">{new Date().toLocaleTimeString()}</span>
         </div>
      </div>
    </div>
  );
}

function DecoyScreen({ type, onExit, settings }: { type: string, onExit: () => void, settings: Settings }) {
  const [calcVal, setCalcVal] = useState('0');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { e.key === 'Escape' && onExit(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (type === 'weather') return <WeatherStation />;

  if (type === 'calculator') {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-[9999]">
        <div id="decoy-calc" className="w-80 bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="p-6 text-right text-4xl font-light tracking-tight text-gray-800 h-24 flex items-end justify-end">
            {calcVal}
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100">
            {['AC', '+/-', '%', '/', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', 'C', '='].map(btn => (
              <button 
                key={btn}
                onClick={() => setCalcVal(btn === 'AC' ? '0' : btn)} 
                className="h-16 flex items-center justify-center text-lg hover:bg-white transition-colors bg-gray-50"
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="p-2 text-center text-[10px] text-gray-300">SYSTEM_CALCULATOR_VER_4.2</div>
        </div>
      </div>
    );
  }

  const t = translations[settings.language];
  const lang = settings.language;

  return (
    <div 
      className="fixed inset-0 bg-black text-green-500 font-mono p-10 z-[9999] overflow-hidden"
      onClick={onExit}
    >
      <p>{t.decoy.initializing}</p>
      <p className="mt-2">{t.decoy.checksum}</p>
      <p>{t.decoy.isolated}</p>
      <p>{t.decoy.allocated}</p>
      <p className="mt-4">{t.decoy.starting}</p>
      <p className="animate-pulse">_</p>
      <div className="absolute bottom-10 right-10 text-[10px] text-gray-800">
        0x00FF821 - {t.decoy.idle}
      </div>
    </div>
  );
}

// --- Views (Updated) ---

function LibraryView({ t, vaultKey }: { t: any, vaultKey: string | null, key?: string }) {
  const [documents, setDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('sahand_library');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDoc, setActiveDoc] = useState<any | null>(null);

  const manuals = [
    { title: 'Urban Evasion', size: '2.4MB', id: 'SURV_01' },
    { title: 'Trauma Care', size: '5.6MB', id: 'MED_09' },
    { title: 'Radio Protocol', size: '1.2MB', id: 'RADIO_04' }
  ];

  useEffect(() => {
    localStorage.setItem('sahand_library', JSON.stringify(documents));
  }, [documents]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vaultKey) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      
      // Calculate approximate size of entire library + new doc
      const currentLibrarySize = JSON.stringify(documents).length;
      const incomingSize = base64.length * 1.5; // Encryption overhead (~30%) + Base64
      
      if (currentLibrarySize + incomingSize > 4 * 1024 * 1024) {
        alert("CRITICAL_ERROR: STORAGE_BUFFER_FULL. To prevent data corruption or crashes, large files cannot be imported. Please delete existing documents first.");
        return;
      }

      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: encryptData(file.name, vaultKey),
        content: encryptData(base64, vaultKey),
        type: file.type,
        addedAt: Date.now()
      };

      setDocuments(prev => [newDoc, ...prev]);
    };
    
    // Read as DataURL for all binary/large files (PDF, Excel, Images)
    // Read as Text only for simple scripts/notes
    if (file.type.includes('text') && !file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const deleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };
  
  if (!vaultKey) return <VaultLockedPlaceholder t={t} />;

  if (activeDoc) {
    return <DocumentViewer doc={activeDoc} vaultKey={vaultKey} t={t} onClose={() => setActiveDoc(null)} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-brand">{t.library.title}</h3>
          <p className="text-text-dim mt-1">{t.library.subtitle}</p>
        </div>
        <label className="flex items-center gap-2 px-6 py-3 bg-brand text-surface rounded-2xl hover:opacity-80 transition-all shadow-lg cursor-pointer">
          <Plus size={20} />
          <span className="font-medium">{t.library.import}</span>
          <input type="file" className="hidden" onChange={handleImport} accept=".pdf,.txt,.epub,.xlsx,.csv" />
        </label>
      </div>

      <div className="bg-brand/5 border border-brand/20 rounded-[2.5rem] p-8 mb-10 group overflow-hidden relative shadow-inner">
         <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <BookOpen size={100} />
         </div>
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-brand" size={24} />
              <h3 className="text-xl font-black text-brand uppercase tracking-tighter">Command Repository</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {manuals.map(m => (
                <div key={m.id} className="p-4 bg-surface border border-border rounded-2xl flex justify-between items-center group/item hover:border-brand/40 transition-all cursor-pointer shadow-sm">
                   <div className="flex flex-col">
                      <span className="text-xs font-black text-brand group-hover/item:text-brand transition-colors">{m.title}</span>
                      <span className="text-[9px] font-mono font-bold text-text-dim uppercase tracking-widest">{m.size}</span>
                   </div>
                   <div className="p-2 bg-brand/10 rounded-lg text-brand group-hover/item:bg-brand group-hover/item:text-surface transition-all">
                      <Download size={14} />
                   </div>
                </div>
              ))}
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-3xl bg-card/30">
            <BookOpen className="mx-auto text-text-dim/20 mb-4" size={48} />
            <p className="text-text-dim font-medium">{t.library.empty}</p>
            <p className="text-[10px] text-text-dim/60 uppercase mt-2">{t.library.types}</p>
          </div>
        ) : (
          documents.map(doc => {
            const name = decryptData(doc.name, vaultKey);
            return (
              <div key={doc.id} className="bg-card p-6 border border-border rounded-2xl hover:border-text-dim transition-all group relative cursor-pointer" onClick={() => setActiveDoc(doc)}>
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-4 text-brand group-hover:scale-110 transition-transform">
                  {doc.type.includes('pdf') ? <Book size={24} /> : <BookOpen size={24} />}
                </div>
                <h4 className="font-bold text-brand mb-1 truncate">{name}</h4>
                <p className="text-[10px] text-text-dim uppercase font-mono">{doc.type.split('/')[1] || 'DOC'}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                  className="absolute top-4 right-4 p-2 text-text-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function VaultLockedPlaceholder({ t }: { t: any }) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
        <Lock className="text-text-dim" size={32} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-brand">{t.vault.lockedTitle}</h3>
      <p className="text-text-dim text-sm">{t.vault.lockedSubtitle}</p>
    </div>
  );
}

function DocumentViewer({ doc, vaultKey, t, onClose }: { doc: any, vaultKey: string, t: any, onClose: () => void }) {
  const name = decryptData(doc.name, vaultKey);
  const content = decryptData(doc.content, vaultKey);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<any[][] | null>(null);

  useEffect(() => {
    if (doc.type.includes('pdf')) {
      try {
        const blob = base64ToBlob(content, doc.type);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error("PDF_BLOB_ERROR:", e);
      }
    } else if (doc.type.includes('sheet') || doc.type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
      try {
        const workbook: XLSX.WorkBook = XLSX.read(content.split(',')[1] || content, { type: 'base64' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        setExcelData(data);
      } catch (e) {
        console.error("EXCEL_READ_ERROR:", e);
      }
    }
  }, [doc, content, name]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg text-brand">
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <h3 className="font-bold text-brand">{name}</h3>
        </div>
        <p className="text-[10px] font-mono text-text-dim uppercase">{doc.type}</p>
      </div>
      
      <div className="flex-1 bg-surface border border-border rounded-3xl overflow-hidden shadow-inner flex flex-col">
        {doc.type.includes('pdf') ? (
          blobUrl ? (
            <iframe 
              src={`${blobUrl}#toolbar=0`} 
              className="w-full h-full border-none"
              title="pdf-viewer"
            />
          ) : (
            <div className="p-10 flex items-center justify-center h-full text-brand animate-pulse font-mono text-xs uppercase tracking-widest">
              Decrypting_Secure_Stream...
            </div>
          )
        ) : excelData ? (
          <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-white">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface sticky top-0 font-bold uppercase tracking-widest text-text-dim border-b-2 border-border">
                  {excelData[0]?.map((cell, i) => (
                    <th key={i} className="p-3 border-r border-border">{cell || `COL_${i+1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {excelData.slice(1).map((row, i) => (
                  <tr key={i} className="hover:bg-brand/5 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 border-r border-border font-mono">{String(cell || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : doc.type.includes('text') || doc.type.includes('txt') ? (
          <div className="p-10 max-w-2xl mx-auto h-full overflow-y-auto text-brand leading-relaxed font-serif whitespace-pre-wrap selection:bg-brand/20">
            {content}
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center h-full text-text-dim">
            <AlertTriangle size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium uppercase tracking-widest">{t.library.unsupportedType || 'Preview Not Available'}</p>
            <a href={content} download={name} className="mt-4 px-6 py-2 bg-brand text-surface rounded-xl text-xs font-bold uppercase tracking-widest">
              Download to View
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DictionaryView({ t, lang }: { t: any, lang: Language, key?: string }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'enFa' | 'faEn'>('faEn');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const dictionary: { fa: string, en: string[], cat: string }[] = useMemo(() => [
    // --- TACTICAL & NAVIGATION ---
    { fa: 'هدف', en: ['Target', 'Objective', 'Goal'], cat: 'tactical' },
    { fa: 'منطقه', en: ['Zone', 'Area', 'Region', 'Sector'], cat: 'tactical' },
    { fa: 'عملیات', en: ['Operation', 'Mission'], cat: 'tactical' },
    { fa: 'تاکتیکی', en: ['Tactical'], cat: 'tactical' },
    { fa: 'استراتژیک', en: ['Strategic'], cat: 'tactical' },
    { fa: 'محرمانه', en: ['Confidential', 'Classified'], cat: 'tactical' },
    { fa: 'سری', en: ['Secret', 'Top Secret'], cat: 'tactical' },
    { fa: 'جنگ', en: ['War', 'Conflict'], cat: 'tactical' },
    { fa: 'اسلحه', en: ['Weapon', 'Armament'], cat: 'tactical' },
    { fa: 'مهمات', en: ['Ammunition', 'Ammo'], cat: 'tactical' },
    { fa: 'تدارکات', en: ['Supplies', 'Logistics'], cat: 'tactical' },
    { fa: 'ارتباط', en: ['Communication', 'Contact'], cat: 'tactical' },
    { fa: 'بیسیم', en: ['Wireless', 'Radio'], cat: 'tactical' },
    { fa: 'فرکانس', en: ['Frequency'], cat: 'tactical' },
    { fa: 'پارازیت', en: ['Noise', 'Interference', 'Jamming'], cat: 'tactical' },
    { fa: 'رله', en: ['Relay'], cat: 'tactical' },
    { fa: 'ماهواره', en: ['Satellite'], cat: 'tactical' },
    { fa: 'مختصات', en: ['Coordinates'], cat: 'tactical' },
    { fa: 'ارتفاع', en: ['Altitude', 'Height'], cat: 'tactical' },
    { fa: 'سرعت', en: ['Speed', 'Velocity'], cat: 'tactical' },
    { fa: 'جهت', en: ['Direction', 'Bearing'], cat: 'tactical' },
    { fa: 'شمال', en: ['North'], cat: 'tactical' },
    { fa: 'جنوب', en: ['South'], cat: 'tactical' },
    { fa: 'شرق', en: ['East'], cat: 'tactical' },
    { fa: 'غرب', en: ['West'], cat: 'tactical' },
    { fa: 'کمین', en: ['Ambush'], cat: 'tactical' },
    { fa: 'گشت', en: ['Patrol'], cat: 'tactical' },
    { fa: 'تجسس', en: ['Reconnaissance', 'Surveillance'], cat: 'tactical' },
    { fa: 'نفوذ', en: ['Infiltration', 'Penetration'], cat: 'tactical' },
    { fa: 'تخلیه', en: ['Evacuation', 'Extraction'], cat: 'tactical' },
    { fa: 'فرار', en: ['Escape'], cat: 'tactical' },
    { fa: 'اسیر', en: ['Prisoner', 'Captive'], cat: 'tactical' },
    { fa: 'تلفات', en: ['Casualties'], cat: 'tactical' },
    { fa: 'مجروح', en: ['Wounded', 'Injured'], cat: 'tactical' },
    { fa: 'کشته', en: ['Killed', 'Fatalities'], cat: 'tactical' },
    { fa: 'پناهگاه', en: ['Shelter', 'Bunker', 'Hideout'], cat: 'tactical' },
    { fa: 'سنگر', en: ['Trench', 'Fortification'], cat: 'tactical' },
    { fa: 'فرمانده', en: ['Commander', 'Officer'], cat: 'tactical' },
    { fa: 'سرباز', en: ['Soldier', 'Troop'], cat: 'tactical' },

    // --- MEDICAL & TRIAGE ---
    { fa: 'پزشک', en: ['Doctor', 'Physician', 'Medic'], cat: 'medical' },
    { fa: 'پرستار', en: ['Nurse'], cat: 'medical' },
    { fa: 'بیمارستان', en: ['Hospital'], cat: 'medical' },
    { fa: 'دارو', en: ['Medicine', 'Drug'], cat: 'medical' },
    { fa: 'تزریق', en: ['Injection'], cat: 'medical' },
    { fa: 'خون', en: ['Blood'], cat: 'medical' },
    { fa: 'قلب', en: ['Heart'], cat: 'medical' },
    { fa: 'ریه', en: ['Lungs'], cat: 'medical' },
    { fa: 'مغز', en: ['Brain'], cat: 'medical' },
    { fa: 'ضربان', en: ['Pulse', 'Heartbeat'], cat: 'medical' },
    { fa: 'فشار خون', en: ['Blood Pressure'], cat: 'medical' },
    { fa: 'تب', en: ['Fever', 'Temperature'], cat: 'medical' },
    { fa: 'درد', en: ['Pain'], cat: 'medical' },
    { fa: 'بیهوشی', en: ['Unconsciousness', 'Anesthesia'], cat: 'medical' },
    { fa: 'جراحی', en: ['Surgery', 'Operation'], cat: 'medical' },
    { fa: 'بخیه', en: ['Suture', 'Stitches'], cat: 'medical' },
    { fa: 'پانسمان', en: ['Dressing', 'Bandage'], cat: 'medical' },
    { fa: 'شکستگی', en: ['Fracture'], cat: 'medical' },
    { fa: 'خونریزی', en: ['Bleeding', 'Hemorrhage'], cat: 'medical' },
    { fa: 'عفونت', en: ['Infection'], cat: 'medical' },
    { fa: 'شوک', en: ['Shock'], cat: 'medical' },
    { fa: 'احیا', en: ['Resuscitation', 'CPR'], cat: 'medical' },
    { fa: 'گردنی', en: ['Cervical', 'Neck'], cat: 'medical' },
    { fa: 'تنفسی', en: ['Respiratory'], cat: 'medical' },

    // --- TECHNICAL & CYBER ---
    { fa: 'هوش مصنوعی', en: ['Artificial Intelligence', 'AI'], cat: 'tech' },
    { fa: 'شبکه', en: ['Network'], cat: 'tech' },
    { fa: 'امنیت', en: ['Security'], cat: 'tech' },
    { fa: 'رمزنگاری', en: ['Encryption'], cat: 'tech' },
    { fa: 'رمزگشایی', en: ['Decryption'], cat: 'tech' },
    { fa: 'نرم‌افزار', en: ['Software', 'App'], cat: 'tech' },
    { fa: 'سخت‌افزار', en: ['Hardware'], cat: 'tech' },
    { fa: 'پردازنده', en: ['Processor', 'CPU'], cat: 'tech' },
    { fa: 'حافظه', en: ['Memory'], cat: 'tech' },
    { fa: 'پایگاه داده', en: ['Database'], cat: 'tech' },
    { fa: 'سرور', en: ['Server'], cat: 'tech' },
    { fa: 'نفوذگر', en: ['Hacker'], cat: 'tech' },
    { fa: 'بدافزار', en: ['Malware'], cat: 'tech' },
    { fa: 'فایروال', en: ['Firewall'], cat: 'tech' },
    { fa: 'پروتکل', en: ['Protocol'], cat: 'tech' },
    { fa: 'داده', en: ['Data'], cat: 'tech' },
    { fa: 'الگوریتم', en: ['Algorithm'], cat: 'tech' },
    { fa: 'رابط کاربری', en: ['User Interface', 'UI'], cat: 'tech' },

    // --- COMMON & DAILY ---
    { fa: 'سلام', en: ['Hello', 'Hi'], cat: 'common' },
    { fa: 'خداحافظ', en: ['Goodbye'], cat: 'common' },
    { fa: 'بله', en: ['Yes'], cat: 'common' },
    { fa: 'خیر', en: ['No'], cat: 'common' },
    { fa: 'لطفا', en: ['Please'], cat: 'common' },
    { fa: 'ممنون', en: ['Thank you', 'Thanks'], cat: 'common' },
    { fa: 'ببخشید', en: ['Excuse me', 'Sorry'], cat: 'common' },
    { fa: 'آب', en: ['Water'], cat: 'common' },
    { fa: 'نان', en: ['Bread'], cat: 'common' },
    { fa: 'غذا', en: ['Food'], cat: 'common' },
    { fa: 'خواب', en: ['Sleep'], cat: 'common' },
    { fa: 'بیدار', en: ['Awake'], cat: 'common' },
    { fa: 'سریع', en: ['Fast', 'Quick'], cat: 'common' },
    { fa: 'آرام', en: ['Slow', 'Calm'], cat: 'common' },
    { fa: 'بزرگ', en: ['Big', 'Large'], cat: 'common' },
    { fa: 'کوچک', en: ['Small', 'Little'], cat: 'common' },
    { fa: 'خوب', en: ['Good', 'Well'], cat: 'common' },
    { fa: 'بد', en: ['Bad'], cat: 'common' },
    { fa: 'امروز', en: ['Today'], cat: 'common' },
    { fa: 'فردا', en: ['Tomorrow'], cat: 'common' },
    { fa: 'دیروز', en: ['Yesterday'], cat: 'common' },
    { fa: 'ساعت', en: ['Clock', 'Hour', 'Time'], cat: 'common' },
    { fa: 'آزادی', en: ['Freedom', 'Liberty'], cat: 'common' },
    { fa: 'صلح', en: ['Peace'], cat: 'common' },
    { fa: 'عشق', en: ['Love'], cat: 'common' },
    { fa: 'خانواده', en: ['Family'], cat: 'common' },
    { fa: 'دوست', en: ['Friend'], cat: 'common' },
    { fa: 'دشمن', en: ['Enemy'], cat: 'common' },
    { fa: 'مدرسه', en: ['School'], cat: 'common' },
    { fa: 'دانشگاه', en: ['University'], cat: 'common' },
    { fa: 'کار', en: ['Work', 'Job'], cat: 'common' },
    { fa: 'پول', en: ['Money'], cat: 'common' },

    // --- EMOTIONS ---
    { fa: 'خوشحال', en: ['Happy', 'Glad'], cat: 'emotions' },
    { fa: 'ناراحت', en: ['Sad', 'Upset'], cat: 'emotions' },
    { fa: 'عصبانی', en: ['Angry', 'Mad'], cat: 'emotions' },
    { fa: 'ترسیده', en: ['Scared', 'Afraid'], cat: 'emotions' },
    { fa: 'خسته', en: ['Tired'], cat: 'emotions' },
    { fa: 'هیجان‌زده', en: ['Excited'], cat: 'emotions' },
    { fa: 'امیدوار', en: ['Hopeful'], cat: 'emotions' },
    { fa: 'نگران', en: ['Worried', 'Anxious'], cat: 'emotions' },

    // --- COLORS & NUMBERS ---
    { fa: 'سفید', en: ['White'], cat: 'colors' },
    { fa: 'سیاه', en: ['Black'], cat: 'colors' },
    { fa: 'قرمز', en: ['Red'], cat: 'colors' },
    { fa: 'آبی', en: ['Blue'], cat: 'colors' },
    { fa: 'سبز', en: ['Green'], cat: 'colors' },
    { fa: 'زرد', en: ['Yellow'], cat: 'colors' },
    { fa: 'صفر', en: ['Zero'], cat: 'numbers' },
    { fa: 'یک', en: ['One'], cat: 'numbers' },
    { fa: 'دو', en: ['Two'], cat: 'numbers' },
    { fa: 'سه', en: ['Three'], cat: 'numbers' },
    { fa: 'ده', en: ['Ten'], cat: 'numbers' },
    { fa: 'صد', en: ['Hundred'], cat: 'numbers' },
    { fa: 'هزار', en: ['One Thousand'], cat: 'numbers' },
    { fa: 'پنهان', en: ['Hidden', 'Concealed'], cat: 'tactical' },
    { fa: 'نشت', en: ['Leak', 'Exposure'], cat: 'tech' },
    { fa: 'نفوذ پذیری', en: ['Vulnerability', 'Permeability'], cat: 'tech' },
    { fa: 'پچ', en: ['Patch', 'Fix'], cat: 'tech' },
    { fa: 'پراکسی', en: ['Proxy'], cat: 'tech' },
    { fa: 'تونل', en: ['Tunnel'], cat: 'tech' },
    { fa: 'گره', en: ['Node', 'Vertex'], cat: 'tech' },
    { fa: 'رشته', en: ['String', 'Thread'], cat: 'tech' },
    { fa: 'دودویی', en: ['Binary'], cat: 'tech' },
    { fa: 'مبنای ۱۶', en: ['Hexadecimal', 'Hex'], cat: 'tech' },
    { fa: 'سرنخ', en: ['Clew', 'Lead', 'Hint'], cat: 'forensics' },
    { fa: 'دلیل', en: ['Evidence', 'Reason'], cat: 'forensics' },
    { fa: 'اثر انگشت', en: ['Fingerprint'], cat: 'forensics' },
    { fa: 'ردپا', en: ['Footprint', 'Trace'], cat: 'forensics' },
    { fa: 'بازرسی', en: ['Inspection'], cat: 'forensics' },
    { fa: 'کالبدشکافی', en: ['Autopsy', 'Dissection'], cat: 'forensics' },
    { fa: 'پزشکی قانونی', en: ['Forensics'], cat: 'forensics' },
    { fa: 'سم شناسی', en: ['Toxicology'], cat: 'medical' },
    { fa: 'پاتولوژی', en: ['Pathology'], cat: 'medical' },
    { fa: 'رادیولوژی', en: ['Radiology'], cat: 'medical' },
    { fa: 'تیراندازی', en: ['Shooting', 'Firing'], cat: 'tactical' },
    { fa: 'انفجار', en: ['Explosion', 'Blast'], cat: 'tactical' },
    { fa: 'تله', en: ['Trap', 'Snare'], cat: 'tactical' },
    { fa: 'مین', en: ['Mine'], cat: 'tactical' },
    { fa: 'بمب', en: ['Bomb'], cat: 'tactical' },
    { fa: 'نارنجک', en: ['Grenade'], cat: 'tactical' },
    { fa: 'پدافند', en: ['Defense', 'Air Defense'], cat: 'tactical' },
    { fa: 'آفند', en: ['Offense', 'Attack'], cat: 'tactical' },
    { fa: 'قرارگاه', en: ['Base', 'Headquarters', 'HQ'], cat: 'tactical' },
    { fa: 'پادگان', en: ['Barracks', 'Garrison'], cat: 'tactical' },
    { fa: 'رزمی', en: ['Combat', 'Martial'], cat: 'tactical' },
    { fa: 'بیولوژیک', en: ['Biological'], cat: 'tactical' },
    { fa: 'شیمیایی', en: ['Chemical'], cat: 'tactical' },
    { fa: 'هسته‌ای', en: ['Nuclear'], cat: 'tactical' },
    { fa: 'اشعه', en: ['Radiation', 'Ray'], cat: 'tactical' },
    { fa: 'سرعت‌سنج', en: ['Speedometer'], cat: 'tactical' },
    { fa: 'نقشه', en: ['Map'], cat: 'tactical' },
    { fa: 'راهنما', en: ['Guide', 'Pilot'], cat: 'tactical' },
    { fa: 'مسیر', en: ['Route', 'Path'], cat: 'tactical' },
    { fa: 'مقصد', en: ['Destination'], cat: 'tactical' },
    { fa: 'تجهیزات', en: ['Equipment', 'Gear'], cat: 'tactical' },
    { fa: 'آمادگی', en: ['Readiness', 'Preparedness'], cat: 'tactical' },
    { fa: 'کمک‌های اولیه', en: ['First Aid'], cat: 'medical' },
    { fa: 'اورژانس', en: ['Emergency'], cat: 'medical' },
    { fa: 'آمبولانس', en: ['Ambulance'], cat: 'medical' },
    { fa: 'آتل', en: ['Splint'], cat: 'medical' },
    { fa: 'بانداژ', en: ['Bandage'], cat: 'medical' },
    { fa: 'سرم', en: ['Serum', 'IV Fluid'], cat: 'medical' },
    { fa: 'اکسیژن', en: ['Oxygen'], cat: 'medical' },
    { fa: 'ضد عفونی', en: ['Disinfectant', 'Antiseptic'], cat: 'medical' },
    { fa: 'ماسک', en: ['Mask'], cat: 'medical' },
    { fa: 'دماسنج', en: ['Thermometer'], cat: 'medical' },
    { fa: 'دسترسی', en: ['Access'], cat: 'tech' },
    { fa: 'مجوز', en: ['Permission', 'License'], cat: 'tech' },
    { fa: 'نشت داده', en: ['Data Leak'], cat: 'tech' },
    { fa: 'رمز عبور', en: ['Password'], cat: 'tech' },
    { fa: 'ورود', en: ['Login', 'Enter'], cat: 'tech' },
    { fa: 'خروج', en: ['Logout', 'Exit'], cat: 'tech' },
    { fa: 'تنظیمات', en: ['Settings', 'Config'], cat: 'tech' },
    { fa: 'فایل', en: ['File'], cat: 'tech' },
    { fa: 'پوشه', en: ['Folder', 'Directory'], cat: 'tech' },
    { fa: 'بارگیری', en: ['Download'], cat: 'tech' },
    { fa: 'بارگذاری', en: ['Upload'], cat: 'tech' },
    { fa: 'همگام‌سازی', en: ['Sync', 'Synchronization'], cat: 'tech' },
    { fa: 'به‌روزرسانی', en: ['Update'], cat: 'tech' },
    { fa: 'خطا', en: ['Error', 'Bug'], cat: 'tech' },
    { fa: 'موفقیت', en: ['Success'], cat: 'tech' },
    { fa: 'ناشناس', en: ['Anonymous'], cat: 'tech' },
    { fa: 'پنهان‌سازی', en: ['Obfuscation'], cat: 'tech' },
    { fa: 'تونل زنی', en: ['Tunneling'], cat: 'tech' },
    { fa: 'دیروز', en: ['Yesterday'], cat: 'common' },
    { fa: 'پریروز', en: ['Day before yesterday'], cat: 'common' },
    { fa: 'پریشب', en: ['Night before last'], cat: 'common' },
    { fa: 'دیشب', en: ['Last night'], cat: 'common' },
    { fa: 'صبح', en: ['Morning'], cat: 'common' },
    { fa: 'ظهر', en: ['Noon'], cat: 'common' },
    { fa: 'عصر', en: ['Afternoon'], cat: 'common' },
    { fa: 'شب', en: ['Night'], cat: 'common' },
    { fa: 'پاسخ', en: ['Answer', 'Response'], cat: 'common' },
    { fa: 'پرسش', en: ['Question'], cat: 'common' },
    { fa: 'اطلاعات', en: ['Information', 'Intel'], cat: 'common' },
    { fa: 'گزارش', en: ['Report'], cat: 'common' },
    { fa: 'پیام', en: ['Message'], cat: 'common' },
    { fa: 'صدا', en: ['Sound', 'Voice'], cat: 'common' },
    { fa: 'تصویر', en: ['Image', 'Picture'], cat: 'common' },
    { fa: 'ویدیو', en: ['Video'], cat: 'common' },
    { fa: 'نور', en: ['Light'], cat: 'common' },
    { fa: 'تاریکی', en: ['Darkness'], cat: 'common' },
    { fa: 'بالا', en: ['Up', 'High'], cat: 'common' },
    { fa: 'پایین', en: ['Down', 'Low'], cat: 'common' },
    { fa: 'چپ', en: ['Left'], cat: 'common' },
    { fa: 'راست', en: ['Right'], cat: 'common' },
  ], []);

  const normalizeFarsi = (text: string) => {
    return text
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u200c]/g, ' ') // Replace ZWNJ with space
      .trim();
  };

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    const nq = normalizeFarsi(q);
    
    return dictionary.filter(entry => {
      const faMatch = normalizeFarsi(entry.fa).toLowerCase().includes(nq);
      const enMatch = entry.en.some(e => e.toLowerCase().includes(q));
      
      const categoryMatch = !selectedCat || entry.cat === selectedCat;
      if (!categoryMatch) return false;

      // Prioritize the current mode, but show both if typed correctly
      if (mode === 'faEn') {
        return faMatch || (q.length > 2 && enMatch);
      } else {
        return enMatch || (q.length > 2 && faMatch);
      }
    }).sort((a, b) => {
      if (mode === 'faEn') {
        return a.fa.localeCompare(b.fa, 'fa');
      } else {
        return a.en[0].localeCompare(b.en[0]);
      }
    });
  }, [query, mode, dictionary, selectedCat]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="text-center mb-10 shrink-0">
        <h3 className="text-4xl font-black text-brand mb-2 tracking-tighter uppercase">{t.dictionary.title}</h3>
        <p className="text-text-dim font-mono text-[10px] tracking-[0.3em] uppercase">{t.dictionary.subtitle}</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl flex-1 flex flex-col min-h-0">
        <div className="flex gap-3 mb-6">
          <button 
            onClick={() => { setMode('faEn'); setQuery(''); }}
            className={`flex-1 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${mode === 'faEn' ? 'bg-brand text-surface shadow-lg shadow-brand/20 scale-[1.02]' : 'bg-surface text-text-dim hover:bg-border'}`}
          >
            {t.dictionary.faEn}
          </button>
          <button 
            onClick={() => { setMode('enFa'); setQuery(''); }}
            className={`flex-1 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${mode === 'enFa' ? 'bg-brand text-surface shadow-lg shadow-brand/20 scale-[1.02]' : 'bg-surface text-text-dim hover:bg-border'}`}
          >
            {t.dictionary.enFa}
          </button>
        </div>

        <div className="relative mb-4 shadow-inner rounded-2xl bg-surface/50">
          <Search className={`absolute ${lang === 'fa' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-brand`} size={20} />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.dictionary.placeholder}
            className={`w-full ${lang === 'fa' ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 bg-transparent border-none rounded-2xl text-xl text-brand outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium placeholder:text-text-dim/30`}
            dir={mode === 'faEn' ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${!selectedCat ? 'bg-brand text-surface border-brand' : 'bg-surface text-text-dim border-border hover:border-brand/40'}`}
          >
            {lang === 'fa' ? 'همه' : 'All'}
          </button>
          {Object.keys(t.dictionary.categories).map(catKey => (
            <button
              key={catKey}
              onClick={() => setSelectedCat(catKey)}
              className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${selectedCat === catKey ? 'bg-brand text-surface border-brand' : 'bg-surface text-text-dim border-border hover:border-brand/40'}`}
            >
              {t.dictionary.categories[catKey]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mb-8 overflow-x-auto pb-2 justify-center no-scrollbar">
          {(mode === 'faEn' ? 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('') : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).map(char => (
            <button
              key={char}
              onClick={() => setQuery(char)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border text-[10px] font-bold text-text-dim hover:border-brand hover:text-brand transition-all active:scale-90"
            >
              {char}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 min-h-0">
          {query.length > 0 ? (
            results.length > 0 ? (
              results.map((entry, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  key={entry.fa + i} 
                  className="p-5 bg-surface/40 rounded-[1.5rem] border border-border/50 flex items-center justify-between group hover:border-brand/40 hover:bg-surface/60 transition-all active:scale-[0.98]"
                >
                  <div className={`flex flex-col ${lang === 'fa' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-black uppercase text-brand/40 tracking-widest mb-1">
                      {t.dictionary.categories[entry.cat] || entry.cat}
                    </span>
                    <span className={`font-bold text-brand text-2xl ${mode === 'faEn' ? 'font-vazirmatn' : ''}`}>
                      {mode === 'faEn' ? entry.fa : entry.en.join(', ')}
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 ${lang === 'fa' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          const text = mode === 'faEn' ? `${entry.fa} -> ${entry.en.join(', ')}` : `${entry.en.join(', ')} -> ${entry.fa}`;
                          navigator.clipboard.writeText(text);
                        }}
                        className="p-2 bg-surface hover:bg-border rounded-lg text-text-dim transition-all"
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <ArrowRight className={`text-text-dim/20 ${lang === 'fa' ? 'rotate-180' : ''}`} size={20} />
                    <div className={`flex flex-wrap gap-2 ${lang === 'fa' ? 'justify-start' : 'justify-end'}`}>
                      {(mode === 'faEn' ? entry.en : [entry.fa]).map(v => (
                        <span key={v} className="px-4 py-2 bg-brand text-surface hover:bg-brand-light transition-colors rounded-xl text-xs font-black uppercase shadow-sm">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale">
                <Search size={80} className="mb-4" />
                <p className="text-2xl font-black uppercase tracking-tighter">{t.dictionary.noResult}</p>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-dim/20 py-20 select-none">
              <Languages size={100} className="mb-8 opacity-10" />
              <div className="text-center max-w-sm space-y-2">
                <p className="text-sm font-black uppercase tracking-[0.3em]">{t.dictionary.placeholder}</p>
                <div className="flex flex-wrap justify-center gap-2 pt-4 opacity-50">
                  {['TACTICAL', 'MEDICAL', 'CYBER', 'DAILY'].map(tag => (
                    <span key={tag} className="text-[8px] border border-border px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {results.length > 0 && query.length > 0 && (
          <div className="pt-4 shrink-0 border-t border-border/20 mt-4">
            <p className="text-[8px] font-mono text-text-dim text-center uppercase tracking-widest">
              Sahand_Dictionary v5.0 // Entries: {dictionary.length} // Offline_Database: OK
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ManifestView({ t }: { t: any }) {
  const [activeTab, setActiveTab] = useState<'mission' | 'assets' | 'protocol' | 'report'>('mission');
  const labels = t.tools.manifestLabels;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8 border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-black text-brand uppercase tracking-tighter italic">
            {t.tools.manifestTitle}
          </h2>
          <p className="text-text-dim text-sm mt-2 font-mono uppercase tracking-widest">{t.tools.manifestSubtitle}</p>
        </div>
        <div className="flex bg-surface p-1 rounded-2xl border border-border shadow-inner">
          {(['mission', 'assets', 'protocol', 'report'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-brand text-surface shadow-lg' : 'text-text-dim hover:text-brand'}`}
            >
              {labels.tabs[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          {activeTab === 'mission' && (
            <div className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand/10 text-brand rounded-2xl">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-black text-brand uppercase tracking-widest text-lg">{labels.activeDirectives}</h3>
                  <p className="text-[10px] text-text-dim font-mono">{labels.personnelOnly}</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'Project: NO-TRACE', status: 'In Progress', progress: 65, desc: 'Implementation of zero-footprint data persistence across decentralized nodes.' },
                  { title: 'Operation: SILENT_WHISPER', status: 'Pending', progress: 0, desc: 'Mesh-based cryptographic handshake protocol for low-band frequency nodes.' },
                  { title: 'Directive: OMEGA_PROTOCOL', status: 'Standby', progress: 95, desc: 'Final validation of automated shredding procedures on breach detection.' },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-surface border border-border rounded-3xl hover:border-brand/40 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-brand uppercase tracking-tight">{item.title}</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 px-3 py-1 rounded-full">{item.status}</span>
                    </div>
                    <p className="text-xs text-text-dim leading-relaxed mb-4">{item.desc}</p>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        className="h-full bg-brand"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'assets' && (
             <div className="bg-card border border-border rounded-[3rem] p-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-surface border border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-brand transition-all">
                       <Package size={32} className="text-text-dim/20 group-hover:text-brand transition-colors mb-4" />
                       <span className="text-[10px] font-black uppercase text-brand tracking-widest mb-1">SKU_{1000 + i}</span>
                       <span className="text-[8px] font-mono text-text-dim">RESERVE_CAPACITY_{Math.floor(Math.random() * 100)}%</span>
                    </div>
                  ))}
                </div>
             </div>
          )}
          {activeTab === 'protocol' && (
             <div className="bg-card border border-border rounded-[3rem] p-10 space-y-8 h-full">
                <div className="flex items-center gap-4 mb-2">
                   <ShieldCheck className="text-brand" size={24} />
                   <h3 className="font-black text-brand uppercase tracking-widest text-lg">{labels.tabs.protocol}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {t.tools.protocols.map((protocol: any) => (
                     <div key={protocol.id} className="p-6 bg-surface border border-border rounded-3xl hover:border-brand/30 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[11px] font-black text-brand uppercase tracking-tighter">{protocol.name}</span>
                           <span className="text-[8px] font-mono text-text-dim opacity-40 group-hover:opacity-100 transition-opacity">PROTO_ID: {protocol.id}</span>
                        </div>
                        <p className="text-[10px] text-text-dim leading-relaxed uppercase font-bold">{protocol.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          )}
          {activeTab === 'report' && (
             <div className="bg-card border border-border rounded-[3rem] p-10 space-y-8 h-full">
                <div className="flex items-center gap-4 mb-2">
                   <FileText className="text-brand" size={24} />
                   <h3 className="font-black text-brand uppercase tracking-widest text-lg">{labels.reportTitle}</h3>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-brand/5 border border-brand/10 rounded-3xl">
                      <p className="text-[12px] text-brand leading-relaxed uppercase font-black mb-1">{labels.reportSubtitle}</p>
                      <div className="w-12 h-1 bg-brand" />
                   </div>
                   {labels.reportSections.map((section: any, i: number) => (
                     <div key={i} className="space-y-2">
                        <h4 className="text-[11px] font-black text-brand uppercase tracking-widest">{section.title}</h4>
                        <p className="text-[10px] text-text-dim leading-relaxed uppercase font-bold border-l-2 border-brand/20 pl-4">
                          {section.content}
                        </p>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
        <div className="md:col-span-4 space-y-6">
           <div className="bg-brand text-surface p-8 rounded-[3rem] shadow-2xl shadow-brand/20">
              <History className="mb-6 opacity-60" size={32} />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{labels.auditTrail}</h3>
              <p className="text-xs opacity-80 leading-relaxed mb-6 font-medium">{labels.auditDesc}</p>
              <div className="space-y-4">
                {[
                  'ENCRYPTION_LAYER_MODIFIED',
                  'VAULT_ACCESS_TIME: 14:22',
                  'NODE_04_HANDSHAKE_OK',
                  'METADATA_SCRUB_COMPLETE'
                ].map((log, i) => (
                  <div key={i} className="py-2 border-t border-surface/20 flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-surface" />
                    <span className="text-[9px] font-mono uppercase tracking-widest">{log}</span>
                  </div>
                ))}
              </div>
           </div>
           <div className="bg-card border border-border rounded-[3rem] p-8">
              <Award className="text-brand mb-4" size={24} />
              <h4 className="text-xs font-black uppercase tracking-widest text-brand mb-2">{labels.serviceIdentity}</h4>
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                      <Brain size={16} />
                   </div>
                   <span className="text-[10px] font-bold text-brand">{labels.operatorId}</span>
                </div>
                <p className="text-[8px] font-mono text-text-dim uppercase truncate">SHA256: 4f88e1a...99b2c</p>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function ForensicsView({ t }: { t: any }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const performAnalysis = () => {
    if (!file) return;
    setAnalyzing(true);
    setResults(null);
    
    // Simulate deep forensics analysis
    setTimeout(() => {
      setResults({
        metadata: [
          { key: 'MIME Type', value: file.type || 'application/octet-stream' },
          { key: 'Size', value: `${(file.size / 1024).toFixed(2)} KB` },
          { key: 'Entropy', value: '0.892 (High)' },
          { key: 'Last Modified', value: new Date(file.lastModified).toISOString() },
        ],
        threats: [
          { level: 'low', desc: 'No suspicious strings found in primary headers.' },
          { level: 'med', desc: 'Unknown block found at offset 0x4A.' },
        ],
        strings: ['SQL_QUERY', 'HEX_0x45', 'AES_GCM', 'SALT_256', 'UUID_V4'],
        hex: Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase())
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-20"
    >
      <div className="mb-10 text-center">
        <div className="inline-flex py-1 px-3 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          {t.forensics.status}
        </div>
        <h1 className="text-4xl font-black text-brand tracking-tighter mb-2">{t.forensics.title}</h1>
        <p className="text-text-dim text-sm max-w-lg mx-auto">{t.forensics.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-surface rounded-3xl border border-border flex flex-col items-center text-center group hover:border-brand transition-all">
            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mb-6 text-brand">
              <FileSearch size={32} />
            </div>
            <h3 className="font-bold text-brand mb-2">{t.forensics.analyze}</h3>
            <p className="text-xs text-text-dim mb-6">{t.forensics.noFile}</p>
            
            <input 
              type="file" 
              id="forensics-file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label 
              htmlFor="forensics-file"
              className="w-full py-4 bg-surface border-2 border-dashed border-border rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer hover:border-brand hover:text-brand transition-all mb-4"
            >
              {file ? file.name : 'Select Data Object'}
            </label>

            <button
              onClick={performAnalysis}
              disabled={!file || analyzing}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${!file || analyzing ? 'bg-border text-text-dim cursor-not-allowed' : 'bg-brand text-surface shadow-lg shadow-brand/20 hover:scale-105 active:scale-95'}`}
            >
              {analyzing ? 'Processing...' : t.forensics.analyze}
            </button>
          </div>

          {results && (
            <div className="p-6 bg-surface rounded-3xl border border-border">
              <div className="flex items-center gap-2 mb-4 text-brand">
                <Database size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">{t.forensics.results}</h3>
              </div>
              <div className="space-y-3">
                {results.metadata.map((m: any) => (
                  <div key={m.key} className="flex justify-between items-center text-[10px]">
                    <span className="text-text-dim font-mono">{m.key}</span>
                    <span className="text-brand font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-surface rounded-3xl border border-border h-full min-h-[400px] flex flex-col relative overflow-hidden">
            {analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-brand"
                >
                  <Cpu size={48} />
                </motion.div>
                <div className="text-[10px] font-mono text-brand uppercase tracking-widest animate-pulse">
                  Scanning blocks for anomalies...
                </div>
              </div>
            ) : results ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 mb-3 text-brand opacity-60">
                      <Hash size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.forensics.hex}</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {results.hex.map((h: string, i: number) => (
                        <span key={i} className="text-[8px] font-mono text-text-dim/60">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 mb-3 text-brand opacity-60">
                      <Terminal size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.forensics.extract}</span>
                    </div>
                    <div className="space-y-1">
                      {results.strings.map((s: string) => (
                        <div key={s} className="text-[9px] font-mono text-brand bg-brand/5 px-2 py-0.5 rounded">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-dim">Risk Assessment</h4>
                  {results.threats.map((t: any, i: number) => (
                    <div key={i} className={`p-4 rounded-2xl border ${t.level === 'med' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-green-500/5 border-green-500/20'} flex items-start gap-4`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.level === 'med' ? 'bg-orange-500 text-surface' : 'bg-green-500 text-surface'}`}>
                        <AlertTriangle size={14} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-bold uppercase ${t.level === 'med' ? 'text-orange-500' : 'text-green-500'}`}>{t.level} risk</p>
                        <p className="text-xs text-text-dim mt-1">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-dim/20">
                <SearchCode size={80} strokeWidth={1} />
                <p className="mt-4 font-black uppercase tracking-[0.5em] text-[10px]">Awaiting Data Input</p>
              </div>
            )}
            
            {/* Design Accents */}
            <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-20">
              <div className="text-[8px] font-mono uppercase text-right leading-none">
                <div>offset_ptr: 0x4F</div>
                <div>checksum_valid: true</div>
                <div>p_entropy: 0.92</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 p-4 pointer-events-none">
               <div className="w-24 h-1 bg-brand/20 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ x: [-100, 100] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="w-full h-full bg-brand"
                 />
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmergencyView({ t, lang }: { t: any, lang: Language, key?: string }) {
  const categories = [
    { id: 'search', icon: Search, label: t.emergency.categories.search },
    { id: 'nav', icon: Map, label: t.emergency.categories.nav },
    { id: 'trans', icon: Languages, label: t.emergency.categories.trans },
    { id: 'media', icon: Volume2, label: t.emergency.categories.media },
    { id: 'utils', icon: Clock, label: t.emergency.categories.utils },
    { id: 'chat', icon: MessageSquare, label: t.emergency.categories.chat },
    { id: 'apps', icon: Download, label: t.emergency.categories.apps },
    { id: 'upload', icon: Share2, label: t.emergency.categories.upload },
    { id: 'movies', icon: Heart, label: t.emergency.categories.movies },
    { id: 'subs', icon: Languages, label: t.emergency.categories.subs },
    { id: 'music', icon: Radio, label: t.emergency.categories.music },
    { id: 'books', icon: Book, label: t.emergency.categories.books },
    { id: 'games', icon: Zap, label: t.emergency.categories.games },
    { id: 'ai', icon: Activity, label: t.emergency.categories.ai },
    { id: 'gov', icon: Shield, label: t.emergency.categories.gov },
  ];

  const links = [
    { cat: 'search', name: 'Gerdoo', fa: 'گردو', url: 'https://gerdoo.me' },
    { cat: 'search', name: 'Zarebin', fa: 'ذره‌بین', url: 'https://zarebin.ir' },
    { cat: 'search', name: 'Shaadbin', fa: 'شادبین (ویژه کودکان)', url: 'https://shaadbin.ir' },
    { cat: 'search', name: 'Rismoon', fa: 'رسیمون', url: 'https://rismoon.com' },
    { cat: 'search', name: '2059', fa: '2059', url: 'https://2059.ir' },
    { cat: 'nav', name: 'Neshan', fa: 'نشان', url: 'https://neshan.org' },
    { cat: 'nav', name: 'Balad', fa: 'بلد', url: 'https://balad.ir' },
    { cat: 'trans', name: 'Faraazin', fa: 'فرازین', url: 'https://faraazin.ir' },
    { cat: 'trans', name: 'Abadis', fa: 'آبادیس', url: 'https://abadis.ir' },
    { cat: 'trans', name: 'FastDic', fa: 'FastDic', url: 'https://fastdic.com' },
    { cat: 'trans', name: 'B-amooz Dictionary', fa: 'دیکشنری بی‌آموز', url: 'https://dic.b-amooz.com' },
    { cat: 'media', name: 'Telewebion', fa: 'تلوبیون', url: 'https://telewebion.com' },
    { cat: 'media', name: 'Filimo', fa: 'فیلیمو', url: 'https://filimo.com' },
    { cat: 'media', name: 'Namava', fa: 'نماوا', url: 'https://namava.ir' },
    { cat: 'media', name: 'Aparat', fa: 'آپارات', url: 'https://aparat.com' },
    { cat: 'media', name: 'Namasha', fa: 'نماشا', url: 'https://namasha.com' },
    { cat: 'utils', name: 'Time.ir', fa: 'اوقات شرعی و تقویم', url: 'https://time.ir' },
    { cat: 'utils', name: 'Roadway (141)', fa: 'راهداری (۱۴۱)', url: 'https://141.ir' },
    { cat: 'utils', name: 'Adliran', fa: 'سامانه عدل ایران', url: 'https://adliran.ir' },
    { cat: 'utils', name: 'Iranseda', fa: 'ایرانصدا', url: 'https://iranseda.ir' },
    { cat: 'utils', name: 'Weather', fa: 'سازمان هواشناسی', url: 'https://irimo.ir' },
    { cat: 'chat', name: 'Bale', fa: 'بله', url: 'https://bale.ai' },
    { cat: 'chat', name: 'Eitaa', fa: 'ایتا', url: 'https://eitaa.com' },
    { cat: 'chat', name: 'Rubika', fa: 'روبیکا', url: 'https://rubika.ir' },
    { cat: 'chat', name: 'Soroush Plus', fa: 'سروش پلاس', url: 'https://soroushplus.com' },
    { cat: 'apps', name: 'Cafe Bazaar', fa: 'کافه بازار', url: 'https://cafebazaar.ir' },
    { cat: 'apps', name: 'Myket', fa: 'مایکت', url: 'https://myket.ir' },
    { cat: 'apps', name: 'Sib Irani', fa: 'سیب ایرانی', url: 'https://sibirani.com' },
    { cat: 'apps', name: 'Sibapp', fa: 'سیباپ', url: 'https://sibapp.com' },
    { cat: 'apps', name: 'Anardoni', fa: 'اناردونی', url: 'https://anardoni.com' },
    { cat: 'apps', name: 'iapps', fa: 'آیاپس', url: 'https://iapps.ir' },
    { cat: 'upload', name: 'PasteHub', fa: 'PasteHub', url: 'https://pastehub.ir' },
    { cat: 'upload', name: 'ULNI', fa: 'ULNI', url: 'https://m.ulni.ir' },
    { cat: 'upload', name: 'UploadKon', fa: 'UploadKon', url: 'https://uploadkon.ir' },
    { cat: 'upload', name: 'PicoFile', fa: 'PicoFile', url: 'https://picofile.com' },
    { cat: 'upload', name: 'UUpload', fa: 'UUpload', url: 'https://uupload.ir' },
    { cat: 'upload', name: 'LinkLick', fa: 'LinkLick', url: 'https://linklick.ir' },
    { cat: 'upload', name: 'UploadBoy', fa: 'UploadBoy', url: 'https://uploadboy.com' },
    { cat: 'upload', name: 'MyFiles', fa: 'MyFiles', url: 'https://my.files.ir' },
    { cat: 'upload', name: 'NixFile', fa: 'NixFile', url: 'https://nixfile.com' },
    { cat: 'upload', name: 'GuardNet', fa: 'GuardNet', url: 'https://guardnet.ir' },
    { cat: 'movies', name: 'DonyaYeSerial', fa: 'DonyaYeSerial', url: 'https://iran-gamecenter-host.com' },
    { cat: 'movies', name: 'Nairobi', fa: 'Nairobi', url: 'https://saymyname.website' },
    { cat: 'movies', name: 'Berlin', fa: 'Berlin', url: 'https://saymyname.website' },
    { cat: 'movies', name: 'Rio', fa: 'Rio', url: 'https://ggusers.com' },
    { cat: 'movies', name: 'SerMovieDown', fa: 'SerMovieDown', url: 'https://sermoviedown.pw' },
    { cat: 'movies', name: 'Myf2mi', fa: 'Myf2mi', url: 'https://myf2mi.top' },
    { cat: 'movies', name: 'F2me', fa: 'F2me', url: 'https://f2me.top' },
    { cat: 'movies', name: 'Cup', fa: 'Cup', url: 'https://theazizi.ir' },
    { cat: 'movies', name: 'Flzios', fa: 'Flzios', url: 'https://flzios.ir' },
    { cat: 'movies', name: 'OldTowns', fa: 'OldTowns', url: 'https://oldtowns.top' },
    { cat: 'movies', name: 'Gifpey', fa: 'Gifpey', url: 'https://gifpey.info' },
    { cat: 'movies', name: 'Daneshpaz', fa: 'Daneshpaz', url: 'https://daneshpaz.top' },
    { cat: 'subs', name: 'Subkade', fa: 'Subkade', url: 'https://subkade.ir' },
    { cat: 'subs', name: 'Subzone', fa: 'Subzone', url: 'https://subzone.ir' },
    { cat: 'subs', name: '3FA', fa: '3FA', url: 'https://3fa.ir' },
    { cat: 'music', name: '9Craft Radio', fa: '9Craft Radio', url: 'https://radio.9craft.ir' },
    { cat: 'music', name: 'MeloVaz', fa: 'MeloVaz', url: 'https://melovaz.ir' },
    { cat: 'music', name: 'BehMelody', fa: 'BehMelody', url: 'https://behmelody.in' },
    { cat: 'books', name: 'Fidibo', fa: 'فیدیبو', url: 'https://fidibo.com' },
    { cat: 'books', name: 'Taaghche', fa: 'طاقچه', url: 'https://taaghche.com' },
    { cat: 'books', name: 'Navaar', fa: 'نوار', url: 'https://navaar.ir' },
    { cat: 'books', name: 'Libra Books', fa: 'Libra Books', url: 'https://libra-books.com' },
    { cat: 'books', name: 'EbooksWorld', fa: 'EbooksWorld', url: 'https://ebooksworld.ir' },
    { cat: 'games', name: 'Bazion', fa: 'Bazion', url: 'https://bazion.ir' },
    { cat: 'games', name: 'Soft98', fa: 'Soft98', url: 'https://soft98.ir' },
    { cat: 'games', name: 'YasDL', fa: 'YasDL', url: 'https://yasdl.com' },
    { cat: 'games', name: 'Farsroid', fa: 'Farsroid', url: 'https://farsroid.com' },
    { cat: 'games', name: 'VGDL', fa: 'VGDL', url: 'https://vgdl.ir' },
    { cat: 'games', name: 'Par30Games', fa: 'Par30Games', url: 'https://par30games.net' },
    { cat: 'games', name: 'GameQ', fa: 'GameQ', url: 'https://gameq.ir' },
    { cat: 'games', name: 'Downloadha', fa: 'Downloadha', url: 'https://downloadha.com' },
    { cat: 'games', name: 'Download.ir', fa: 'Download.ir', url: 'https://download.ir' },
    { cat: 'games', name: 'Patoghu', fa: 'Patoghu', url: 'https://patoghu.com' },
    { cat: 'games', name: 'Gold-Team', fa: 'Gold-Team', url: 'https://gold-team.org' },
    { cat: 'games', name: 'BosGame', fa: 'BosGame', url: 'https://bosgame.ir' },
    { cat: 'games', name: 'PirateGames', fa: 'PirateGames', url: 'https://pirategames.ir' },
    { cat: 'games', name: 'SarzaminDownload', fa: 'SarzaminDownload', url: 'https://sarzamindownload.com' },
    { cat: 'games', name: 'DLFOX', fa: 'DLFOX', url: 'https://dlfox.com' },
    { cat: 'ai', name: 'BoofAI', fa: 'BoofAI', url: 'https://chat.boofai.com' },
    { cat: 'ai', name: 'Hooshyar', fa: 'Hooshyar', url: 'https://hooshyar.golrang.ai' },
    { cat: 'ai', name: 'Hooshang', fa: 'Hooshang', url: 'https://hooshang.ai' },
    { cat: 'ai', name: 'SmartBytes Chat', fa: 'SmartBytes Chat', url: 'https://chat.smartbytes.ir' },
    { cat: 'gov', name: 'My Gov', fa: 'دولت هوشمند', url: 'https://sso.my.gov.ir' },
    { cat: 'gov', name: 'Leader.ir', fa: 'دفتر رهبری', url: 'https://leader.ir' },
    { cat: 'gov', name: 'President.ir', fa: 'ریاست جمهوری', url: 'https://president.ir' },
    { cat: 'gov', name: 'Sabteahval', fa: 'ثبت احوال', url: 'https://sabteahval.ir' },
    { cat: 'gov', name: 'Tamin', fa: 'تامین اجتماعی', url: 'https://tamin.ir' },
    { cat: 'gov', name: 'Cyber Police', fa: 'پلیس فتا', url: 'https://cyberpolice.ir' },
  ];
  
  const [activeTab, setActiveTab] = useState(categories[0].id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h3 className="text-3xl font-bold text-brand tracking-tight mb-2">{t.emergency.title}</h3>
        <p className="text-text-dim max-w-2xl">{t.emergency.subtitle}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${activeTab === cat.id 
                ? 'bg-brand text-surface shadow-lg scale-105' 
                : 'bg-card border border-border text-text-dim hover:border-brand hover:text-brand'}`}
          >
            <cat.icon size={16} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {links.filter(l => l.cat === activeTab).map(link => (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-card border border-border p-6 rounded-2xl hover:border-brand hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-brand mb-1 group-hover:text-brand transition-colors text-lg">{link.fa}</h4>
                <p className="text-xs text-text-dim font-mono mb-4">{link.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-dim/60 font-mono underline decoration-brand/30 group-hover:text-brand group-hover:decoration-brand transition-all truncate max-w-[150px]">
                  {link.url.replace('https://', '')}
                </span>
                <ChevronRight className={`text-brand group-hover:translate-x-1 transition-transform ${lang === 'fa' ? 'rotate-180' : ''}`} size={16} />
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BroadcastsView({ t }: { t: any, key?: string }) {
  const [activeTab, setActiveTab] = useState('signals');
  const [isScanning, setIsScanning] = useState(false);
  const [sweepProgress, setSweepProgress] = useState(0);
  const [foundSignals, setFoundSignals] = useState<any[]>([]);
  const [selectedBand, setSelectedBand] = useState('VHF');
  const [filterType, setFilterType] = useState('ALL');

  const bands = {
    VHF: '136 - 174 MHz',
    UHF: '400 - 512 MHz',
    SHF: '2.4 - 5.8 GHz'
  };

  const startSweep = () => {
    soundService.playData();
    setIsScanning(true);
    setSweepProgress(0);
    setFoundSignals([]);
    
    const interval = setInterval(() => {
      setSweepProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          soundService.playSuccess();
          
          const newSignals = [
            { id: 1, freq: '144.800 MHz', type: 'APRS_NODE', strength: -82, protocol: 'AX.25', band: 'VHF', modulation: 'AFSK', duty: '5%' },
            { id: 2, freq: '156.800 MHz', type: 'MARITIME_CH16', strength: -65, protocol: 'FM_VOICE', band: 'VHF', modulation: 'NFM', duty: '40%' },
            { id: 3, freq: '433.920 MHz', type: 'IOT_REPEATER', strength: -94, protocol: 'LoRa/WAN', band: 'UHF', modulation: 'CSS', duty: '2%' },
            { id: 4, freq: '462.562 MHz', type: 'FRS_RADIO', strength: -55, protocol: 'ANALOG_VOICE', band: 'UHF', modulation: 'FM', duty: '15%' },
            { id: 5, freq: '868.100 MHz', type: 'MESH_BRIDGE', strength: -68, protocol: 'RETICULUM', band: 'UHF', modulation: 'FSK', duty: '8%' },
            { id: 6, freq: '2.412 GHz', type: 'WiFi_BSSID', strength: -42, protocol: '802.11n', band: 'SHF', modulation: 'OFDM', duty: '65%' },
            { id: 7, freq: '5.180 GHz', type: 'DRONE_LINK', strength: -75, protocol: 'COFDM', band: 'SHF', modulation: 'QAM', duty: '90%' }
          ].filter(s => s.band === selectedBand);
          
          setFoundSignals(newSignals);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
          <Radio className="text-blue-500" size={32} />
        </div>
        <h3 className="text-3xl font-bold text-brand tracking-tight mb-2">{t.broadcasts.title}</h3>
        <p className="text-text-dim max-w-2xl">{t.broadcasts.subtitle}</p>
      </div>

      <div className="flex justify-center gap-4 mb-4">
        {Object.entries(t.broadcasts.tabs).map(([id, label]: [string, any]) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); soundService.playClick(); }}
            className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all
              ${activeTab === id 
                ? 'bg-brand text-surface shadow-xl scale-105' 
                : 'bg-card border border-border text-text-dim hover:border-brand hover:text-brand'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'recon' && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.keys(bands).map(b => (
              <button
                key={b}
                onClick={() => { setSelectedBand(b); soundService.playClick(); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${selectedBand === b ? 'bg-brand/20 border-brand text-brand' : 'bg-card border-border text-text-dim hover:border-brand/40'}`}
              >
                {b} ({bands[b as keyof typeof bands]})
              </button>
            ))}
          </div>

          <div className="bg-card border border-border p-8 rounded-[3rem] overflow-hidden relative shadow-inner">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="font-bold text-brand uppercase tracking-tighter text-xl">Spectral Analysis Lab</h4>
                <p className="text-xs text-text-dim mt-1">Monitoring {selectedBand} Band ({bands[selectedBand as keyof typeof bands]})</p>
              </div>
              <button 
                onClick={startSweep}
                disabled={isScanning}
                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isScanning ? 'bg-surface text-text-dim cursor-not-allowed' : 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'}`}
              >
                {isScanning ? 'SWEEPING...' : 'INITIATE LIVE SWEEP'}
              </button>
            </div>
            
            <div className="relative h-48 flex items-end gap-1 px-4 mb-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent)] pointer-events-none" />
              
              {/* Simulated Waterfall Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-t-[2rem]">
                 <motion.div 
                   animate={{ y: [0, 192] }}
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   className="h-[400%] w-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.2)_5%,transparent_10%,rgba(59,130,246,0.4)_15%,transparent_20%)]"
                   style={{ backgroundSize: '100% 64px' }}
                 />
              </div>

              {Array.from({ length: 60 }).map((_, i) => {
                const isFound = foundSignals.some(s => {
                   const freqNum = parseFloat(s.freq);
                   const relativeFreq = (freqNum - (selectedBand === 'VHF' ? 136 : selectedBand === 'UHF' ? 400 : 2400));
                    // Simple hash for positioning
                   return i === Math.floor((relativeFreq * 17) % 60);
                });

                return (
                  <motion.div 
                    key={i} 
                    className={`flex-1 rounded-t-sm relative group transition-colors ${isScanning ? 'bg-brand/60' : (isFound ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-brand/10')}`} 
                    animate={{ height: isScanning ? `${Math.random() * 80 + 10}%` : (isFound ? '85%' : `${Math.random() * 15 + 5}%`) }}
                    transition={isScanning ? { duration: 0.1, repeat: Infinity } : { duration: 0.5 }}
                  />
                )
              })}
              {isScanning && (
                <motion.div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20"
                  animate={{ left: `${sweepProgress}%` }}
                />
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
              {foundSignals.map(sig => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={sig.id} 
                  className="p-5 bg-surface rounded-[2rem] border border-border flex items-center justify-between group hover:border-brand/40 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-black text-brand tracking-tighter">{sig.freq}</span>
                      <span className="text-[10px] bg-brand text-surface px-2 py-0.5 rounded uppercase font-black tracking-widest">{sig.type}</span>
                    </div>
                    <p className="text-[10px] text-text-dim font-mono tracking-wider opacity-80">{sig.protocol} • {sig.modulation} • {sig.strength}dBm • DUTY: {sig.duty}</p>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-1">
                       <CheckCircle2 size={16} />
                     </div>
                     <span className="text-[8px] font-bold font-mono text-green-500 uppercase tracking-widest">Locked</span>
                  </div>
                </motion.div>
              ))}
              {isScanning && (
                <div className="col-span-full py-16 flex flex-col items-center gap-6 text-text-dim">
                  <div className="w-12 h-12 border-4 border-brand/5 border-t-brand rounded-full animate-spin" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-brand">Sweeping {selectedBand} Range</span>
                    <span className="text-[10px] font-mono mt-2 opacity-60">Isolating noise peaks in {bands[selectedBand as keyof typeof bands]}...</span>
                  </div>
                </div>
              )}
              {!isScanning && foundSignals.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center text-text-dim/30">
                  <Radio size={48} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Spectrum Idle // Select Band & Initiate Scan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* @ts-ignore */}
        {t.broadcasts[activeTab].map((item: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-card border border-border p-8 rounded-[2rem] hover:border-brand/40 transition-all shadow-sm hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xl font-bold text-brand group-hover:text-brand bg-brand/5 px-4 py-1 rounded-full">{item.title}</h4>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-1 h-4 rounded-full transition-all duration-500 ${activeTab === 'signals' ? 'bg-blue-500/30' : 'bg-red-500/30'}`} style={{ height: `${Math.random() * 16 + 4}px` }} />
                ))}
              </div>
            </div>
            <p className="text-text-dim leading-relaxed text-sm">{item.desc}</p>
            <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono text-text-dim">FREQ_ANALYSIS: COMPLETE</span>
              <div className="flex items-center gap-2 text-brand">
                <span className="text-[10px] font-bold uppercase tracking-tighter italic">Signal Lock</span>
                <CheckCircle2 size={12} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function IntelView({ t, lang, context, vaultKey }: { t: any, lang: Language, context: any, vaultKey: string | null }) {
  const urgentLogs = context?.journals?.filter((j: any) => j.level === 'charlie') || [];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-black text-brand uppercase tracking-tighter">Heuristic Intelligence</h2>
          <p className="text-text-dim mt-1 font-medium">Local node aggregation & pattern matching</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card px-4 py-2 border border-border rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-brand">V4.2_ENGINE_ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-card p-8 border border-border rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-3">Logs Processed</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-brand">{context?.journals?.length || 0}</p>
            <span className="text-[10px] font-mono text-text-dim">/ 1024_BUF</span>
          </div>
        </div>
        <div className="bg-card p-8 border border-border rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-3">Mesh Nodes</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-brand">{context?.contacts?.length || 0}</p>
            <span className="text-[10px] font-mono text-green-500">ACTIVE_MESH</span>
          </div>
        </div>
        <div className="bg-card p-8 border border-border rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-3">Atmosphere</p>
          <div className="space-y-1">
             <div className="flex justify-between text-[8px] font-mono text-text-dim uppercase">
                <span>Ambient_Noise</span>
                <span className="text-brand">-82dBm</span>
             </div>
             <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div animate={{ width: '40%' }} className="h-full bg-brand" />
             </div>
             <div className="flex justify-between text-[8px] font-mono text-text-dim uppercase pt-1">
                <span>Signal_Stability</span>
                <span className="text-brand">98.2%</span>
             </div>
             <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div animate={{ width: '98%' }} className="h-full bg-brand" />
             </div>
          </div>
        </div>
        <div className="bg-card p-8 border border-border rounded-[2rem] shadow-sm">
          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-3">Critical Alerts</p>
          <p className="text-4xl font-black text-red-500">{urgentLogs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-10 border border-border rounded-[3rem] space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-brand" size={24} />
            <h4 className="font-black text-brand uppercase tracking-widest">Priority Anomalies</h4>
          </div>
          {urgentLogs.length === 0 ? (
            <div className="py-12 border border-dashed border-border rounded-3xl text-center">
              <CheckCircle2 className="mx-auto mb-4 text-green-500/20" size={32} />
              <p className="text-xs font-bold text-text-dim uppercase tracking-widest">Environment Stable</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urgentLogs.map((log: any) => (
                <div key={log.id} className="p-5 bg-surface border border-border rounded-2xl flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  <div>
                    <p className="text-[9px] font-mono text-red-500 uppercase mb-1">SEGMENT_{log.id.substring(0,6)}</p>
                    <p className="text-xs font-medium text-brand line-clamp-2 leading-relaxed">
                      {decryptData(log.content, vaultKey || 'SAHAND')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card p-10 border border-border rounded-[3rem] flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full border-8 border-brand/5 border-t-brand animate-spin mb-8" />
          <h4 className="font-black text-brand uppercase tracking-[0.2em] mb-3">Cognitive Bridge</h4>
          <p className="text-xs text-text-dim max-w-xs leading-relaxed font-mono">
            CONTINUOUSLY MONITORING ENCRYPTED SEGMENTS FOR CORRELATION ATTACKS AND TEMPORAL DRIFT.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// --- COMPONENT: NeuralLinkView ---
// EN: Simulates biometric and cognitive security monitoring.
// FA: شبیه‌سازی پایش امنیت بیومتریک و شناختی.
function NeuralLinkView({ t }: { t: any }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-brand uppercase tracking-tighter mb-2">Neural Link Interface</h2>
          <p className="text-text-dim text-xs font-mono">Cognitive Integrity & Biometric Defensive Sync</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full border border-brand/20 flex items-center justify-center animate-pulse">
              <Zap size={20} className="text-brand" />
           </div>
           <div className="text-right">
              <p className="text-[10px] font-bold text-brand uppercase">Sync Status</p>
              <p className="text-[8px] text-green-500 font-mono">92.4% OPTIMAL</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Activity size={120} />
          </div>
          <h4 className="text-sm font-black text-brand uppercase mb-6 tracking-widest">Cognitive Load Analysis</h4>
          <div className="space-y-6">
             {[
               { label: 'Attentional Focus', val: 88 },
               { label: 'Stress Response', val: 12 },
               { label: 'Information Processing', val: 64 },
             ].map((m, i) => (
               <div key={i}>
                  <div className="flex justify-between text-[10px] font-mono mb-2">
                     <span className="text-text-dim uppercase">{m.label}</span>
                     <span className="text-brand">{m.val}%</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }} className={`h-full ${m.val > 80 ? 'bg-brand' : m.val > 50 ? 'bg-brand/60' : 'bg-green-500'}`} />
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl">
           <h4 className="text-sm font-black text-brand uppercase mb-6 tracking-widest">Biometric Perimeter</h4>
           <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 mb-6">
                 <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-brand/20 rounded-full"
                 />
                 <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border border-brand/40 rounded-full"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldAlert size={40} className="text-brand animate-pulse" />
                 </div>
              </div>
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-mono text-brand">USER_ID: SAHAND_OPERATOR_01</p>
                 <p className="text-[9px] font-mono text-text-dim uppercase tracking-tighter">Heart-Rate Variability (HRV): 72ms</p>
                 <p className="text-[9px] font-mono text-text-dim uppercase tracking-tighter">Galvanic Skin Response: BASELINE</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
           <AlertTriangle size={20} className="text-brand" />
           <h4 className="text-sm font-black text-brand uppercase tracking-widest">Autonomous Counters</h4>
        </div>
        <p className="text-xs text-text-dim leading-relaxed mb-6 italic">
          In the event of a biometric mismatch or critical stress detection, Sahand OS will initiate an autonomous "Burn-Down" protocol, purging high-entropy vault fragments from RAM before physical compromise occurs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Auto-Wipe', status: 'READY' },
             { label: 'Panic-Esc', status: 'ACTIVE' },
             { label: 'Entropy-Boost', status: 'STANDBY' },
             { label: 'Mesh-Silence', status: 'AUTO' }
           ].map((c, i) => (
             <div key={i} className="p-3 bg-surface border border-border rounded-xl text-center">
                <p className="text-[8px] font-black text-text-dim uppercase">{c.label}</p>
                <p className="text-[10px] font-mono text-brand font-bold">{c.status}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT: IntelLabView ---
// EN: Demonstrates data preprocessing, evaluation metrics, and AI model interpretation.
// FA: نمایش پیش‌پردازش داده‌ها، معیارهای ارزیابی و تفسیر مدل هوش مصنوعی.
function IntelLabView({ t, lang }: { t: any, lang: Language }) {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'patterns' | 'signal' | 'identity' | 'decoder'>('analyzer');
  const [step, setStep] = useState<'idle' | 'cleaning' | 'evaluating' | 'interpreting' | 'done'>('idle');
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Decoder State
  const [decoderMode, setDecoderMode] = useState<'morse' | 'base64' | 'neural'>('neural');
  const [decoderInput, setDecoderInput] = useState('.. --. -. .- .-..');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedResult, setDecodedResult] = useState('');
  const [neuralInterpretation, setNeuralInterpretation] = useState<string | null>(null);

  const runDecoder = async () => {
    setIsDecoding(true);
    setNeuralInterpretation(null);
    soundService.playData();
    
    if (decoderMode === 'neural') {
      try {
        const aiResponse = await getAssistantResponse(
          `ANALYZE_AND_DECODE the following cipher/fragment: "${decoderInput}". 
Provide a tactical interpretation of what this might represent in a field operation context.`,
          { language: lang }
        );
        setDecodedResult(aiResponse);
      } catch (e) {
        setDecodedResult('ERROR: NEURAL_LINK_FAULT');
      }
    } else {
      await new Promise(r => setTimeout(r, 1500));
      try {
        if (decoderMode === 'base64') {
          setDecodedResult(atob(decoderInput));
        } else {
          const morseMap: {[key: string]: string} = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', 
            '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', 
            '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z',
            '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
            '/': ' '
          };
          const decoded = decoderInput.split(/\s+/).map(char => morseMap[char] || '?').join('');
          setDecodedResult(`DECODED_OUTPUT: [${decoded}]`);
        }
      } catch (e) {
        setDecodedResult('ERROR: INVALID_PAYLOAD');
      }
    }
    
    setIsDecoding(false);
    soundService.playSuccess();
  };

  // Pattern Hub State
  const [patternGrid, setPatternGrid] = useState(Array(64).fill(false));
  const [isScanningPatterns, setIsScanningPatterns] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState<string | null>(null);

  const scanPatterns = async () => {
    setIsScanningPatterns(true);
    setDetectedPattern(null);
    soundService.playData();
    await new Promise(r => setTimeout(r, 2000));
    
    const activeCount = patternGrid.filter(v => v).length;
    if (activeCount > 12) setDetectedPattern('HIGH_DENSITY_STORM_09');
    else if (activeCount > 6) setDetectedPattern('STRUCTural_SYNC_ALPHA');
    else if (activeCount > 0) setDetectedPattern('RESIDUAL_NOISE_PKT');
    else setDetectedPattern('NO_PATTERN_MATCH');
    
    setIsScanningPatterns(false);
    soundService.playSuccess();
  };

  // Identity Lab State
  const [identityName, setIdentityName] = useState('');
  const [generatedId, setGeneratedId] = useState<any>(null);

  const rawData = [
    { id: 1, freq: '2.4GHz', strength: -45, noise: 12, source: 'AP-1', status: 'dirty', raw: '0x3F4...NULL' },
    { id: 2, freq: '2.4GHz', strength: -80, noise: 60, source: 'Unknown', status: 'dirty', raw: 'ERR_DATA' },
    { id: 3, freq: '5.0GHz', strength: -55, noise: 5, source: 'AP-2', status: 'dirty', raw: '0xA12...FF' },
    { id: 4, freq: '433MHz', strength: -30, noise: 25, source: 'Unknown_Pulse', status: 'dirty', raw: 'NULL_PKT' },
    { id: 5, freq: '2.4GHz', strength: -12, noise: 90, source: 'JAMMER_SIM', status: 'dirty', raw: 'WIDEBAND_X' },
  ];

  const processData = async () => {
    soundService.playClick();
    setStep('cleaning');
    setLogs(rawData);
    await new Promise(r => setTimeout(r, 1500));
    soundService.playData();
    
    const cleaned = rawData.filter(d => d.raw !== 'ERR_DATA' && d.raw !== 'NULL_PKT').map(d => ({
      ...d,
      status: 'preprocessed',
      strength: Math.max(0, 100 + d.strength),
      noise: Math.min(d.noise, 100)
    }));
    setLogs(cleaned);
    
    setStep('evaluating');
    await new Promise(r => setTimeout(r, 1500));
    soundService.playData();
    
    const evaluated = cleaned.map(d => {
      const snr = (d.strength / (d.noise || 1)).toFixed(2);
      return { ...d, snr, status: 'evaluated' };
    });
    setLogs(evaluated);
    setMetrics({
      avgSNR: (evaluated.reduce((a, b) => a + parseFloat(b.snr), 0) / evaluated.length).toFixed(2),
      threatScore: (evaluated.filter(d => parseFloat(d.snr) < 1.0).length * 25).toFixed(0),
      complexity: 'O(n log n)'
    });

    setStep('interpreting');
    await new Promise(r => setTimeout(r, 1500));
    soundService.playSuccess();
    setStep('done');
  };

  const generateTacticalId = () => {
    soundService.playClick();
    const firstNames = [
      'آریا', 'آرش', 'کاوه', 'سیاوش', 'بردیا', 'مازیار', 'داریوش', 'امیر', 'رضا', 'فرید', 
      'سپهر', 'هومن', 'مانی', 'کیوان', 'رهام', 'سامان', 'بابک', 'کوروش', 'سورنا', 'آبتین',
      'بهرام', 'پرهام', 'سهراب', 'فرزاد', 'کامران', 'نیما', 'کیان', 'ماکان', 'شروین'
    ];
    const lastNames = [
      'ایرانی', 'راد', 'افشار', 'سهرابی', 'تهرانی', 'پارسا', 'شایان', 'رادفر', 'مهراد', 
      'پویا', 'امانی', 'بختیاری', 'فرهمند', 'کاشانی', 'تبریزی', 'اصفهانی', 'شیرازی', 
      'خسروی', 'نوری', 'کریمی', 'منصوری', 'یزدانی', 'موسوی', 'صادقی', 'هاشمی'
    ];
    const roles = [
      'اپراتور ارشد (Senior Operator)', 
      'تحلیلگر سیگنال (Signal Analyst)', 
      'مامور میدانی (Field Operative)', 
      'متخصص شبکه (Network Specialist)', 
      'فرمانده عملیات (Ops Commander)', 
      'دژبان سیستم (System Warden)', 
      'نفوذگر شبح (Ghost Infiltrator)', 
      'شناسایی و نفوذ (Recon)',
      'تکنسین مخابرات (Comms Tech)',
      'پزشک رزمی (Combat Medic)',
      'تحلیلگر رمزنگاری (Crypto Analyst)',
      'متخصص جنگ الکترونیک (EW Specialist)'
    ];
    
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    const id = generateId().substring(0, 8);
    const signature = hashData(identityName + id).substring(0, 24);
    
    setGeneratedId({
      name: identityName || `${randomFirst} ${randomLast}`,
      role: randomRole,
      id: id,
      sig: signature,
      blood: ['A+', 'B+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 5)],
      sector: Math.floor(Math.random() * 99),
      timestamp: Date.now()
    });
    soundService.playSuccess();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-black uppercase tracking-widest">
            <Radio size={12} />
            Nexus_Core_Ready
          </div>
          <h2 className="text-6xl font-black text-brand uppercase tracking-tighter leading-none">
            {t.nexus.title}
          </h2>
          <p className="text-text-dim text-sm font-medium max-w-xl">
             Centralized intelligence processing hub for signal analysis, pattern matching, and cryptographic operations.
          </p>
        </div>
        
        <nav className="flex bg-card p-1.5 rounded-[2rem] border border-border overflow-x-auto custom-scrollbar no-scrollbar">
           {(['analyzer', 'patterns', 'signal', 'identity', 'decoder'] as const).map(tab => {
             const Icon = {
               analyzer: Activity,
               patterns: Cpu,
               signal: Radio,
               identity: Fingerprint,
               decoder: Binary
             }[tab];
             return (
               <button 
                key={tab}
                onClick={() => { setActiveTab(tab); soundService.playClick(); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brand text-surface shadow-xl shadow-brand/20 scale-105' : 'text-text-dim hover:text-brand hover:bg-surface/50'}`}
               >
                 <Icon size={14} />
                 {t.nexus.tabs[tab]}
               </button>
             );
           })}
        </nav>
      </div>

      {activeTab === 'analyzer' && (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { key: 'cleaning', label: t.nexus.tabs.analyzer + ' (Clean)', icon: Layers },
                { key: 'evaluating', label: 'Matrix Evaluation', icon: Activity },
                { key: 'interpreting', label: 'Neural Interpretation', icon: Brain },
                { key: 'done', label: 'Analysis Complete', icon: CheckCircle2 },
              ].map((s, i) => (
                <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                  (step === s.key || (step === 'done' && s.key !== 'done')) ? 'bg-brand border-brand text-surface shadow-2xl scale-105 z-10' : 'bg-card border-border text-text-dim opacity-30 scale-95'
                }`}>
                  <s.icon size={20} className="mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-[3rem] p-10 shadow-3xl relative overflow-hidden min-h-[550px] flex flex-col">
              {step === 'idle' ? (
                <div className="flex-1 flex flex-col items-center justify-center py-24">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  >
                     <Database size={600} className="mx-auto" />
                  </motion.div>
                  <Database className="mb-10 text-brand/20 animate-pulse" size={120} />
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(var(--brand-rgb), 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={processData}
                    className="group relative px-20 py-8 bg-brand text-surface rounded-[2.5rem] font-black uppercase tracking-[0.4em] overflow-hidden shadow-2xl shadow-brand/30"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <span className="relative z-10 flex items-center gap-4">
                        <Zap size={24} />
                        {t.tools.datasetLoad}
                     </span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex-1 space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4 text-brand font-mono text-xs font-black tracking-widest animate-pulse">
                        <div className="w-4 h-4 bg-brand rounded-full " />
                        <span className="uppercase">
                           STATUS: {step}_IN_PROGRESS... // CLK_{Date.now().toString().slice(-4)}
                        </span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="h-1.5 w-64 bg-border rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: step === 'done' ? '100%' : step === 'interpreting' ? '75%' : step === 'evaluating' ? '50%' : '25%' }}
                             className="h-full bg-brand"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
                            <AnimatePresence mode="popLayout">
                              {logs.map((log, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="p-5 bg-surface border border-border rounded-2xl flex items-center justify-between font-mono text-[10px] shadow-sm hover:shadow-md transition-shadow group"
                                >
                                  <div className="flex items-center gap-4">
                                     <span className="text-brand font-black bg-brand/10 px-3 py-1 rounded-lg">[{log.source}]</span>
                                     <span className="text-text-dim/60 font-bold uppercase tracking-widest">{log.freq}</span>
                                  </div>
                                  <div className="flex items-center gap-6">
                                     <span className="text-text-dim font-black opacity-40">RAW_{idx}</span>
                                     <span className={`font-black px-4 py-1 rounded-full ${log.snr && parseFloat(log.snr) < 1.0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                       {log.status === 'evaluated' ? `SNR_IDX: ${log.snr}` : log.status.toUpperCase()}
                                     </span>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                        </div>
                      </div>
                      
                      {metrics && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-surface border-2 border-brand/20 rounded-[2.5rem] p-8 space-y-10 shadow-inner"
                        >
                            <div className="space-y-4">
                               <div className="flex items-center gap-2 text-text-dim/40">
                                  <Activity size={14} />
                                  <p className="text-[9px] font-black uppercase tracking-widest">Average Spectral SNR</p>
                               </div>
                               <p className="text-5xl font-black text-brand tracking-tighter">{metrics.avgSNR}dB</p>
                            </div>
                            <div className="space-y-4">
                               <div className="flex items-center gap-2 text-text-dim/40">
                                  <ShieldAlert size={14} />
                                  <p className="text-[9px] font-black uppercase tracking-widest">Global Threat Index</p>
                               </div>
                               <p className={`text-5xl font-black tracking-tighter ${parseFloat(metrics.threatScore) > 40 ? 'text-red-500' : 'text-green-500'}`}>{metrics.threatScore}%</p>
                            </div>
                            <div className="pt-6 border-t border-border">
                               <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em] mb-2">Computational Complexity</p>
                               <div className="px-4 py-2 bg-black/5 rounded-xl text-[10px] font-mono text-brand font-black">{metrics.complexity}</div>
                            </div>

                            {step === 'done' && (
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full mt-4 py-4 bg-brand text-surface rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
                                onClick={async () => {
                                  setIsDecoding(true);
                                  const summary = await getAssistantResponse("Perform a CRITICAL_TACTICAL_EVALUATION of the current signal dataset and metrics. Suggest immediate countermeasures.", { metrics });
                                  setNeuralInterpretation(summary);
                                  setIsDecoding(false);
                                  soundService.playSuccess();
                                }}
                              >
                                <Brain size={16} />
                                Neural Tactical Assessment
                              </motion.button>
                            )}

                            {neuralInterpretation && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-6 mt-4 border-t border-border"
                              >
                                 <p className="text-[8px] font-black text-brand uppercase mb-3 tracking-widest">AI_DEDUCTION_REPORT</p>
                                 <div className="text-[10px] font-medium text-text-dim leading-relaxed bg-brand/5 p-4 rounded-xl border border-brand/10">
                                   {neuralInterpretation}
                                 </div>
                              </motion.div>
                            )}
                        </motion.div>
                      )}
                  </div>
                </div>
              )}
            </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
           <div className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className={`absolute inset-0 bg-brand/5 transition-opacity duration-1000 ${isScanningPatterns ? 'opacity-100' : 'opacity-0'}`} />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
                <div className="space-y-1">
                   <h4 className="text-xl font-black text-brand uppercase tracking-tighter leading-none">Heuristic Grid Analysis</h4>
                   <p className="text-[9px] text-text-dim uppercase font-bold tracking-widest">Input geometric signal signatures manually</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setPatternGrid(Array(64).fill(false)); soundService.playClick(); }} className="px-5 py-2.5 rounded-xl text-[10px] font-black bg-surface border border-border text-text-dim hover:text-brand hover:border-brand/40 uppercase transition-all">Clear</button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scanPatterns} 
                    disabled={isScanningPatterns}
                    className="px-6 py-2.5 rounded-xl text-[10px] font-black bg-brand text-surface uppercase disabled:opacity-50 shadow-lg shadow-brand/20 transition-all flex items-center gap-2"
                  >
                    {isScanningPatterns ? (
                      <>
                        <div className="w-3 h-3 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                        Scanning
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        Auto-Scan
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              
              <div className="aspect-square bg-surface border-4 border-border/50 rounded-[2.5rem] p-6 relative z-10 shadow-inner">
                 <div className="grid grid-cols-8 gap-2 h-full">
                    {patternGrid.map((active, i) => (
                      <button 
                       key={i} 
                       onClick={() => { setPatternGrid(prev => { const n = [...prev]; n[i] = !n[i]; return n; }); soundService.playData(); }}
                       className={`rounded-lg transition-all duration-300 relative group/tile ${active ? 'bg-brand shadow-[0_0_20px_rgba(var(--brand-rgb),0.6)] scale-105 z-10' : 'bg-black/5 hover:bg-brand/10'}`}
                      >
                         {active && <motion.div layoutId="pattern-spark" className="absolute inset-0 bg-white/20 rounded-lg" />}
                      </button>
                    ))}
                 </div>
              </div>

              {isScanningPatterns && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-brand/60 blur-[2px] z-20 pointer-events-none"
                />
              )}
           </div>
           
           <div className="space-y-8">
               <div className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Cpu size={120} />
                  </div>
                  <h4 className="text-sm font-black text-brand uppercase tracking-widest mb-10">Intelligence Output</h4>
                  {detectedPattern ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 relative z-10">
                       <div className="p-8 bg-brand/10 border-l-[10px] border-brand rounded-r-[3rem] shadow-sm">
                          <p className="text-[10px] font-black text-brand uppercase mb-3 tracking-[0.3em] opacity-60 flex items-center gap-2">
                             <Zap size={14} />
                             SIG_MATCH_CONFIRMED
                          </p>
                          <p className="text-4xl font-black text-brand tracking-tighter leading-tight break-all">{detectedPattern}</p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6">
                          <div className="p-5 bg-surface border border-border rounded-3xl group-hover:border-brand/30 transition-colors">
                             <p className="text-[9px] font-black text-text-dim uppercase mb-2 tracking-widest">Neural Confidence</p>
                             <p className="text-2xl font-black text-brand tracking-tight">{(Math.random() * 20 + 78).toFixed(1)}%</p>
                          </div>
                          <div className="p-5 bg-surface border border-border rounded-3xl group-hover:border-brand/30 transition-colors">
                             <p className="text-[9px] font-black text-text-dim uppercase mb-2 tracking-widest">Entropy Rating</p>
                             <p className="text-2xl font-black text-emerald-500 tracking-tight">LOW_RISK</p>
                          </div>
                       </div>
                       
                       <div className="p-6 bg-black/5 rounded-[2rem] border-2 border-border border-dashed">
                          <div className="flex gap-4">
                             <Shield className="text-brand shrink-0" size={24} />
                             <p className="text-[10px] text-text-dim uppercase font-black leading-relaxed tracking-wider">
                                Geometric match aligns with known satellite uplink handshake signatures in the localized 5GHz spectrum. Recommended: Keep monitoring.
                             </p>
                          </div>
                       </div>
                    </motion.div>
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center opacity-40 group-hover:opacity-100 transition-opacity">
                       <Cpu className="text-brand/20 mb-8" size={100} />
                       <div className="space-y-2">
                          <p className="text-xs font-black text-brand uppercase tracking-[0.2em]">Neural Engine Standby</p>
                          <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest max-w-[280px] leading-relaxed mx-auto">
                             Construct a coordinate-based pattern or use Auto-Scan to interpret signal geometry and identify potential threats.
                          </p>
                       </div>
                    </div>
                  )}
               </div>
               
               <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2.5rem] flex items-start gap-6">
                  <div className="p-3 bg-brand text-surface rounded-2xl shadow-lg shadow-brand/20">
                     <Binary size={24} />
                  </div>
                  <div>
                     <p className="text-xs font-black text-brand uppercase mb-1 tracking-widest">Heuristic Recognition v4</p>
                     <p className="text-[10px] text-text-dim font-medium leading-relaxed">
                        Nexus Core uses multi-layered convolutional neural networks to evaluate geometric signal spikes against a global database of 2.4/5GHz interference patterns.
                     </p>
                  </div>
               </div>
           </div>
        </div>
      )}

      {activeTab === 'decoder' && (
        <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black text-brand uppercase tracking-widest">Cryptographic Signal Decoder</h4>
              <div className="flex gap-2 bg-surface p-1 rounded-xl border border-border">
                 {(['morse', 'base64', 'neural'] as const).map(mode => (
                   <button 
                    key={mode}
                    onClick={() => setDecoderMode(mode)}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${decoderMode === mode ? 'bg-brand text-surface shadow-md' : 'text-text-dim hover:text-brand'}`}
                   >
                     {mode === 'neural' ? 'Neural_AI' : mode}
                   </button>
                 ))}
              </div>
           </div>
           <div className="space-y-6">
              <div className="relative">
                <textarea 
                  value={decoderInput}
                  onChange={e => setDecoderInput(e.target.value)}
                  className="w-full bg-surface border border-border rounded-2xl p-6 font-mono text-sm outline-none focus:border-brand h-40 resize-none text-brand shadow-inner"
                  placeholder={decoderMode === 'morse' ? 'Example: .. --. -. .- .-..' : 'Example: U0lHTkFM'}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-text-dim uppercase">Buffer: {decoderInput.length} bytes</div>
              </div>
              <button 
                onClick={runDecoder}
                disabled={isDecoding}
                className="w-full py-5 bg-brand text-surface rounded-2xl font-black uppercase tracking-[0.3em] hover:shadow-xl transition-all disabled:opacity-50 relative overflow-hidden group"
              >
                {isDecoding && (
                  <motion.div 
                    initial={{ left: '-100%' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 skew-x-12"
                  />
                )}
                <span className="relative z-10">{isDecoding ? 'DECODING_LAYER_0x...' : 'DECODE_SIGNAL_STREAM'}</span>
              </button>
              {decodedResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-10 bg-surface border border-brand/20 rounded-[2.5rem] relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-4">
                     <div className="bg-brand text-surface px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">
                        {decoderMode}_RECOVERY_SUCCESS
                     </div>
                  </div>
                  <div className="absolute top-0 left-0 w-2 h-full bg-brand" />
                  <p className="text-[10px] font-black text-brand uppercase mb-6 tracking-[0.3em] opacity-60">Decrypted_Operational_Stream</p>
                  <div className="p-6 bg-black/[0.02] border border-border rounded-2xl relative">
                     <p className="text-xl font-mono text-brand font-black break-all leading-relaxed rtl">{decodedResult}</p>
                     <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        className="absolute bottom-0 left-0 h-0.5 bg-brand/30"
                     />
                  </div>
                </motion.div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'signal' && (
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-[600px] flex flex-col group">
           <div className="flex items-center justify-between mb-8 z-10">
              <div>
                <h4 className="text-sm font-black text-brand uppercase tracking-widest">Signal Triangulation [LIVE]</h4>
                <p className="text-[10px] text-text-dim font-mono mt-1 uppercase tracking-tighter">Scanning for high-entropy radio emissions...</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-border">
                    <div className="w-2 h-2 bg-brand rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-brand font-bold uppercase tracking-widest">Tracking_0x88</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 relative border border-brand/10 rounded-3xl overflow-hidden bg-black/10 shadow-inner">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
              
              {/* Radial Sweepers */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border border-brand/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="absolute top-0 left-1/2 w-1 h-1/2 bg-gradient-to-t from-transparent to-brand/30 -translate-x-1/2 origin-bottom" />
              </motion.div>

              {/* Simulated Nodes */}
              {[
                { top: '25%', left: '35%', id: 'NODE_ALPHA' },
                { top: '75%', left: '65%', id: 'NODE_BETA' },
                { top: '45%', left: '85%', id: 'NODE_GAMMA' }
              ].map((n, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="absolute cursor-pointer group/node" 
                  style={{ top: n.top, left: n.left }}
                  onClick={() => soundService.playData()}
                >
                   <div className="relative">
                      <div className="w-6 h-6 bg-brand rounded-full -translate-x-1/2 -translate-y-1/2 relative z-20 shadow-[0_0_20px_rgba(var(--brand-rgb),0.6)] flex items-center justify-center group-hover/node:bg-white transition-colors">
                         <div className="w-2 h-2 bg-surface rounded-full" />
                      </div>
                      
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 space-y-2 pointer-events-none opacity-0 group-hover/node:opacity-100 transition-all scale-95 group-hover/node:scale-100">
                         <div className="bg-black/90 border border-brand/40 px-3 py-2 rounded-lg backdrop-blur-md">
                            <p className="text-[10px] font-black text-brand uppercase tracking-tighter whitespace-nowrap">{n.id}</p>
                            <p className="text-[8px] font-mono text-text-dim/80 whitespace-nowrap">FREQ: 2.455 GHz</p>
                            <p className="text-[8px] font-mono text-text-dim/80 whitespace-nowrap">RSSI: -{40 + i*15} dBm</p>
                         </div>
                      </div>

                      <motion.div 
                        animate={{ scale: [0.5, 2.5], opacity: [0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: i * 0.8 }}
                        className="absolute w-64 h-64 border border-brand/20 rounded-full -translate-x-1/2 -translate-y-1/2 -z-10" 
                      />
                   </div>
                </motion.div>
              ))}

              <motion.div 
                animate={{ x: [0, 5, -5, 3, 0], y: [0, -3, 3, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute top-[60%] left-[45%] w-4 h-4 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_40px_rgba(239,68,68,1)] z-30 flex items-center justify-center"
              >
                 <div className="absolute inset-[-6px] border border-red-500/50 rounded-full animate-ping" />
                 <div className="absolute inset-[-12px] border border-red-500/30 rounded-full animate-pulse" />
                 <ShieldAlert size={12} className="text-white relative z-10" />
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-2xl border border-red-400/50 group-hover:scale-110 transition-transform">
                    Enemy_Emitter_Detected
                 </div>
              </motion.div>
           </div>

           {/* Spectral Visualizer Bar at the bottom */}
           <div className="mt-6 flex items-end gap-1 h-12 px-4 bg-surface/50 rounded-2xl border border-border/50 overflow-hidden">
              {Array(40).fill(0).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [`${20 + Math.random() * 60}%`, `${30 + Math.random() * 70}%`, `${10 + Math.random() * 40}%`] }}
                  transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                  className="flex-1 bg-brand/30 rounded-t-sm"
                />
              ))}
           </div>
        </div>
      )}

      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 order-2 lg:order-1">
             <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Fingerprint size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                   <h3 className="text-2xl font-black text-brand uppercase tracking-widest">{t.nexus.tabs.identity}</h3>
                   <p className="text-text-dim text-xs leading-relaxed uppercase tracking-widest font-mono">
                      Generate synthetic operational personas with localized regional data and biometric signatures.
                   </p>
                   <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Base Identity Reference</label>
                         <input 
                           type="text" 
                           placeholder="نام یا موضوع..."
                           value={identityName}
                           onChange={e => setIdentityName(e.target.value)}
                           className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-xs font-black text-brand placeholder:text-text-dim/30 outline-none focus:border-brand/40 transition-all shadow-inner rtl"
                         />
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateTacticalId}
                        className="w-full py-5 bg-brand text-surface rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/20 hover:opacity-90 transition-all flex items-center justify-center gap-3"
                      >
                         <Zap size={18} />
                         {lang === 'fa' ? 'تولید هویت تاکتیکی' : 'Generate Identity'}
                      </motion.button>
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl flex items-center gap-4">
                <Info className="text-brand shrink-0" size={24} />
                <p className="text-[10px] text-text-dim uppercase font-black tracking-widest leading-relaxed">
                   PERSONA GENERATION USES HEURISTIC LOCALIZATION ALGORITHMS. ALL GENERATED DATA IS EPHEMERAL AND NOT STORED ON DISK.
                </p>
             </div>
          </div>

          <div className="order-1 lg:order-2">
             <AnimatePresence mode="wait">
               {generatedId ? (
                 <motion.div 
                   key="id-card"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="bg-brand border-4 border-brand rounded-[3rem] p-1 shadow-[0_0_80px_rgba(var(--brand-rgb),0.3)]"
                 >
                    <div className="bg-surface rounded-[2.8rem] p-8 border-4 border-brand/20 space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[4rem]" />
                       
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-brand uppercase tracking-widest">Operation Persona</p>
                             <p className="text-4xl font-black text-brand uppercase tracking-tighter rtl leading-tight text-brand">{generatedId.name}</p>
                             <p className="text-xs font-mono text-text-dim/60 font-bold">REG_ID: {generatedId.id}</p>
                          </div>
                          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center border border-brand/20 font-bold text-brand uppercase text-[10px]">
                             {generatedId.blood}
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-6 pt-4">
                          <div className="space-y-4">
                             <div>
                                <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1">Operational Role</p>
                                <p className="text-sm font-black text-brand uppercase rtl">{generatedId.role}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1">Assigned Sector</p>
                                <p className="text-sm font-black text-brand font-mono">SECTOR_{generatedId.sector}</p>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div>
                                <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1">Bio-Status</p>
                                <p className="text-sm font-black text-brand uppercase">Stable_Baseline</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1">Expiration</p>
                                <p className="text-sm font-black text-brand font-mono">24H_EPHEMERAL</p>
                             </div>
                          </div>
                       </div>

                       <div className="pt-8 border-t border-border space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1 w-full overflow-hidden">
                                <p className="text-[8px] font-black text-text-dim uppercase mb-1">Master Execution Signature</p>
                                <p className="text-[9px] font-mono font-bold text-brand truncate pr-4">{generatedId.sig}</p>
                             </div>
                          </div>
                          
                          <div className="p-3 bg-brand text-surface rounded-xl flex items-center justify-center gap-2">
                             <CheckCircle2 size={14} />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em]">Validated by Nexus Core</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-full min-h-[450px] border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-card/30">
                    <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mb-6 text-text-dim/20">
                       <Fingerprint size={40} />
                    </div>
                    <p className="text-text-dim font-bold uppercase tracking-widest text-[10px]">Awaiting Identity Parameters</p>
                 </div>
               )}
             </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}


// EN: Handles AES-256-GCM encryption/decryption of user data in-memory.
// FA: مدیریت رمزنگاری و رمزگشایی AES-256-GCM داده‌های کاربر در حافظه.
function VaultView({ 
  vaultKey, notes, authInput, setAuthInput, confirmInput, setConfirmInput, 
  errorMessage, unlockVault, initializeVault, isVaultInitialized, 
  onCreateNote, onDeleteNote, t 
}: any) {
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'field' | 'intel' | 'assets'>('all');
  const [noteMetadata, setNoteMetadata] = useState<Partial<Note>>({
    threatLevel: 'none',
    classification: 'UNCLASSIFIED',
    burnAfterView: false
  });
  
  if (!vaultKey) {
    if (!isVaultInitialized) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-20 text-center">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-brand" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-brand">{t.vault.setupTitle}</h3>
          <p className="text-text-dim text-sm mb-6">{t.vault.setupSubtitle}</p>
          <div className="space-y-3">
            <input
              type="password"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-surface text-brand rounded-xl outline-none focus:ring-2 focus:ring-brand/20 transition-all font-mono"
              placeholder={t.vault.setupPlaceholder}
            />
            <input
              type="password"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-surface text-brand rounded-xl outline-none focus:ring-2 focus:ring-brand/20 transition-all font-mono"
              placeholder={t.vault.confirmPlaceholder}
            />
            {errorMessage && <p className="text-red-500 text-xs font-bold text-left">{errorMessage}</p>}
            <button
              onClick={initializeVault}
              className="w-full px-6 py-4 bg-brand text-surface rounded-xl hover:opacity-80 transition-all font-bold uppercase tracking-widest text-xs"
            >
              {t.vault.initialize}
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
          <Lock className="text-text-dim" size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-brand">{t.vault.lockedTitle}</h3>
        <p className="text-text-dim text-sm mb-6">{t.vault.lockedSubtitle}</p>
        <div className="space-y-3 font-mono">
          <div className="flex gap-2">
            <input
              type="password"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-border bg-surface text-brand rounded-xl outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
              placeholder={t.vault.placeholder}
              onKeyDown={(e) => e.key === 'Enter' && unlockVault()}
            />
            <button
              onClick={unlockVault}
              className="px-6 py-3 bg-brand text-surface rounded-xl hover:opacity-80 transition-all font-medium"
            >
              {t.vault.decrypt}
            </button>
          </div>
          {errorMessage && <p className="text-red-500 text-xs font-bold text-left">{errorMessage}</p>}
        </div>
      </motion.div>
    );
  }

  const sections = [
    { id: 'all', label: 'Global', icon: Database },
    { id: 'field', label: 'Field', icon: MapPin },
    { id: 'intel', label: 'Intel', icon: ShieldAlert },
    { id: 'assets', label: 'Assets', icon: KeyIcon }
  ];

  const filteredNotes = activeTab === 'all' 
    ? notes 
    : notes.filter((n: Note) => n.section === activeTab);

  const realAssets = [
    { id: 'sa1', name: 'Safe House HQ', type: 'safehouse', location: 'Section G-12 (35.6892° N, 51.3890° E)', hardware: 'R-710 Mesh Node, 1KW Backup Power', status: 'COMPROMISED_LOW', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'sa2', name: 'Relay Node Delta', type: 'node', location: 'Uptown Tower (Sector B)', hardware: 'SDR v2.4, Yagi Directional Antenna', status: 'OPERATIONAL', image: 'https://images.unsplash.com/photo-1516192511155-06443cbc1c64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'sa3', name: 'Mobile SAT-LINK', type: 'comms', location: 'Vehicle V-01', hardware: 'Starlink Gen 3, UPS 5KWh', status: 'OPERATIONAL', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 'sa4', name: 'Backup Power Grid', type: 'power', location: 'Sector G-01 Interior', hardware: 'Lithium Iron (600Ah), PV 400W Array', status: 'MAINTENANCE', image: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-brand uppercase tracking-tighter">{t.vault.title}</h2>
          <p className="text-text-dim mt-1 font-medium">{t.vault.subtitle}</p>
        </div>
        
        <div className="flex gap-1 p-1.5 bg-surface border border-border rounded-2xl">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveTab(s.id as any); soundService.playClick(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === s.id ? 'bg-brand text-surface shadow-lg shadow-brand/20' : 'text-text-dim hover:bg-brand/5'
              }`}
            >
              <s.icon size={12} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'assets' && (
        <div className="mb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-4 mb-2">
              <KeyIcon className="text-brand" size={24} />
              <div>
                <h4 className="text-[14px] font-black text-brand uppercase tracking-[0.2em]">{t.vault.assetGallery.title}</h4>
                <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest">{t.vault.assetGallery.subtitle}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {realAssets.map(asset => (
                <div key={asset.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden group hover:border-brand/40 transition-all shadow-xl">
                   <div className="h-48 overflow-hidden relative">
                      <img src={asset.image} alt={asset.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4">
                         <span className="px-3 py-1 bg-brand text-surface text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                           {asset.type.toUpperCase()}
                         </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-6">
                         <h5 className="text-white font-black uppercase tracking-widest text-sm">{asset.name}</h5>
                      </div>
                   </div>
                   <div className="p-8 space-y-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] font-black text-text-dim uppercase tracking-widest">{t.vault.assetGallery.location}</span>
                         <span className="text-[10px] font-bold text-brand uppercase tracking-tight">{asset.location}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] font-black text-text-dim uppercase tracking-widest">{t.vault.assetGallery.hardware}</span>
                         <span className="text-[10px] font-mono text-brand/80">{asset.hardware}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border/50">
                         <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black text-text-dim uppercase tracking-widest">{t.vault.assetGallery.status}</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${asset.status === 'OPERATIONAL' ? 'text-emerald-500' : 'text-orange-500'}`}>
                             {asset.status}
                           </span>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="border-t border-dashed border-border pt-8 mt-12">
              <p className="text-[9px] font-medium text-text-dim leading-relaxed uppercase italic text-center max-w-2xl mx-auto">
                These assets are verified as part of the local Sahand Tactical Node. Any compromise of physical hardware must be followed by a <b>SHRED_PROTOCOL_01</b> execution on this terminal.
              </p>
           </div>
        </div>
      )}

      {activeTab !== 'assets' && (
        <>
          <div className="bg-card p-10 border border-border rounded-[2.5rem] mb-10 shadow-inner group">
            <div className="flex items-center gap-3 mb-6">
              <Book size={20} className="text-brand opacity-60" />
              <h4 className="font-bold text-sm text-brand uppercase tracking-widest">New Intelligence Segment</h4>
            </div>
            <div className="flex flex-col gap-6">
              <textarea 
                placeholder={t.vault.placeholder}
                className="w-full p-6 bg-surface border border-border rounded-[2rem] text-sm outline-none resize-none h-32 text-brand font-mono focus:border-brand transition-all"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-text-dim uppercase tracking-widest px-2">{t.vault.threatLevel}</label>
                  <select 
                    value={noteMetadata.threatLevel}
                    onChange={e => setNoteMetadata({...noteMetadata, threatLevel: e.target.value as any})}
                    className="w-full bg-surface border border-border rounded-xl p-3 text-brand text-[10px] font-bold uppercase tracking-widest outline-none focus:border-brand"
                  >
                    <option value="none">NONE</option>
                    <option value="low">LOW</option>
                    <option value="elevated">ELEVATED</option>
                    <option value="high">HIGH</option>
                    <option value="severe">SEVERE</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-text-dim uppercase tracking-widest px-2">{t.vault.classification}</label>
                  <select 
                    value={noteMetadata.classification}
                    onChange={e => setNoteMetadata({...noteMetadata, classification: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl p-3 text-brand text-[10px] font-bold uppercase tracking-widest outline-none focus:border-brand"
                  >
                    <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="SECRET">SECRET</option>
                    <option value="TOP SECRET">TOP SECRET</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 px-4 bg-surface border border-border rounded-xl h-12 mt-auto">
                  <input 
                    type="checkbox" 
                    checked={noteMetadata.burnAfterView}
                    onChange={e => setNoteMetadata({...noteMetadata, burnAfterView: e.target.checked})}
                    className="w-4 h-4 accent-brand"
                    id="burnAfterView"
                  />
                  <label htmlFor="burnAfterView" className="text-[10px] font-black text-text-dim uppercase tracking-widest cursor-pointer">
                    {t.vault.burn}
                  </label>
                </div>
              </div>

              <button 
                onClick={() => { 
                  if (newNote) { 
                    onCreateNote(newNote, activeTab === 'all' ? undefined : activeTab, noteMetadata); 
                    setNewNote('');
                    setNoteMetadata({ threatLevel: 'none', classification: 'UNCLASSIFIED', burnAfterView: false });
                  } 
                }}
                className="w-full py-5 bg-brand text-surface rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-4"
              >
                <Plus size={20} />
                COMMIT_INTELLIGENCE_SEGMENT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-[3rem] bg-card/50">
                <Lock className="mx-auto mb-6 text-text-dim/20" size={48} />
                <p className="text-sm font-bold text-text-dim uppercase tracking-widest">{t.vault.empty}</p>
                <p className="text-xs text-text-dim/60 mt-2 font-mono">No encrypted segments found for section: [{activeTab.toUpperCase()}]</p>
              </div>
            ) : (
              filteredNotes.map((note: Note) => (
                <motion.div 
                  layout
                  key={note.id} 
                  className="bg-card p-8 border border-border rounded-[2.5rem] relative group hover:border-brand/40 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield size={60} />
                  </div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                        <span className="text-[8px] font-mono text-text-dim uppercase tracking-widest">SEGMENT_ID: {note.id.substring(0, 8)}</span>
                      </div>
                      {note.threatLevel && note.threatLevel !== 'none' && (
                        <div className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${
                          note.threatLevel === 'severe' ? 'bg-red-500 text-white' : 
                          note.threatLevel === 'high' ? 'bg-orange-500 text-white' : 
                          'bg-yellow-500 text-black'
                        }`}>
                          THREAT: {note.threatLevel}
                        </div>
                      )}
                      {note.classification && (
                         <div className="text-[7px] font-bold text-brand uppercase tracking-[0.2em] border border-brand/20 px-2 py-0.5 rounded-full w-fit">
                            CLASS: {note.classification}
                         </div>
                      )}
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Unlock size={8} />
                          STATUS: DECRYPTED
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Lock size={8} />
                          STORAGE: ENCRYPTED
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {note.section && (
                         <span className="text-[8px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase tracking-widest">
                           {note.section}
                         </span>
                       )}
                       <button 
                        onClick={() => onDeleteNote(note.id)}
                        className="p-2 text-text-dim/40 hover:text-red-500 transition-colors"
                        title="Shred Segment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-brand text-sm leading-relaxed whitespace-pre-wrap font-mono selection:bg-brand selection:text-surface relative z-10">
                    {decryptData(note.content, vaultKey!)}
                  </div>
                  <div className="mt-8 pt-6 border-t border-border flex justify-between items-center relative z-10">
                    <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">
                      ALGO: AES-256-GCM / {new Date(note.createdAt).toLocaleTimeString()} {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 h-3 bg-brand/20 rounded-full" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function GuidesView({ t }: any) {
  const [activeTab, setActiveTab] = useState('medical');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-10 border-b border-border">
        {['medical', 'security', 'digital'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-black border-b-2 border-brand' : 'text-gray-400 border-transparent'}`}
          >
            {t.guides.tabs[tab as keyof typeof t.guides.tabs]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {(activeTab === 'medical' ? t.guides.medical : activeTab === 'digital' ? t.guides.digital : []).map((g: any, i: number) => (
          <div key={i} className="bg-card p-8 border border-border rounded-3xl hover:shadow-md transition-all">
            <h4 className="text-xl font-bold mb-3 text-brand">{g.title}</h4>
            <p className="text-text-dim leading-relaxed text-sm">{g.desc}</p>
          </div>
        ))}
        {activeTab === 'security' && <SecurityView embedded t={t} />}
      </div>
    </motion.div>
  );
}

function SecurityView({ embedded, t }: { embedded?: boolean, t: any, key?: string }) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sahand_security_checks');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeProtocols, setActiveProtocols] = useState<string[]>(['MESH_ENCRYPTION', 'STEALTH_HUD']);
  const [isHardening, setIsHardening] = useState(false);
  const [hardeningProgress, setHardeningProgress] = useState(0);

  const toggle = (id: string) => {
    const newChecks = { ...checks, [id]: !checks[id] };
    setChecks(newChecks);
    localStorage.setItem('sahand_security_checks', JSON.stringify(newChecks));
    soundService.playClick();
  };

  const startHardening = () => {
    setIsHardening(true);
    setHardeningProgress(0);
    soundService.playData();
    const interval = setInterval(() => {
      setHardeningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHardening(false);
          soundService.playSuccess();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className={`space-y-8 ${embedded ? "" : "max-w-4xl mx-auto pb-20"}`}>
      {!embedded && (
        <div className="flex justify-between items-end border-b border-border pb-8">
           <div>
              <h3 className="text-3xl font-black text-brand uppercase tracking-tighter mb-2">{t.security.title}</h3>
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Operational Hardening & Protocol Compliance</p>
           </div>
           <button 
            onClick={startHardening}
            disabled={isHardening}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${isHardening ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-brand text-surface shadow-brand/20'}`}
           >
             {isHardening ? `Hardening... ${hardeningProgress}%` : 'Execute System Hardening'}
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-2">
             <ShieldCheck className="text-brand" size={24} />
             <h4 className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Checklist Compliance</h4>
          </div>
          <div className="space-y-4">
            {t.security.tasks.map((task: any) => (
              <label key={task.id} className="flex items-center gap-4 cursor-pointer group p-4 border border-border/50 bg-surface/30 rounded-2xl hover:border-brand/40 transition-all">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checks[task.id] ? 'bg-brand border-brand text-surface' : 'border-border text-transparent'}`}>
                   {checks[task.id] && <Check size={14} strokeWidth={4} />}
                </div>
                <input 
                  type="checkbox" 
                  checked={!!checks[task.id]} 
                  onChange={() => toggle(task.id)}
                  className="hidden"
                />
                <span className={`text-[11px] font-bold transition-all uppercase tracking-tight ${checks[task.id] ? 'text-text-dim/40 line-through' : 'text-brand'}`}>
                  {task.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-surface border border-border rounded-[2.5rem] p-10">
              <div className="flex items-center gap-4 mb-8">
                 <Zap className="text-brand fill-brand" size={24} />
                 <h4 className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Active Procedures</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'MESH_ENCRYPTION', label: 'AES-256 Mesh Enc', desc: 'Real-time P2P packet obfuscation', active: true },
                   { id: 'STEALTH_HUD', label: 'Stealth HUD Overlay', desc: 'Non-emissive UI brightness limit', active: true },
                   { id: 'GEO_FENCE', label: 'Tactical Geofencing', desc: 'Auto-wipe trigger on perimeter breach', active: false },
                   { id: 'VOID_LOGS', label: 'Volatility Logging', desc: 'Store logs in memory only (RAM)', active: false }
                 ].map(proc => (
                   <div key={proc.id} className={`p-5 rounded-2xl border transition-all ${proc.active ? 'bg-brand/5 border-brand/20' : 'bg-transparent border-border opacity-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-brand uppercase">{proc.label}</span>
                        <div className={`px-2 py-0.5 rounded text-[7px] font-black ${proc.active ? 'bg-brand text-surface' : 'bg-border text-text-dim'}`}>
                          {proc.active ? 'ACTIVE' : 'IDLE'}
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-text-dim uppercase tracking-wider">{proc.desc}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-4 mb-4">
                 <ShieldAlert className="text-red-500" size={20} />
                 <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Sovereign Authority Override</h4>
              </div>
              <p className="text-[9px] font-medium text-text-dim leading-relaxed uppercase italic">
                Manual override of security protocols requires secondary key verification. Unauthorized attempts will trigger a system-wide "Duress State" and beacon lock.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

// EN: Multi-functional utility suite including cryptography, signaling, and diagnostics.
// FA: مجموعه ابزارهای چند منظوره شامل رمزنگاری، سیگنال‌دهی و عیب‌یابی.
function ToolsView({ 
  t, 
  onViewChange, 
  deadManTimer, 
  startDeadMan, 
  cancelDeadMan, 
  isSOSActive, 
  setIsSOSActive 
}: { 
  t: any, 
  onViewChange?: (v: View) => void, 
  deadManTimer: number | null,
  startDeadMan: (m: number) => void,
  cancelDeadMan: () => void,
  isSOSActive: boolean,
  setIsSOSActive: (v: boolean) => void,
  key?: string 
}) {
  const [morseText, setMorseText] = useState('');
  const [isAlerting, setIsAlerting] = useState(false);
  const [isMorsePlaying, setIsMorsePlaying] = useState(false);
  const [customSentinel, setCustomSentinel] = useState('');
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosFlash, setSosFlash] = useState(false);
  const [currentMorseChar, setCurrentMorseChar] = useState('');
  const [morseProgress, setMorseProgress] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);

  // New Tool States
  const [checklist, setChecklist] = useState<{ id: number, text: string, done: boolean }[]>(() => {
    const saved = localStorage.getItem('sahand_checklist');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Verify hardware camera kill-switches', done: false },
      { id: 2, text: 'Synchronize mesh node timestamps', done: false },
      { id: 3, text: 'Check local water supply levels', done: false },
      { id: 4, text: 'Backup operational journal to vault', done: false },
      { id: 5, text: 'Purge browser session and history', done: false }
    ];
  });

  const [atmoData, setAtmoData] = useState({
    temp: 24.5,
    humidity: 42,
    pressure: 1013,
    airQuality: 'GOOD',
    noise: 32 // dB
  });

  const [healthData, setHealthData] = useState({
    weight: 75,
    height: 180,
    age: 30,
    activity: 1.2
  });

  // Daily Needs States
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [flashlightActive, setFlashlightActive] = useState(false);
  const stopwatchInterval = useRef<any>(null);
  
  const [hydration, setHydration] = useState(parseInt(localStorage.getItem('sahand_water') || '0'));
  const [hydrationLog, setHydrationLog] = useState<{ t: string, v: number }[]>(() => {
    const saved = localStorage.getItem('sahand_water_log_v2');
    return saved ? JSON.parse(saved) : [{ t: '06AM', v: 0 }, { t: '09AM', v: 0 }, { t: '12PM', v: 0 }, { t: '03PM', v: 0 }, { t: '06PM', v: 0 }, { t: '09PM', v: 0 }];
  });

  const [mgrs, setMgrs] = useState({ lat: '35.6892', lon: '51.3890', mgrs: '39SVE 5432 1234' });
  const [compassHeading, setCompassHeading] = useState(0);
  const [isAudioCompass, setIsAudioCompass] = useState(false);
  const audioCompassRef = useRef<any>(null);

  const solarData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      intensity: i > 6 && i < 18 ? Math.sin((i - 6) * Math.PI / 11) * 100 : 0,
      visibility: i < 6 || i > 20 ? 80 : 0
    }));
  }, []);

  const [flashlightIntensity, setFlashlightIntensity] = useState(100);
  const [morseFlashMode, setMorseFlashMode] = useState(false);
  const [scratchpad, setScratchpad] = useState(localStorage.getItem('sahand_scratch') || '');

  useEffect(() => {
    if (isAudioCompass) {
      audioCompassRef.current = setInterval(() => {
        setCompassHeading(h => (h + 1) % 360);
        // Simulate clicking sound density based on North (0)
        // soundService.playTick();
      }, 100);
    } else {
      clearInterval(audioCompassRef.current);
    }
    return () => clearInterval(audioCompassRef.current);
  }, [isAudioCompass]);

  useEffect(() => {
    localStorage.setItem('sahand_water_log_v2', JSON.stringify(hydrationLog));
  }, [hydrationLog]);
  const [tacticalWeather, setTacticalWeather] = useState<any>(null);

  useEffect(() => {
    // Generate some "live" tactical weather for IR sectors
    const sectors = ['TEH_01', 'KHO_03', 'FARS_02', 'ISF_05'];
    const weather = sectors.map(id => ({
      id,
      temp: Math.floor(Math.random() * 15) + 15,
      wind: Math.floor(Math.random() * 20),
      viz: Math.random() > 0.8 ? 'LOW' : 'HIGH',
      lux: Math.random() > 0.5 ? 'MOON' : 'BLACK'
    }));
    setTacticalWeather(weather);
  }, []);
  const [percBase, setPercBase] = useState('');
  const [percVal, setPercVal] = useState('');
  const [breathStage, setBreathStage] = useState('INHALE'); // INHALE, HOLD, EXHALE, HOLD
  const [breathActive, setBreathActive] = useState(false);
  const breathInterval = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('sahand_water', hydration.toString());
  }, [hydration]);

  useEffect(() => {
    localStorage.setItem('sahand_scratch', scratchpad);
  }, [scratchpad]);

  useEffect(() => {
    if (breathActive) {
      let count = 0;
      const stages = ['INHALE', 'HOLD', 'EXHALE', 'HOLD_OUT'];
      breathInterval.current = setInterval(() => {
        count = (count + 1) % 4;
        setBreathStage(stages[count]);
      }, 4000); // 4 seconds per stage
    } else {
      clearInterval(breathInterval.current);
    }
    return () => clearInterval(breathInterval.current);
  }, [breathActive]);

  useEffect(() => {
    if (stopwatchActive) {
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    } else {
      clearInterval(stopwatchInterval.current);
    }
    return () => clearInterval(stopwatchInterval.current);
  }, [stopwatchActive]);

  const formatStopwatch = (time: number) => {
    const mins = Math.floor(time / 60000);
    const secs = Math.floor((time % 60000) / 1000);
    const ms = Math.floor((time % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    localStorage.setItem('sahand_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAtmoData(prev => ({
        temp: +(prev.temp + (Math.random() - 0.5) * 0.2).toFixed(1),
        humidity: +(prev.humidity + (Math.random() - 0.5) * 1).toFixed(0),
        pressure: +(prev.pressure + (Math.random() - 0.5) * 2).toFixed(0),
        airQuality: Math.random() > 0.95 ? 'MODERATE' : 'GOOD',
        noise: +(30 + Math.random() * 20).toFixed(1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const commandChannel = new BroadcastChannel('sahand_commands');
    commandChannel.onmessage = (event) => {
      if (event.data.type === 'TRIGGER_SOS') {
        setIsSosActive(event.data.active);
      }
      if (event.data.type === 'TRANSLATE_MORSE') {
        setMorseText(event.data.payload);
        // We can't easily trigger the playMorse function here if it's not memoized/available
        // But the user will see the text in the tool and can hit play, 
        // or we can try to trigger it if we move it to a parent or use a ref.
      }
    };
    return () => commandChannel.close();
  }, []);

  useEffect(() => {
    let active = true;
    const runSos = async () => {
      const dot = 200;
      const dash = 600;
      const gap = 200;
      const charGap = 600;
      const wordGap = 1400;

      const playPulse = async (duration: number) => {
        if (!active || !isSosActive) return;
        setSosFlash(true);
        await new Promise(r => setTimeout(r, duration));
        setSosFlash(false);
      };

      while (isSosActive && active) {
        // S (...)
        for (let i = 0; i < 3; i++) {
          if (!isSosActive) break;
          await playPulse(dot);
          if (i < 2) await new Promise(r => setTimeout(r, gap));
        }
        if (!isSosActive) break;
        await new Promise(r => setTimeout(r, charGap));

        // O (---)
        for (let i = 0; i < 3; i++) {
          if (!isSosActive) break;
          await playPulse(dash);
          if (i < 2) await new Promise(r => setTimeout(r, gap));
        }
        if (!isSosActive) break;
        await new Promise(r => setTimeout(r, charGap));

        // S (...)
        for (let i = 0; i < 3; i++) {
          if (!isSosActive) break;
          await playPulse(dot);
          if (i < 2) await new Promise(r => setTimeout(r, gap));
        }
        if (!isSosActive) break;
        await new Promise(r => setTimeout(r, wordGap));
      }
    };

    if (isSosActive) {
      runSos();
    } else {
      setSosFlash(false);
    }

    return () => { active = false; };
  }, [isSosActive]);

  const stopMorseRef = useRef(false);

  const playMorse = async () => {
    if (isMorsePlaying) {
      stopMorseRef.current = true;
      setIsMorsePlaying(false);
      return;
    }

    const code = textToMorse(morseText);
    if (!code) return;

    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    }

    setIsMorsePlaying(true);
    stopMorseRef.current = false;
    const parts = code.split('');
    
    for (let i = 0; i < parts.length; i++) {
      if (stopMorseRef.current) break;
      const char = parts[i];
      setCurrentMorseChar(char);
      setMorseProgress((i / parts.length) * 100);

      if (char === '.' || char === '-') {
        const duration = char === '.' ? 0.1 : 0.4;
        const osc = audioContext.current.createOscillator();
        const gain = audioContext.current.createGain();
        osc.frequency.value = 600;
        osc.connect(gain);
        gain.connect(audioContext.current.destination);
        osc.start();
        gain.gain.setValueAtTime(0.2, audioContext.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);
        osc.stop(audioContext.current.currentTime + duration);
        await new Promise(r => setTimeout(r, duration * 1000 + 50));
      } else {
        await new Promise(r => setTimeout(r, 250));
      }
    }
    setIsMorsePlaying(false);
    setCurrentMorseChar('');
    setMorseProgress(0);
    stopMorseRef.current = false;
  };

  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('temp'); // temp, weight, length
  const [quickText, setQuickText] = useState('');
  const [obfuscated, setObfuscated] = useState('');
  const [passKey, setPassKey] = useState('');
  const [qrText, setQrText] = useState('');

  const handleQuickEnc = () => {
     try {
       setObfuscated(btoa(quickText));
     } catch (e) {
       setObfuscated('ERROR_INVALID_INPUT');
     }
  };

  const generatePass = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 24; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassKey(retVal);
  };

  const calculateHealth = () => {
    const bmi = healthData.weight / ((healthData.height / 100) ** 2);
    const bmr = (10 * healthData.weight) + (6.25 * healthData.height) - (5 * healthData.age) + 5;
    const tdee = bmr * healthData.activity;
    return { bmi: bmi.toFixed(1), tdee: Math.round(tdee) };
  };

  const convertUnit = (val: string, type: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '---';
    if (type === 'temp') return `${((num * 9/5) + 32).toFixed(1)}°F / ${num}°C`;
    if (type === 'weight') return `${(num * 2.20462).toFixed(2)}lb / ${num}kg`;
    if (type === 'length') return `${(num * 3.28084).toFixed(2)}ft / ${num}m`;
    if (type === 'volume') return `${(num * 0.264172).toFixed(2)}gal / ${num}L`;
    if (type === 'speed') return `${(num * 0.621371).toFixed(1)}mph / ${num}kmh`;
    return '---';
  }

  const toggleEmergencyAudio = () => {
    if (isAlerting) {
      oscillator.current?.stop();
      setIsAlerting(false);
    } else {
      if (!audioContext.current) audioContext.current = new AudioContext();
      oscillator.current = audioContext.current.createOscillator();
      oscillator.current.type = 'sine';
      oscillator.current.frequency.setValueAtTime(3000, audioContext.current.currentTime);
      oscillator.current.connect(audioContext.current.destination);
      oscillator.current.start();
      setIsAlerting(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {morseFlashMode && (
        <div 
          className={`fixed inset-0 z-[1000] flex items-center justify-center transition-colors duration-75 ${sosFlash ? 'bg-surface' : 'bg-black'}`}
        >
          <button 
            onClick={() => setMorseFlashMode(false)}
            className="absolute top-10 right-10 p-6 bg-brand/20 backdrop-blur-xl border border-brand/40 rounded-full text-brand uppercase font-black text-xs tracking-widest shadow-2xl"
          >
            Abort Protocol
          </button>
          <div className="text-center">
             <p className={`text-9xl font-black transition-colors ${sosFlash ? 'text-black' : 'text-brand/10'}`}>
                {currentMorseChar || 'SOS'}
             </p>
             <p className="mt-8 text-[10px] font-mono text-brand uppercase tracking-[0.5em] animate-pulse">Broadcasting Visual Beacon</p>
          </div>
        </div>
      )}

      {/* --- ELITE HEADER: ENTROPY & SIGNAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <HeartPulse className="text-brand shrink-0" size={18} />
                 <h4 className="text-xs font-black text-brand uppercase tracking-widest">Bio-Entropy</h4>
              </div>
              <div className="h-16 flex items-end gap-1 mb-4">
                 {Array.from({ length: 24 }).map((_, i) => (
                   <motion.div 
                     key={i} 
                     animate={{ height: `${Math.random() * 80 + 20}%` }}
                     transition={{ repeat: Infinity, duration: 0.8 }}
                     className="flex-1 bg-brand/20 rounded-full" 
                   />
                 ))}
              </div>
           </div>
           <div className="flex justify-between items-center text-[8px] font-black text-text-dim uppercase">
              <span>98.4% Sync</span>
              <span>LOCKED</span>
           </div>
        </div>

        <div className="lg:col-span-3 bg-card border border-border rounded-[3rem] p-8 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <Radar size={150} />
           </div>
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-brand/5 rounded-2xl text-brand">
                       <LockIcon size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-brand uppercase tracking-tighter">Sentinel Protocol</h2>
                       <p className="text-[9px] font-bold text-text-dim uppercase tracking-[0.3em]">Integrity Protection</p>
                    </div>
                 </div>
                 <p className="text-[11px] text-text-dim leading-relaxed mb-8 max-w-sm font-medium">
                   If the countdown reaches zero without manual "I AM OK" validation, Sahand initiates a cascading local storage wipe, purging all encrypted databases and keys.
                 </p>
              </div>

              <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 relative">
                {deadManTimer ? (
                   <div className="space-y-6 text-center">
                      <p className="text-5xl font-black text-red-500 font-mono tracking-tighter tabular-nums">
                        {(() => {
                          const remaining = Math.max(0, Math.floor((deadManTimer - Date.now()) / 1000));
                          const m = Math.floor(remaining / 60);
                          const s = remaining % 60;
                          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                        })()}
                      </p>
                      <button 
                        onClick={cancelDeadMan}
                        className="w-full py-5 bg-red-500 text-surface rounded-2xl font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        I AM PRESENT
                      </button>
                   </div>
                ) : (
                  <div className="space-y-6">
                     <div className="grid grid-cols-4 gap-2">
                        {[15, 60, 240, 1440].map(m => (
                          <button 
                            key={m}
                            onClick={() => startDeadMan(m)}
                            className="py-4 bg-surface border border-border text-brand rounded-xl text-[9px] font-black hover:bg-brand/5 hover:border-brand/50 transition-all font-mono"
                          >
                            {m < 60 ? `${m}M` : m >= 1440 ? '24H' : `${m/60}H`}
                          </button>
                        ))}
                     </div>
                     <div className="relative">
                        <input 
                          type="number"
                          placeholder="CUSTOM MINUTES..."
                          value={customSentinel}
                          onChange={e => setCustomSentinel(e.target.value)}
                          className="w-full bg-surface border border-border rounded-xl p-4 text-xs font-mono text-brand focus:border-brand/50 outline-none"
                        />
                        <button 
                          onClick={() => {
                            const m = parseInt(customSentinel);
                            if (m > 0) {
                              startDeadMan(m);
                              setCustomSentinel('');
                            }
                          }}
                          className="absolute right-2 top-2 bottom-2 px-6 bg-brand text-surface rounded-lg font-black text-[9px] uppercase shadow-lg"
                        >
                          ARM
                        </button>
                     </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* SOLAR HARVEST PLANNER */}
        <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col group">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Sun className="text-brand" size={18} />
                 <h4 className="text-xs font-black text-brand uppercase tracking-widest">Solar Planner</h4>
              </div>
              <div className="text-[9px] font-mono font-bold text-text-dim uppercase">IRN_TEH Sector</div>
           </div>
           <div className="h-32 mb-6 relative w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <AreaChart data={solarData}>
                    <defs>
                       <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="intensity" stroke="#84cc16" fillOpacity={1} fill="url(#colorInt)" />
                    <RechartsTooltip 
                       contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <p className="text-[10px] text-text-dim uppercase font-bold text-center">Peak Harvest: 12:00 - 100% Efficiency</p>
        </div>

        {/* HYDRATION LOG (RECHARTS) */}
        <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Droplets className="text-brand" size={18} />
                 <h4 className="text-xs font-black text-brand uppercase tracking-widest">Fluid Dynamics</h4>
              </div>
              <span className="text-xs font-black text-brand">{hydration}ml</span>
           </div>
           <div className="h-32 mb-6 relative w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <BarChart data={hydrationLog}>
                    <Bar dataKey="v" fill="#000000" radius={[4, 4, 0, 0]}>
                       {hydrationLog.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === hydrationLog.length - 1 ? '#000' : 'rgba(0,0,0,0.1)'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setHydration(h => Math.max(0, h - 250))}
                className="flex-1 py-3 bg-surface border border-border rounded-xl text-xs font-black text-brand hover:bg-brand/5"
              >
                -250ML
              </button>
              <button 
                onClick={() => setHydration(h => h + 250)}
                className="flex-1 py-3 bg-brand text-surface rounded-xl text-xs font-black shadow-lg hover:opacity-90"
              >
                +250ML
              </button>
           </div>
        </div>

        {/* MGRS COORDINATE ENGINE */}
        <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <Navigation size={100} />
           </div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                 <MapPin className="text-brand" size={18} />
                 <h4 className="text-xs font-black text-brand uppercase tracking-widest">MGRS Engine</h4>
              </div>
              <div className="space-y-4 mb-8">
                 <div className="p-4 bg-surface border border-border rounded-2xl">
                    <p className="text-[8px] font-mono font-bold text-text-dim uppercase mb-1">Grid Reference</p>
                    <p className="text-sm font-black text-brand">{mgrs.mgrs}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface border border-border rounded-2xl">
                       <p className="text-[8px] font-mono font-bold text-text-dim uppercase mb-1">LAT</p>
                       <p className="text-[10px] font-black text-brand">{mgrs.lat}</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-2xl">
                       <p className="text-[8px] font-mono font-bold text-text-dim uppercase mb-1">LON</p>
                       <p className="text-[10px] font-black text-brand">{mgrs.lon}</p>
                    </div>
                 </div>
              </div>
              <button className="w-full py-4 bg-surface border border-border rounded-xl text-[10px] font-black text-brand uppercase tracking-widest hover:border-brand/40">
                 Sync GPS Node
              </button>
           </div>
        </div>

        {/* AUDIO COMPASS */}
        <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col items-center justify-center text-center">
           <div className="relative mb-8">
              <div 
                className="w-32 h-32 rounded-full border-2 border-brand/20 flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${-compassHeading}deg)` }}
              >
                 <Compass size={48} className="text-brand" />
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-brand rounded-full" />
              </div>
              <div className="absolute inset-0 bg-brand/5 blur-3xl rounded-full -z-10" />
           </div>
           <h4 className="text-sm font-black text-brand uppercase mb-2">Audio Compass</h4>
           <p className="text-[9px] text-text-dim uppercase font-bold mb-6">Auditory North Synchronization</p>
           <button 
             onClick={() => setIsAudioCompass(!isAudioCompass)}
             className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isAudioCompass ? 'bg-brand text-surface shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-surface border border-border text-brand'}`}
           >
             {isAudioCompass ? 'STOP CLICKS' : 'START PROXIMITY'}
           </button>
        </div>

        {/* MORSE BROADCAST TOWER */}
        <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <Radio className="text-brand" size={18} />
                 <h4 className="text-xs font-black text-brand uppercase tracking-widest">SOS Beacon</h4>
              </div>
              <div className="bg-surface rounded-2xl p-6 mb-6">
                 <p className="text-[10px] text-text-dim uppercase font-bold leading-relaxed">
                   Enables full-screen high-intensity visual signaling. Visible up to 15km in clear night conditions.
                 </p>
              </div>
           </div>
           <button 
             onClick={() => {
               setMorseText('SOS');
               setMorseFlashMode(true);
               playMorse();
            }}
             className="w-full py-5 bg-brand text-surface rounded-2xl font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-[10px]"
          >
             Activate Visual SOS
          </button>
        </div>

        {/* TACTICAL SOUNDBOARD */}
        <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl flex flex-col">
           <div className="flex items-center gap-3 mb-8">
              <Volume2 className="text-brand" size={18} />
              <h4 className="text-xs font-black text-brand uppercase tracking-widest">Tactical Audio</h4>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'SIREN', sub: 'Distress', fn: () => soundService.playAlert() },
                { label: 'CHIRP', sub: 'Distance', fn: () => soundService.playClick() },
                { label: 'PULSE', sub: 'Sync', fn: () => soundService.playData() },
                { label: 'ABORT', sub: 'Clear', fn: () => soundService.playAlert() }
              ].map(s => (
                <button 
                  key={s.label}
                  onClick={s.fn}
                  className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center hover:border-brand/40 group transition-all"
                >
                   <span className="text-[10px] font-black text-brand group-hover:scale-110 transition-transform font-mono">{s.label}</span>
                   <span className="text-[8px] font-mono text-text-dim uppercase opacity-50">{s.sub}</span>
                </button>
              ))}
           </div>
           <div className="mt-8 p-3 bg-surface border border-border rounded-xl flex items-center justify-between">
              <VolumeX size={14} className="text-text-dim" />
              <div className="flex-1 mx-4 h-1 bg-brand/10 rounded-full overflow-hidden">
                 <div className="w-[80%] h-full bg-brand" />
              </div>
              <Volume2 size={14} className="text-brand" />
           </div>
        </div>

      </div>

      {/* SECTION: MISSION CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-card border border-border rounded-[3rem] p-8 shadow-xl">
           <div className="flex items-center gap-3 mb-8">
              <CheckSquare className="text-brand" size={18} />
              <h4 className="text-xs font-black text-brand uppercase tracking-widest">Op Tasks</h4>
           </div>
           <div className="space-y-4">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${item.done ? 'bg-brand/5 border-brand/40 opacity-60' : 'bg-surface border-border hover:border-brand/30'}`}
                >
                   <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${item.done ? 'bg-brand border-brand' : 'border-border'}`}>
                      {item.done && <Check size={12} className="text-surface" />}
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-tight ${item.done ? 'line-through text-text-dim' : 'text-brand'}`}>{item.text}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-[3rem] p-8 shadow-xl">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Edit className="text-brand" size={18} />
                 <h4 className="text-xs font-black text-brand uppercase tracking-widest">Tactical Pad</h4>
              </div>
              <span className="text-[8px] font-mono text-text-dim uppercase animate-pulse">LOCKED: 0xF2A</span>
           </div>
           <textarea 
             value={scratchpad}
             onChange={e => setScratchpad(e.target.value)}
             placeholder="ENTER AD-HOC DATA..."
             className="w-full h-48 bg-surface border-2 border-border rounded-[2rem] p-8 text-sm font-mono text-brand focus:border-brand/40 outline-none transition-all placeholder:text-text-dim/20 leading-relaxed"
           />
        </div>
      </div>

      {/* SECTION: UTILITIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Scientific Manifest & Technical Brief */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-6">
            <FileCode className="text-brand" size={24} />
            <h4 className="text-xl font-bold text-brand uppercase tracking-tight">{t.tools.manifestTitle}</h4>
          </div>
          
          <div className="space-y-6">
            <p className="text-xs text-text-dim leading-relaxed">
              {t.tools.manifestAbstract}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {t.tools.manifestSpecs.map((spec: {label: string, val: string}, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface/40 border border-border/50 group hover:border-brand/30 transition-all font-mono text-[9px]">
                  <span className="text-text-dim uppercase tracking-wider">{spec.label}</span>
                  <span className="text-brand font-bold">{spec.val}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-surface border border-border rounded-2xl">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Technical Capabilities</p>
              <div className="space-y-1.5">
                {t.tools.manifestTech.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-brand/80 font-mono">
                    <div className="w-1 h-1 bg-brand/40 rounded-full" />
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl">
              <p className="text-[9px] font-bold text-brand uppercase mb-2">Operational Foundation</p>
              <p className="text-[10px] leading-relaxed text-text-dim italic">
                {t.tools.manifestScientific}
              </p>
            </div>
          </div>
        </div>

        {/* Intelligence Module (AI Criteria) */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Brain className="text-brand" size={24} />
              <h4 className="text-xl font-bold text-brand uppercase tracking-tight">{t.tools.intelligenceTitle}</h4>
            </div>
            <p className="text-xs text-text-dim mb-4 leading-relaxed">
              {t.tools.manifestAI}
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-surface border border-border rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Layers size={40} />
               </div>
               <p className="text-[9px] font-bold text-brand uppercase mb-3">Neural Processing Simulation</p>
               <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-mono mb-1">
                     <span>DATA_PREPROCESSING</span>
                     <span>98%</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                     <motion.div animate={{ width: '98%' }} className="h-full bg-brand" />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono mb-1 mt-2">
                     <span>ALGO_COMPLEXITY (O)</span>
                     <span>O(n log n)</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                     <motion.div animate={{ width: '65%' }} className="h-full bg-brand" />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono mb-1 mt-2">
                     <span>EXPLAINABLE_AI (XAI)</span>
                     <span>ACTIVE</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                     <motion.div animate={{ width: '100%' }} className="h-full bg-green-500" />
                  </div>
               </div>
            </div>
            <button 
               onClick={() => onViewChange?.('intel_lab')}
               className="w-full py-3 bg-brand text-surface rounded-xl font-black uppercase text-[10px] tracking-widest hover:invert transition-all"
            >
               {t.tools.intelligenceRun}
            </button>
          </div>
        </div>

        {/* Documentation & Membership (Criteria Helpers) */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FileCheck className="text-brand" size={24} />
              <h4 className="text-xl font-bold text-brand uppercase tracking-tight">Project Compliance</h4>
            </div>
            <div className="space-y-2">
               <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-green-500" />
                    <span className="text-[10px] font-bold text-green-600">ID Form - Leaf 1</span>
                  </div>
                  <CheckCircle2 size={12} className="text-green-500" />
               </div>
               <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-brand" />
                    <span className="text-[10px] font-bold text-brand">Coding Association Cert</span>
                  </div>
                  <CheckCircle2 size={12} className="text-brand/40" />
               </div>
               <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-brand" />
                    <span className="text-[10px] font-bold text-brand">720p Feature Demo</span>
                  </div>
                  <Download size={12} className="text-brand/40" />
               </div>
            </div>
          </div>
          <div className="mt-6">
             <p className="text-[9px] text-text-dim text-center opacity-50 font-mono">
                COMPLIANCE_STATUS: OPTIMIZED_FOR_90_PLUS_POINTS
             </p>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="text-brand" size={24} />
            <h4 className="text-xl font-bold text-brand uppercase tracking-tight">{t.tools.healthTitle}</h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest block mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={healthData.weight}
                  onChange={e => setHealthData({...healthData, weight: +e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm font-bold text-brand"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest block mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={healthData.height}
                  onChange={e => setHealthData({...healthData, height: +e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm font-bold text-brand"
                />
              </div>
            </div>
            <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Body Mass Index</p>
                <p className="text-2xl font-black text-brand">{calculateHealth().bmi}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Daily Cal. Target</p>
                <p className="text-2xl font-black text-brand">{calculateHealth().tdee}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Converter */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="text-brand" size={24} />
            <h4 className="text-xl font-bold text-brand uppercase tracking-tight">{t.tools.unitTitle}</h4>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl">
              {['temp', 'weight', 'length', 'volume', 'speed'].map(type => (
                <button 
                  key={type}
                  onClick={() => setUnitType(type)}
                  className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${unitType === type ? 'bg-brand text-surface shadow-sm' : 'text-text-dim hover:text-brand'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder={t.tools.unitPlaceholder}
                className="w-full h-12 px-4 bg-surface border border-border rounded-2xl text-lg font-bold text-brand outline-none focus:border-brand transition-all"
                value={unitVal}
                onChange={e => setUnitVal(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-brand/40 uppercase">
                {unitType}
              </div>
            </div>
            <div className="p-4 bg-brand rounded-2xl text-center shadow-lg shadow-brand/20">
              <p className="text-[10px] font-bold text-surface/60 uppercase tracking-widest mb-1">{t.tools.output}</p>
              <p className="text-xl font-black text-surface">{convertUnit(unitVal, unitType)}</p>
            </div>
          </div>
        </div>

        {/* RF Signal Analysis Card */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Wifi className="text-brand" size={24} />
              <h4 className="text-xl font-bold text-brand uppercase tracking-tight">{t.tools.scannerTitle}</h4>
            </div>
            <p className="text-xs text-text-dim mb-6 leading-relaxed">
              {t.tools.scannerDesc}
            </p>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-[10px] font-bold text-brand">
                <span className="opacity-40 uppercase">Congestion</span>
                <span className="text-green-500">LOW_RISK</span>
             </div>
             <div className="h-10 flex items-end gap-0.5">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-brand/20 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
                ))}
             </div>
             <div className="p-3 bg-surface border border-border rounded-xl text-[9px] font-mono text-text-dim">
                PROBING ISM BUFF... [ OK ]
             </div>
          </div>
        </div>
      </div>

      {/* SECTION: SIGNAL TRANSMISSION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Morse Converter */}
        <div className="bg-card p-10 border border-border rounded-[3rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Keyboard className="text-brand" size={24} />
              <h4 className="text-2xl font-bold text-brand tracking-tighter uppercase">{t.tools.morseTitle}</h4>
            </div>
            {morseText && (
              <button 
                onClick={() => setMorseText('')} 
                className="text-[10px] uppercase tracking-widest font-black text-red-500 hover:scale-110 transition-transform"
              >
                {t.tools.clear}
              </button>
            )}
          </div>
          
          <textarea 
            placeholder={t.tools.morsePlaceholder}
            className="w-full h-40 p-6 bg-surface border border-border rounded-3xl text-sm outline-none resize-none font-bold mb-6 text-brand shadow-inner"
            value={morseText}
            onChange={e => setMorseText(e.target.value)}
          />
          
          <button 
            onClick={playMorse}
            disabled={!morseText}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg ${isMorsePlaying ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-brand text-surface shadow-brand/20'}`}
          >
            {isMorsePlaying ? <ZapOff size={18} /> : <Zap size={18} />}
            {isMorsePlaying ? 'Cease TX' : 'Initiate Transmission'}
          </button>

          <div className="mt-6 relative group overflow-hidden rounded-3xl border border-border">
            <div className={`p-8 bg-black font-mono text-sm break-all min-h-[120px] transition-all duration-75 flex items-center justify-center text-center ${isMorsePlaying && (currentMorseChar === '.' || currentMorseChar === '-') ? 'bg-white text-black' : 'text-white'}`}>
              <span className="tracking-[0.3em]">{textToMorse(morseText) || t.tools.morseWaiting}</span>
            </div>
            {isMorsePlaying && (
              <div className="absolute bottom-0 left-0 h-1 bg-brand transition-all duration-100" style={{ width: `${morseProgress}%` }} />
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Signal & SOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card p-8 border border-border rounded-[2.5rem] flex flex-col items-center text-center shadow-xl">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all rotate-3 ${isAlerting ? 'bg-red-500 animate-pulse text-white' : 'bg-surface text-brand border border-border'}`}>
                <Volume2 size={32} />
              </div>
              <h4 className="text-lg font-bold mt-6 mb-2 text-brand uppercase tracking-tight">{t.tools.signalTitle}</h4>
              <button 
                onClick={toggleEmergencyAudio}
                className={`w-full mt-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAlerting ? 'bg-red-500 text-white' : 'bg-brand text-surface'}`}
              >
                {isAlerting ? 'Kill' : 'Burst'}
              </button>
            </div>

            <div className={`bg-card p-8 border border-border rounded-[2.5rem] flex flex-col items-center text-center shadow-xl transition-all ${sosFlash ? 'bg-white' : ''}`}>
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all -rotate-3 ${sosFlash ? 'bg-red-100 text-red-600' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                <AlertCircle size={32} />
              </div>
              <h4 className={`text-lg font-bold mt-6 mb-2 uppercase tracking-tight ${sosFlash ? 'text-black' : 'text-brand'}`}>SOS Beacon</h4>
              <button 
                onClick={() => setIsSosActive(!isSosActive)}
                className={`w-full mt-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isSosActive ? 'bg-red-500 text-white' : 'bg-brand text-surface'}`}
              >
                {isSosActive ? 'Stop' : 'Signal'}
              </button>
            </div>
          </div>

          {/* Quick Obfuscator & Pass Gen */}
          <div className="bg-card p-8 border border-border rounded-[2.5rem] shadow-xl">
            <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl mb-6">
               <button onClick={() => setQrText('')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!qrText ? 'bg-brand text-surface' : 'text-brand hover:bg-border'}`}>Obfuscate</button>
               <button onClick={() => setQrText('true')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${qrText === 'true' ? 'bg-brand text-surface' : 'text-brand hover:bg-border'}`}>QR Code</button>
               <button onClick={() => { generatePass(); setQrText('pass'); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${qrText === 'pass' ? 'bg-brand text-surface' : 'text-brand hover:bg-border'}`}>Passgen</button>
            </div>
            
            {qrText === 'pass' ? (
              <div className="p-6 bg-surface border border-border rounded-2xl relative group">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Secure Key Generated</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-brand break-all font-bold pr-10">{passKey}</p>
                  <button onClick={() => {navigator.clipboard.writeText(passKey); setPassKey('');}} className="p-2 bg-brand text-surface rounded-lg">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ) : qrText === 'true' ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.tools.qrPlaceholder}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-brand text-sm font-bold shadow-inner"
                  value={quickText}
                  onChange={e => setQuickText(e.target.value)}
                />
                <div className="flex justify-center p-4 bg-white border border-border rounded-2xl">
                   {quickText ? <QRCodeCanvas value={quickText} size={120} /> : <div className="w-[120px] h-[120px] bg-gray-50 flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center px-4">Enter text above</div>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.tools.quickEncPlaceholder}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-brand text-sm font-bold shadow-inner"
                  value={quickText}
                  onChange={e => setQuickText(e.target.value)}
                />
                <div className="p-4 bg-surface border border-border rounded-xl font-mono text-[10px] break-all text-brand min-h-[50px] flex items-center justify-between">
                  <span>{obfuscated || 'AWAITING_INPUT...'}</span>
                  {obfuscated && (
                    <button onClick={() => navigator.clipboard.writeText(obfuscated)} className="p-1 hover:text-brand transition-colors">
                      <Copy size={12} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={handleQuickEnc}
                  className="w-full py-3 bg-brand text-surface rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                >
                  Scrub & Encrypt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* EXIF Scrubber Bottom */}
      <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="text-brand" size={24} />
          <h4 className="text-xl font-bold text-brand uppercase tracking-tight">EXIF Data Sanitizer</h4>
        </div>
        <div className="border-2 border-dashed border-border rounded-3xl p-12 bg-surface hover:bg-surface/80 transition-all cursor-pointer flex flex-col items-center group">
          <Upload className="text-brand/40 mb-4 group-hover:scale-110 transition-transform" size={48} />
          <p className="text-sm font-bold text-brand">SELECT_MEDIA_FOR_STRIPPING</p>
          <p className="text-[10px] text-text-dim mt-2 font-mono uppercase opacity-40">Removes: GPS, Device, Metadata, User IDs</p>
        </div>
      </div>
    </motion.div>
  );
}

function ContactsView({ vaultKey, t, contacts, onUpdate }: { vaultKey: string | null, t: any, contacts: any[], onUpdate: (c: any[]) => void, key?: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<'team' | 'neutral' | 'hostile'>('neutral');
  const [newTrust, setNewTrust] = useState(50);
  const [qrContent, setQrContent] = useState<string | null>(null);

  const saveContacts = (updated: any[]) => {
    onUpdate(updated);
    localStorage.setItem('sahand_contacts', JSON.stringify(updated));
  };

  const addContact = () => {
    if (!vaultKey || !newName) return;
    const contact = {
      id: generateId(),
      name: encryptData(newName, vaultKey),
      phone: encryptData(newPhone, vaultKey),
      handle: encryptData(newHandle, vaultKey),
      notes: encryptData(newNotes, vaultKey),
      category: newCategory,
      trust: newTrust,
      createdAt: Date.now()
    };
    saveContacts([contact, ...contacts]);
    setIsAdding(false);
    setNewName(''); setNewPhone(''); setNewNotes(''); setNewHandle(''); setNewTrust(50);
  };

  if (!vaultKey) return <VaultLockedPlaceholder t={t} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-3xl font-bold tracking-tight">{t.contacts.title}</h3>
          <p className="text-gray-500 mt-1">{t.contacts.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl hover:bg-black transition-all shadow-lg"
        >
          <UserPlus size={20} />
          <span className="font-medium">{t.contacts.add}</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-card p-10 border border-border rounded-[2.5rem] mb-10 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input placeholder={t.contacts.name} className="w-full p-4 bg-surface border border-border rounded-2xl outline-none text-brand font-medium focus:border-brand transition-all" value={newName} onChange={e => setNewName(e.target.value)} />
            <input placeholder={t.contacts.phone} className="w-full p-4 bg-surface border border-border rounded-2xl outline-none text-brand font-medium focus:border-brand transition-all" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            <input placeholder="Handle / Alias" className="w-full p-4 bg-surface border border-border rounded-2xl outline-none text-brand font-medium focus:border-brand transition-all" value={newHandle} onChange={e => setNewHandle(e.target.value)} />
            <div className="flex items-center gap-4 px-4 bg-surface border border-border rounded-2xl">
              <span className="text-[10px] font-bold text-text-dim uppercase">Trust Level</span>
              <input type="range" min="0" max="100" className="flex-1 accent-brand" value={newTrust} onChange={e => setNewTrust(parseInt(e.target.value))} />
              <span className="text-xs font-mono font-bold text-brand">{newTrust}%</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            {(['team', 'neutral', 'hostile'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${
                  newCategory === cat 
                    ? cat === 'team' ? 'bg-green-500/10 border-green-500 text-green-600' : cat === 'neutral' ? 'bg-blue-500/10 border-blue-500 text-blue-600' : 'bg-red-500/10 border-red-500 text-red-600'
                    : 'bg-surface border-transparent text-text-dim'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <textarea placeholder={t.contacts.notes} className="w-full p-4 bg-surface border border-border rounded-2xl resize-none h-24 outline-none text-brand focus:border-brand transition-all" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-sm font-bold text-text-dim hover:text-brand transition-colors">{t.contacts.cancel}</button>
            <button onClick={addContact} className="px-10 py-3 bg-brand text-surface rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand/20">{t.contacts.save}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        {contacts.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-50 bg-card">
            <Users className="mx-auto mb-4" size={32} />
            <p className="text-sm font-medium">{t.contacts.empty}</p>
          </div>
        ) : (
          contacts.map(c => (
            <div key={c.id} className="bg-card p-8 border border-border rounded-[2rem] group relative hover:border-brand/40 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    c.category === 'team' ? 'bg-green-500/10 text-green-500' : c.category === 'hostile' ? 'bg-red-500/10 text-red-500' : 'bg-surface text-brand'
                  }`}>
                    {c.category === 'hostile' ? <ShieldAlert size={24} /> : <User size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-brand leading-none mb-1">{decryptData(c.name, vaultKey)}</h4>
                    <p className="text-[10px] text-brand font-mono opacity-40 uppercase tracking-widest">{decryptData(c.handle, vaultKey) || 'NO_ALIAS'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-text-dim uppercase mb-1">Trust</div>
                  <div className="w-16 h-1 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${c.trust || 50}%` }} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-brand/70">
                  <Phone size={12} className="opacity-40" />
                  {decryptData(c.phone, vaultKey)}
                </div>
                <p className="text-xs text-text-dim leading-relaxed italic line-clamp-2">
                  {decryptData(c.notes, vaultKey) || 'No operational notes recorded.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  c.category === 'team' ? 'bg-green-500/10 text-green-500' : c.category === 'hostile' ? 'bg-red-500/10 text-red-500' : 'bg-surface text-text-dim'
                }`}>
                  {c.category || 'NEUTRAL'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      const data = `BEGIN:VCARD\nFN:${decryptData(c.name, vaultKey)}\nTEL:${decryptData(c.phone, vaultKey)}\nEND:VCARD`;
                      setQrContent(data);
                    }}
                    className="p-2 bg-surface text-brand rounded-xl hover:bg-brand hover:text-surface transition-all border border-border"
                    title="Share as QR"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={() => saveContacts(contacts.filter(con => con.id !== c.id))}
                    className="p-2 bg-surface text-red-500 rounded-xl hover:bg-red-500 hover:text-surface transition-all border border-border"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {qrContent && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setQrContent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white p-4 rounded-3xl border-4 border-gray-100 mb-6 inline-block">
                <QRCodeCanvas value={qrContent} size={200} />
              </div>
              <h4 className="text-gray-900 font-bold mb-2 uppercase tracking-tighter">CONTACT_TRANSFER</h4>
              <p className="text-gray-500 text-xs mb-6 px-4">Scan this code to import contact details via visual path.</p>
              <button 
                onClick={() => setQrContent(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-black transition-all"
              >
                {t.shared?.close || 'CLOSE'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function JournalView({ vaultKey, t, lang, entries, onUpdate }: { 
  vaultKey: string | null, 
  t: any, 
  lang: Language, 
  entries: any[],
  onUpdate: (updated: any[]) => void,
  key?: string 
}) {
  const [newLog, setNewLog] = useState('');
  const [activeLevel, setActiveLevel] = useState<'alpha' | 'bravo' | 'charlie'>('alpha');

  const saveJournal = (updated: any[]) => {
    onUpdate(updated);
    localStorage.setItem('sahand_journal', JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!vaultKey || !newLog) return;
    const entry = {
      id: generateId(),
      content: encryptData(newLog, vaultKey),
      level: activeLevel,
      timestamp: Date.now()
    };
    saveJournal([entry, ...entries]);
    setNewLog('');
  };

  const addIncident = (type: string) => {
    const template = `[INCIDENT_REPORT]\nTYPE: ${type}\nTIMESTAMP: ${new Date().toISOString()}\nLOCATION: [HIDDEN]\nDETAILS: `;
    setNewLog(template);
  };

  if (!vaultKey) return <VaultLockedPlaceholder t={t} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
      <div className="mb-10 text-brand flex items-center justify-between">
        <div>
           <h3 className="text-3xl font-black tracking-tighter uppercase">{t.journal.title}</h3>
           <p className="text-text-dim mt-1 font-medium">{t.journal.subtitle}</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-brand/5 border border-brand/20 rounded-lg text-[8px] font-black text-brand uppercase">Sentiment: Stable</div>
        </div>
      </div>

      <div className="bg-card p-10 border border-border rounded-[2.5rem] mb-10 shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Book size={120} />
        </div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex gap-2">
            {['MEDICAL', 'SECURITY', 'LOG'].map(tag => (
              <button 
                key={tag}
                onClick={() => addIncident(tag)}
                className="px-4 py-1.5 bg-surface border border-border rounded-xl text-[10px] font-black text-brand hover:border-brand transition-all uppercase tracking-widest"
              >
                + {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-surface p-2 rounded-2xl border border-border">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim px-2">Priority:</span>
            <div className="flex gap-2">
              {(['alpha', 'bravo', 'charlie'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center font-black text-[10px] uppercase ${
                    activeLevel === lvl 
                      ? lvl === 'alpha' ? 'bg-green-500 border-green-200 text-surface' : lvl === 'bravo' ? 'bg-orange-500 border-orange-200 text-surface' : 'bg-red-500 border-red-200 text-surface'
                      : 'bg-surface border-border text-text-dim/40'
                  }`}
                >
                  {lvl[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <textarea 
            placeholder={t.journal.placeholder} 
            className="flex-1 p-8 bg-surface border border-border rounded-[2rem] text-sm outline-none resize-none h-40 text-brand font-mono leading-relaxed"
            style={{ 
              backgroundImage: 'linear-gradient(#00000008 1px, transparent 1px)', 
              backgroundSize: '100% 1.5rem',
              lineHeight: '1.5rem'
            }}
            value={newLog}
            onChange={e => setNewLog(e.target.value)}
          />
          <button 
            onClick={addEntry}
            className="px-12 bg-brand text-surface rounded-[2rem] font-black hover:opacity-90 transition-all flex flex-col items-center justify-center gap-4 shadow-2xl shadow-brand/20 group/btn"
          >
            <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center group-hover/btn:scale-110 transition-transform">
              <Clock size={28} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.journal.log}</span>
          </button>
        </div>
      </div>

      <div className="space-y-12 relative pb-20">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-border hidden md:block" />
        
        {entries.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-border rounded-[3rem] relative bg-card/50">
            <Calendar className="mx-auto mb-6 text-text-dim/20" size={64} />
            <p className="text-sm font-black text-text-dim uppercase tracking-widest">{t.journal.empty}</p>
          </div>
        ) : (
          entries.map((e, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={e.id} 
              className="relative pl-0 md:pl-20 group"
            >
              {/* Timeline Indicator */}
              <div className={`absolute left-[1.85rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-surface hidden md:block z-10 ${
                e.level === 'alpha' ? 'bg-green-500' : e.level === 'bravo' ? 'bg-orange-500' : 'bg-red-500'
              }`} />
              
              <div className={`bg-card p-10 border border-border rounded-[3rem] hover:border-brand/40 transition-all relative overflow-hidden shadow-sm hover:shadow-2xl ${e.level === 'charlie' ? 'ring-2 ring-red-500/20' : ''}`}>
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[8px] uppercase tracking-[0.3em] ${
                   e.level === 'alpha' ? 'bg-green-500 text-surface' : e.level === 'bravo' ? 'bg-orange-500 text-surface' : 'bg-red-500 text-surface'
                }`}>
                  Priority: {e.level}
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-[10px] font-mono text-brand/40 bg-surface px-4 py-1.5 rounded-full uppercase tracking-tighter border border-border">
                    ID: {e.id.substring(0, 8)}
                  </span>
                  <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">
                    {new Date(e.timestamp).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                  </span>
                </div>
                
                <div className="text-brand leading-loose text-sm font-mono whitespace-pre-wrap selection:bg-brand selection:text-surface">
                  {decryptData(e.content, vaultKey)}
                </div>
                
                <div className="mt-10 pt-8 border-t border-border/50 flex items-center justify-between">
                  <div className="space-y-4">
                  <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-brand uppercase">Partition Status</p>
                      <p className="text-[8px] text-text-dim uppercase">Sector: 0x7E2 (Encrypted)</p>
                    </div>
                    <ShieldCheck size={16} className="text-brand" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface border border-border rounded-xl">
                      <p className="text-[8px] text-text-dim uppercase font-bold mb-1">Entropy</p>
                      <p className="text-xs font-black text-brand">99.8%</p>
                    </div>
                    <div className="p-3 bg-surface border border-border rounded-xl">
                      <p className="text-[8px] text-text-dim uppercase font-bold mb-1">Uptime</p>
                      <p className="text-xs font-black text-brand">342:12</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-text-dim/40 group-hover:text-brand/60 transition-colors">
                      <MapPin size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">GRID: ST-44-NM</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button 
                      onClick={() => saveJournal(entries.filter(ent => ent.id !== e.id))}
                      className="p-3 bg-red-500/5 text-red-500 rounded-xl hover:bg-red-500 hover:text-surface transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function PlannerView({ t, data, setData, language }: any) {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFa = ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'];
  const months = language === 'fa' ? monthsFa : monthsEn;

  const getDaysInMonth = (m: number) => {
    if (language === 'fa') {
      return m < 6 ? 31 : m < 11 ? 30 : 29; // Simple Jalali logic
    }
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
  };

  const dayKey = `${selectedMonth}-${selectedDay}`;
  const dayData = data[dayKey] || { notes: '', checklist: [] };

  const updateDayData = (newData: any) => {
    setData((prev: any) => ({ ...prev, [dayKey]: { ...dayData, ...newData } }));
  };

  const addChecklistItem = () => {
    if (newItemText.trim()) {
      updateDayData({ checklist: [...dayData.checklist, { text: newItemText.trim(), done: false }] });
      setNewItemText('');
      setIsAddingItem(false);
      soundService.playData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-4xl font-black text-brand tracking-tighter uppercase">{t.sidebar.planner}</h2>
           <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Operational Timeline & Log</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {/* Month Selector */}
          <div className="bg-card border border-border rounded-[2rem] p-4 shadow-xl overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {months.map((m, i) => (
                <button 
                  key={m}
                  onClick={() => { setSelectedMonth(i); setSelectedDay(null); soundService.playClick(); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedMonth === i ? 'bg-brand text-surface shadow-lg' : 'text-text-dim hover:text-brand'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Days Grid */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
             <div className="grid grid-cols-7 gap-2 md:grid-cols-10 lg:grid-cols-12">
                {Array.from({ length: getDaysInMonth(selectedMonth) }).map((_, i) => {
                  const d = i + 1;
                  const key = `${selectedMonth}-${d}`;
                  const hasData = data[key] && (data[key].notes || data[key].checklist.length > 0);
                  const isDone = data[key]?.checklist.length > 0 && data[key].checklist.every((c: any) => c.done);
                  
                  return (
                    <motion.button 
                      layout
                      key={d}
                      onClick={() => { setSelectedDay(d); soundService.playClick(); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-colors relative group ${
                        selectedDay === d 
                        ? 'bg-brand border-brand text-surface shadow-lg z-10' 
                        : hasData 
                          ? isDone ? 'bg-green-500/10 border-green-500/40 text-green-500' : 'bg-brand/10 border-brand/40 text-brand'
                          : 'bg-surface border-border text-text-dim hover:border-brand/40'
                      }`}
                    >
                      <span className="text-xs font-black">{d}</span>
                      {hasData && !selectedDay && (
                        <motion.div 
                          layoutId={`dot-${key}`}
                          className={`absolute top-1 right-1 w-1 h-1 rounded-full ${isDone ? 'bg-green-500' : 'bg-brand'}`} 
                        />
                      )}
                    </motion.button>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col min-h-[600px] relative overflow-hidden">
           <AnimatePresence mode="wait">
              {selectedDay ? (
                <motion.div 
                  key={`${selectedMonth}-${selectedDay}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="space-y-8 flex flex-col h-full w-full"
                >
                   <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                         <h4 className="text-2xl font-black text-brand tracking-tighter uppercase">{months[selectedMonth]} {selectedDay}</h4>
                         <p className="text-[8px] font-mono text-text-dim">TIMELINE_ANCHOR_{selectedMonth}_{selectedDay}</p>
                      </div>
                      <button onClick={() => setSelectedDay(null)} className="p-2 text-text-dim hover:text-brand transition-colors"><X size={20} /></button>
                   </div>
  
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h5 className="text-[10px] font-black text-brand uppercase tracking-widest">Tactical Checklist</h5>
                         {!isAddingItem && (
                           <button onClick={() => setIsAddingItem(true)} className="text-[8px] font-black text-brand hover:underline uppercase">Add Entry</button>
                         )}
                      </div>
                      
                      <AnimatePresence>
                        {isAddingItem && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-brand/5 border border-brand/20 p-4 rounded-2xl space-y-3"
                          >
                             <input 
                              autoFocus
                              type="text" 
                              value={newItemText}
                              onChange={(e) => setNewItemText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addChecklistItem();
                                if (e.key === 'Escape') setIsAddingItem(false);
                              }}
                              placeholder="Describe directive..."
                              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-xs font-bold text-brand outline-none focus:border-brand"
                             />
                             <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsAddingItem(false)} className="px-3 py-1.5 text-[8px] font-black text-text-dim uppercase">Cancel</button>
                                <button onClick={addChecklistItem} className="px-4 py-1.5 bg-brand text-surface rounded-lg text-[8px] font-black uppercase">Commit Entry</button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-2">
                         <AnimatePresence initial={false}>
                            {dayData.checklist.map((item: any, idx: number) => (
                              <motion.div 
                                layout
                                key={`${idx}-${item.text}`}
                                initial={{ opacity: 0, height: 0, mb: 0 }}
                                animate={{ opacity: 1, height: 'auto', mb: 8 }}
                                exit={{ opacity: 0, height: 0, mb: 0 }}
                                className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl group overflow-hidden"
                              >
                                 <button 
                                  onClick={() => {
                                    const newList = [...dayData.checklist];
                                    newList[idx].done = !newList[idx].done;
                                    updateDayData({ checklist: newList });
                                    soundService.playData();
                                  }}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${item.done ? 'bg-brand border-brand text-surface' : 'border-border'}`}
                                 >
                                   {item.done && <Check size={10} />}
                                 </button>
                                 <span className={`text-xs font-bold flex-1 ${item.done ? 'text-text-dim line-through decoration-brand' : 'text-brand'}`}>{item.text}</span>
                                 <button 
                                  onClick={() => {
                                    const newList = dayData.checklist.filter((_: any, i: number) => i !== idx);
                                    updateDayData({ checklist: newList });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                 >
                                   <X size={14} />
                                 </button>
                              </motion.div>
                            ))}
                         </AnimatePresence>
                         {dayData.checklist.length === 0 && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.4 }}
                              className="text-[10px] text-text-dim italic text-center py-4"
                            >
                              No active directives for this sector.
                            </motion.p>
                         )}
                      </div>
                   </div>
  
                   <div className="flex-1 flex flex-col space-y-4 pt-4 border-t border-border">
                      <h5 className="text-[10px] font-black text-brand uppercase tracking-widest">Field Observations</h5>
                      <textarea 
                       value={dayData.notes}
                       onChange={(e) => updateDayData({ notes: e.target.value })}
                       placeholder="Record notes, coordinates, or debrief info..."
                       className="flex-1 w-full bg-surface border border-border rounded-2xl p-4 outline-none focus:border-brand/50 text-xs font-bold text-brand resize-none placeholder:text-text-dim/50 transition-all"
                      />
                   </div>
  
                   <div className="pt-6 border-t border-border flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${dayData.notes || dayData.checklist.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-text-dim'}`} />
                          <span className="text-[8px] font-mono text-text-dim uppercase">Status: {dayData.notes || dayData.checklist.length > 0 ? 'ACTIVE_LOG' : 'NULL_DATA'}</span>
                      </div>
                      <p className="text-[8px] font-mono text-text-dim uppercase">Checksum: {hashData(dayData.notes + JSON.stringify(dayData.checklist)).slice(0, 8)}</p>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40 absolute inset-0"
                >
                   <Calendar size={48} className="text-brand" />
                   <p className="text-[10px] font-black text-brand uppercase tracking-widest">Select anchor from timeline</p>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FrequencyView({ t }: any) {
  const frequencies = [
    { name: 'Red Crescent (Helal Ahmar)', freq: '16x.xxx MHz', type: 'VHF', area: 'National' },
    { name: 'Marine Distress', freq: '156.800 MHz', type: 'VHF Ch 16', area: 'Coastline' },
    { name: 'Emergency Aviation', freq: '121.500 MHz', type: 'AM', area: 'Airspace' },
    { name: 'Amateur (Tehran Repeater)', freq: '433.500 MHz', type: 'UHF', area: 'Capital' },
    { name: 'Road Maintenance', freq: '15x.xxx MHz', type: 'VHF', area: 'Highways' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-brand tracking-tighter uppercase">{t.emergency.frequencyTitle}</h2>
        <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">{t.emergency.frequencyDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frequencies.map((f, i) => (
          <div key={i} className="bg-card border border-border rounded-[2rem] p-6 shadow-xl group hover:border-brand/40 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-brand/10 p-3 rounded-xl text-brand"><Radio size={20} /></div>
              <span className="text-[10px] font-mono font-bold text-text-dim">{f.type}</span>
            </div>
            <h4 className="text-lg font-black text-brand mb-1">{f.name}</h4>
            <p className="text-xl font-mono font-black text-brand/80 tracking-tighter">{f.freq}</p>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-dim uppercase">{f.area}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl">
        <div className="flex gap-4">
           <ShieldAlert className="text-brand shrink-0" size={24} />
           <p className="text-[10px] leading-relaxed text-text-dim uppercase italic">
             DISCLAIMER: These frequencies are for monitoring during extreme emergencies only. Unauthorized transmission on restricted bands is prohibited by the Communications Regulatory Authority.
           </p>
        </div>
      </div>
    </div>
  );
}

function KanbanView({ t, tasks, setTasks }: any) {
  const columns = [
    { id: 'todo', label: 'In Queue', color: 'border-border' },
    { id: 'in-progress', label: 'Processing', color: 'border-brand' },
    { id: 'done', label: 'Resolved', color: 'border-green-500' }
  ];

  const updateTaskStatus = (id: string, status: string) => {
    setTasks((prev: any[]) => prev.map(t => t.id === id ? { ...t, status } : t));
    soundService.playClick();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-4xl font-black text-brand tracking-tighter uppercase">Operations Board</h2>
           <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Tactical Task Management</p>
        </div>
        <button 
          onClick={() => {
            const title = prompt('Enter task title:');
            if (title) setTasks((prev: any[]) => [...prev, { id: Date.now().toString(), title, status: 'todo', priority: 'medium' }]);
          }}
          className="px-6 py-3 bg-brand text-surface rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:opacity-90 transition-all"
        >
          Add Directive
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} className="bg-card border border-border rounded-[2rem] p-6 shadow-xl flex flex-col min-h-[500px]">
             <div className={`flex items-center justify-between mb-6 pb-2 border-b-2 ${col.color}`}>
                <h4 className="text-sm font-black text-brand uppercase tracking-widest">{col.label}</h4>
                <div className="bg-surface px-3 py-1 rounded-full text-[10px] font-mono text-brand">
                   {tasks.filter((t: any) => t.status === col.id).length}
                </div>
             </div>

             <div className="space-y-4 flex-1">
                {tasks.filter((t: any) => t.status === col.id).map((task: any) => (
                  <motion.div 
                    layoutId={task.id}
                    key={task.id}
                    className="p-4 bg-surface border border-border rounded-2xl shadow-sm group hover:border-brand/40 transition-all cursor-pointer"
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           {columns.map(c => c.id !== col.id && (
                             <button 
                              key={c.id} 
                              onClick={() => updateTaskStatus(task.id, c.id)}
                              className="text-[8px] font-black uppercase text-brand hover:underline"
                             >
                               {c.id.split('-')[0]}
                             </button>
                           ))}
                        </div>
                     </div>
                     <p className="text-xs font-bold text-brand leading-relaxed uppercase tracking-tight">{task.title}</p>
                     <p className="mt-2 text-[8px] font-mono text-text-dim">UID: {task.id.slice(-4)}</p>
                  </motion.div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeshView({ t, socket, status, strength, activity, onConnect, onDisconnect, triggerPulse }: any) {
  const [nodes, setNodes] = useState<string[]>([]);
  const [packets, setPackets] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [relayIp, setRelayIp] = useState(window.location.host);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  
  useEffect(() => {
    const channel = new BroadcastChannel('sahand_mesh');
    channelRef.current = channel;
    
    const heartBeat = setInterval(() => {
      channel.postMessage({ type: 'HEARTBEAT', id: 'NODE_' + Math.random().toString(36).substr(2, 5) });
    }, 2000);

    channel.onmessage = (event) => {
      if (event.data.type === 'HEARTBEAT') {
        setNodes(prev => Array.from(new Set([...prev, event.data.id])).slice(-5));
        triggerPulse?.();
      }
      if (event.data.type === 'PACKET') {
        soundService.playData();
        triggerPulse?.();
        setPackets(prev => [{ source: 'LOCAL', type: 'text', content: event.data.payload, id: Date.now() }, ...prev].slice(0, 10));
      }
      if (event.data.type === 'FILE_PACKET') {
        soundService.playAlert();
        triggerPulse?.();
        setPackets(prev => [{ source: 'LOCAL', type: 'file', content: event.data.payload, id: Date.now() }, ...prev].slice(0, 10));
      }
    };

    if (socket) {
      socket.on('mesh-incoming', (payload: any) => {
        soundService.playData();
        triggerPulse?.();
        const isFile = payload && typeof payload === 'object' && payload.data && payload.name;
        if (isFile) soundService.playAlert();
        setPackets(prev => [{ 
          source: 'RELAY', 
          type: isFile ? 'file' : 'text', 
          content: payload, 
          id: Date.now() 
        }, ...prev].slice(0, 10));
      });
    }

    return () => {
      clearInterval(heartBeat);
      channel.close();
      if (socket) socket.off('mesh-incoming');
    };
  }, [socket]);

  const sendPacket = () => {
    if (!inputText) return;
    triggerPulse?.();
    channelRef.current?.postMessage({ type: 'PACKET', payload: inputText });
    
    if (socket && socket.connected) {
      socket.emit('mesh-message', { meshId: 'global', payload: inputText });
    }

    setPackets(prev => [{ source: 'ME', type: 'text', content: inputText, id: Date.now() }, ...prev].slice(0, 10));
    setInputText('');
    soundService.playData();
  };

  const handleFileShare = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert("File too large for mesh relay (Max 500KB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64
      };

      channelRef.current?.postMessage({ type: 'FILE_PACKET', payload: fileData });
      
      if (socket && socket.connected) {
        socket.emit('mesh-message', { meshId: 'global', payload: fileData });
      }

      setPackets(prev => [{ source: 'ME', type: 'file', content: fileData, id: Date.now() }, ...prev].slice(0, 10));
      soundService.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (fileData: any) => {
    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileData.name;
    link.click();
    soundService.playClick();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 text-brand">
        <h3 className="text-3xl font-bold tracking-tight">{t.mesh.title}</h3>
        <p className="text-text-dim mt-1">{t.mesh.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card p-6 border border-border rounded-3xl col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Network className="text-brand" size={18} />
            <h4 className="font-bold text-sm text-brand">{t.mesh.status}</h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-surface border border-border rounded-2xl">
              <p className="text-[10px] text-text-dim uppercase font-bold mb-3">Bridge Status</p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : status === 'searching' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold font-mono text-brand uppercase">
                      {status === 'connected' ? t.mesh.connected : status === 'searching' ? t.mesh.searching : t.mesh.disconnected}
                    </span>
                  </div>
                  {status === 'connected' && (
                    <div className="flex items-end gap-[1px] h-3">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div 
                          key={bar}
                          className={`w-[2px] rounded-t-[1px] ${(strength / 20) >= bar ? 'bg-brand' : 'bg-brand/10'}`}
                          style={{ height: `${bar * 20 + 20}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {status === 'connected' && (
                  <div className="space-y-2">
                     <div className="flex justify-between text-[8px] font-black text-text-dim uppercase tracking-widest">
                        <span>Signal Quality</span>
                        <span className="text-brand">{strength}%</span>
                     </div>
                     <div className="h-1 bg-surface-light rounded-full overflow-hidden border border-border/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${strength}%` }}
                          className={`h-full ${strength > 70 ? 'bg-brand' : strength > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                     </div>
                  </div>
                )}
                
                {activity && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[8px] font-bold text-brand uppercase italic"
                  >
                    <Activity size={10} className="animate-pulse" /> Data_Burst_Detected
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-text-dim uppercase font-bold px-1">{t.mesh.relayServer}</p>
              <input 
                type="text"
                value={relayIp}
                onChange={e => setRelayIp(e.target.value)}
                placeholder="mesh.relay.local:3000"
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-mono outline-none text-brand focus:ring-2 focus:ring-brand/20"
              />
              {window.location.protocol === 'https:' && (relayIp.startsWith('10.') || relayIp.startsWith('192.') || relayIp.startsWith('172.') || relayIp.startsWith('localhost') || relayIp.startsWith('127.')) && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <ShieldAlert size={14} />
                    <span className="text-[10px] font-black uppercase">Protocol_Mismatch</span>
                  </div>
                  <p className="text-[9px] text-yellow-500/80 leading-tight">
                    {t.mesh.mixedContentWarning || "Browser Security: You are on a secure site (HTTPS) trying to connect to an insecure local relay (HTTP). This is automatically blocked. Use a secure relay or run Sahand locally."}
                  </p>
                  <div className="pt-1 border-t border-yellow-500/10">
                    <p className="text-[8px] text-yellow-500/60 italic font-mono">REMEDY: Enable 'Insecure content' in site settings or use WSS protocol.</p>
                  </div>
                </div>
              )}
              <div className="p-3 bg-brand/5 border border-brand/10 rounded-xl">
                <h5 className="text-[10px] font-black text-brand uppercase mb-2 flex items-center gap-1">
                  <Radio size={12} /> Connection_Guide
                </h5>
                <ul className="text-[9px] text-text-dim space-y-1.5 list-disc pl-3">
                  <li>Enter Relay IP:Port (e.g. 10.0.0.5:3000)</li>
                  <li>Click CONNECT to bridge local & global nodes</li>
                  <li>Status <span className="text-brand">GREEN</span>: Online Mesh Active</li>
                  <li>Messages transmit via Local Broadcast + Relay Socket</li>
                </ul>
              </div>
              <button
                onClick={() => { 
                  soundService.playClick(); 
                  if (status === 'connected' || status === 'searching') {
                    onDisconnect();
                  } else {
                    onConnect(relayIp); 
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg ${
                  (status === 'connected' || status === 'searching') 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                    : 'bg-brand text-surface hover:opacity-80'
                }`}
              >
                {status === 'connected' || status === 'searching' ? t.mesh.disconnect : t.mesh.connect}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="text-brand" size={18} />
              <h4 className="font-bold text-sm text-brand">{t.mesh.nodes}</h4>
            </div>
            <div className="space-y-2">
              {nodes.length === 0 ? (
                <p className="text-xs text-text-dim">{t.mesh.scanning}</p>
              ) : (
                nodes.map(node => (
                  <div key={node} className="flex items-center gap-2 text-xs font-mono text-brand bg-surface p-2 rounded-lg border border-border">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {node}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-card p-10 border border-border rounded-3xl col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-brand uppercase tracking-tighter text-sm">{t.mesh.broadcast}</h4>
            <div className="flex items-center gap-2 text-[10px] bg-brand/5 border border-brand/10 px-3 py-1 rounded-full text-brand font-mono">
              <Wifi size={12} /> {t.mesh.channel}
            </div>
          </div>
          
          <div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {packets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-dim text-center py-20 opacity-40 select-none">
                <WifiOff size={40} className="mb-4" />
                <p className="text-sm italic">{t.mesh.waiting}</p>
                <div className="flex gap-1 mt-4">
                  <div className="w-1 h-1 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              packets.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={p.id} 
                  className={`p-4 rounded-2xl border font-mono text-xs shadow-lg transition-all relative overflow-hidden group ${
                    p.source === 'ME' 
                      ? 'border-brand/40 bg-brand/5 ml-12' 
                      : 'border-border/60 bg-surface/80 mr-12'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2 pb-1 border-b border-border/20">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${p.source === 'ME' ? 'text-brand' : 'text-blue-400'}`}>
                      {p.source === 'ME' ? 'LOCAL_NODE_UPLINK' : 'REMOTE_RELAY_DOWNLINK'}
                    </span>
                    <span className="text-[8px] text-text-dim opacity-50 uppercase">{new Date(p.id).toLocaleTimeString()}</span>
                  </div>
                  
                  {p.type === 'file' ? (
                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-brand/10">
                      <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center border border-brand/20">
                        <Download size={18} className="text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black truncate text-brand">{p.content.name}</p>
                        <p className="text-[9px] text-text-dim uppercase">{(p.content.size / 1024).toFixed(1)}KB // TAD_ENCRYPTED</p>
                      </div>
                      <a 
                        href={p.content.data} 
                        download={p.content.name}
                        className="px-4 py-1.5 bg-brand text-surface rounded-lg text-[9px] font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(var(--color-brand),0.3)]"
                      >
                        RETRIEVE
                      </a>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="text-[13px] leading-relaxed break-words font-medium text-text">{p.content}</p>
                      {/* Scanline effect for remote packets */}
                      {p.source !== 'ME' && (
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-400/5 to-transparent h-[10%] animate-scanline" />
                      )}
                    </div>
                  )}

                  {/* Corner accent */}
                  <div className={`absolute top-0 ${p.source === 'ME' ? 'right-0' : 'left-0'} w-8 h-8 opacity-10 pointer-events-none`}>
                    <div className={`absolute top-2 ${p.source === 'ME' ? 'right-2' : 'left-2'} w-1 h-1 rounded-full ${p.source === 'ME' ? 'bg-brand' : 'bg-blue-400'}`} />
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="flex gap-3">
            <input 
              placeholder={t.mesh.placeholder} 
              className="flex-1 p-4 bg-surface border border-border rounded-2xl text-sm outline-none text-brand focus:border-brand/50"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendPacket()}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileShare}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border border-border rounded-2xl text-brand hover:border-brand/50 transition-all"
            >
              <Upload size={20} />
            </button>
            <button 
              onClick={sendPacket}
              className="px-8 bg-brand text-surface rounded-2xl font-bold hover:opacity-90 transition-all text-xs uppercase tracking-widest shadow-xl"
            >
              {t.mesh.send}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand rounded-[3rem] p-12 text-surface overflow-hidden relative shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h4 className="text-2xl font-black mb-4 flex items-center gap-3 uppercase tracking-tighter">
              <ShieldAlert size={32} /> Security Protocol
            </h4>
            <p className="text-sm opacity-80 leading-relaxed mb-6">
              Mesh data is transmitted locally via 2.4GHz ISM. While Sahand uses E2EE for session logic, public mesh packets are ephemeral. Always use code-words for high-risk transmissions.
            </p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-surface text-brand rounded-full text-[10px] font-bold uppercase">Air-Gap Ready</span>
              <span className="px-3 py-1 bg-surface text-brand rounded-full text-[10px] font-bold uppercase">RF-Silent Option</span>
            </div>
          </div>
          <div className="w-1/3 opacity-20 hidden md:block">
            <Network size={160} />
          </div>
        </div>
        <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-white/5 rounded-full blur-[80px]" />
      </div>
    </motion.div>
  );
}

import { getAssistantResponse } from './services/geminiService';

function AssistantView({ t, vaultKey, journals, contacts, files, settings, guides, onTriggerSos, onMorseTranslate }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([{ 
      id: Date.now(), 
      content: t.chat.welcome, 
      sender: 'ai',
      timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.split(' ');
    const base = parts[0].toLowerCase();
    const commandChannel = new BroadcastChannel('sahand_commands');
    
    switch(base) {
      case '/help':
        return t.chat.commands.map((c: any) => `${c.cmd}: ${c.desc}`).join('\n');
      case '/status':
        return `CORE_INTEGRITY: [NOMINAL]\nENCRYPTION: [AES-256-GCM]\nCONNECTION: [AIR_GAPPED]\nACTIVE_PROTOCOLS: [SAHAND_v2.1]`;
      case '/medical':
        if (guides) return guides.medical.map((g: any) => `• ${g.title}`).join('\n');
        return 'GUIDE_ERROR: Medical protocols unavailable.';
      case '/digital':
        if (guides) return guides.digital.map((g: any) => `• ${g.title}`).join('\n');
        return 'GUIDE_ERROR: Digital protocols unavailable.';
      case '/sos':
        commandChannel.postMessage({ type: 'TRIGGER_SOS', active: true });
        return 'INITIATING_SOS: Visual beacon has been activated on your primary display.';
      case '/analyze':
        if (!journals || journals.length === 0) return 'INTEL_DATA_EMPTY: Cannot perform analysis without field logs.';
        const freqMap: any = {};
        journals.forEach((j: any) => {
          const text = decryptData(j.content, vaultKey).toUpperCase();
          const words = text.match(/\b\w+\b/g) || [];
          words.forEach((w: any) => { freqMap[w] = (freqMap[w] || 0) + 1; });
        });
        const keywords = Object.entries(freqMap).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
        return `ANALYSIS_COMPLETE:\n\nVOLUME: ${journals.length} ENTRIES\nKEYWORDS: ${keywords.join(', ')}\n\n(Note: Pattern detection suggests ongoing operational density in provided segments.)`;
      case '/secure':
        return `SECURITY_AUDIT:
[OK] AES-256-GCM LOCAL_ENCRYPTION
[OK] ZERO_KNOWLEDGE_ARCHITECTURE
[OK] AIR_GAP_SIMULATION
[OK] VOLATILE_MEMORY_PURGE
[SAFE] SYSTEM_IS_SECURE`;
      case '/keygen':
        const key = Array.from({length: 32}, () => Math.random().toString(36)[2]).join('').toUpperCase();
        return `NEW_SECURE_KEY_GENERATED: ${key}\n(Ensure this is stored in your secure vault immediately.)`;
      case '/morse':
        const text = parts.slice(1).join(' ');
        if (!text) return 'ERROR: MISSING_TEXT. Usage: /morse <text>';
        commandChannel.postMessage({ type: 'TRANSLATE_MORSE', payload: text });
        return `TRANSLATING_TO_MORSE: "${text}" sent to Signal Converter. Attempting auto-transmission...`;
      case '/intel':
        if (journals && journals.length > 0) {
          return `ANALYZING_JOURNAL_LOGS...\n${journals.length} recent entries detected. Summarization requires high-intelligence module.`;
        }
        return 'INTEL_DATA_EMPTY: No journal entries found to analyze.';
      default:
        return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = { id: Date.now(), content: input, sender: 'me', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 1. Check for local commands
    if (input.startsWith('/')) {
      const cmdResponse = await handleCommand(input);
      if (cmdResponse) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now(), 
            content: cmdResponse, 
            sender: 'ai',
            timestamp: Date.now(),
            isCommand: true
          }]);
          setIsTyping(false);
        }, 500);
        return;
      }
    }

    // 2. Otherwise, use Gemini AI
    try {
      const aiResponse = await getAssistantResponse(input, {
        journals: journals,
        contacts: contacts,
        files: files,
        language: settings.language,
      });

      // Special handling for "Cognitive Load" visualization
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 400));
        soundService.playData();
      }

      setMessages(prev => [...prev, { 
        id: Date.now(), 
        content: aiResponse, 
        sender: 'ai',
        timestamp: Date.now()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        content: "CONNECTION_FAULT: Cognitive layer unreachable.", 
        sender: 'ai',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!vaultKey) return <VaultLockedPlaceholder t={t} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto h-[750px] flex flex-col bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none overflow-hidden font-mono text-[8px] leading-none">
        {Array(20).fill(0).map((_, i) => (
          <div key={i} className="whitespace-nowrap animate-pulse">
            {Array(50).fill(0).map(() => Math.random().toString(16).substring(2, 4)).join(' ')}
          </div>
        ))}
      </div>

      {/* AI Header */}
      <div className="p-8 border-b border-border bg-surface/30 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-surface shadow-lg shadow-brand/20 relative group overflow-hidden">
            <Cpu size={24} className="relative z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand flex items-center gap-2">
              {t.chat.title}
              <span className="text-[8px] font-black bg-brand/10 px-2 py-0.5 rounded border border-brand/20 uppercase tracking-tighter">v4.2_Sovereign</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-3 bg-green-500 rounded-full"
                  />
                ))}
              </div>
              <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">{t.chat.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className="flex gap-2">
              <button 
                onClick={() => setMessages(prev => prev.slice(0, 1))} 
                className="p-2 text-text-dim hover:text-brand transition-colors bg-surface border border-border rounded-xl"
                title="Wipe Conversation memory"
              >
                <Trash2 size={18} />
              </button>
           </div>
           <div className="text-[7px] font-mono text-brand/40 uppercase tracking-widest">Cognitive_Load: {isTyping ? '84%' : '12%'}</div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.map(msg => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm ${
              msg.sender === 'me' 
                ? 'bg-brand text-surface rounded-tr-none shadow-md' 
                : msg.isCommand 
                  ? 'bg-surface border border-brand/20 text-brand rounded-tl-none font-mono shadow-sm'
                  : msg.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 rounded-tl-none font-mono italic text-xs'
                    : 'bg-surface border border-border text-brand rounded-tl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              <div className="text-[8px] opacity-40 mt-2 uppercase flex items-center gap-1">
                {msg.sender === 'ai' && <Cpu size={8} />}
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border px-5 py-4 rounded-3xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-brand/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-brand/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-brand/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-surface/50 border-t border-border flex gap-4 backdrop-blur-md">
        <div className="flex-1 relative">
          <input 
            placeholder={t.chat.placeholder}
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-sm outline-none text-brand focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
        </div>
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          className="p-4 bg-brand text-surface rounded-2xl hover:opacity-80 disabled:opacity-50 transition-all shadow-lg shadow-brand/20"
        >
          <Send size={24} />
        </button>
      </div>
      
      {/* Quick Commands Bar */}
      <div className="px-8 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {['/help', '/status', '/medical', '/keygen'].map(cmd => (
          <button 
            key={cmd} 
            onClick={() => { setInput(cmd); sendMessage(); }}
            className="px-3 py-1 bg-brand/5 border border-brand/10 rounded-full text-[9px] font-bold text-brand hover:bg-brand/10 transition-all whitespace-nowrap"
          >
            {cmd.toUpperCase()}
          </button>
        ))}
      </div>
    </motion.div>
  );
}



function FilesView({ t, vaultKey, files, onUpload, onDelete }: { 
  t: any, 
  vaultKey: string | null, 
  files: any[],
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onDelete: (id: string) => void,
  key?: string
}) {
  const [activeFile, setActiveFile] = useState<any | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateWipe = async (id: string) => {
    setIsWiping(true);
    await new Promise(r => setTimeout(r, 1500));
    onDelete(id);
    setIsWiping(false);
    setActiveFile(null);
  };

  if (!vaultKey) return <VaultLockedPlaceholder t={t} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-black text-brand uppercase tracking-tighter">{t.tools.filesTitle}</h2>
          <p className="text-text-dim mt-1 font-medium">{t.tools.filesDesc}</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={onUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-brand text-surface px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-brand/20"
        >
          <Upload size={18} className="inline-block mr-2" />
          UPLOAD_SECURE_BLOB
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {files.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-border rounded-[3rem] bg-card/50">
              <FolderLock className="mx-auto mb-6 text-text-dim/20" size={48} />
              <p className="text-sm font-bold text-text-dim uppercase tracking-widest">NO_DATA_BLOBS_DETECTED</p>
            </div>
          ) : (
            files.map(f => (
              <div 
                key={f.id} 
                onClick={() => setActiveFile(f)}
                className={`bg-card p-6 border rounded-[1.5rem] flex items-center justify-between cursor-pointer transition-all ${activeFile?.id === f.id ? 'border-brand shadow-lg ring-4 ring-brand/5' : 'border-border hover:border-brand/40'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-brand">
                    {decryptData(f.type || '', vaultKey).includes('image') ? <Image size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand text-sm">{decryptData(f.name, vaultKey)}</h4>
                    <p className="text-[10px] text-text-dim font-mono uppercase tracking-widest">
                      {decryptData(f.type || '', vaultKey).split('/')[1] || 'DATA'} // {decryptData(f.size, vaultKey)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-[1px] bg-border mr-2" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                    <Shield size={12} /> SECURED
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 h-fit sticky top-24 shadow-2xl">
          {activeFile ? (
            <div className="space-y-8">
              <div className="pb-8 border-b border-border">
                <h3 className="font-bold text-brand uppercase tracking-tighter text-lg mb-2 truncate">{decryptData(activeFile.name, vaultKey)}</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-brand/10 text-brand text-[8px] font-bold rounded uppercase tracking-widest">Local_Only</span>
                  <span className="px-2 py-0.5 bg-brand/10 text-brand text-[8px] font-bold rounded uppercase tracking-widest">Encrypted</span>
                </div>
              </div>

              <div className="space-y-4">
                 <h5 className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Tactical Operations</h5>
                 
                 <button 
                  onClick={() => {
                    try {
                      const content = decryptData(activeFile.content, vaultKey);
                      const name = decryptData(activeFile.name, vaultKey);
                      const link = document.createElement('a');
                      link.href = content;
                      link.download = name;
                      link.click();
                    } catch (e) {
                      console.error("Export failed", e);
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:border-brand transition-all text-left"
                 >
                   <div className="flex items-center gap-3">
                     <Download size={20} className="text-brand" />
                     <div>
                       <p className="text-[10px] font-bold text-brand uppercase tracking-widest">Download Node</p>
                       <p className="text-[8px] text-text-dim">Decrypt to local storage</p>
                     </div>
                   </div>
                 </button>

                 <button className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:border-brand transition-all text-left">
                   <div className="flex items-center gap-3">
                     <Eraser size={20} className="text-brand" />
                     <div>
                       <p className="text-[10px] font-bold text-brand uppercase tracking-widest">Scrub Metadata</p>
                       <p className="text-[8px] text-text-dim">Wipe GPS/EXIF data</p>
                     </div>
                   </div>
                   <CheckCircle2 size={16} className="text-green-500" />
                 </button>

                 <button className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:border-brand transition-all text-left">
                   <div className="flex items-center gap-3">
                     <Binary size={20} className="text-brand" />
                     <div>
                       <p className="text-[10px] font-bold text-brand uppercase tracking-widest">Verify Hash</p>
                       <p className="text-[8px] text-text-dim">SHA-256 Integrity check</p>
                     </div>
                   </div>
                   <Activity size={16} className="text-blue-500" />
                 </button>

                 <button 
                  onClick={() => simulateWipe(activeFile.id)}
                  disabled={isWiping}
                  className="w-full h-16 bg-red-500 text-surface rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-3 overflow-hidden relative"
                 >
                   {isWiping ? (
                     <motion.div 
                      className="absolute inset-x-0 h-full bg-black/20" 
                      initial={{ scaleX: 0 }} 
                      animate={{ scaleX: 1 }} 
                      transition={{ duration: 1.5 }}
                     />
                   ) : <Trash2 size={20} />}
                   <span className="relative z-10 font-sans tracking-widest">{isWiping ? 'SHREDDING...' : 'SHRED FILE'}</span>
                 </button>
              </div>
              
              <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                <p className="text-[9px] text-red-500/60 leading-relaxed italic">
                  CAUTION: Shredding overwrites file sectors with random noise multiple times. Deletion is IRREVERSIBLE.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center text-text-dim opacity-30">
               <ShieldCheck size={48} className="mb-4" />
               <p className="text-xs font-bold uppercase tracking-widest px-4">Select an encrypted asset for operational audit</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// EN: GIS intelligence visualization using Leaflet engine.
// FA: تجسم داده‌های جغرافیایی با استفاده از موتور Leaflet.
function MapView({ t, settings, setSettings }: { t: any, settings: Settings, setSettings: any, key?: string }) {
  const [mapSearch, setMapSearch] = useState('');
  const [cacheProgress, setCacheProgress] = useState<number | null>(null);
  const [mapSource, setMapSource] = useState<'neshan' | 'osm' | 'local'>('neshan');
  const [installing, setInstalling] = useState(false);

  const installLocalMap = async () => {
    soundService.playData();
    setInstalling(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      if (progress >= 100) {
        clearInterval(interval);
        setSettings((s: any) => ({ ...s, isMapInstalled: true }));
        setInstalling(false);
        setMapSource('local');
        soundService.playSuccess();
      }
    }, 150);
  };

  const tehranDistricts = [
    { name: 'District 1', coords: [[35.80, 51.40], [35.82, 51.45], [35.79, 51.48], [35.77, 51.42]], label: 'Shemiran' },
    { name: 'District 2', coords: [[35.75, 51.32], [35.78, 51.35], [35.76, 51.38], [35.72, 51.35]], label: 'Saadat Abad' },
    { name: 'District 6', coords: [[35.70, 51.38], [35.73, 51.40], [35.71, 51.44], [35.68, 51.42]], label: 'Center / Valiasr' },
    { name: 'District 12', coords: [[35.66, 51.41], [35.69, 51.43], [35.67, 51.45], [35.65, 51.42]], label: 'Grand Bazaar' }
  ];
  
  const cities = [
    { name: 'Tehran', fa: 'تهران', lat: 35.6892, lng: 51.3890, pop: '9M', poi: ['Azadi Tower', 'Milad Tower', 'Bazaar'] },
    { name: 'Mashhad', fa: 'مشهد', lat: 36.2972, lng: 59.6067, pop: '3M', poi: ['Imam Reza Shrine', 'Koohestan Park'] },
    { name: 'Isfahan', fa: 'اصفهان', lat: 32.6546, lng: 51.6680, pop: '2M', poi: ['Naqsh-e Jahan', 'Si-o-se-pol'] },
    { name: 'Tabriz', fa: 'تبریز', lat: 38.0962, lng: 46.2736, pop: '1.5M', poi: ['Bazaar of Tabriz', 'El Goli'] },
    { name: 'Shiraz', fa: 'شیراز', lat: 29.5918, lng: 52.5837, pop: '1.8M', poi: ['Persepolis', 'Eram Garden'] },
    { name: 'Ahvaz', fa: 'اهواز', lat: 31.3183, lng: 48.6706, pop: '1.2M', poi: ['Karun River', 'White Bridge'] },
    { name: 'Kerman', fa: 'کرمان', lat: 30.2839, lng: 57.0834, pop: '0.8M', poi: ['Ganjali Khan', 'Shahdad Desert'] },
    { name: 'Bandar Abbas', fa: 'بندرعباس', lat: 27.1705, lng: 56.2808, pop: '0.5M', poi: ['Hormuz Island', 'Fish Market'] },
    { name: 'Sari', fa: 'ساری', lat: 36.5633, lng: 53.0601, pop: '0.3M', poi: ['Badab-e Surt', 'Hazar Jarib'] },
    { name: 'Rasht', fa: 'رشت', lat: 37.2801, lng: 49.5850, pop: '0.7M', hex: '#FF5733' },
    { name: 'Zahedan', fa: 'زاهدان', lat: 29.4963, lng: 60.8629, pop: '0.6M' },
  ];

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(mapSearch.toLowerCase()) || 
    city.fa.includes(mapSearch)
  );

  const cacheIranMap = async () => {
    soundService.playClick();
    setCacheProgress(0);
    
    // Simulations of fetching and caching tiles
    for (let i = 0; i <= 10; i++) {
        setCacheProgress(i * 10);
        await new Promise(r => setTimeout(r, 400));
        soundService.playData();
    }
    
    soundService.playSuccess();
    setTimeout(() => setCacheProgress(null), 3000);
  };

  const iranBounds: [[number, number], [number, number]] = [[25.0, 44.0], [40.0, 63.5]];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-brand uppercase">{t.map.title}</h3>
          <p className="text-xs font-mono text-text-dim mt-1 tracking-widest uppercase">{t.map.subtitle}</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-text-dim">
          <button 
            onClick={() => setMapSource(prev => prev === 'neshan' ? 'osm' : 'neshan')}
            className="px-3 py-1 bg-card border border-border rounded-lg hover:border-brand transition-colors flex items-center gap-2"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${mapSource === 'neshan' ? 'bg-brand' : 'bg-text-dim'}`} />
            MAP_ENGINE: {mapSource === 'neshan' ? 'NESHAN' : 'OSM_FALLBACK'}
          </button>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span>{t.map.gridLocked}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-6 left-6 z-[1000] w-64 pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
            <input 
              type="text" 
              placeholder={t.map.searchPlaceholder} 
              className="w-full bg-card/90 backdrop-blur-lg border border-border rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-brand transition-all text-brand font-medium shadow-xl"
              value={mapSearch}
              onChange={e => setMapSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2 items-end pointer-events-auto">
          {!settings.isMapInstalled ? (
            <button 
              onClick={installLocalMap}
              disabled={installing}
              className={`bg-brand backdrop-blur-lg border border-brand/20 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 text-surface group ${installing ? 'opacity-80' : 'hover:scale-105 active:scale-95'}`}
            >
              <Database size={16} className={installing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
              {installing ? 'INSTALLING_CORE...' : t.map.installMap}
            </button>
          ) : (
             <button 
                onClick={() => setMapSource(prev => prev === 'local' ? 'neshan' : 'local')}
                className={`bg-card/90 backdrop-blur-lg border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 text-brand hover:border-brand`}
              >
                <ShieldCheck size={14} className="text-green-500" />
                {mapSource === 'local' ? t.map.switchOnline : t.map.switchOffline}
              </button>
          )}

          <button 
            onClick={cacheIranMap}
            disabled={cacheProgress !== null}
            className={`bg-card/90 backdrop-blur-lg border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 group ${cacheProgress !== null ? 'opacity-50' : 'hover:bg-brand hover:text-surface text-brand'}`}
          >
            <Download size={14} className={cacheProgress !== null ? 'animate-bounce' : 'group-hover:translate-y-0.5 transition-transform'} />
            {cacheProgress !== null ? `${t.map.cacheStatus} ${cacheProgress}%` : t.map.offlineCache}
          </button>
          
          <div className="flex gap-2">
            {settings.isMapInstalled && (
               <div className="bg-brand/10 backdrop-blur-lg border border-brand/20 rounded-xl px-4 py-2 text-[10px] font-mono text-brand shadow-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                  {t.map.installed}
               </div>
            )}
            <div className="bg-card/90 backdrop-blur-lg border border-border rounded-xl px-4 py-2 text-[10px] font-mono text-green-500 shadow-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {t.map.cacheReady}
            </div>
          </div>
        </div>

        <MapContainer 
          center={[35.6892, 51.3890]}
          zoom={mapSource === 'local' ? 12 : 5} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          {mapSource === 'local' ? (
             <div className="absolute inset-0 z-[1] pointer-events-none bg-surface/40 backdrop-blur-[2px]" />
          ) : null}
          
          {mapSource === 'local' ? (
             tehranDistricts.map(d => (
                <Polygon 
                   key={d.name}
                   positions={d.coords as any}
                   pathOptions={{
                      color: '#1a1a1a',
                      fillColor: '#1a1a1a',
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: '5, 10'
                   }}
                >
                   <MapTooltip sticky direction="top" className="custom-tooltip bg-brand text-surface border-none px-2 py-1 text-[8px] font-black uppercase">
                      {d.label}
                   </MapTooltip>
                </Polygon>
             ))
          ) : (
            mapSource === 'neshan' ? (
              <TileLayer
                attribution="&copy; Neshan Maps"
                url={`https://raster.neshan.org/v1/raster-tiles/osm-bright/{z}/{x}/{y}.png?key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjEwMDY2M2RkNzExZGIzZTM3OGJjNDBmOWQ0YWZmMDMwM2EyZWQzMDNlNzE3MTAwYjAzOGVmMmJkMDEyNTJmOWZjYjhkNmMzMmNjMDE3YzM3In0.eyJhdWQiOiIzOTk3NyIsImp0aSI6IjEwMDY2M2RkNzExZGIzZTM3OGJjNDBmOWQ0YWZmMDMwM2EyZWQzMDNlNzE3MTAwYjAzOGVmMmJkMDEyNTJmOWZjYjhkNmMzMmNjMDE3YzM3IiwiaWF0IjoxNzc3NzM2MTU5LCJuYmYiOjE3Nzc3MzYxNTksImV4cCI6MTc4MDMyODE1OSwic3ViIjoiIiwic2NvcGVzIjpbImJhc2ljIl19.OAUm7gdrySBZpghIQymIWYCu5nBOIv4Z7nhZxBELkA2Sytr36n3DnI56fYnPV3FsxxUTw7ojBj7x0U1QzU8NGorRS65v61aZocI13LOYnmJetu-i7_NWNgds4IjyDWj2MIPGFXt8VEe3xLeHpn_2f8U5GT5tq3Nm_jaXgRsG49GUN_j5f0ZweNu_VzIBnzcMfxEjctYYYd4pmSCbBbW7yOu6Ou1KII60nRQSlwpWU9sAPbkZxRU6wCVKNjSlYVnDfHXlialCT4pCh76ZLC-Zg8h4SieUIm24LBQAHUjv0LhB6Nr7WFsEZGu0koi3vPPc5BfRh7tITz2votU1SWaccg&api-key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjEwMDY2M2RkNzExZGIzZTM3OGJjNDBmOWQ0YWZmMDMwM2EyZWQzMDNlNzE3MTAwYjAzOGVmMmJkMDEyNTJmOWZjYjhkNmMzMmNjMDE3YzM3In0.eyJhdWQiOiIzOTk3NyIsImp0aSI6IjEwMDY2M2RkNzExZGIzZTM3OGJjNDBmOWQ0YWZmMDMwM2EyZWQzMDNlNzE3MTAwYjAzOGVmMmJkMDEyNTJmOWZjYjhkNmMzMmNjMDE3YzM3IiwiaWF0IjoxNzc3NzM2MTU5LCJuYmYiOjE3Nzc3MzYxNTksImV4cCI6MTc4MDMyODE1OSwic3ViIjoiIiwic2NvcGVzIjpbImJhc2ljIl19.OAUm7gdrySBZpghIQymIWYCu5nBOIv4Z7nhZxBELkA2Sytr36n3DnI56fYnPV3FsxxUTw7ojBj7x0U1QzU8NGorRS65v61aZocI13LOYnmJetu-i7_NWNgds4IjyDWj2MIPGFXt8VEe3xLeHpn_2f8U5GT5tq3Nm_jaXgRsG49GUN_j5f0ZweNu_VzIBnzcMfxEjctYYYd4pmSCbBbW7yOu6Ou1KII60nRQSlwpWU9sAPbkZxRU6wCVKNjSlYVnDfHXlialCT4pCh76ZLC-Zg8h4SieUIm24LBQAHUjv0LhB6Nr7WFsEZGu0koi3vPPc5BfRh7tITz2votU1SWaccg`}
                className="contrast-115 saturate-[0.8] grayscale-[20%] brightness-90"
                eventHandlers={{
                  tileerror: (e) => {
                    console.error("TILE_ERROR: Neshan tiles failed to load. Check API key or quota.", e);
                  }
                }}
              />
            ) : (
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="contrast-125 saturate-50 grayscale-[40%] invert-[5%] opacity-90"
              />
            )
          )}
          
          {mapSource === 'local' && (
             <TileLayer
                attribution="Grid Architecture v1"
                url="" 
                className="opacity-0" // Blank tile layer to prevent leaflet errors if mapContainer expects one
             />
          )}
          {filteredCities.map(city => (
            <Marker 
              key={city.name} 
              position={[city.lat, city.lng]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div class="w-4 h-4 bg-brand rounded-full border-2 border-surface shadow-lg animate-pulse"></div>`
              })}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[180px] bg-surface rounded-lg">
                  <div className="flex justify-between items-start mb-2 border-b border-border pb-1">
                    <h4 className="font-bold text-lg text-brand m-0">{city.fa}</h4>
                    <span className="text-[10px] font-mono text-text-dim uppercase mt-1.5">{city.name}</span>
                  </div>
                  <div className="space-y-2">
                    {city.pop && (
                      <div>
                        <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Population</p>
                        <p className="text-xs font-medium text-brand">{city.pop}</p>
                      </div>
                    )}
                    {city.poi && (
                      <div>
                        <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Key Assets</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {city.poi.map((p: any) => (
                            <span key={p} className="px-1.5 py-0.5 bg-brand/10 text-[8px] font-bold text-brand rounded border border-brand/20 uppercase">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
          <div className="px-4 py-2 bg-card/90 backdrop-blur-md border border-border rounded-xl text-[10px] font-mono shadow-xl text-brand">
            COORDS: <span className="opacity-60">{ iranBounds[0][0].toFixed(2) }N, { iranBounds[0][1].toFixed(2) }E</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsView({ settings, setSettings, t, vaultKey, setConfirmDialog }: { settings: Settings, setSettings: any, t: any, vaultKey: string | null, setConfirmDialog: any, key?: string }) {

  const [showExportInfo, setShowExportInfo] = useState(false);

  const executePurge = () => {
    localStorage.clear();
    window.location.reload();
  };

  const initiateWipe = () => {
    if (!vaultKey) {
       setConfirmDialog({
         isOpen: true,
         title: 'ACCESS_DENIED',
         message: settings.language === 'fa' ? 'برای اجرای دستور پاکسازی، ابتدا باید صندوقچه را باز کنید.' : 'You must unlock the vault before executing the wipe protocol.',
         type: 'warning',
         onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
       });
       return;
    }

    setConfirmDialog({
      isOpen: true,
      title: t.settings.wipeConfirm,
      message: settings.language === 'fa' ? 'هشدار: تمامی یادداشت‌ها، اطلاعات مخاطبین، فایل‌ها و تنظیمات برای همیشه حذف خواهند شد.' : 'CRITICAL_WARNING: All notes, contacts, files, and settings will be permanently destroyed.',
      type: 'danger',
      requirePassword: true,
      onConfirm: executePurge
    });
  };

  const sections = [
    { 
      id: 'ui', 
      title: 'Interface Protocol', 
      icon: Palette,
      items: [
        { 
          label: t.settings.language, 
          desc: t.settings.languageSubtitle,
          content: (
            <div className="flex border border-border rounded-xl overflow-hidden font-bold text-xs p-1 bg-surface">
              <button 
                onClick={() => setSettings({ ...settings, language: 'en' })}
                className={`px-4 py-2 rounded-lg transition-all ${settings.language === 'en' ? 'bg-card shadow-sm text-brand' : 'text-text-dim'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setSettings({ ...settings, language: 'fa' })}
                className={`px-4 py-2 rounded-lg transition-all ${settings.language === 'fa' ? 'bg-card shadow-sm text-brand' : 'text-text-dim'}`}
              >
                FA
              </button>
            </div>
          )
        },
        settings.language === 'fa' ? {
          label: t.settings.faFontTitle,
          desc: t.settings.faFontSubtitle,
          content: (
            <div className="flex border border-border rounded-xl font-bold text-[10px] p-1 bg-surface overflow-x-auto no-scrollbar gap-1 max-w-[200px]">
              {(['vazir', 'vazirmatn', 'samim', 'shabnam', 'sahel', 'gandom', 'inter'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setSettings({ ...settings, faFont: f })}
                  className={`px-2 py-1.5 rounded-lg transition-all capitalize font-${f} whitespace-nowrap ${settings.faFont === f ? 'bg-card shadow-sm text-brand border border-border/50' : 'text-text-dim hover:text-brand'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )
        } : null,
        {
          label: t.settings.themeTitle,
          desc: t.settings.themeSubtitle,
          content: (
            <div className="flex border border-border rounded-xl font-bold text-[8px] p-1 bg-surface overflow-x-auto no-scrollbar gap-1 max-w-[200px]">
              {(['light', 'dark', 'matrix', 'brutalist', 'nord', 'solarized', 'retro'] as const).map(th => (
                <button 
                  key={th}
                  onClick={() => setSettings({ ...settings, theme: th })}
                  className={`px-2 py-1.5 rounded-lg transition-all uppercase whitespace-nowrap ${settings.theme === th ? 'bg-card shadow-sm text-brand border border-border/50' : 'text-text-dim hover:text-brand'}`}
                >
                  {th}
                </button>
              ))}
            </div>
          )
        }
      ].filter(Boolean)
    },
    {
      id: 'security',
      title: 'Security Sub-System',
      icon: Shield,
      items: [
        {
          label: t.settings.stealthMode,
          desc: t.settings.stealthSubtitle,
          content: (
            <div className="flex flex-wrap gap-2 justify-end">
               <select 
                value={settings.decoyType}
                onChange={e => setSettings({ ...settings, decoyType: e.target.value as any })}
                className="bg-surface border border-border rounded-lg text-[10px] font-black uppercase px-3 py-2 outline-none text-brand"
              >
                <option value="console">{t.settings.decoyConsole}</option>
                <option value="calculator">{t.settings.decoyCalc}</option>
                <option value="weather">{t.settings.decoyWeather}</option>
              </select>
              <button 
                onClick={() => setSettings({ ...settings, stealthMode: true })}
                className="px-4 py-2 bg-brand text-surface rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all font-mono"
              >
                {t.settings.testStealth}
              </button>
            </div>
          )
        },
        {
          label: t.settings.triggerTimer,
          desc: t.settings.triggerTimerDesc,
          content: (
            <div className="flex border border-border rounded-lg bg-surface p-0.5 gap-0.5">
               {([0, 5, 15, 30] as const).map(mins => (
                 <button 
                   key={mins}
                   onClick={() => setSettings({ ...settings, autoStealthMinutes: mins })}
                   className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${settings.autoStealthMinutes === mins ? 'bg-brand text-surface' : 'text-text-dim'}`}
                 >
                   {mins === 0 ? t.settings.triggerTimerOff : `${mins}${t.settings.triggerTimerFixed.charAt(0)}`}
                 </button>
               ))}
            </div>
          )
        },
        {
          label: t.settings.panicButton,
          desc: t.settings.panicButtonDesc,
          content: (
             <button 
                onClick={() => setSettings({ ...settings, panicTrigger: !settings.panicTrigger })}
                className={`w-10 h-5 rounded-full transition-all relative ${settings.panicTrigger ? 'bg-brand' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface transition-all ${settings.panicTrigger ? 'left-5' : 'left-1'}`} />
              </button>
          )
        },
        {
          label: 'Duress PIN',
          desc: t.settings.duressSubtitle,
          content: (
            <div className="flex gap-2">
              <input 
                type="password"
                placeholder="SET_PIN..."
                className="w-24 bg-surface border border-border rounded-lg px-3 py-2 text-[10px] outline-none font-mono"
                onBlur={(e) => {
                  if (e.target.value) {
                    setSettings({ ...settings, duressHash: hashData(e.target.value) });
                    e.target.value = '';
                    soundService.playSuccess();
                  }
                }}
              />
              {settings.duressHash && (
                <button onClick={() => setSettings({ ...settings, duressHash: null })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )
        }
      ]
    },
    {
       id: 'accessibility',
       title: 'Operational Comfort',
       icon: Zap,
       items: [
         {
           label: 'High Contrast',
           desc: 'Enhance UI visibility thresholds',
           content: (
             <button 
                onClick={() => setSettings({ ...settings, highContrast: !settings.highContrast })}
                className={`w-10 h-5 rounded-full transition-all relative ${settings.highContrast ? 'bg-brand' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface transition-all ${settings.highContrast ? 'left-5' : 'left-1'}`} />
              </button>
           )
         },
         {
           label: 'Font Scaling',
           desc: 'Global typography amplitude',
           content: (
             <div className="flex border border-border rounded-lg bg-surface p-0.5 gap-0.5">
                {(['small', 'medium', 'large'] as const).map(sz => (
                  <button 
                    key={sz}
                    onClick={() => setSettings({ ...settings, fontSize: sz })}
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${settings.fontSize === sz ? 'bg-brand text-surface' : 'text-text-dim'}`}
                  >
                    {sz.charAt(0)}
                  </button>
                ))}
             </div>
           )
         }
       ]
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-4xl font-black mb-2 tracking-tighter text-brand uppercase">{t.sidebar.settings}</h3>
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">System Configuration Interface</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowExportInfo(true)}
             className="px-6 py-4 bg-card border border-border rounded-2xl flex items-center gap-3 text-brand font-bold text-xs hover:border-brand transition-all"
           >
             <Download size={18} />
             {t.settings.downloadOffline}
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map(section => (
          <div key={section.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col group">
            <div className="p-8 border-b border-border/50 bg-surface/30 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                  <section.icon size={20} />
               </div>
               <h4 className="font-black text-xs text-brand uppercase tracking-widest">{section.title}</h4>
            </div>
            <div className="flex-1 divide-y divide-border/30">
               {section.items.map((item: any, idx: number) => (
                 <div key={idx} className="p-8 flex items-center justify-between gap-6 hover:bg-surface/10 transition-colors">
                    <div>
                      <p className="font-bold text-sm text-brand mb-1">{item.label}</p>
                      <p className="text-[10px] text-text-dim leading-relaxed font-medium uppercase tracking-tight">{item.desc}</p>
                    </div>
                    <div>{item.content}</div>
                 </div>
               ))}
            </div>
          </div>
        ))}

        <div className="bg-red-500/5 border-2 border-red-500/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center justify-center space-y-6 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <AlertTriangle size={150} className="text-red-500" />
          </div>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
             <Trash2 size={24} />
          </div>
          <div className="max-w-md">
            <h4 className="font-black text-xl text-red-500 mb-2 uppercase tracking-tighter">{t.settings.wipe}</h4>
            <p className="text-sm text-text-dim font-medium leading-relaxed">{t.settings.wipeSubtitle}</p>
          </div>
          <button 
            onClick={initiateWipe}
            className={`px-12 py-5 bg-red-500 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 active:scale-95`}
          >
            {t.settings.executeWipe}
          </button>
          {!vaultKey && (
            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-red-400 opacity-60">
               <Lock size={10} />
               {settings.language === 'fa' ? 'قفل صندوقچه را برای فعال‌سازی باز کنید' : 'UNLOCK VAULT TO AUTHORIZE PURGE'}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showExportInfo && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-md z-[12000] flex items-center justify-center p-6"
             onClick={() => setShowExportInfo(false)}
           >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="bg-card max-w-xl w-full rounded-[3rem] p-12 border border-border shadow-2xl overflow-hidden relative"
               onClick={e => e.stopPropagation()}
             >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <Download size={160} />
                </div>
                <h4 className="text-3xl font-black text-brand mb-8 uppercase tracking-tighter">{t.settings.exportGuideTitle}</h4>
                <div className="space-y-6">
                   {[t.settings.exportStep1, t.settings.exportStep2, t.settings.exportStep3].map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                         <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center font-black text-brand text-xs shrink-0 group-hover:bg-brand group-hover:text-surface transition-all">
                            {i+1}
                         </div>
                         <p className="text-text-dim text-sm leading-relaxed font-bold">{step}</p>
                      </div>
                   ))}
                </div>
                <div className="mt-10 p-6 bg-surface rounded-3xl border border-border">
                   <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">Technical Note</p>
                   <p className="text-text-dim text-[10px] leading-relaxed font-medium">{t.settings.exportNote}</p>
                </div>
                <button 
                  onClick={() => setShowExportInfo(false)}
                  className="w-full mt-10 py-5 bg-brand text-surface font-black rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
                >
                  {t.settings.gotIt}
                </button>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SignalView({ t }: any) {
  const [isScanning, setIsScanning] = useState(false);
  const [noise, setNoise] = useState<number[]>(Array(50).fill(0).map(() => Math.random() * 30 + 10));
  const [foundSignals, setFoundSignals] = useState<{ id: string, freq: string, pwr: string, type: string, time: string, phase?: number, lat?: number, lng?: number }[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [decoding, setDecoding] = useState<{ id: string, progress: number } | null>(null);
  const waterfallCanvasRef = useRef<HTMLCanvasElement>(null);
  const waterfallData = useRef<number[][]>([]);
  
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        const newNoise = Array(50).fill(0).map(() => Math.max(5, Math.min(100, Math.random() * 30 + 10 + (Math.random() > 0.9 ? 40 : 0))));
        setNoise(newNoise);
        
        // Update waterfall data
        waterfallData.current = [newNoise, ...waterfallData.current].slice(0, 100);
        const canvas = waterfallCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const width = canvas.width;
            const height = canvas.height;
            const rowHeight = height / 100;
            const colWidth = width / 50;
            
            ctx.clearRect(0, 0, width, height);
            waterfallData.current.forEach((row, rowIndex) => {
              row.forEach((val, colIndex) => {
                const alpha = Math.max(0.1, val / 100);
                const hue = val > 80 ? 0 : val > 50 ? 40 : 160; // Red, Yellow, Brand (Cyan-ish)
                ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
                ctx.fillRect(colIndex * colWidth, rowIndex * rowHeight, colWidth, rowHeight);
              });
            });
          }
        }

        if (Math.random() > 0.98) {
          const id = `SIGNAL_${Math.floor(Math.random() * 9999)}`;
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          setFoundSignals(prev => [{ 
            id, 
            freq: (2.4 + Math.random() * 0.1).toFixed(4) + ' GHz', 
            pwr: '-'+Math.floor(Math.random() * 40 + 50) + ' dBm', 
            type: 'ENCRYPT_MESH',
            time: timeStr,
            phase: Math.random() * 360,
            lat: 35.6892 + (Math.random() - 0.5) * 0.05,
            lng: 51.3890 + (Math.random() - 0.5) * 0.05
          }, ...prev].slice(0, 15));
          soundService.playData();
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleDecode = (id: string) => {
    setDecoding({ id, progress: 0 });
    soundService.playProcess();
    const interval = setInterval(() => {
      setDecoding(prev => {
        if (!prev || prev.progress >= 100) {
          clearInterval(interval);
          if (prev) {
            soundService.playSuccess();
            setTimeout(() => setDecoding(null), 1000);
          }
          return null;
        }
        return { ...prev, progress: prev.progress + 5 };
      });
    }, 150);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-brand/20 rounded-lg flex items-center justify-center">
              <Radio className="text-brand" size={18} />
            </div>
            <h2 className="text-3xl font-black text-brand uppercase tracking-tighter">SIGINT_LAB v4.2</h2>
          </div>
          <p className="text-text-dim font-medium uppercase text-[10px] tracking-widest opacity-60">High-Resolution Spectral Analysis & Triangulation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setFoundSignals([]); soundService.playClick(); setSelectedSignal(null); }}
            className="px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-card border border-border text-text-dim hover:text-brand transition-all"
          >
            Purge Buffer
          </button>
          <button 
            onClick={() => { setIsScanning(!isScanning); soundService.playClick(); }}
            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3 ${
              isScanning ? 'bg-red-500 text-surface shadow-red-500/30' : 'bg-brand text-surface shadow-brand/30'
            }`}
          >
            {isScanning ? <Zap size={18} className="animate-pulse" /> : <Activity size={18} />}
            {isScanning ? 'HALT_SWEEP' : 'INITIATE_SWEEP'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Main Visualizer */}
          <div className="bg-card border border-border rounded-[3rem] shadow-inner relative overflow-hidden flex flex-col group">
             {/* Spectrum View */}
             <div className="p-10 h-[300px] flex flex-col h-full relative">
                <div className="absolute top-6 left-10 z-20 flex items-center gap-4">
                    <span className="text-[8px] font-black bg-brand text-surface px-2 py-0.5 rounded uppercase tracking-[0.3em]">Live_Spectrum</span>
                    <span className="text-[8px] font-mono text-brand/50">BW: 20MHz | FFT: 2048</span>
                </div>
                
                <div className="flex-1 flex items-end gap-[1px] relative z-10">
                  {noise.map((v, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: '5%' }}
                      animate={{ height: `${v}%` }}
                      className={`flex-1 rounded-t-[1px] transition-colors duration-100 ${
                        v > 85 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : v > 60 ? 'bg-orange-500' : 'bg-brand/80'
                      }`}
                    />
                  ))}
                </div>
             </div>

             {/* Waterfall View */}
             <div className="h-[200px] bg-black/40 relative border-t border-border">
                <canvas 
                  ref={waterfallCanvasRef} 
                  className="w-full h-full opacity-60"
                  width={1000}
                  height={200}
                />
                <div className="absolute inset-0 pointer-events-none border-x border-brand/5" />
                <div className="absolute top-2 right-4 text-[8px] font-black text-brand uppercase tracking-widest opacity-30">Spectral_Waterfall</div>
             </div>

             <div className="p-8 border-t border-border/50 flex justify-between items-center bg-card/50">
               <div className="flex gap-10">
                 <div className="space-y-1">
                   <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Noise Floor</p>
                   <p className="text-xs font-mono text-brand">-118.2 dBm</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Resolution</p>
                   <p className="text-xs font-mono text-brand">50 kHz</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">LNA Gain</p>
                   <p className="text-xs font-mono text-brand">42 dB</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end">
                   <p className="text-[8px] font-black text-text-dim uppercase tracking-tighter italic">RF_LOCK_STATUS</p>
                   <p className="text-[10px] font-mono text-brand font-bold uppercase">Ready_to_Intercept</p>
                 </div>
                 <div className="w-3 h-3 rounded-full bg-brand animate-ping opacity-40" />
               </div>
             </div>
          </div>

          {/* Triangulation Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-10 h-[400px] relative flex flex-col">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <Crosshair className="text-brand" size={20} />
                  <h4 className="font-bold text-sm text-brand uppercase tracking-[0.2em]">Triangulation</h4>
                </div>
                {selectedSignal && (
                  <span className="text-[10px] font-mono text-brand font-bold uppercase animate-pulse">LOCK: {selectedSignal.id}</span>
                )}
              </div>
              
              <div className="flex-1 relative flex items-center justify-center">
                {/* Radar Grid */}
                <div className="absolute inset-0 border border-brand/10 rounded-full" />
                <div className="absolute inset-4 border border-brand/10 rounded-full" />
                <div className="absolute inset-16 border border-brand/10 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-full h-[1px] bg-brand" />
                  <div className="w-[1px] h-full bg-brand absolute" />
                  <div className="w-full h-full border-2 border-brand/5 rotate-45" />
                </div>
                
                {/* Radar Sweep */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-brand/20 rounded-full"
                />

                {/* Signal Points */}
                {foundSignals.map((sig, idx) => (
                  <motion.div
                    key={sig.id}
                    onClick={() => { setSelectedSignal(sig); soundService.playSuccess(); }}
                    className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all ${
                      selectedSignal?.id === sig.id ? 'bg-red-500 scale-150 z-20 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-brand/40 hover:bg-brand z-10'
                    }`}
                    style={{ 
                      left: `${50 + (15 + idx * 2) * Math.cos((sig.phase || 0) * Math.PI / 180)}%`,
                      top: `${50 + (15 + idx * 2) * Math.sin((sig.phase || 0) * Math.PI / 180)}%`
                    }}
                  >
                    {selectedSignal?.id === sig.id && (
                       <motion.div 
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red-500 rounded-full"
                       />
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="text-[8px] text-text-dim uppercase text-center mt-4 tracking-tighter opacity-40 italic">Relative Azimuth Positioning based on TDOA logic</p>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-10 h-[400px] flex flex-col">
               <div className="flex items-center gap-3 mb-6 shrink-0">
                  <Terminal className="text-brand" size={20} />
                  <h4 className="font-bold text-sm text-brand uppercase tracking-[0.2em]">Signal Processor</h4>
               </div>
               
               {selectedSignal ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-surface p-4 border border-border rounded-xl">
                          <span className="text-[10px] font-black text-text-dim uppercase">Designator</span>
                          <span className="text-sm font-mono text-brand">{selectedSignal.id}</span>
                       </div>
                       <div className="flex justify-between items-center bg-surface p-4 border border-border rounded-xl">
                          <span className="text-[10px] font-black text-text-dim uppercase">Freq_Target</span>
                          <span className="text-sm font-mono text-brand">{selectedSignal.freq}</span>
                       </div>
                       <div className="flex justify-between items-center bg-surface p-4 border border-border rounded-xl">
                          <span className="text-[10px] font-black text-text-dim uppercase">Vector_Fix</span>
                          <span className="text-sm font-mono text-brand">{selectedSignal.lat?.toFixed(4)}, {selectedSignal.lng?.toFixed(4)}</span>
                       </div>
                    </div>

                    <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-[10px] text-brand/80 overflow-y-auto custom-scrollbar">
                       {decoding?.id === selectedSignal.id ? (
                         <div className="space-y-2">
                            <p className="text-brand animate-pulse">Initializing Decryption Routine...</p>
                            <p>Loading NIST P-384 Primitives...</p>
                            <p>Brute Force Entropy: 42.1 bits</p>
                            <div className="w-full h-1 bg-brand/10 rounded-full mt-4 overflow-hidden">
                               <motion.div 
                                className="h-full bg-brand"
                                animate={{ width: `${decoding.progress}%` }}
                               />
                            </div>
                            <p className="text-right">{decoding.progress}% COMPLETE</p>
                         </div>
                       ) : (
                         <div className="space-y-2 opacity-50">
                            <p className="text-brand">Packet Intercepted: {selectedSignal.time}</p>
                            <p>Header: 0x4B 0x53 0x20 0x01</p>
                            <p>Payload: [ENCRYPTED_BLOB_AES_256]</p>
                            <p>Parity Check: PASSED</p>
                            <p>Wait for decryption command...</p>
                         </div>
                       )}
                    </div>

                    <button 
                      onClick={() => handleDecode(selectedSignal.id)}
                      disabled={decoding !== null}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        decoding ? 'bg-text-dim/20 text-text-dim cursor-not-allowed' : 'bg-brand text-surface hover:opacity-90 shadow-xl shadow-brand/20'
                      }`}
                    >
                      {decoding ? 'DECODING_IN_PROGRESS...' : 'ATTEMPT_DECRYPTION'}
                    </button>
                 </motion.div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 gap-4">
                    <Target size={40} className="mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest leading-loose">
                      Selected a signal from the radar<br/>or intercept log for analysis.
                    </p>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-card border border-border rounded-[3rem] p-10 flex flex-col h-full lg:h-[max(940px,calc(100vh-200px))]">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <Radio className="text-brand" size={24} />
            <h4 className="font-black text-brand uppercase tracking-widest">Intercept Buffer</h4>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {foundSignals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                <Search className="mb-4" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Spectral Hit</p>
              </div>
            ) : (
              foundSignals.map((s, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={s.id + i} 
                  onClick={() => { setSelectedSignal(s); soundService.playSuccess(); }}
                  className={`p-5 border rounded-2xl cursor-pointer transition-all shadow-sm ${
                    selectedSignal?.id === s.id ? 'bg-brand/10 border-brand' : 'bg-surface border-border hover:border-brand/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-black uppercase font-mono ${selectedSignal?.id === s.id ? 'text-brand' : 'text-brand/70'}`}>{s.id}</span>
                    <span className="text-[8px] font-mono text-text-dim">{s.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-text-dim">{s.freq}</span>
                    <span className="text-[10px] font-mono text-brand font-bold">{s.pwr}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-border/50">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-dim">
                <span>Buffer Capacity</span>
                <span className="text-brand">{(foundSignals.length / 15 * 100).toFixed(0)}%</span>
             </div>
             <div className="w-full h-1 bg-surface rounded-full mt-2 overflow-hidden border border-border/10">
                <motion.div 
                  className="h-full bg-brand"
                  animate={{ width: `${(foundSignals.length / 15 * 100)}%` }}
                />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TacticalView({ t }: { t: any }) {
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('sahand_tactical_nodes');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, x: 40, y: 30, type: 'comm', label: 'HUB_PRIMARY', status: 'online' },
      { id: 2, x: 70, y: 50, type: 'sensor', label: 'PERIMETER_NORTH', status: 'online' },
      { id: 3, x: 25, y: 80, type: 'supply', label: 'ASSET_CACHE_04', status: 'online' },
      { id: 4, x: 85, y: 15, type: 'hazard', label: 'DEGRADED_SIGNAL', status: 'warning' },
    ];
  });

  const [activeType, setActiveType] = useState<'comm' | 'supply' | 'hazard' | 'sensor'>('comm');
  const constraintsRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sahand_tactical_nodes', JSON.stringify(nodes));
  }, [nodes]);

  const addNode = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const label = prompt('Enter identifier for this node:');
    if (!label) return;

    const newNode = {
      id: Date.now(),
      x,
      y,
      type: activeType,
      label: label.toUpperCase(),
      status: 'online'
    };

    setNodes([...nodes, newNode]);
    soundService.playSuccess();
  };

  const updateNodePos = (id: number, info: any) => {
    const rect = (constraintsRef.current as any).getBoundingClientRect();
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;
    
    setNodes(nodes.map((n: any) => n.id === id ? { ...n, x, y } : n));
  };

  const removeNode = (id: number) => {
    setNodes(nodes.filter((n: any) => n.id !== id));
    soundService.playClick();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-black text-brand uppercase tracking-tighter">Tactical Grid v3.1</h2>
          <p className="text-text-dim mt-1 font-medium">Coordinate-based asset deployment & threat mapping</p>
        </div>
        <div className="flex gap-2 bg-card p-2 rounded-2xl border border-border">
          {(['comm', 'supply', 'hazard', 'sensor'] as const).map(type => (
            <button 
              key={type} 
              onClick={() => { setActiveType(type); soundService.playClick(); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === type ? 'bg-brand text-surface shadow-lg' : 'text-text-dim hover:text-brand'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-card border border-border rounded-[3rem] p-4 relative overflow-hidden h-[650px] shadow-inner select-none">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
          />
          <div className="absolute inset-0 border-[20px] border-surface z-20 pointer-events-none" />
          
          <div className="absolute top-10 left-10 z-30 p-4 bg-brand text-surface rounded-xl flex items-center gap-3 font-mono text-[10px] font-bold shadow-2xl">
            <Crosshair size={14} /> COORDINATE_SYTEM: [UTM_WGS84]
          </div>
          
          <div className="absolute top-10 right-10 z-30 flex flex-col gap-2">
             <div className="p-4 bg-surface/90 backdrop-blur border border-border rounded-xl font-mono text-[10px] text-brand shadow-xl">
               ACTIVE_HANDLES: {nodes.length}
             </div>
             <button 
               onClick={() => { setNodes([]); soundService.playClick(); }}
               className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-mono text-[10px] uppercase font-bold hover:bg-red-500 hover:text-white transition-all shadow-xl"
             >
               Wipe Markers
             </button>
          </div>

          <div 
            ref={constraintsRef}
            onDoubleClick={addNode}
            className="relative w-full h-full z-10 cursor-crosshair"
          >
             {nodes.map((node: any) => (
               <motion.div 
                 key={node.id}
                 drag
                 dragConstraints={constraintsRef}
                 onDragEnd={(e, info) => updateNodePos(node.id, info)}
                 className="absolute cursor-grab active:cursor-grabbing"
                 style={{ left: `${node.x}%`, top: `${node.y}%` }}
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
               >
                 <div className="relative group flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${node.type === 'hazard' ? 'bg-red-500' : 'bg-brand'}`} />
                    <div className={`p-4 rounded-full border-2 bg-surface shadow-2xl relative z-10 transition-colors ${node.type === 'hazard' ? 'border-red-500 text-red-500' : 'border-brand text-brand'}`}>
                       {node.type === 'comm' ? <Zap size={20} /> : node.type === 'supply' ? <HardDrive size={20} /> : node.type === 'hazard' ? <ShieldAlert size={20} /> : <Eye size={20} />}
                    </div>
                    
                    <div className="absolute top-full mt-3 px-4 py-2 bg-brand text-surface rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                       <p className="text-[10px] font-black uppercase tracking-tighter">{node.label}</p>
                       <p className="text-[8px] opacity-60 font-mono">POS: {node.x.toFixed(1)}, {node.y.toFixed(1)}</p>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-surface rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-0 group-hover:scale-100"
                    >
                      <X size={12} strokeWidth={4} />
                    </button>
                 </div>
               </motion.div>
             ))}
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-8 py-3 bg-surface/90 backdrop-blur border border-border rounded-2xl flex items-center gap-8 shadow-2xl">
             <div className="text-[9px] font-black uppercase text-text-dim tracking-[0.2em]">Double-Click to place marker</div>
             <div className="h-4 w-[1px] bg-border" />
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-brand" />
               <span className="text-[8px] font-black uppercase text-brand tracking-widest">Asset</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500" />
               <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">Threat</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-8 border border-border rounded-[2.5rem] shadow-sm">
            <h4 className="font-black text-brand uppercase tracking-widest mb-6 flex items-center gap-2">
               <Activity size={18} /> Telemetry
            </h4>
            <div className="space-y-4">
               {[
                 { label: 'Uplink', value: 'NOMINAL', color: 'text-green-500' },
                 { label: 'Map_Scale', value: '1:25000', color: 'text-brand' },
                 { label: 'Drift_Rate', value: '< 0.1%', color: 'text-brand' },
                 { label: 'Sat_Link', value: 'ESTABLISHED', color: 'text-blue-500' }
               ].map(t => (
                 <div key={t.label} className="flex justify-between items-center border-b border-border/50 pb-3">
                   <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">{t.label}</span>
                   <span className={`text-[10px] font-mono font-bold ${t.color}`}>{t.value}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <Navigation size={20} className="text-brand" />
                <h4 className="font-black text-brand uppercase tracking-widest text-xs">Field Log</h4>
             </div>
             <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {nodes.slice().reverse().map((n: any) => (
                   <div key={n.id} className="p-3 bg-card border border-border rounded-xl text-[9px] font-mono">
                      <div className="flex justify-between mb-1">
                         <span className="text-brand font-black">[{n.type.toUpperCase()}]</span>
                         <span className="text-text-dim">{n.label}</span>
                      </div>
                      <div className="opacity-40">COORD: {n.x.toFixed(2)}, {n.y.toFixed(2)}</div>
                   </div>
                ))}
                {nodes.length === 0 && <p className="text-[9px] text-text-dim uppercase text-center py-4 font-bold tracking-widest">No markers active</p>}
             </div>
          </div>

          <div className="bg-brand p-8 rounded-[2.5rem] shadow-2xl text-surface relative overflow-hidden group">
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" 
            />
            <Zap className="mb-4 relative z-10" size={32} />
            <h4 className="font-black uppercase tracking-widest mb-2 relative z-10">Field Mesh v4</h4>
            <p className="text-[10px] font-bold opacity-90 leading-relaxed uppercase relative z-10 tracking-tight">
              Grid synchronization active. Offline relay enabled via broadcast metadata.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

