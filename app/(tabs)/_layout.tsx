import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default function App() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<"player" | "computer" | null>(null);
  const [autoRestart, setAutoRestart] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Helper function to check winner without setting state
  const checkWinnerForBoard = (board: (string | null)[]): string | null => {
    for (let [a, b, c] of WINNING_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (!board.includes(null)) return "Draw";
    return null;
  };

  // Effect for computer move
  useEffect(() => {
    // Computer AI - simple strategy
    const getComputerMove = (currentBoard: (string | null)[]): number => {
      // First, try to win
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          const testBoard = [...currentBoard];
          testBoard[i] = "O";
          if (checkWinnerForBoard(testBoard) === "O") {
            return i;
          }
        }
      }

      // Second, try to block player from winning
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          const testBoard = [...currentBoard];
          testBoard[i] = "X";
          if (checkWinnerForBoard(testBoard) === "X") {
            return i;
          }
        }
      }

      // Third, take center if available
      if (!currentBoard[4]) return 4;

      // Fourth, take corners
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter((i) => !currentBoard[i]);
      if (availableCorners.length > 0) {
        return availableCorners[
          Math.floor(Math.random() * availableCorners.length)
        ];
      }

      // Finally, take any available space
      const availableSpaces = currentBoard
        .map((cell, index) => (cell === null ? index : null))
        .filter((val) => val !== null) as number[];

      return availableSpaces[
        Math.floor(Math.random() * availableSpaces.length)
      ];
    };

    if (gameMode === "computer" && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(board);
        if (computerMove !== undefined) {
          const newBoard = [...board];
          newBoard[computerMove] = "O";
          setBoard(newBoard);
          setXIsNext(true);
          checkWinner(newBoard);
        }
      }, 300); // Small delay to make it feel more natural

      return () => clearTimeout(timer);
    }
  }, [board, xIsNext, winner, gameMode]);

  // Auto-restart effect
  useEffect(() => {
    if (winner && autoRestart) {
      setCountdown(3);
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimer);
            // Auto restart the game
            setBoard(Array(9).fill(null));
            setXIsNext(true);
            setWinner(null);
            setCountdown(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [winner, autoRestart]);

  const handlePress = (index: number) => {
    if (board[index] || winner) return;

    // In computer mode, only allow player (X) moves
    if (gameMode === "computer" && !xIsNext) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    checkWinner(newBoard);
  };

  const checkWinner = (newBoard: (string | null)[]) => {
    for (let [a, b, c] of WINNING_COMBOS) {
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        setWinner(newBoard[a]);
        return;
      }
    }
    if (!newBoard.includes(null)) setWinner("Draw");
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setCountdown(null);
  };

  const startNewGame = (mode: "player" | "computer") => {
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setCountdown(null);
  };

  const backToMenu = () => {
    setGameMode(null);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setCountdown(null);
  };

  const toggleAutoRestart = () => {
    setAutoRestart(!autoRestart);
    if (countdown !== null) {
      setCountdown(null);
    }
  };

  const renderSquare = (index: number) => (
    <TouchableOpacity style={styles.square} onPress={() => handlePress(index)}>
      <Text style={styles.squareText}>{board[index]}</Text>
    </TouchableOpacity>
  );

  // Game mode selection screen
  if (gameMode === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Text style={styles.subtitle}>Choose Game Mode</Text>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => startNewGame("player")}
        >
          <Text style={styles.modeButtonText}>Player vs Player</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => startNewGame("computer")}
        >
          <Text style={styles.modeButtonText}>Player vs Computer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <Text style={styles.gameMode}>
        {gameMode === "computer" ? "Player vs Computer" : "Player vs Player"}
      </Text>
      <View style={styles.board}>
        {board.map((_, idx) => renderSquare(idx))}
      </View>
      <Text style={styles.status}>
        {winner
          ? countdown !== null
            ? `${
                winner === "Draw" ? "It's a Draw!" : `Winner: ${winner}`
              } - New game in ${countdown}...`
            : winner === "Draw"
            ? "It's a Draw!"
            : `Winner: ${winner}`
          : gameMode === "computer"
          ? xIsNext
            ? "Your turn (X)"
            : "Computer thinking..."
          : `Next: ${xIsNext ? "X" : "O"}`}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>Reset Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.autoRestartButton,
            autoRestart ? styles.autoRestartActive : styles.autoRestartInactive,
          ]}
          onPress={toggleAutoRestart}
        >
          <Text style={styles.resetText}>
            {autoRestart ? "Auto: ON" : "Auto: OFF"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={backToMenu}>
          <Text style={styles.resetText}>Main Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 40,
  },
  gameMode: {
    fontSize: 18,
    color: "#00ffff",
    marginBottom: 20,
  },
  modeButton: {
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: "#007bff",
    borderRadius: 10,
    minWidth: 200,
    alignItems: "center",
  },
  modeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 2,
    borderColor: "#444",
    borderRadius: 10,
  },
  square: {
    width: "33.33%",
    height: "33.33%",
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
  },
  squareText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#00ffff",
  },
  status: {
    fontSize: 24,
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  autoRestartButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  autoRestartActive: {
    backgroundColor: "#28a745",
  },
  autoRestartInactive: {
    backgroundColor: "#6c757d",
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fd7e14",
    borderRadius: 8,
  },
  resetText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
});
