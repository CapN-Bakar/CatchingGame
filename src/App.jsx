import { useState, useEffect, useRef } from "react";
import "./App.css";

export default function FallingSignsGame() {
  const [fallingObjects, setFallingObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [enteredName, setEnteredName] = useState("");

  const playerRef = useRef(null);
  const gameContainerRef = useRef(null);
  const playerPositionRef = useRef(50);
  const animationFrameRef = useRef(null);

  const playerWidth = 75;
  const playerHeight = 75;
  const objectSize = 60;

  // Smooth mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gameStarted || gameOver || !gameContainerRef.current) return;

      const gameContainer = gameContainerRef.current;
      const containerRect = gameContainer.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;

      const newPosition = Math.max(
        0,
        Math.min(mouseX, containerRect.width - playerWidth)
      );
      playerPositionRef.current = newPosition;

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(() => {
          if (playerRef.current) {
            playerRef.current.style.left = `${playerPositionRef.current}px`;
          }
          animationFrameRef.current = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameStarted, gameOver]);

  // Spawn falling objects
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setFallingObjects((prev) => [
        ...prev,
        {
          id: Math.random(),
          left: Math.random() * (window.innerWidth - objectSize),
          top: 0,
          type: Math.random() > 0.5 ? "bad" : "good",
        },
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Move objects and check for collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setFallingObjects((prevObjects) => {
        return prevObjects
          .map((obj) => ({ ...obj, top: obj.top + 5 }))
          .filter((obj) => {
            const gameContainerHeight =
              gameContainerRef.current?.clientHeight || window.innerHeight;
            const playerY = gameContainerHeight - playerHeight;

            const objectBottom = obj.top + objectSize;
            const fullyOverlapping =
              objectBottom >= playerY && obj.top <= gameContainerHeight;

            const horizontallyAligned =
              obj.left + objectSize > playerPositionRef.current &&
              obj.left < playerPositionRef.current + playerWidth;

            if (fullyOverlapping && horizontallyAligned) {
              if (obj.type === "bad") {
                setGameOver(true);
              } else {
                setScore((prev) => prev + 5);
              }
              return false;
            }

            return obj.top < gameContainerHeight;
          });
      });
    }, 20);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) setGameOver(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    if (!playerName.trim()) return; // Prevent start if name is empty

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setFallingObjects([]);
    setEnteredName(playerName); // Save the entered name
  };

  return (
    <div className="game-container" ref={gameContainerRef}>
      {!gameStarted ? (
        <div className="start-screen">
          <h1>Catching Signs</h1>
          <input
            type="text"
            placeholder="Enter X handle..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <>
          <h1>Catching Signs</h1>
          <h2>
            Score: {score} | Time: {timeLeft}s
          </h2>
          {gameOver && (
            <h2 className="game-over">
              🎉 Congrats, {enteredName}! You caught {score} signs! 🎉
            </h2>
          )}

          <img
            ref={playerRef}
            src="/XinYan.png"
            className="player"
            style={{ left: `${playerPositionRef.current}px` }}
            alt="Player"
          />

          {fallingObjects.map((obj) => (
            <img
              key={obj.id}
              className="falling-object"
              src={obj.type === "bad" ? "/vite.svg" : "/signlogo.jpg"}
              style={{ left: `${obj.left}px`, top: `${obj.top}px` }}
              alt={obj.type}
            />
          ))}

          {gameOver && <button onClick={startGame}>Restart</button>}
        </>
      )}
    </div>
  );
}
