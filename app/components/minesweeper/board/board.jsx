// board

import styles from "./board.css";

import emptyTile from "./images/empty.png"
import bombTile from "./images/bomb.png"
import craterTile from "./images/bomb-exploded.png"
import hiddenTile from "./images/hidden.png"
import flagTile from "./images/flag.png"
import wrongBombTile from "./images/bomb-wrong.png"

import s1Tile from "./images/s1.png"
import s2Tile from "./images/s2.png"
import s3Tile from "./images/s3.png"
import s4Tile from "./images/s4.png"
import s5Tile from "./images/s5.png"
import s6Tile from "./images/s6.png"
import s7Tile from "./images/s7.png"
import s8Tile from "./images/s8.png"

const scoreTiles = [
	emptyTile,
	s1Tile,
	s2Tile,
	s3Tile,
	s4Tile,
	s5Tile,
	s6Tile,
	s7Tile,
	s8Tile,
]

export function links() {
	return [{ rel: "stylesheet", href: styles }];
}


export function newBoard(gameState) {
	const width = gameState.width;
	const height = gameState.height;
	const bombs = gameState.bombs
	let board = []

	const countMines = (h, w) => {
		let mines = 0;

		const isBomb = (h, w) => board[h].squares[w].contents === "BOMB"
		const mineIn = (h, w) => {
			if ((h < 0) || (h > height - 1)) return 0
			if ((w < 0) || (w > width - 1)) return 0
			return isBomb(h, w) ? 1 : 0
		}

		mines += mineIn(h - 1, w - 1) + mineIn(h - 1, w) + mineIn(h - 1, w + 1)
		mines += mineIn(h, w - 1) + 0 + mineIn(h, w + 1)
		mines += mineIn(h + 1, w - 1) + mineIn(h + 1, w) + mineIn(h + 1, w + 1)

		return mines
	}

	// initialise board
	for (let h = 0; h < height; h++) {
		board[h] = { id: h, squares: [] }
		for (let w = 0; w < width; w++) {
			board[h].squares[w] = {
				id: h + "_" + w,
				coords: { h: h, w: w },
				contents: "EMPTY", // "EMPTY", "BOMB", 'WRONG' or "CRATER"
				state: "HIDDEN", // "HIDDEN", "FLAGGED", "SEEN"
			}
		}
	}

	// randomly place bombs 
	let bombsleft = bombs;
	while (bombsleft > 0) {
		const w = Math.floor(Math.random() * width)
		const h = Math.floor(Math.random() * height)
		if (board[h].squares[w].contents === "BOMB") continue; // choose again
		board[h].squares[w].contents = "BOMB"
		bombsleft = bombsleft - 1
	}

	// calculate scores
	for (let h = 0; h < height; h++) {
		for (let w = 0; w < width; w++) {
			board[h].squares[w].score = countMines(h, w)
		}
	}

	return board
}

function plantFlag(h, w, gameState, setGameState) {

	// have we already checked this square?
	if (gameState.board[h].squares[w].state === "SEEN") return;

	setGameState(prevState => {
		// update game state to account for the flag
		gameState = JSON.parse(JSON.stringify(prevState))

		// flagging has more to it than first appears :-
		//
		// 1) You only get as mang flags as there are bombs.
		// 2) We can only flag if we have a flag left
		// 3) If we remove a flag, we get to use it again
		// 4) Once we place our final flag, we need to check if we've won the game

		if (gameState.board[h].squares[w].state === "FLAGGED") {
			// if (prevState.flagsLeft < prevState.bombs)
			gameState.board[h].squares[w].state = "HIDDEN"
			gameState.flagsLeft = prevState.flagsLeft + 1
		} else {
			/* not flagged */
			if (prevState.flagsLeft > 0) {
				gameState.board[h].squares[w].state = "FLAGGED"
				gameState.flagsLeft = prevState.flagsLeft - 1

				if (gameState.flagsLeft === 0) {
					console.log("Checking flags to see if won…")
					//check if you've won!
					let correctFlags = 0;
					for (let h = 0; h < gameState.height; h++) {
						for (let w = 0; w < gameState.width; w++) {

							if (gameState.board[h].squares[w].state === "FLAGGED") { // state hasn't updated yet
								//TODO: DEAL WITH LAST HIDDEN
								if (gameState.board[h].squares[w].contents === "BOMB") {
									correctFlags = correctFlags + 1
								}

							}
						}
					}

					console.log(correctFlags, "flags, ", prevState.bombs, "bombs")
					if (correctFlags === prevState.bombs) {
						gameState.result = "win"
						// reveal all the hidden squares
						for (let h = 0; h < gameState.height; h++)
							for (let w = 0; w < gameState.width; w++)
								if ((gameState.board[h].squares[w].state === "HIDDEN")
									|| (gameState.board[h].squares[w].state === "BOMB"))
									gameState.board[h].squares[w].state = "SEEN"
					}
				}
			}
		}
		return gameState
	})

}

function clickSquare(h, w, gameState, setGameState) {
	console.log("click!")
	// is this square offf the board?
	if ((h < 0) || (h >= gameState.height)) return
	if ((w < 0) || (w >= gameState.width)) return
	// Is this square already open?
	if (gameState.board[h].squares[w].state !== "HIDDEN") return;
	// have we already checked this square?
	if (gameState.board[h].squares[w].state === "SEEN") return;
	// have we already flagged this square?
	if (gameState.board[h].squares[w].state === "FLAGGED") return;

	// okay, it's valid, so open it
	// let newBoard = JSON.parse(JSON.stringify(board)
	setGameState(prevGameState => {

		gameState = JSON.parse(JSON.stringify(prevGameState))
		gameState.board[h].squares[w].state = "SEEN"

		if (gameState.board[h].squares[w].contents === "BOMB") {

			// BOOM!
			gameState.board[h].squares[w].contents = "CRATER"
			gameState.result = "lose"

			for (let h = 0; h < gameState.height; h++) {
				for (let w = 0; w < gameState.width; w++) {

					if ((prevGameState.board[h].squares[w].state === "FLAGGED")
						&& (prevGameState.board[h].squares[w].contents !== "BOMB")) {
						gameState.board[h].squares[w].contents = "WRONG"
					}

					if (prevGameState.board[h].squares[w].state === "FLAGGED"
						|| prevGameState.board[h].squares[w].state === "HIDDEN") {
						gameState.board[h].squares[w].state = "SEEN"
					}
				}
			}
		}
		return gameState;
	})

	// shouldn't happen outside of testing, but shrug
	if (gameState.board[h].squares[w].contents === "CRATER") return
	// here's where we check for a bomb
	// so we'll need a game state passed in to end the game
	if (gameState.board[h].squares[w].contents === "BOMB") return

	// if this square is next to a mine, stop
	if (gameState.board[h].squares[w].score != 0) return

	// okay, this is a blank square, 
	// so we get to open all the neighbours, too

	// wait for a tick to allow the store to update.
	// if we don't it will overflow the stack
	requestAnimationFrame(() => {
		clickSquare(h - 1, w - 1, gameState, setGameState)
		clickSquare(h - 1, w, gameState, setGameState)
		clickSquare(h - 1, w + 1, gameState, setGameState)

		clickSquare(h, w - 1, gameState, setGameState)
		clickSquare(h, w + 1, gameState, setGameState)

		clickSquare(h + 1, w - 1, gameState, setGameState)
		clickSquare(h + 1, w, gameState, setGameState)
		clickSquare(h + 1, w + 1, gameState, setGameState)
	})
}

function Square({ square, gameState, setGameState, setScaredFace }) {
	// console.log(square)
	let tile;
	let classes = "square"
	const { w, h } = square.coords
	if ((square.state === "HIDDEN") || (square.state === "FLAGGED")) {
		if (square.state === "FLAGGED")
			tile = flagTile
		else {
			tile = hiddenTile;
			classes += " clickable"
		}
		return < div className={classes}
			onClick={(e) => {
				clickSquare(h, w, gameState, setGameState)
				e.preventDefault()
			}}
			onContextMenu={(e) => {
				plantFlag(h, w, gameState, setGameState)
				e.preventDefault()
			}}
			onMouseDown={(e) => {
				if (e.button === 0) {
					// left click only
					console.log("scared face")
					setScaredFace(true)
				}
			}}
			onMouseUp={(e) => {
				console.log("happy face")
				setScaredFace(false)
			}}
		>
			<img alt="" src={tile} />
		</div >
	}
	else if (square.contents === "BOMB")
		tile = bombTile
	else if (square.contents === "WONG")
		tile = wrongBombTile
	else if (square.contents === "CRATER")
		tile = craterTile
	else
		tile = scoreTiles[square.score]

	return <div className={classes}
		onClick={(e) => {
			e.preventDefault()
		}}
		onContextMenu={(e) => {
			e.preventDefault()
		}}

	>
		<img alt="" src={tile} /></div>
}

export function Board({ gameState, setGameState, setScaredFace }) {

	return <div className="board">
		{gameState.board.map((row) =>
			<div className="row" key={row.id}>{
				row.squares.map((square) =>
					<Square
						square={square}
						gameState={gameState}
						setGameState={setGameState}
						setScaredFace={setScaredFace}
						key={square.id} />
				)
			}</div>
		)}
	</div>
}