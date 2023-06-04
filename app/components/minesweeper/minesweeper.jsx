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
	// So a ratio of 16/100 bomb sqaures
	//
	// I'm going 8x8/10 as it's a little more casual. More fun for a portfolio,
	//
	const initialGameState = {
		width: 8,
		height: 8,
		bombs: 4, // I find bombs easier to see in code 
		flagsLeft: 4, // bombs and flagsLeft should be the same
		result: "waiting", // "waiting", "playing", "win", "lose"
		board: []
	}

	// initialise board
	const initialiseGameState = (startingState) => {
		let gameState = startingState
		gameState.board = newBoard(startingState)
		return gameState
	}

	//
	// All the shared state lives here
	//
	const [gameState, setGameState] = useState(initialiseGameState(initialGameState))
	const [scaredFace, setScaredFace] = useState(false)
	const timeTaken = useCounter(0) // { count, setCount, increment, decrement, reset } 
	const [isExploding, setIsExploding] = useState(false);

	const resetGame = () => {
		setGameState(initialiseGameState(initialGameState))
		timeTaken.reset()
		setIsExploding(false)
	}

	const doOnTick = () => {
		if (gameState.result === "playing")
			timeTaken.increment()
	}

	useTimer(doOnTick, [gameState.result, timeTaken])

	return (
		<>
			<Window
				gameState={gameState}
				timeTaken={timeTaken.count}
				resetGame={resetGame}
				scaredFace={scaredFace}
				isExploding={isExploding}
			>
				<Board
					gameState={gameState}
					setGameState={setGameState}
					setScaredFace={setScaredFace}
					setIsExploding={setIsExploding}
				/>
			</Window>
		</>
	);
}