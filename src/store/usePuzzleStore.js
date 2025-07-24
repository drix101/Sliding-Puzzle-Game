import { create } from 'zustand';

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

const generateTiles = () => {
  const arr = [...Array(15).keys()].map(n => n + 1).concat(null);
  return shuffleArray(arr);
};

const LEADERBOARD_KEY = 'sliding-puzzle-leaderboard';

function loadLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(leaderboard) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch {}
}

export const usePuzzleStore = create((set, get) => ({
  tiles: generateTiles(),
  moves: 0,
  time: 0,
  timerActive: false,
  timerInterval: null,
  isSolved: false,
  leaderboard: loadLeaderboard(),
  moveTile: (index) => set((state) => {
    const emptyIndex = state.tiles.indexOf(null);
    const validMoves = [index - 1, index + 1, index - 4, index + 4];

    if (!validMoves.includes(emptyIndex)) return state;

    const newTiles = [...state.tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

    // Check if solved
    const solved = newTiles.every((val, i) =>
      i === 15 ? val === null : val === i + 1
    );

    let newLeaderboard = state.leaderboard;
    // If just solved and wasn't solved before, add to leaderboard
    if (solved && !state.isSolved) {
      newLeaderboard = [
        ...state.leaderboard,
        { moves: state.moves + 1, time: state.time }
      ];
      saveLeaderboard(newLeaderboard);
    }

    return { tiles: newTiles, moves: state.moves + 1, isSolved: solved, leaderboard: newLeaderboard };
  }),
  reset: () => {
    if (get().timerInterval) {
      clearInterval(get().timerInterval);
    }
    const newTiles = generateTiles();
    // Check if solved
    const solved = newTiles.every((val, i) =>
      i === 15 ? val === null : val === i + 1
    );
    set({
      tiles: newTiles,
      moves: 0,
      time: 0,
      timerActive: false,
      timerInterval: null,
      isSolved: solved,
      // Do not clear leaderboard on reset
    });
  },
  startTimer: () => {
    if (!get().timerActive) {
      const interval = setInterval(() => {
        set((state) => ({ time: state.time + 1 }));
      }, 1000);
      set({ timerActive: true, timerInterval: interval });
    }
  },
  stopTimer: () => {
    if (get().timerInterval) {
      clearInterval(get().timerInterval);
      set({ timerActive: false, timerInterval: null });
    }
  },
}));


export default usePuzzleStore;
