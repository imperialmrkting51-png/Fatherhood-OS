import { useState, useEffect } from 'react';

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  faithMode: "none" | "christian" | "muslim" | "jewish" | "spiritual";
  completedQuests: string[];
}

const defaultState: GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  faithMode: "none",
  completedQuests: [],
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('fatherhood_os_state');
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('fatherhood_os_state', JSON.stringify(gameState));
  }, [gameState]);

  const addXP = (amount: number) => {
    setGameState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      if (newXp >= 100) {
        newLevel += Math.floor(newXp / 100);
        newXp = newXp % 100;
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const updateState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return { gameState, addXP, updateState };
}
