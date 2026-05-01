import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('arcade_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Check if we have persistent stats for this user
    const statsKey = `arcade_stats_${userData.name.toLowerCase()}`;
    const savedStats = localStorage.getItem(statsKey);
    
    let userWithStats;
    if (savedStats) {
      userWithStats = { ...userData, ...JSON.parse(savedStats) };
    } else {
      userWithStats = {
        ...userData,
        joinedAt: Date.now(),
        totalPlayTime: 0,
        matchesPlayed: 0,
        mostPlayed: 'None',
        level: 1,
        xp: 0,
        recentBattles: []
      };
      localStorage.setItem(statsKey, JSON.stringify(userWithStats));
    }

    setUser(userWithStats);
    localStorage.setItem('arcade_user', JSON.stringify(userWithStats));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arcade_user');
  };

  // --- Background Playtime Tracking ---
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      setUser(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          totalPlayTime: (prev.totalPlayTime || 0) + 1
        };
        const statsKey = `arcade_stats_${prev.name.toLowerCase()}`;
        localStorage.setItem(statsKey, JSON.stringify(updated));
        localStorage.setItem('arcade_user', JSON.stringify(updated));
        return updated;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.name]); // Re-run if user changes

  const recordMatch = (gameName, result, xpGained) => {
    console.log(`[Arcade] Recording match: ${gameName} - ${result}`);
    setUser(prev => {
      if (!prev) {
        console.warn("[Arcade] No user found, cannot record match.");
        return null;
      }
      
      const isWin = result.toLowerCase() === 'win';
      const actualXp = xpGained || (isWin ? 150 : 20);
      
      const newXp = (prev.xp || 0) + actualXp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      const newBattle = {
        game: gameName,
        result: result,
        reward: `+${actualXp} XP`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        opponent: 'Arena_Bot'
      };

      const updated = {
        ...prev,
        matchesPlayed: (prev.matchesPlayed || 0) + 1,
        xp: newXp,
        level: newLevel,
        recentBattles: [newBattle, ...(prev.recentBattles || [])].slice(0, 5)
      };

      const statsKey = `arcade_stats_${prev.name.toLowerCase()}`;
      localStorage.setItem(statsKey, JSON.stringify(updated));
      localStorage.setItem('arcade_user', JSON.stringify(updated));
      console.log("[Arcade] Stats updated successfully.");
      return updated;
    });
  };

  const clearHistory = () => {
    setUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        matchesPlayed: 0,
        xp: 0,
        level: 1,
        totalPlayTime: 0,
        recentBattles: []
      };
      const statsKey = `arcade_stats_${prev.name.toLowerCase()}`;
      localStorage.setItem(statsKey, JSON.stringify(updated));
      localStorage.setItem('arcade_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, recordMatch, clearHistory, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
