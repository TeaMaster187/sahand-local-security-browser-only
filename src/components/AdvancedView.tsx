import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundService } from '../services/soundService';
import { 
  ShieldAlert, 
  Wifi, 
  Terminal, 
  Package, 
  MapPin, 
  VolumeX, 
  Archive, 
  Binary, 
  Activity, 
  HeartPulse,
  Lock,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Database,
  Crosshair,
  Gauge,
  Zap,
  Globe,
  Monitor,
  Cpu
} from 'lucide-react';

interface AdvancedViewProps {
  vaultKey: string | null;
  t: any;
}

export function AdvancedView({ vaultKey, t }: AdvancedViewProps) {
  const [activeTab, setActiveTab] = useState('suite');
  
  const features = [
    { id: 'duress', name: t.advanced.tabs.duress, icon: ShieldAlert, desc: t.advanced.tabs.duressDesc },
    { id: 'scanner', name: t.advanced.tabs.scanner, icon: Wifi, desc: t.advanced.tabs.scannerDesc },
    { id: 'terminal', name: t.advanced.tabs.terminal, icon: Terminal, desc: t.advanced.tabs.terminalDesc },
    { id: 'inventory', name: t.advanced.tabs.inventory, icon: Package, desc: t.advanced.tabs.inventoryDesc },
    { id: 'waypoints', name: t.advanced.tabs.waypoints, icon: MapPin, desc: t.advanced.tabs.waypointsDesc },
    { id: 'jammer', name: t.advanced.tabs.jammer, icon: VolumeX, desc: t.advanced.tabs.jammerDesc },
    { id: 'deaddrop', name: t.advanced.tabs.deaddrop, icon: Archive, desc: t.advanced.tabs.deaddropDesc },
    { id: 'cipher', name: t.advanced.tabs.cipher, icon: Binary, desc: t.advanced.tabs.cipherDesc },
    { id: 'matrix', name: t.advanced.tabs.matrix, icon: Activity, desc: t.advanced.tabs.matrixDesc },
    { id: 'med', name: t.advanced.tabs.med, icon: HeartPulse, desc: t.advanced.tabs.medDesc },
    { id: 'satellite', name: t.advanced.tabs.satellite, icon: Globe, desc: t.advanced.tabs.satelliteDesc },
  ];

  if (!vaultKey) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <Lock size={64} className="text-brand/20 mb-6" />
        <h2 className="text-2xl font-black text-brand uppercase tracking-tighter mb-4">{t.advanced.accessDenied}</h2>
        <p className="text-text-dim max-w-md uppercase text-[10px] font-bold tracking-widest leading-relaxed">
          {t.advanced.accessDeniedDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <Zap className="text-brand fill-brand" size={24} />
              <h1 className="text-4xl font-black text-brand uppercase tracking-tighter">{t.advanced.title}</h1>
           </div>
           <p className="text-text-dim uppercase text-[10px] font-black tracking-[0.4em]">{t.advanced.subtitle}</p>
        </div>
        <div className="flex gap-2">
           <div className="px-6 py-3 bg-brand/5 border border-brand/20 rounded-2xl text-[10px] font-black text-brand uppercase tracking-widest">
              {t.advanced.uptime}: 242.4h
           </div>
           <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest">
              {t.advanced.signal}: {t.advanced.stealth}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         {features.map(f => (
           <button 
            key={f.id}
            onClick={() => setActiveTab(f.id)}
            className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center text-center group ${activeTab === f.id ? 'bg-brand border-brand text-surface shadow-2xl shadow-brand/40 scale-105 z-10' : 'bg-card border-border text-brand hover:border-brand/40'}`}
           >
              <f.icon size={32} className={`mb-4 transition-transform group-hover:scale-110 ${activeTab === f.id ? 'text-surface' : 'text-brand'}`} />
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-1">{f.name}</h3>
              <p className={`text-[8px] uppercase font-bold opacity-60 ${activeTab === f.id ? 'text-surface' : 'text-text-dim'}`}>{f.desc}</p>
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
         <motion.div 
           key={activeTab}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
         >
            {activeTab === 'suite' && <SuiteWelcome t={t} />}
            {activeTab === 'duress' && <DuressProtocol t={t} />}
            {activeTab === 'scanner' && <RFScanner t={t} />}
            {activeTab === 'terminal' && <TermGrid t={t} />}
            {activeTab === 'inventory' && <InventoryGrid t={t} />}
            {activeTab === 'waypoints' && <WaypointLog t={t} />}
            {activeTab === 'jammer' && <NoiseJammer t={t} />}
            {activeTab === 'deaddrop' && <DeadDropLog t={t} />}
            {activeTab === 'cipher' && <CipherEngine t={t} />}
            {activeTab === 'matrix' && <ThreatMatrixDashboard t={t} />}
            {activeTab === 'med' && <TCCCGuideView t={t} />}
            {activeTab === 'satellite' && <SatelliteUplinkView t={t} />}
         </motion.div>
      </AnimatePresence>

      <MarketExpansionSegment t={t} />
    </div>
  );
}

function SuiteWelcome({ t }: { t: any }) {
  return (
    <div className="py-20 text-center">
       <Gauge className="text-brand/10 mx-auto mb-8" size={120} />
       <h2 className="text-3xl font-black text-brand uppercase tracking-tighter mb-4">{t.advanced.awaitingSelection}</h2>
       <p className="text-text-dim max-w-sm mx-auto uppercase text-[10px] font-bold tracking-widest leading-relaxed">
          {t.advanced.awaitingSelectionDesc}
       </p>
    </div>
  );
}

// 1. Duress Protocol
function DuressProtocol({ t }: { t: any }) {
  const [duressKey, setDuressKey] = useState(() => localStorage.getItem('sahand_duress_key') || '');
  const [triggers, setTriggers] = useState(() => {
    const saved = localStorage.getItem('sahand_duress_triggers');
    return saved ? JSON.parse(saved) : { sos: true, decoy: false, sync: true, shred: false };
  });

  const toggleTrigger = (key: string) => {
    const newTriggers = { ...triggers, [key]: !triggers[key] };
    setTriggers(newTriggers);
    localStorage.setItem('sahand_duress_triggers', JSON.stringify(newTriggers));
  };

  const handleArm = () => {
    localStorage.setItem('sahand_duress_key', duressKey);
    alert("DURESS_PROTOCOL: ARMED. System will respond to DURESS_KEY on next authentication challenge.");
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 border-b border-border pb-8">
          <ShieldAlert className="text-red-500" size={32} />
          <div>
             <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.duress.title}</h2>
             <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest">{t.advanced.duress.subtitle}</p>
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
             <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
                <p className="text-[11px] text-red-500/80 leading-relaxed font-bold uppercase italic">
                   {t.advanced.duress.warning}
                </p>
             </div>
             <div>
                <label className="text-[10px] font-black text-brand uppercase mb-2 block">{t.advanced.duress.label}</label>
                <input 
                  type="password"
                  value={duressKey}
                  onChange={e => setDuressKey(e.target.value)}
                  placeholder={t.advanced.duress.placeholder}
                  className="w-full bg-surface border border-border rounded-2xl p-4 text-xs font-mono text-brand mb-4 outline-none focus:border-brand"
                />
                <button 
                  onClick={handleArm}
                  className="w-full py-4 bg-red-500 text-surface rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                >
                   {t.advanced.duress.button}
                </button>
             </div>
          </div>
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-brand uppercase mb-4">{t.advanced.duress.triggers}</h4>
             {[
               { id: 'sos', label: t.advanced.duress.sos },
               { id: 'decoy', label: t.advanced.duress.decoy },
               { id: 'sync', label: t.advanced.duress.sync },
               { id: 'shred', label: t.advanced.duress.shred }
             ].map((trigger) => (
                <div 
                  key={trigger.id} 
                  onClick={() => toggleTrigger(trigger.id)}
                  className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl cursor-pointer hover:border-brand transition-colors"
                >
                   <span className="text-[10px] font-bold text-brand uppercase">{trigger.label}</span>
                   <div className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${triggers[trigger.id] ? 'bg-brand' : 'bg-border'}`}>
                      <motion.div 
                        animate={{ x: triggers[trigger.id] ? 20 : 0 }}
                        className="w-3 h-3 bg-surface rounded-full" 
                      />
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}

// 2. RF Scanner
function RFScanner({ t }: { t: any }) {
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [detectedTargets, setDetectedTargets] = useState<any[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Create a more realistic spectrum with some "valleys" and "peaks"
      const base = Array.from({ length: 80 }, (_, i) => {
        let val = Math.random() * 20 + 5; // Noise floor
        // Add some simulated signals
        const peaks = [15, 35, 55, 72];
        peaks.forEach(p => {
          const dist = Math.abs(i - p);
          if (dist < 5) val += (5 - dist) * (Math.random() * 15 + 10);
        });
        return Math.min(val, 100);
      });
      setFrequencies(base);
      
      // Occasionally detect a "target"
      if (Math.random() > 0.98) {
        const id = `NODE_${Math.floor(Math.random() * 999)}`;
        setDetectedTargets(prev => [{ id, time: new Date().toLocaleTimeString(), strength: (Math.random() * 50 + 40).toFixed(1) }, ...prev].slice(0, 4));
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <Wifi className="text-brand" size={32} />
            <div>
               <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.scanner.title}</h2>
               <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest">{t.advanced.scanner.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-mono text-brand uppercase font-black">2.441 GHz</p>
             <p className="text-[8px] font-mono text-text-dim uppercase">{t.advanced.scanner.rate}: 1.2ms</p>
          </div>
       </div>

       <div className="h-48 bg-black rounded-[2rem] p-8 flex items-end gap-[2px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] opacity-50 z-10" />
          <div className="absolute top-0 left-0 w-full p-4 border-b border-white/5 flex justify-between text-[8px] font-mono text-white/20">
             <span>{t.advanced.scanner.low}</span>
             <span>{t.advanced.scanner.high}</span>
          </div>
          {frequencies.map((f, i) => (
            <motion.div 
              key={i}
              initial={false}
              animate={{ height: `${f}%`, opacity: f / 100 + 0.2 }}
              className={`flex-1 rounded-t-[2px] ${f > 70 ? 'bg-red-500' : 'bg-brand'}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          ))}
          <div className="absolute top-1/2 left-0 w-full h-px bg-brand/10 z-0" />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'LTE-A', status: 'DET_0.4' },
              { label: 'ISM_WIFI', status: 'ACTIVE' },
              { label: 'BT_BLE', status: 'POLL_4' },
              { label: 'SAT_COM', status: 'SYNC_99' }
            ].map(s => (
              <div key={s.label} className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center">
                 <span className="text-[10px] font-black text-brand">{s.label}</span>
                 <span className="text-[8px] font-mono text-text-dim uppercase">{s.status}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-black/40 border border-border rounded-2xl space-y-2 overflow-hidden">
             <h4 className="text-[8px] font-black text-brand/40 uppercase mb-2">Signal Intercept Log</h4>
             {detectedTargets.length === 0 && <p className="text-[8px] font-mono text-text-dim italic">SCANNING_NO_SIGNATURES...</p>}
             {detectedTargets.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-[9px] font-mono border-b border-white/5 pb-1 last:border-0">
                   <span className="text-brand">[{d.id}]</span>
                   <span className="text-text-dim">{d.strength}dBm</span>
                   <span className="text-text-dim/50">{d.time}</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}

// 3. Encrypted Terminal
function TermGrid({ t }: { t: any }) {
  const [messages, setMessages] = useState([
     { id: 1, text: 'SAHAND_OS [v2.4.1] INITIALIZED', type: 'in' },
     { id: 2, text: 'AWAITING_ENCRYPTED_UPLINK...', type: 'in' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processCommand = (cmd: string) => {
    const c = cmd.toLowerCase().trim();
    if (c === 'clear') {
      setMessages([]);
      return;
    }
    if (c === 'status') {
      return 'SYSTEM_STATUS: [NOMINAL]\nUPTIME: 14h 22m\nENCRYPTION: AES-256-GCM\nNODES_FOUND: 4\nACTIVE_LOGS: 12\nBATTERY_CHARGE: 98%\nTHERMAL_SYNC: STABLE';
    }
    if (c === 'scan') {
      return 'INITIATING_RF_SCAN...\n[OK] 2.4GHz ISM_BAND\n[OK] 433MHz UHF\n[OK] 868MHz MESH\n[OK] 5.8GHz WIDEBAND\nNO_ACTIVE_THREATS_DETECTED';
    }
    if (c === 'help') {
      return 'AVAILABLE_COMMANDS: HELP, STATUS, SCAN, CLEAR, PING, WHOAMI, VERSION, LOGS, DISCONNECT';
    }
    if (c === 'version') {
      return 'SAHAND_OS_v2.4.1 [STABLE_BUILD]';
    }
    if (c === 'logs') {
      return 'SHRED_PROTOCOL_ACTIVE. PREVIOUS_SESSION_LOGS_PURGED.';
    }
    if (c === 'disconnect') {
      return 'REMOTE_SESSION_TERMINATED. STANDBY...';
    }
    if (c === 'ping') {
      return 'PONG: 42ms';
    }
    if (c === 'whoami') {
      return 'USER: OPERATOR_ALPHA\nLEVEL: 4_CRYPTO_OP';
    }
    return `ERROR: COMMAND_NOT_FOUND: ${c}`;
  };

  const send = () => {
    if (!input) return;
    soundService.playClick();
    const userMsg = { id: Date.now(), text: input, type: 'out' };
    setMessages(prev => [...prev, userMsg]);
    
    const response = processCommand(input);
    if (response) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: response, type: 'in' }]);
        soundService.playData();
      }, 600);
    }
    
    setInput('');
  };

  return (
    <div className="h-[600px] flex flex-col gap-6">
       <div className="flex items-center gap-4 border-b border-border pb-6">
          <Terminal className="text-brand" size={32} />
          <h2 className="text-2xl font-black text-brand uppercase tracking-tighter">{t.advanced.terminal.title}</h2>
       </div>
       <div className="flex-1 bg-black rounded-[2.5rem] p-8 overflow-y-auto space-y-4 font-mono no-scrollbar flex flex-col">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.type === 'in' ? 'justify-start' : 'justify-end'}`}>
               <div className={`max-w-[85%] p-4 rounded-2xl text-[10px] leading-relaxed whitespace-pre-wrap ${m.type === 'in' ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-brand text-surface'}`}>
                  <span className="opacity-30 mr-2">[{m.type === 'in' ? 'REV' : 'ACK'}]</span>
                  {m.text}
               </div>
            </div>
          ))}
          <div ref={scrollRef} />
       </div>
       <div className="flex gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-mono text-sm opacity-50">$</span>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={t.advanced.terminal.placeholder}
              className="w-full bg-surface border border-border rounded-2xl pl-10 pr-6 py-4 text-sm font-mono text-brand focus:border-brand outline-none transition-all"
            />
          </div>
          <button 
            onClick={send}
            className="p-4 bg-brand text-surface rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all w-16 h-16 flex items-center justify-center shrink-0"
          >
             <ChevronRight />
          </button>
       </div>
    </div>
  );
}

// 4. Tactical Inventory
function InventoryGrid({ t }: { t: any }) {
  const [gear, setGear] = useState(() => {
    const saved = localStorage.getItem('sahand_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'SDR Transceiver (v2.4)', status: t.advanced.inventory.optimal, charge: 92 },
      { id: 2, name: 'Mesh Relay Node R-710', status: t.advanced.inventory.synced, charge: 45 },
      { id: 3, name: 'HF Tactical Antenna', status: t.advanced.inventory.active, charge: 100 },
      { id: 4, name: 'Solar Fabric (120W)', status: t.advanced.inventory.active, charge: 88 },
      { id: 5, name: 'Encrypted USB (2TB)', status: t.advanced.inventory.optimal, charge: 100 },
      { id: 6, name: 'Thermal Vision Scope', status: t.advanced.inventory.depleted, charge: 0 },
      { id: 7, name: 'Personal First Aid Kit', status: t.advanced.inventory.active, charge: 100 },
      { id: 8, name: 'Radio Wave Jammer (L1)', status: t.advanced.inventory.active, charge: 56 }
    ];
  });

  const addItem = () => {
    const name = prompt('Enter Item Name:');
    if (!name) return;
    const newItem = { id: Date.now(), name, status: t.advanced.inventory.active, charge: 100 };
    const newGear = [newItem, ...gear];
    setGear(newGear);
    localStorage.setItem('sahand_inventory', JSON.stringify(newGear));
    soundService.playSuccess();
  };

  const removeItem = (id: number) => {
    const newGear = gear.filter((g: any) => g.id !== id);
    setGear(newGear);
    localStorage.setItem('sahand_inventory', JSON.stringify(newGear));
    soundService.playClick();
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="flex items-center gap-4">
             <Package className="text-brand" size={32} />
             <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.inventory.title}</h2>
          </div>
          <button 
            onClick={addItem}
            className="px-6 py-2 bg-brand text-surface rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Add Asset
          </button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gear.map((g: any) => (
            <div key={g.id} className="bg-surface border border-border rounded-[2rem] p-8 group hover:border-brand transition-all relative">
               <button 
                 onClick={() => removeItem(g.id)}
                 className="absolute top-6 right-6 p-2 text-text-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
               >
                 <Trash2 size={16} />
               </button>
               <div className="flex justify-between items-start mb-6 mr-8">
                  <div>
                     <h3 className="text-sm font-black text-brand uppercase mb-1">{g.name}</h3>
                     <p className={`text-[8px] font-mono font-black uppercase ${g.status === t.advanced.inventory.depleted ? 'text-red-500' : 'text-green-500'}`}>{g.status}</p>
                  </div>
                  <Database className="text-brand/20 group-hover:text-brand/40 transition-colors" size={24} />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[8px] font-black text-text-dim uppercase">
                     <span>{t.advanced.inventory.charge}</span>
                     <span>{g.charge}%</span>
                  </div>
                  <div className="h-3 bg-black/5 rounded-full overflow-hidden border border-border">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${g.charge}%` }}
                       className={`h-full ${g.charge < 20 ? 'bg-red-500' : 'bg-brand'}`} 
                     />
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

// 5. Waypoints
function WaypointLog({ t }: { t: any }) {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('sahand_waypoints');
    return saved ? JSON.parse(saved) : [
      { id: 'ALPHA_01', coords: '35.6892, 51.3890', sector: 'TEH_NORTH' },
      { id: 'BRAVO_04', coords: '35.7219, 51.3347', sector: 'TEH_WEST' },
      { id: 'ZULU_09', coords: '35.7942, 51.4111', sector: 'SHEMIRAN' }
    ];
  });

  const addPoint = () => {
    const id = `MARK_${Math.floor(Math.random() * 999)}`;
    const newPoint = { id, coords: '35.xxxx, 51.xxxx', sector: 'UNKNOWN' };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    localStorage.setItem('sahand_waypoints', JSON.stringify(newPoints));
  };

  const removePoint = (id: string) => {
    const newPoints = points.filter((p: any) => p.id !== id);
    setPoints(newPoints);
    localStorage.setItem('sahand_waypoints', JSON.stringify(newPoints));
  };

  return (
     <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-8">
           <div className="flex items-center gap-4">
              <MapPin className="text-brand" size={32} />
              <h2 className="text-2xl font-black text-brand uppercase">{points.length} {t.advanced.waypoints.title}</h2>
           </div>
           <button 
            onClick={addPoint}
            className="p-3 bg-brand text-surface rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
           >
             <Plus size={16} /> {t.advanced.waypoints.new}
           </button>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-border">
                    <th className="py-4 text-[10px] font-black text-text-dim uppercase">{t.advanced.waypoints.designator}</th>
                    <th className="py-4 text-[10px] font-black text-text-dim uppercase">{t.advanced.waypoints.coordinates}</th>
                    <th className="py-4 text-[10px] font-black text-text-dim uppercase">{t.advanced.waypoints.sector}</th>
                    <th className="py-4 text-[10px] font-black text-text-dim uppercase text-right">{t.advanced.waypoints.action}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {points.map((w: any) => (
                    <tr key={w.id} className="group hover:bg-brand/5 transition-colors">
                       <td className="py-6 text-xs font-black text-brand">{w.id}</td>
                       <td className="py-6 text-xs font-mono text-brand/70">{w.coords}</td>
                       <td className="py-6 text-xs font-bold text-text-dim uppercase">{w.sector}</td>
                       <td className="py-6 text-right">
                          <button 
                            onClick={() => removePoint(w.id)}
                            className="p-2 text-text-dim hover:text-red-500 transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  );
}

// 6. Noise Jammer
function NoiseJammer({ t }: { t: any }) {
  const [isActive, setIsActive] = useState(false);
  const [intensity, setIntensity] = useState(60);
  const [mode, setMode] = useState<'WHITE' | 'PINK' | 'BROWNIAN'>('WHITE');
  const [frequency, setFrequency] = useState('2.4GHz');
  const audioContext = useRef<AudioContext | null>(null);
  const noiseSource = useRef<AudioBufferSourceNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  const startJammer = () => {
    soundService.playData();
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }

      const bufferSize = 2 * audioContext.current.sampleRate;
      const noiseBuffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (mode === 'WHITE') {
              output[i] = white;
          } else if (mode === 'PINK') {
              // Simple approximation of pink noise
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5; 
          } else {
              // Brownian noise
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5;
          }
      }

      noiseSource.current = audioContext.current.createBufferSource();
      noiseSource.current.buffer = noiseBuffer;
      noiseSource.current.loop = true;

      gainNode.current = audioContext.current.createGain();
      gainNode.current.gain.value = intensity / 100 * 0.15; 

      noiseSource.current.connect(gainNode.current);
      gainNode.current.connect(audioContext.current.destination);
      
      noiseSource.current.start();
      setIsActive(true);
    } catch (e) {
      console.error('Jammer failed to start:', e);
    }
  };

  const stopJammer = () => {
    soundService.playClick();
    if (noiseSource.current) {
      try {
        noiseSource.current.stop();
        noiseSource.current.disconnect();
      } catch (e) {}
      noiseSource.current = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    if (isActive) {
        stopJammer();
        startJammer();
    }
  }, [mode]);

  useEffect(() => {
    if (isActive && gainNode.current) {
      gainNode.current.gain.setTargetAtTime(intensity / 100 * 0.15, audioContext.current!.currentTime, 0.1);
    }
  }, [intensity, isActive]);

  useEffect(() => {
    return () => {
      stopJammer();
    };
  }, []);

  return (
    <div className="space-y-12">
       <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="flex items-center gap-4">
             <VolumeX className="text-brand" size={32} />
             <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.jammer.title}</h2>
          </div>
          <div className="flex gap-2">
             {['2.4GHz', '5.8GHz', 'UHF', 'VHF'].map(f => (
               <button 
                key={f}
                onClick={() => setFrequency(f)}
                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${frequency === f ? 'bg-brand text-surface' : 'bg-surface border border-border text-text-dim'}`}
               >
                 {f}
               </button>
             ))}
          </div>
       </div>
       
       <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(['WHITE', 'PINK', 'BROWNIAN'] as const).map(m => (
            <button
               key={m}
               onClick={() => setMode(m)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-brand/20 border-brand text-brand shadow-lg shadow-brand/10' : 'bg-surface border-border text-text-dim'}`}
            >
               {m}_NOISE
            </button>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square max-w-[320px] mx-auto w-full flex items-center justify-center">
             <motion.div 
               animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] } : {}}
               transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               className={`absolute inset-0 rounded-[4rem] border-2 border-dashed border-brand/40 ${isActive ? 'opacity-100 shadow-[0_0_100px_rgba(var(--brand-rgb),0.3)]' : 'opacity-20'}`} 
             />
             <motion.div 
               animate={isActive ? { scale: [1, 1.2, 1] } : {}}
               transition={{ repeat: Infinity, duration: 1 }}
               className={`absolute inset-10 rounded-[3rem] bg-brand/5 border border-brand/10 ${isActive ? 'opacity-100' : 'opacity-0'}`}
             />
             <button 
               onClick={() => isActive ? stopJammer() : startJammer()}
               className={`w-48 h-48 rounded-[3rem] border-4 flex flex-col items-center justify-center transition-all relative z-10 ${isActive ? 'bg-brand border-brand text-surface shadow-[0_0_60px_rgba(var(--brand-rgb),0.4)] scale-110' : 'bg-surface border-border text-brand hover:scale-105 active:scale-95'}`}
             >
                <motion.div animate={isActive ? { rotate: [0, 10, -10, 0] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}>
                  <Zap size={64} className={`${isActive ? 'fill-surface' : ''}`} />
                </motion.div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">{isActive ? t.advanced.jammer.jamming : t.advanced.jammer.idle}</span>
             </button>
          </div>

          <div className="space-y-8">
             <div className="space-y-6 bg-surface p-8 border border-border rounded-[2.5rem]">
                <div className="flex justify-between text-[11px] font-black text-brand uppercase tracking-widest">
                   <span>Jamming Intensity</span>
                   <span className="font-mono">{intensity}%</span>
                </div>
                <input 
                  type="range"
                  max="100"
                  min="0"
                  step="1"
                  value={intensity}
                  onChange={e => setIntensity(+e.target.value)}
                  className="w-full h-1.5 bg-border rounded-full appearance-none outline-none accent-brand cursor-pointer"
                />
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-black/5 border border-border rounded-2xl">
                      <p className="text-[8px] text-text-dim uppercase font-bold mb-1">Target Band</p>
                      <p className="text-sm font-black text-brand">{frequency}</p>
                   </div>
                   <div className="p-4 bg-black/5 border border-border rounded-2xl">
                      <p className="text-[8px] text-text-dim uppercase font-bold mb-1">Spectrum</p>
                      <p className="text-sm font-black text-brand uppercase">{mode}</p>
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-brand/5 border border-brand/20 rounded-[2rem] flex items-center gap-4">
                <ShieldAlert className="text-brand shrink-0" size={24} />
                <p className="text-[9px] text-text-dim uppercase font-black tracking-widest leading-relaxed">
                   Active interference prevents near-field acoustic data exfiltration. Ensure peripheral devices are shielded during operation.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}

// 7. Dead Drop Tracker
function DeadDropLog({ t }: { t: any }) {
  const [drops, setDrops] = useState(() => {
    const saved = localStorage.getItem('sahand_deaddrops');
    return saved ? JSON.parse(saved) : [
      { id: 'CACHE_RED', loc: 'Abandoned Factory Vent', status: t.advanced.deaddrop.stocked, last: '2d ago' },
      { id: 'CACHE_NULL', loc: 'Public Library Section 4', status: t.advanced.deaddrop.empty, last: '5d ago' }
    ];
  });

  const addDrop = () => {
    const id = `DROP_${Math.floor(Math.random() * 999)}`;
    const loc = prompt('Enter Location:');
    if (!loc) return;
    const newDrop = { id, loc, status: t.advanced.deaddrop.stocked, last: 'Just now' };
    const newDrops = [newDrop, ...drops];
    setDrops(newDrops);
    localStorage.setItem('sahand_deaddrops', JSON.stringify(newDrops));
    soundService.playSuccess();
  };

  const removeDrop = (id: string) => {
    const newDrops = drops.filter((d: any) => d.id !== id);
    setDrops(newDrops);
    localStorage.setItem('sahand_deaddrops', JSON.stringify(newDrops));
    soundService.playClick();
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="flex items-center gap-4">
             <Archive className="text-brand" size={32} />
             <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.deaddrop.title}</h2>
          </div>
          <button 
            onClick={addDrop}
            className="px-6 py-2 bg-brand text-surface rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Establish Cache
          </button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {drops.map((c: any) => (
            <div key={c.id} className="p-8 bg-surface border border-border rounded-[2.5rem] relative group hover:border-brand transition-all">
               <button 
                 onClick={() => removeDrop(c.id)}
                 className="absolute top-4 right-4 p-2 text-text-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
               >
                 <Trash2 size={16} />
               </button>
               <div className={`absolute top-8 right-8 w-2 h-2 rounded-full ${c.status === t.advanced.deaddrop.stocked ? 'bg-brand shadow-[0_0_10px_#84cc16]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
               <h4 className="text-xs font-black text-brand uppercase mb-4 tracking-tighter">{c.id}</h4>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-text-dim uppercase font-bold">{t.advanced.deaddrop.location}</span>
                     <span className="text-brand font-black ml-4 text-right">{c.loc}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-text-dim uppercase font-bold">{t.advanced.deaddrop.sync}</span>
                     <span className="text-brand font-black">{c.last}</span>
                  </div>
               </div>
               <button className="w-full mt-6 py-3 border border-brand/20 rounded-xl text-[9px] font-black text-brand uppercase tracking-widest hover:bg-brand hover:text-surface transition-all">{t.advanced.deaddrop.report}</button>
            </div>
          ))}
       </div>
    </div>
  );
}

// 8. Cipher Pad
function CipherEngine({ t }: { t: any }) {
  const [pad, setPad] = useState('');
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isDecrypt, setIsDecrypt] = useState(false);
  
  const generatePad = () => {
    soundService.playData();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 30; i++) {
       if (i > 0 && i % 5 === 0) res += '-';
       res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPad(res);
  };

  const executeCipher = () => {
    soundService.playSuccess();
    // Simple Caesar/Vigenere hybrid for visual effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let output = '';
    const key = pad.replace(/-/g, '');
    
    for (let i = 0; i < inputText.length; i++) {
        const char = inputText[i].toUpperCase();
        const pivot = chars.indexOf(char);
        if (pivot === -1) {
            output += char;
            continue;
        }
        const keyChar = key[i % key.length];
        const shift = chars.indexOf(keyChar);
        
        let newIdx;
        if (isDecrypt) {
            newIdx = (pivot - shift + chars.length) % chars.length;
        } else {
            newIdx = (pivot + shift) % chars.length;
        }
        output += chars[newIdx];
    }
    setResultText(output);
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 border-b border-border pb-8">
          <Binary className="text-brand" size={32} />
          <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.cipher.title}</h2>
       </div>
       
       <div className="bg-black rounded-[2rem] p-10 text-center space-y-6">
          <p className="text-[10px] text-brand uppercase font-black tracking-[0.5em]">{t.advanced.cipher.sessionPad}</p>
          {pad ? (
            <motion.span initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-2xl md:text-4xl font-black text-brand font-mono tracking-tighter block">{pad}</motion.span>
          ) : (
            <div className="flex justify-center gap-2">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="w-12 h-16 bg-brand/5 border border-brand/20 rounded-xl animate-pulse" />
               ))}
            </div>
          )}
          <button 
            onClick={generatePad}
            className="px-10 py-5 bg-brand text-surface rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
             {t.advanced.cipher.button}
          </button>
       </div>

       {pad && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6">
            <div className="flex gap-4 p-1 bg-black/5 rounded-2xl">
               <button onClick={() => setIsDecrypt(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isDecrypt ? 'bg-brand text-surface' : 'text-text-dim'}`}>Encrypt</button>
               <button onClick={() => setIsDecrypt(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDecrypt ? 'bg-brand text-surface' : 'text-text-dim'}`}>Decrypt</button>
            </div>
            
            <div className="space-y-4">
               <textarea 
                 value={inputText}
                 onChange={e => setInputText(e.target.value)}
                 className="w-full bg-black/40 border border-border rounded-2xl p-6 font-mono text-brand text-sm outline-none focus:border-brand h-32 resize-none"
                 placeholder="Enter payload..."
               />
               <button 
                 onClick={executeCipher}
                 className="w-full py-4 bg-brand/10 border border-brand/30 text-brand rounded-2xl font-black uppercase tracking-widest hover:bg-brand/20 transition-all"
               >
                 Process Payload
               </button>
               {resultText && (
                 <div className="bg-brand text-surface p-6 rounded-2xl font-mono text-sm break-all relative">
                    <p className="opacity-50 text-[8px] absolute top-2 left-4 uppercase font-black tracking-widest">Output_Result</p>
                    <div className="pt-2">{resultText}</div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(resultText); soundService.playSuccess(); }}
                      className="absolute bottom-2 right-4 text-[8px] bg-black/20 px-2 py-1 rounded uppercase font-black hover:bg-black/40"
                    >
                      Copy
                    </button>
                 </div>
               )}
            </div>
         </motion.div>
       )}

       <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl">
          <p className="text-[9px] text-brand/60 uppercase font-black leading-relaxed">
             {t.advanced.cipher.warning}
          </p>
       </div>
    </div>
  );
}

// 9. Threat Matrix
function ThreatMatrixDashboard({ t }: { t: any }) {
  const [hazard, setHazard] = useState(1.5);
  
  useEffect(() => {
    const interval = setInterval(() => {
       setHazard(prev => {
         const delta = (Math.random() - 0.5) * 0.4;
         return Math.max(0.1, Math.min(10.0, prev + delta));
       });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
       <div className="flex items-center gap-4 border-b border-border pb-8">
          <Activity className="text-brand" size={32} />
          <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.matrix.title}</h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface border border-border rounded-[2rem] p-8 text-center bg-[radial-gradient(circle_at_top_right,_rgba(132,204,22,0.05)_0%,_transparent_50%)]">
             <Crosshair className="text-brand mx-auto mb-4" size={48} />
             <h4 className="text-xl font-black text-brand uppercase mb-2">{t.advanced.matrix.alpha}</h4>
             <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest leading-relaxed">{t.advanced.matrix.alphaDesc}</p>
          </div>
          <div className="bg-surface border border-border rounded-[2rem] p-8 text-center relative overflow-hidden">
             <motion.div 
               animate={{ opacity: [0.1, 0.3, 0.1] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute inset-0 bg-brand/5"
             />
             <Search className="text-brand mx-auto mb-4" size={48} />
             <h4 className="text-xl font-black text-brand uppercase mb-2">{t.advanced.matrix.sig}</h4>
             <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest leading-relaxed">{t.advanced.matrix.sigDesc}</p>
          </div>
          <div className="bg-surface border border-border rounded-[2rem] p-8 text-center bg-[radial-gradient(circle_at_bottom_left,_rgba(239,68,68,0.05)_0%,_transparent_50%)]">
             <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
             <h4 className="text-xl font-black text-brand uppercase mb-2">{t.advanced.matrix.net}</h4>
             <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest leading-relaxed">{t.advanced.matrix.netDesc}</p>
          </div>
       </div>
       
       <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
             <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">{t.advanced.matrix.hazard}</span>
             <span className={`text-2xl font-black font-mono transition-colors ${hazard > 7 ? 'text-red-500' : hazard > 4 ? 'text-orange-500' : 'text-brand'}`}>
               {hazard.toFixed(1)} / 10.0
             </span>
          </div>
          <div className="h-6 w-full bg-black/10 rounded-full overflow-hidden border border-border/50 p-1">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(hazard / 10) * 100}%` }}
               className={`h-full rounded-full transition-colors duration-500 ${hazard > 7 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : hazard > 4 ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-brand'}`}
             />
          </div>
          <p className="text-[9px] font-bold text-text-dim text-center uppercase tracking-widest">
             {hazard > 7 ? 'SECTOR_THREAT_CRITICAL' : hazard > 4 ? 'ELEVATED_RISK_DETECTED' : t.advanced.matrix.clear}
          </p>
       </div>

       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['DNS_LEAK: NO', 'IP_GEO: MASKED', 'SIM: STALE', 'TTL: 64'].map(tag => (
             <div key={tag} className="p-3 bg-surface border border-border rounded-xl text-[8px] font-mono font-black text-brand/60 text-center uppercase">
                {tag}
             </div>
          ))}
       </div>
    </div>
  );
}

function SatelliteUplinkView({ t }: { t: any }) {
  const [connecting, setConnecting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [logs, setLogs] = useState<string[]>(['SU_INITIALIZING_BOOT...']);

  const runSimulation = () => {
    setConnecting(true);
    setLocked(false);
    setLogs(prev => [...prev, 'SEARCHING_ORBITAL_PLANE...']);
    soundService.playData();

    setTimeout(() => {
      setLogs(prev => [...prev, 'GEO_STATIONARY_LOCK_ACQUIRED: 0x921A']);
      soundService.playSuccess();
    }, 2000);

    setTimeout(() => {
      setLogs(prev => [...prev, 'ESTABLISHING_ENCRYPTED_TUNNEL...']);
    }, 4000);

    setTimeout(() => {
      setLocked(true);
      setConnecting(false);
      setLogs(prev => [...prev, 'UPLINK_STABLE: 42mbps']);
      soundService.playSuccess();
    }, 6000);
  };

  return (
    <div className="space-y-8 pb-12">
       <div className="flex justify-between items-center border-b border-border pb-8">
          <div className="flex items-center gap-4">
             <Globe className="text-brand" size={32} />
             <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.tabs.satellite}</h2>
          </div>
          <button 
            onClick={runSimulation}
            disabled={connecting || locked}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${locked ? 'bg-brand text-surface' : 'bg-surface border border-brand text-brand hover:bg-brand/10'}`}
          >
            {connecting ? 'Linking...' : locked ? 'Uplink Established' : 'Initiate Handshake'}
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-black rounded-[2rem] p-8 font-mono text-[10px] text-brand/80 min-h-[300px] border border-brand/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent opacity-50" />
             <div className="relative z-10 space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4">
                     <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                     <span className="font-bold">{log}</span>
                  </div>
                ))}
                {connecting && <div className="animate-pulse">_CURSOR_BLINKING...</div>}
             </div>
          </div>
          
          <div className="space-y-4">
             <div className="p-6 bg-surface border border-border rounded-[2rem] flex flex-col items-center text-center">
                <Cpu className="text-brand mb-4" size={24} />
                <h4 className="text-[10px] font-black uppercase text-text-dim mb-1">Tunnel Status</h4>
                <div className={`text-xs font-black uppercase ${locked ? 'text-brand' : 'text-orange-500'}`}>
                   {locked ? 'AES-QUAD-WRAP' : 'INACTIVE'}
                </div>
             </div>
             <div className="p-6 bg-surface border border-border rounded-[2rem] flex flex-col items-center text-center">
                <Activity className="text-brand mb-4" size={24} />
                <h4 className="text-[10px] font-black uppercase text-text-dim mb-1">Latency (Sim)</h4>
                <div className="text-xs font-black text-brand uppercase">
                   {locked ? '412 MS' : '--- MS'}
                </div>
             </div>
          </div>
       </div>

       <div className="p-8 border border-dashed border-border rounded-[2rem]">
          <h4 className="text-[11px] font-black text-brand uppercase tracking-widest mb-4">Protocol: ORBITAL_STEALTH_V2</h4>
          <p className="text-[10px] text-text-dim leading-relaxed font-bold uppercase">
             This module simulates connection to a geostationary data relay. In real deployments, this requires a physical SAT-LINK terminal (e.g., Starlink, BGAN). The software bridge automatically handles packet scattering to minimize RF signature footprint.
          </p>
       </div>
    </div>
  );
}

// 10. TCCC Guide
function TCCCGuideView({ t }: { t: any }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tcccSteps = Object.entries(t.advanced.medSteps || {}).map(([id, data]: [string, any]) => ({
    tag: id === 'massive' ? 'M' : id === 'airway' ? 'A' : id === 'respiration' ? 'R' : id === 'circulation' ? 'C' : 'H',
    id,
    ...data
  }));

  return (
    <div className="space-y-8 pb-12">
       <div className="flex items-center gap-4 border-b border-border pb-8">
          <HeartPulse className="text-red-500" size={32} />
          <h2 className="text-2xl font-black text-brand uppercase">{t.advanced.tabs.med}</h2>
       </div>
       <div className="grid grid-cols-1 gap-4">
          {tcccSteps.map((m: any) => (
            <motion.div 
               key={m.id} 
               layout
               onClick={() => { setSelectedId(prev => prev === m.id ? null : m.id); soundService.playClick(); }}
               className={`flex flex-col p-6 bg-surface border transition-all cursor-pointer rounded-3xl ${selectedId === m.id ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-border hover:border-brand/40'}`}
            >
               <div className="flex gap-6 items-center">
                  <div className={`w-14 h-14 flex items-center justify-center text-2xl font-black rounded-2xl shrink-0 transition-colors ${selectedId === m.id ? 'bg-brand text-surface' : 'bg-red-500 text-surface'}`}>
                     {m.tag}
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-black text-brand uppercase mb-1 tracking-tighter">{m.name}</h4>
                     <p className="text-[10px] text-text-dim font-bold uppercase leading-relaxed">{m.detail}</p>
                  </div>
                  <motion.div animate={{ rotate: selectedId === m.id ? 180 : 0 }}>
                     <ChevronDown className="text-text-dim" />
                  </motion.div>
               </div>
               
               <AnimatePresence>
                  {selectedId === m.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                       <div className="pt-6 mt-6 border-t border-brand/20">
                          <p className="text-xs font-bold font-mono text-brand mb-4 uppercase tracking-widest bg-brand/10 p-3 rounded-xl">Advanced_Protocol_Instructions</p>
                          <p className="text-xs font-bold leading-relaxed text-text tracking-wide whitespace-pre-wrap">
                             {m.extended}
                          </p>
                          <div className="mt-6 flex gap-4">
                             <div className="flex-1 bg-black/20 p-4 rounded-2xl text-[8px] font-black uppercase text-text-dim tracking-tighter text-center border border-border">{t.advanced.matrix.clear}</div>
                             <div className="flex-1 bg-black/20 p-4 rounded-2xl text-[8px] font-black uppercase text-text-dim tracking-tighter text-center border border-border">SECURE_PROCEDURE</div>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </motion.div>
          ))}
       </div>
       
       <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-start gap-4">
          <ShieldAlert className="text-red-500 shrink-0" size={20} />
          <p className="text-[9px] font-black uppercase text-text tracking-[0.05em] leading-relaxed">
             Disclaimer: This medical guide is for simulation and educational reference only. In tactical situations, always follow verified TCCC professional guidelines and local medical laws.
          </p>
       </div>
    </div>
  );
}



function MarketExpansionSegment({ t }: { t: any }) {
  return (
    <div className="bg-brand text-surface rounded-[3rem] p-12 mt-20 relative overflow-hidden">
       <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12">
          <Archive size={300} />
       </div>
       <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">{t.advanced.roadmap.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
             <div className="p-6 bg-surface/10 backdrop-blur-xl rounded-3xl">
                <Monitor className="text-surface mb-2" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-surface">{t.advanced.roadmap.windows}</h4>
                <p className="text-[8px] uppercase font-bold opacity-70">{t.advanced.roadmap.windowsDesc}</p>
             </div>
             <div className="p-6 bg-surface/10 backdrop-blur-xl rounded-3xl">
                <Search className="text-surface mb-2" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-surface">{t.advanced.roadmap.android}</h4>
                <p className="text-[8px] uppercase font-bold opacity-70">{t.advanced.roadmap.androidDesc}</p>
             </div>
             <div className="p-6 bg-surface/10 backdrop-blur-xl rounded-3xl">
                <Lock className="text-surface mb-2" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-surface">{t.advanced.roadmap.ios}</h4>
                <p className="text-[8px] uppercase font-bold opacity-70">{t.advanced.roadmap.iosDesc}</p>
             </div>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest leading-relaxed opacity-80 mb-8">
             {t.advanced.roadmap.monetization}
          </p>
          <div className="flex gap-4">
             <button className="px-10 py-5 bg-surface text-brand rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">{t.advanced.roadmap.download}</button>
             <button className="px-10 py-5 border border-surface/40 text-surface rounded-2xl font-black uppercase tracking-widest text-xs">{t.advanced.roadmap.investor}</button>
          </div>
       </div>
    </div>
  );
}

