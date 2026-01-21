
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GameState, 
  Notification, 
  StartupType, 
  StartingPath, 
  MarketCondition,
  Employee,
  Feature,
  MarketingChannel,
  HiringRequest
} from './types';

const STORAGE_KEY = 'startup_tycoon_v1';

const INITIAL_FEATURES: Record<string, any[]> = {
  'SaaS': [
    { id: 'auth', name: 'Authentication', description: 'User login system', cost: 10, capacity: 500, revenuePerUser: 0.05, userBonus: 50, prerequisites: [] },
    { id: 'billing', name: 'Billing System', description: 'Recurring payments', cost: 15, capacity: 2000, revenuePerUser: 0.10, userBonus: 100, prerequisites: ['auth'] },
    { id: 'analytics', name: 'Analytics', description: 'User insights dashboard', cost: 12, capacity: 1000, revenuePerUser: 0.07, userBonus: 75, prerequisites: ['auth'] }
  ],
  'Gaming': [
    { id: 'core', name: 'Core Gameplay', description: 'Basic game mechanics', cost: 12, capacity: 1000, revenuePerUser: 0.02, userBonus: 100, prerequisites: [] },
    { id: 'multiplayer', name: 'Multiplayer', description: 'Online play features', cost: 18, capacity: 3000, revenuePerUser: 0.05, userBonus: 200, prerequisites: ['core'] },
    { id: 'store', name: 'In-Game Store', description: 'Microtransactions', cost: 15, capacity: 2000, revenuePerUser: 0.08, userBonus: 150, prerequisites: ['core'] }
  ],
  'FinTech': [
    { id: 'wallet', name: 'Digital Wallet', description: 'Basic payment system', cost: 18, capacity: 1000, revenuePerUser: 0.08, userBonus: 80, prerequisites: [] },
    { id: 'invest', name: 'Investment Tools', description: 'Stock trading features', cost: 24, capacity: 2000, revenuePerUser: 0.15, userBonus: 120, prerequisites: ['wallet'] }
  ],
  'E-commerce': [
    { id: 'catalog', name: 'Product Catalog', description: 'Inventory management', cost: 10, capacity: 800, revenuePerUser: 0.04, userBonus: 100, prerequisites: [] },
    { id: 'checkout', name: 'Checkout Flow', description: 'Payment gateway integration', cost: 15, capacity: 1500, revenuePerUser: 0.12, userBonus: 50, prerequisites: ['catalog'] }
  ],
  'AI/ML': [
    { id: 'model', name: 'Base Model', description: 'Trained neural network', cost: 20, capacity: 200, revenuePerUser: 0.20, userBonus: 30, prerequisites: [] },
    { id: 'api', name: 'Developer API', description: 'External accessibility', cost: 15, capacity: 1000, revenuePerUser: 0.15, userBonus: 100, prerequisites: ['model'] }
  ]
};

const INITIAL_MARKETING: MarketingChannel[] = [
  { id: 'social', name: 'Social Media', cost: 1000, effectiveness: 1.2, fatigue: 1.0, unlocked: false },
  { id: 'seo', name: 'SEO', cost: 5000, effectiveness: 2.5, fatigue: 1.0, unlocked: false },
  { id: 'content', name: 'Content Marketing', cost: 3000, effectiveness: 1.8, fatigue: 1.0, unlocked: false },
  { id: 'paid', name: 'Paid Ads', cost: 5000, effectiveness: 3.0, fatigue: 1.0, unlocked: false }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Initialize or load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (e) {
        setIsNewGameOpen(true);
      }
    } else {
      setIsNewGameOpen(true);
    }
  }, []);

  const save = useCallback((state: GameState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  const notify = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const startNewGame = (name: string, type: StartupType, path: StartingPath) => {
    let cash = 50000;
    let equity = 100;
    let debtAmount = 0;

    if (path === 'Angel') { cash = 100000; equity = 85; }
    else if (path === 'VC Pre-Seed') { cash = 250000; equity = 70; }
    else if (path === 'Bank Loan') { cash = 100000; debtAmount = 50000; }
    else if (path === 'Accelerator') { cash = 50000; equity = 93; }

    const initialFeatures = (INITIAL_FEATURES[type] || INITIAL_FEATURES['SaaS']).map(f => ({
      ...f,
      status: f.prerequisites.length === 0 ? 'Available' : 'Locked',
      remainingCost: f.cost
    }));

    const newState: GameState = {
      day: 1,
      cash,
      users: 100,
      team: [],
      features: initialFeatures,
      marketingChannels: [...INITIAL_MARKETING],
      companyName: name || 'New Venture',
      startupType: type,
      startingPath: path,
      equity,
      debtAmount,
      officeRented: false,
      marketCondition: 'Steady',
      isGameOver: false,
      quarterlyGrowth: [0.01],
      hiringQueue: []
    };

    setGameState(newState);
    save(newState);
    setIsNewGameOpen(false);
  };

  const calculateDailySalaries = useCallback((team: Employee[]) => {
    return team.reduce((sum, member) => sum + (member.salary / 30), 0);
  }, []);

  const calculateServerBurn = useCallback((users: number) => {
    if (users === 0) return 0;
    if (users <= 100) return 10;
    if (users <= 1000) return 50;
    if (users <= 10000) return 200;
    return 500;
  }, []);

  const calculateDailyRevenue = useCallback((state: GameState) => {
    const liveFeatures = state.features.filter(f => f.status === 'Live');
    const revenuePerUser = liveFeatures.reduce((sum, f) => sum + f.revenuePerUser, 0);
    const hasScaleIssues = state.features.some(f => f.status === 'NeedsScale');
    const penalty = hasScaleIssues ? 0.5 : 1.0;
    return state.users * revenuePerUser * penalty;
  }, []);

  const calculateTotalBurn = useCallback((state: GameState) => {
    const salaries = calculateDailySalaries(state.team);
    const server = calculateServerBurn(state.users);
    const software = calculateDailyRevenue(state) > 100 ? 50 : 0;
    const office = state.officeRented ? 100 : 0;
    const loan = state.debtAmount > 0 ? (state.debtAmount * 0.005) : 0;
    return salaries + server + software + office + loan;
  }, [calculateDailySalaries, calculateServerBurn, calculateDailyRevenue]);

  const calculateValuation = useCallback((state: GameState) => {
    const revenue = calculateDailyRevenue(state);
    const growthRate = state.quarterlyGrowth.length > 0 ? state.quarterlyGrowth[state.quarterlyGrowth.length - 1] : 0;
    let multiple = state.marketCondition === 'Bull' ? 800 : state.marketCondition === 'Bear' ? 300 : 500;
    const growthPremium = 1 + (growthRate * 10);
    return Math.max(25000, (state.users * 20) + (revenue * multiple) * growthPremium);
  }, [calculateDailyRevenue]);

  const nextDay = () => {
    if (!gameState || gameState.isGameOver) return;

    setGameState(prev => {
      if (!prev) return null;
      
      const day = prev.day + 1;
      const dailyRevenue = calculateDailyRevenue(prev);
      const dailyBurn = calculateTotalBurn(prev);
      let cash = prev.cash + dailyRevenue - dailyBurn;
      
      // Growth
      const baseGrowth = 0.005 + (Math.random() * 0.01);
      const growthMultiplier = prev.startingPath === 'Accelerator' ? 1.1 : 1.0;
      const dayGrowth = baseGrowth * growthMultiplier;
      let users = Math.floor(prev.users * (1 + dayGrowth));

      // Velocity
      const teamStrength = prev.team.reduce((sum, emp) => sum + (emp.skill * (emp.morale / 100)), 0);
      const velocity = teamStrength > 0 ? teamStrength / 100 : 0.25;

      // Features update
      let bonusUsers = 0;
      const features = prev.features.map(f => {
        if (f.status === 'Developing') {
          const newRemaining = f.remainingCost - velocity;
          if (newRemaining <= 0) {
            notify(`Feature Launched: ${f.name}`, 'success');
            bonusUsers += f.userBonus;
            return { ...f, status: 'Live', remainingCost: 0 } as Feature;
          }
          return { ...f, remainingCost: newRemaining };
        }
        if (f.status === 'Live' && users > f.capacity) {
          return { ...f, status: 'NeedsScale' } as Feature;
        }
        return f;
      });

      users += bonusUsers;

      // Monthly Payroll
      let team = prev.team;
      if (day % 30 === 0) {
        const totalMonthlySalaries = team.reduce((sum, member) => sum + member.salary, 0);
        if (cash >= totalMonthlySalaries) {
          cash -= totalMonthlySalaries;
          notify(`Paid ${totalMonthlySalaries.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} in salaries`, 'success');
          team = team.map(m => ({ ...m, morale: Math.min(100, m.morale + 5) }));
        } else {
          notify(`CRISIS: Missed payroll!`, 'error');
          team = team.map(m => {
            const quit = Math.random() < 0.2;
            if (quit) notify(`${m.name} quit due to unpaid salary`, 'error');
            return quit ? null : { ...m, morale: Math.max(0, m.morale - 30) };
          }).filter(Boolean) as Employee[];
        }
      }

      // Daily morale decay/growth
      team = team.map(m => {
        let moraleChange = -0.5;
        if (dailyRevenue - dailyBurn > 100) moraleChange += 1;
        if (cash < 5000) moraleChange -= 2;
        return {
          ...m,
          morale: Math.max(0, Math.min(100, m.morale + moraleChange)),
          skill: m.skill + (day % 10 === 0 ? 0.5 : 0),
          tenure: m.tenure + 1
        };
      });

      // Hiring Queue
      const hiringQueue = prev.hiringQueue.map(h => ({ ...h, daysRemaining: h.daysRemaining - 1 }));
      const completedHires = hiringQueue.filter(h => h.daysRemaining <= 0);
      const remainingHiring = hiringQueue.filter(h => h.daysRemaining > 0);
      
      completedHires.forEach(h => {
        team.push({
          id: h.id,
          name: h.name,
          role: h.role,
          salary: h.salary,
          morale: 80,
          loyalty: 80,
          tenure: 0,
          skill: h.role.includes('Senior') ? 75 : 50,
          experience: 0
        });
        notify(`${h.name} joined as ${h.role}`, 'success');
      });

      // Market
      let marketCondition = prev.marketCondition;
      if (day % 60 === 0) {
        const r = Math.random();
        marketCondition = r > 0.7 ? 'Bull' : r < 0.3 ? 'Bear' : 'Steady';
        notify(`Market shifted to ${marketCondition}`, 'info');
      }

      const nextState: GameState = {
        ...prev,
        day,
        cash,
        users,
        team,
        features,
        marketCondition,
        hiringQueue: remainingHiring,
        quarterlyGrowth: [...prev.quarterlyGrowth, dayGrowth].slice(-30),
        isGameOver: cash <= 0
      };
      
      save(nextState);
      return nextState;
    });
  };

  const startDeveloping = (id: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const features = prev.features.map(f => {
        if (f.id === id) {
          const isScaling = f.status === 'NeedsScale';
          return { 
            ...f, 
            status: 'Developing', 
            remainingCost: isScaling ? f.cost * 0.6 : f.cost,
            wasScaling: isScaling,
            capacity: isScaling ? f.capacity * 2.5 : f.capacity
          } as Feature;
        }
        return f;
      });
      const next = { ...prev, features };
      save(next);
      return next;
    });
    notify("Development started");
  };

  // Fixed: HiringRequest import added to types import above to fix "Cannot find name 'HiringRequest'"
  const startHiring = (role: string, salary: number) => {
    if (!gameState) return;
    const fee = salary / 3;
    if (gameState.cash < fee) {
      notify(`Need ${fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} for recruiting`, 'error');
      return;
    }
    const names = ['Alex', 'Jordan', 'Sam', 'Casey', 'Riley', 'Taylor', 'Morgan', 'Blake'];
    const name = names[Math.floor(Math.random() * names.length)];
    const h: HiringRequest = { id: Date.now().toString(), name, role, salary, daysRemaining: 3 };
    
    setGameState(prev => {
      if (!prev) return null;
      const next = { ...prev, cash: prev.cash - fee, hiringQueue: [...prev.hiringQueue, h] };
      save(next);
      return next;
    });
    notify(`Started recruiting ${role}`);
  };

  const runMarketing = (id: string) => {
    if (!gameState) return;
    const channel = gameState.marketingChannels.find(c => c.id === id);
    if (!channel || gameState.cash < channel.cost) {
      notify("Insufficient funds for campaign", "error");
      return;
    }

    const gain = Math.floor(channel.cost * channel.effectiveness * channel.fatigue);
    setGameState(prev => {
      if (!prev) return null;
      const channels = prev.marketingChannels.map(c => 
        c.id === id ? { ...c, fatigue: Math.max(0.1, c.fatigue - 0.15) } : c
      );
      const next = { ...prev, cash: prev.cash - channel.cost, users: prev.users + gain, marketingChannels: channels };
      save(next);
      return next;
    });
    notify(`Campaign gained ${gain} users!`, 'success');
  };

  const unlockMarketing = (id: string) => {
    if (!gameState) return;
    if (gameState.cash < 5000) {
      notify("Need $5,000 to unlock channel", "error");
      return;
    }
    setGameState(prev => {
      if (!prev) return null;
      const channels = prev.marketingChannels.map(c => c.id === id ? { ...c, unlocked: true } : c);
      const next = { ...prev, cash: prev.cash - 5000, marketingChannels: channels };
      save(next);
      return next;
    });
  };

  const pitchInvestors = () => {
    if (!gameState) return;
    const val = calculateValuation(gameState);
    const growth = gameState.quarterlyGrowth[gameState.quarterlyGrowth.length - 1] * 100;
    const score = growth + (gameState.users / 1000) + (calculateDailyRevenue(gameState) / 100);
    const req = gameState.marketCondition === 'Bull' ? 20 : gameState.marketCondition === 'Bear' ? 60 : 40;

    if (score >= req) {
      const offer = Math.floor(val * 0.15);
      if (window.confirm(`Investors offer ${offer.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} for 15% equity. Accept?`)) {
        setGameState(prev => {
          if (!prev) return null;
          const next = { ...prev, cash: prev.cash + offer, equity: prev.equity - 15 };
          save(next);
          return next;
        });
        notify("Funding secured!", "success");
      }
    } else {
      notify("Pitch failed. Metrics are too weak.", "error");
    }
  };

  if (isNewGameOpen || !gameState) {
    return <NewGameModal onStart={startNewGame} currentType={gameState?.startupType || 'SaaS'} currentPath={gameState?.startingPath || 'Bootstrap'} />;
  }

  const revenue = calculateDailyRevenue(gameState);
  const burn = calculateTotalBurn(gameState);
  const net = revenue - burn;
  const valuation = calculateValuation(gameState);

  return (
    <div className="pb-24 max-w-2xl mx-auto min-h-screen">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl text-white font-bold shadow-2xl animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-rose-500' : 'bg-indigo-600'
        }`}>
          {notification.msg}
        </div>
      )}

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Bankrupt</h2>
            <p className="text-slate-500 mb-8">Your startup has run out of runway. The journey ends here.</p>
            <button 
              onClick={() => setIsNewGameOpen(true)}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-indigo-200"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 glass-morphism p-4 flex justify-between items-center shadow-sm">
        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold">
          <i className="fas fa-rocket"></i>
        </div>
        <div className="flex gap-6">
          <StatItem label="Capital" value={gameState.cash.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Market</div>
            <div className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${
              gameState.marketCondition === 'Bull' ? 'bg-emerald-100 text-emerald-700' :
              gameState.marketCondition === 'Bear' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {gameState.marketCondition}
            </div>
          </div>
          <StatItem label="Day" value={gameState.day.toString()} />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white text-center shadow-2xl shadow-indigo-200">
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70 mb-2">{gameState.startupType} VENTURE</div>
              <div className="text-5xl font-black mb-8">Day {gameState.day}</div>
              <button 
                onClick={nextDay}
                className="w-full max-w-xs mx-auto bg-white text-indigo-600 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95"
              >
                Next Day <i className="fas fa-play"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DashboardCard label="Burn Rate" value={`-${burn.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} footer="Daily Expenses" color="text-rose-500" />
              <DashboardCard label="Revenue" value={revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} footer="Recurring Income" color="text-emerald-500" />
              <DashboardCard label="Net Flow" value={`${net >= 0 ? '+' : ''}${net.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`} footer={net >= 0 ? "Profitable" : "Deficit"} color={net >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
              <DashboardCard label="Runway" value={net >= 0 ? 'Infinite' : `${Math.floor(gameState.cash / Math.abs(net))} Days`} footer="Estimated Time" />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-4">Quick Insights</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Users</span>
                  <span className="font-bold">{gameState.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Valuation</span>
                  <span className="font-bold text-indigo-600">{valuation.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Headcount</span>
                  <span className="font-bold">{gameState.team.length} Team</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <SectionHeader title="Talent Management" desc="Recruit specialized talent to scale your operations." />
            <div className="grid grid-cols-2 gap-3">
              <HireButton role="Junior Dev" salary={4000} onClick={() => startHiring('Junior Dev', 4000)} />
              <HireButton role="Senior Dev" salary={8000} onClick={() => startHiring('Senior Dev', 8000)} />
              <HireButton role="Designer" salary={6000} onClick={() => startHiring('Designer', 6000)} />
              <HireButton role="Marketer" salary={5000} onClick={() => startHiring('Marketer', 5000)} />
            </div>

            {gameState.hiringQueue.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase font-black text-slate-400">Recruitment Pipeline</h3>
                {gameState.hiringQueue.map(h => (
                  <div key={h.id} className="bg-indigo-50 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-indigo-900">{h.role}</div>
                      <div className="text-xs text-indigo-400">{h.name} is interviewing...</div>
                    </div>
                    <div className="text-xs font-black text-indigo-600 uppercase">{h.daysRemaining}d</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-black text-slate-400">Current Team ({gameState.team.length})</h3>
              {gameState.team.map(member => (
                <div key={member.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-500 mb-2">{member.role}</div>
                    <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${member.morale}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-500 text-sm">${(member.salary/30).toFixed(0)}/day</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Morale {Math.round(member.morale)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'product' && (
          <div className="space-y-6">
            <SectionHeader title="Product Roadmap" desc="Build new features to unlock revenue streams." />
            <div className="space-y-4">
              {gameState.features.map(feature => (
                <FeatureCard key={feature.id} feature={feature} onStart={() => startDeveloping(feature.id)} teamSize={gameState.team.length} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-6">
            <SectionHeader title="Marketing & Growth" desc="Scale your user base through acquisition channels." />
            <div className="grid gap-4">
              {gameState.marketingChannels.map(channel => (
                <MarketingCard 
                  key={channel.id} 
                  channel={channel} 
                  cash={gameState.cash}
                  onUnlock={() => unlockMarketing(channel.id)}
                  onRun={() => runMarketing(channel.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[3rem] text-white shadow-2xl">
              <div className="text-center mb-8">
                <div className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Valuation</div>
                <div className="text-4xl font-black">${valuation.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-white/10 p-4 rounded-3xl mb-8">
                <div className="text-center">
                  <div className="text-[8px] uppercase font-bold opacity-60">Equity</div>
                  <div className="font-bold">{gameState.equity}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[8px] uppercase font-bold opacity-60">Revenue</div>
                  <div className="font-bold">${revenue.toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[8px] uppercase font-bold opacity-60">Users</div>
                  <div className="font-bold">{gameState.users.toLocaleString()}</div>
                </div>
              </div>
              <button 
                onClick={pitchInvestors}
                className="w-full bg-white text-indigo-600 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Pitch to Investors
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <SectionHeader title="Operations" desc="Manage your venture settings." />
            <div className="space-y-3">
              <button onClick={() => save(gameState)} className="w-full bg-white border border-slate-200 p-5 rounded-3xl font-bold flex items-center justify-between text-slate-700">
                <span>Save Progress</span>
                <i className="fas fa-save text-indigo-500"></i>
              </button>
              <button onClick={() => { if(window.confirm("Start over?")) setIsNewGameOpen(true); }} className="w-full bg-white border border-slate-200 p-5 rounded-3xl font-bold flex items-center justify-between text-slate-700">
                <span>New Venture</span>
                <i className="fas fa-plus text-emerald-500"></i>
              </button>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-rose-50 border border-rose-100 p-5 rounded-3xl font-bold flex items-center justify-between text-rose-600">
                <span>Wipe All Data</span>
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-slate-200 px-6 py-2 flex justify-between z-40 max-w-2xl mx-auto">
        <NavButton active={activeTab === 'dashboard'} icon="fa-chart-pie" onClick={() => setActiveTab('dashboard')} />
        <NavButton active={activeTab === 'team'} icon="fa-user-group" onClick={() => setActiveTab('team')} />
        <NavButton active={activeTab === 'product'} icon="fa-terminal" onClick={() => setActiveTab('product')} />
        <NavButton active={activeTab === 'growth'} icon="fa-bullhorn" onClick={() => setActiveTab('growth')} />
        <NavButton active={activeTab === 'investors'} icon="fa-briefcase" onClick={() => setActiveTab('investors')} />
        <NavButton active={activeTab === 'settings'} icon="fa-cog" onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

// --- SUBCOMPONENTS ---

// Fixed: Added React.FC typing to handle common component props.
const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-right">
    <div className="text-[10px] uppercase font-bold text-slate-400">{label}</div>
    <div className="text-sm font-bold text-slate-900">{value}</div>
  </div>
);

// Fixed: Added React.FC typing.
const DashboardCard: React.FC<{ label: string; value: string; footer: string; color?: string }> = ({ label, value, footer, color = 'text-slate-900' }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-32">
    <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{label}</div>
    <div className={`text-xl font-black ${color}`}>{value}</div>
    <div className="text-[8px] uppercase font-bold text-slate-300 tracking-wider">{footer}</div>
  </div>
);

// Fixed: Added React.FC typing.
const SectionHeader: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div>
    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

// Fixed: Added React.FC typing.
const NavButton: React.FC<{ active: boolean; icon: string; onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
    <i className={`fas ${icon} text-lg`}></i>
  </button>
);

// Fixed: Added React.FC typing.
const HireButton: React.FC<{ role: string; salary: number; onClick: () => void }> = ({ role, salary, onClick }) => (
  <button onClick={onClick} className="bg-white border border-slate-100 p-4 rounded-3xl text-left shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
    <div className="text-xs font-black text-slate-900">{role}</div>
    <div className="text-xs font-bold text-rose-500">${salary}/mo</div>
    <div className="text-[8px] uppercase font-bold text-slate-400 mt-2">Recruit Fee: ${(salary/3).toFixed(0)}</div>
  </button>
);

// Fixed: Added React.FC typing to resolve "Property 'key' does not exist" errors when mapping in lists.
const FeatureCard: React.FC<{ feature: Feature; onStart: () => void; teamSize: number }> = ({ feature, onStart, teamSize }) => {
  const isAvailable = feature.status === 'Available' || feature.status === 'NeedsScale';
  const isDeveloping = feature.status === 'Developing';
  const progress = isDeveloping ? ((feature.cost - feature.remainingCost) / feature.cost) * 100 : 0;

  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm ${feature.status === 'Live' ? 'bg-emerald-50/50 border-emerald-100' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-black text-slate-900">{feature.name}</h3>
          <p className="text-xs text-slate-500">{feature.description}</p>
        </div>
        <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
          feature.status === 'Live' ? 'bg-emerald-500 text-white' : 
          feature.status === 'Developing' ? 'bg-indigo-500 text-white' :
          feature.status === 'NeedsScale' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {feature.status}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] font-bold text-slate-500">
        <div><i className="fas fa-coins text-emerald-500 mr-1"></i> +${feature.revenuePerUser}/user</div>
        <div><i className="fas fa-users text-indigo-500 mr-1"></i> {feature.capacity} cap</div>
      </div>

      {isDeveloping && (
        <div className="space-y-2 mb-4">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-[10px] text-center font-bold text-slate-400 uppercase">{progress.toFixed(0)}% Complete</div>
        </div>
      )}

      {isAvailable && (
        <button 
          onClick={onStart}
          disabled={teamSize === 0}
          className={`w-full py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
            teamSize === 0 ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
          }`}
        >
          {feature.status === 'NeedsScale' ? 'Scale System' : 'Develop Feature'}
          {teamSize === 0 && ' (Hire Team First)'}
        </button>
      )}
    </div>
  );
};

// Fixed: Added React.FC typing to resolve "Property 'key' does not exist" errors when mapping.
const MarketingCard: React.FC<{ channel: MarketingChannel; cash: number; onUnlock: () => void; onRun: () => void }> = ({ channel, cash, onUnlock, onRun }) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="font-black text-slate-900">{channel.name}</div>
        <div className="text-rose-500 font-bold">${channel.cost.toLocaleString()}</div>
      </div>
      <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase mb-4">
        <span>Eff: {channel.effectiveness}x</span>
        <span>Fatigue: {Math.round(channel.fatigue * 100)}%</span>
      </div>
      {channel.unlocked ? (
        <button 
          onClick={onRun}
          disabled={cash < channel.cost}
          className={`w-full py-3 rounded-2xl font-black uppercase text-xs tracking-widest ${
            cash < channel.cost ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white'
          }`}
        >
          Run Campaign
        </button>
      ) : (
        <button 
          onClick={onUnlock}
          disabled={cash < 5000}
          className={`w-full py-3 rounded-2xl font-black uppercase text-xs tracking-widest border-2 border-indigo-100 text-indigo-600 ${
            cash < 5000 ? 'opacity-30' : ''
          }`}
        >
          Unlock ($5k)
        </button>
      )}
    </div>
  );
};

// Fixed: Added React.FC typing.
const NewGameModal: React.FC<{ onStart: (name: string, type: StartupType, path: StartingPath) => void; currentType: StartupType; currentPath: StartingPath }> = ({ onStart, currentType, currentPath }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<StartupType>(currentType);
  const [path, setPath] = useState<StartingPath>(currentPath);

  const marketTypes: StartupType[] = ['SaaS', 'Gaming', 'FinTech', 'E-commerce', 'AI/ML'];
  const paths: { id: StartingPath; name: string; desc: string }[] = [
    { id: 'Bootstrap', name: 'Bootstrap', desc: '$50k, 100% Equity' },
    { id: 'Angel', name: 'Angel', desc: '$100k, 85% Equity' },
    { id: 'VC Pre-Seed', name: 'VC Pre-Seed', desc: '$250k, 70% Equity' },
    { id: 'Bank Loan', name: 'Bank Loan', desc: '$100k, 100% Equity + Debt' },
    { id: 'Accelerator', name: 'Accelerator', desc: '$50k, 93% Equity, +10% Growth' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">New Venture</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Select your destiny</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 px-2">Venture Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HyperSpace"
              className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-bold focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 px-2">Market Segment</label>
            <div className="grid grid-cols-2 gap-2">
              {marketTypes.map(t => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-4 rounded-2xl font-bold text-sm transition-all ${
                    type === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 px-2">Financial Path</label>
            <div className="space-y-2">
              {paths.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setPath(p.id)}
                  className={`w-full p-5 rounded-3xl text-left transition-all border-2 ${
                    path === p.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className={`font-black uppercase text-xs ${path === p.id ? 'text-indigo-600' : 'text-slate-900'}`}>{p.name}</div>
                  <div className="text-xs text-slate-400">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onStart(name, type, path)}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-indigo-100"
          >
            Launch Startup
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
