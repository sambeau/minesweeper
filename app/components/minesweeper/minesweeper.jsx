import { useState } from "react";
import { useCounter } from 'usehooks-ts'

import { useTimer } from "~/utils/timer"
import { Window, links as windowLinks } from "./window/window";
import { Board, newBoard, links as boardLinks } from "./board/board";

import styles from "./minesweeper.css";

export function links() {
	return [...windowLinks(), ...boardLinks(), { rel: "stylesheet", href: styles }];
}

//
// All shared state lives here, it should probably be a context, but for now I'm passing it around
// 

export function Minesweeper() {
	//
	// Beginner (8x8, 10 mines), Intermediate (16x16, 40 mines) and Expert (24x24, 99 mines)
	//
	const initialGameState = {
		width: 8,
		height: 8,
		bombs: 4,
		flagsLeft: 4, // bombs and flagsLeft should be the same
		result: "playing" // "playing", "win", "lose"
	}

	// All the shared state. I might combine game and board them to make joint updates easier
	//
	const [gameState, setGameState] = useState(initialGameState)
	const [board, setBoard] = useState(newBoard(gameState))
	const [scaredFace, setScaredFace] = useState(false)
	const timeTaken = useCounter(0) // { count, setCount, increment, decrement, reset } 

	const doOnTick = () => {
		if (gameState.result === "playing")
			timeTaken.increment()
	}
	useTimer(doOnTick, [gameState.result, timeTaken])

	const resetGame = () => {
		console.log('reset!')
		setBoard(newBoard(gameState))
		setGameState(initialGameState)
		timeTaken.reset()
	}

	return (
		<>
			<Window
				gameState={gameState}
				timeTaken={timeTaken.count}
				resetGame={resetGame}
				scaredFace={scaredFace}
			>
				<Board
					gameState={gameState}
					setGameState={setGameState}
					board={board}
					setBoard={setBoard}
					setScaredFace={setScaredFace}
				/>
			</Window>
		</>
	);
}