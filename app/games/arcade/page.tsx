"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

export default function NeonSnake() {
  const router = useRouter();
  
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 }); // Moving UP initially
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Generate random food coordinates
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on the snake
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setNextDirection({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setIsStarted(true);
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/games');
      
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isStarted && e.key === 'Enter') {
        resetGame();
        return;
      }
      
      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }

      // Update next direction, preventing 180-degree self-collisions
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, isStarted, router]);

  // The Game Loop
  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y };
        setDirection(nextDirection);

        // Check Wall Collisions
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        // Check Self Collisions
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          // Don't pop the tail, so the snake grows!
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    // Increase speed slightly as score goes up, capping at 50ms
    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 30) * 10);
    const gameInterval = setInterval(moveSnake, speed);
    
    return () => clearInterval(gameInterval);
  }, [nextDirection, food, isStarted, gameOver, generateFood, score]);

  const handleGameOver = () => {
    setGameOver(true);
    setHighScore(prev => Math.max(prev, score));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-6 z-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">NEON SNAKE</h1>
          <p className="text-emerald-400 text-xs font-mono mt-1">MODULE_02: ARCADE CLASSIC</p>
        </div>
        
        <div className="flex gap-8 text-right font-mono">
          <div>
            <p className="text-slate-400 text-xs">SCORE</p>
            <p className="text-2xl text-emerald-400 font-bold">{score.toString().padStart(4, '0')}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">HIGH SCORE</p>
            <p className="text-2xl text-purple-400 font-bold">{highScore.toString().padStart(4, '0')}</p>
          </div>
        </div>
      </div>

      {/* Game Board Container (Glassmorphism) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl z-10 relative">
        
        {/* The Grid */}
        <div 
          className="relative bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
          style={{ width: `${GRID_SIZE * 20}px`, height: `${GRID_SIZE * 20}px` }}
        >
          {/* Render Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={index}
                className={`absolute rounded-sm transition-all duration-75 ${
                  isHead 
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-10' 
                    : 'bg-emerald-500/70 border border-emerald-900/50'
                }`}
                style={{
                  width: '18px',
                  height: '18px',
                  left: `${segment.x * 20 + 1}px`,
                  top: `${segment.y * 20 + 1}px`,
                }}
              />
            );
          })}

          {/* Render Food */}
          <div
            className="absolute bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse"
            style={{
              width: '16px',
              height: '16px',
              left: `${food.x * 20 + 2}px`,
              top: `${food.y * 20 + 2}px`,
            }}
          />

          {/* Overlays */}
          {!isStarted && !gameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center flex-col text-white font-mono">
              <p className="text-emerald-400 text-xl font-bold mb-4 animate-pulse">PRESS ENTER TO START</p>
              <p className="text-xs text-slate-400">USE ARROW KEYS OR WASD</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center flex-col text-white font-mono">
              <h2 className="text-4xl font-bold text-red-500 mb-2 shadow-red-500/50 drop-shadow-lg">SYSTEM FAILURE</h2>
              <p className="text-xl mb-6 text-red-200">FINAL SCORE: {score}</p>
              <button 
                onClick={resetGame}
                className="px-6 py-3 bg-red-500/20 border border-red-500 rounded text-red-100 hover:bg-red-500 hover:text-white transition-all font-bold tracking-widest uppercase"
              >
                REBOOT SEQUENCE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-2xl flex justify-between items-center mt-6 text-xs text-slate-400 font-mono z-10">
        <p>ESC = RETURN TO DIRECTORY</p>
        <button onClick={() => router.push('/games')} className="hover:text-emerald-400 transition-colors border border-slate-700 px-4 py-1 rounded-full bg-slate-800">
          DISCONNECT
        </button>
      </div>

    </div>
  );
}