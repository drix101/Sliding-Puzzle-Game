import usePuzzleStore  from '../store/usePuzzleStore';
import Tile from './Tile';
import './Board.css';
import { useEffect, useRef } from 'react';


function Confetti({ show }) {
  const canvasRef = useRef();
  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 400;
    const H = canvas.height = 200;
    let particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 6 + 4,
      d: Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      tilt: Math.random() * 10 - 10
    }));
    let angle = 0;
    let animationFrame;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      angle += 0.01;
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.ellipse(p.x, p.y, p.r, p.r / 2, p.tilt, 0, 2 * Math.PI);
        ctx.fill();
        p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
        p.x += Math.sin(angle) * 2;
        if (p.y > H) {
          p.x = Math.random() * W;
          p.y = -10;
        }
      }
      animationFrame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [show]);
  return show ? (
    <canvas ref={canvasRef} style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', top: 0, pointerEvents: 'none', zIndex: 10 }} width={400} height={200} />
  ) : null;
}

const Board = () => {
  const {
    tiles,
    moveTile,
    reset,
    moves,
    time,
    isSolved,
    leaderboard,
    timerActive,
    startTimer,
    stopTimer,
  } = usePuzzleStore();

  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current && moves === 0 && !timerActive) {
      // Not started yet
      return;
    }
    if (!hasStarted.current && moves > 0 && !timerActive) {
      startTimer();
      hasStarted.current = true;
    }
  }, [moves, timerActive, startTimer]);

  // Stop timer when solved
  useEffect(() => {
    if (isSolved && timerActive) {
      stopTimer();
    }
  }, [isSolved, timerActive, stopTimer]);

  // Reset hasStarted ref on reset
  useEffect(() => {
    if (moves === 0 && time === 0 && !timerActive) {
      hasStarted.current = false;
    }
  }, [moves, time, timerActive]);

  const safeLeaderboard = leaderboard || [];

  return (
    <div className="game-wrapper" style={{ position: 'relative' }}>
      <Confetti show={isSolved} />
      <div className="puzzle-box">
        <h2>Sliding Puzzle</h2>
        <div style={{ marginBottom: 10 }}>
          <span>Moves: {moves} </span>
          <span style={{ marginLeft: 20 }}>Time: {time}s</span>
        </div>
        <div className="board">
          {tiles.map((value, index) => (
            <Tile key={index} value={value} onClick={() => moveTile(index)} />
          ))}
        </div>
        <button onClick={reset}>Reset</button>
        {isSolved && (
          <div style={{ marginTop: 20, color: 'green', fontWeight: 'bold', fontSize: 24 }}>
            🎉 Congratulations! You solved the puzzle!
          </div>
        )}
        <div style={{ marginTop: 30 }}>
          <h3>Leaderboard</h3>
          <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0 10px' }}>#</th>
                <th style={{ padding: '0 10px' }}>Moves</th>
                <th style={{ padding: '0 10px' }}>Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {safeLeaderboard.length === 0 && (
                <tr><td colSpan={3}>No scores yet</td></tr>
              )}
              {safeLeaderboard.map((score, i) => (
                <tr key={i}>
                  <td style={{ padding: '0 10px' }}>{i + 1}</td>
                  <td style={{ padding: '0 10px' }}>{score.moves}</td>
                  <td style={{ padding: '0 10px' }}>{score.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Board;
