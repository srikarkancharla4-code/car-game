(() => {
  const KEY = 'neonStreetRacer.save.v1';
  const catalog = [
    { id: 'volt', name: 'VOLT GT', price: 0, color: 0x28d9d1, stats: [72, 68, 73, 65, 58] },
    { id: 'rivet', name: 'RIVET R', price: 1800, color: 0xff694f, stats: [78, 73, 62, 69, 61] },
    { id: 'spectre', name: 'SPECTRE S', price: 5200, color: 0x9a80ff, stats: [88, 85, 76, 73, 75] },
    { id: 'apex', name: 'APEX X', price: 12000, color: 0xffcf67, stats: [96, 92, 83, 81, 89] },
    { id: 'formula', name: 'FORMULA N', price: 19000, color: 0xf2f4fa, stats: [91, 88, 94, 91, 84] },
    { id: 'future', name: 'NOVA ZERO', price: 30000, color: 0x6eaaff, stats: [99, 97, 89, 88, 96] }
  ];
  const missions = [
    { id: 'distance', name: 'City limits', desc: 'Drive 5 km', goal: 5, key: 'distance', reward: 250 },
    { id: 'speed', name: 'Redline', desc: 'Hit 200 km/h', goal: 200, key: 'speed', reward: 180 },
    { id: 'near', name: 'Close call', desc: 'Perform 10 near misses', goal: 10, key: 'nearMisses', reward: 350 },
    { id: 'coins', name: 'Pocket change', desc: 'Collect 500 credits', goal: 500, key: 'coins', reward: 200 },
    { id: 'nitro', name: 'Afterburner', desc: 'Use nitro 20 times', goal: 20, key: 'nitroUses', reward: 300 },
    { id: 'clean', name: 'Clean getaway', desc: 'Finish a run without crashing', goal: 1, key: 'cleanRuns', reward: 500 }
  ];
  const defaults = () => ({ coins: 1250, xp: 0, level: 1, best: 0, totalDistance: 0, totalNearMisses: 0, totalRuns: 0, totalCoins: 0, owned: ['volt'], selected: 'volt', paint: {}, upgrades: {}, claimed: [], achievements: [], leaderboard: [], lastDaily: '', settings: { quality: 'HIGH', volume: 0.35, weather: 'clear', environment: 'city', nickname: 'DRIVER' } });
  let data;
  try { data = { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { data = defaults(); }
  data.settings = { ...defaults().settings, ...(data.settings || {}) };
  data.owned ||= ['volt']; data.claimed ||= []; data.achievements ||= []; data.leaderboard ||= [];
  function save() { localStorage.setItem(KEY, JSON.stringify(data)); }
  function levelFor(xp) { return Math.floor(Math.sqrt(xp / 150)) + 1; }
  function addXP(amount) { data.xp += amount; const before = data.level; data.level = levelFor(data.xp); save(); return data.level > before; }
  function addCoins(amount) { data.coins += amount; data.totalCoins += amount; save(); }
  function buyCar(id) { const car = catalog.find(c => c.id === id); if (!car || data.owned.includes(id) || data.coins < car.price) return false; data.coins -= car.price; data.owned.push(id); save(); return true; }
  function buyUpgrade(type) { const level = data.upgrades[type] || 0; const cost = 250 + level * 350; if (level >= 5 || data.coins < cost) return false; data.coins -= cost; data.upgrades[type] = level + 1; save(); return true; }
  function awardRun(run) {
    data.totalRuns++; data.totalDistance += run.distance; data.totalNearMisses += run.nearMisses; addCoins(run.coins);
    data.best = Math.max(data.best, Math.floor(run.score));
    const levelUp = addXP(Math.floor(run.score / 20) + Math.floor(run.distance * 2));
    const values = { distance: data.totalDistance, speed: run.topSpeed, nearMisses: data.totalNearMisses, coins: data.totalCoins, nitroUses: run.nitroUses, cleanRuns: run.crashed ? 0 : 1 };
    for (const mission of missions) if (!data.claimed.includes(mission.id) && values[mission.key] >= mission.goal) { data.claimed.push(mission.id); addCoins(mission.reward); }
    const checks = [data.totalRuns > 0, run.topSpeed >= 200, data.totalNearMisses >= 10, data.totalDistance >= 50, data.totalCoins >= 10000, run.nitroUses >= 20, !run.crashed];
    const ids = ['first-race', 'speed-demon', 'near-miss', 'highway-king', 'millionaire', 'nitro-addict', 'perfect-driver'];
    checks.forEach((met, index) => { if (met && !data.achievements.includes(ids[index])) data.achievements.push(ids[index]); });
    data.leaderboard.push({ name: data.settings.nickname || 'DRIVER', score: Math.floor(run.score), distance: Number(run.distance.toFixed(2)), date: Date.now() });
    data.leaderboard.sort((a, b) => b.score - a.score); data.leaderboard = data.leaderboard.slice(0, 10);
    save(); return { levelUp, level: data.level, xp: Math.floor(run.score / 20) + Math.floor(run.distance * 2) };
  }
  window.NSRStore = { data, catalog, missions, save, addXP, addCoins, buyCar, buyUpgrade, awardRun };
})();
