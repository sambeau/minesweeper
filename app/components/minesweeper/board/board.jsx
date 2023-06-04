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

//
// All the complicated game logic lives here…
//

export function newBoard(gameState) {

	// set upo the constants
	const width = gameState.width;
	const height = gameState.height;
	const bombs = gameState.bombs
	let board = []

	// count the bombs around a square
	const countBombs = (h, w) => {
		let bombs = 0;

		// helper functions
		// is there a bomb in this square?
		const isBomb = (h, w) => board[h].squares[w].contents === "BOMB"
		// Is there be a bomb at these (possibly invalid) coordinates

		// if a square has a bomb in it, it scores 1
		// If a  doesn't or if it's off the board, score it 0
		const scoreSquare = (h, w) => {
			// first, check if the coords are off the board
			if ((h < 0) || (h > height - 1)) return 0 // invalid, scores 0
			if ((w < 0) || (w > width - 1)) return 0 // invalid, scores 0

			// if it's a bomb, score it as +1
			return isBomb(h, w) ? 1 : 0
		}

		// a square's score is the sum off all the 8 sqaures around it
		// the square itself always scores 0 as we already know its empty
		// (as only empty sqaures get scores)
		bombs += scoreSquare(h - 1, w - 1) + scoreSquare(h - 1, w) + scoreSquare(h - 1, w + 1)
		bombs += scoreSquare(h, w - 1) + 0 + scoreSquare(h, w + 1)
		bombs += scoreSquare(h + 1, w - 1) + scoreSquare(h + 1, w) + scoreSquare(h + 1, w + 1)

		return bombs
	}

	//
	// initialise board
	//

	/// First, empty out all the squares
	for (let h = 0; h < height; h++) {
		board[h] = { id: h, squares: [] }
		for (let w = 0; w < width; w++) {
			board[h].squares[w] = {
				// React needs IDs to use as keys
				id: h + "_" + w,
				// Everyone needs to have access to a square's coordinates
				coords: { h: h, w: w },
				// initial state
				contents: "EMPTY", // "EMPTY", "BOMB", 'WRONG' or "CRATER"
				state: "HIDDEN", // "HIDDEN", "FLAGGED", "SEEN"
			}
		}
	}

	// randomly place bombs, using a simple retry method
	let bombsleft = bombs;
	while (bombsleft > 0) {
		// choose a random square
		const w = Math.floor(Math.random() * width)
		const h = Math.floor(Math.random() * height)
		// if the square already has a bomb in it, try another square
		if (board[h].squares[w].contents === "BOMB") continue; // go back & choose again
		// put a bomb here
		board[h].squares[w].contents = "BOMB"
		// now you have one fewer bombs to place
		bombsleft = bombsleft - 1
	}

	// calculate scores for each square
	for (let h = 0; h < height; h++) {
		for (let w = 0; w < width; w++) {
			board[h].squares[w].score = countBombs(h, w)
		}
	}

	return board
}

function plantFlag(h, w, gameState, setGameState) {

	// have we already checked this square?
	if (gameState.board[h].squares[w].state === "SEEN") return;

	setGameState(prevState => {
		// update game state to account for the flag
		gameState = JSON.parse(JSON.stringify(prevState))  // quick & dirty deep copy

		// flagging has more to it than first appears :-
		//
		// 1) You only get as mang flags as there are bombs.
		// 2) We can only flag if we have a flag left
		// 3) If we remove a flag, we get to use it again
		// 4) Once we place our final flag, we need to check if we've won the game

		if (gameState.board[h].squares[w].state === "FLAGGED") {
			// already flagged
			// remove the flag
			gameState.board[h].squares[w].state = "HIDDEN"
			gameState.flagsLeft = prevState.flagsLeft + 1
		} else {
			// not flagged
			// add a flag if there's one left to use
			if (prevState.flagsLeft > 0) {
				gameState.board[h].squares[w].state = "FLAGGED"
				gameState.flagsLeft = prevState.flagsLeft - 1

				// if all  flags are used, check to see if you've won
				if (gameState.flagsLeft === 0) {

					// chack all the squares with flags
					// count up all the ones with bombs under them
					let correctFlags = 0;
					for (let h = 0; h < gameState.height; h++) {
						for (let w = 0; w < gameState.width; w++) {
							if (gameState.board[h].squares[w].state === "FLAGGED") {
								if (gameState.board[h].squares[w].contents === "BOMB") {
									// this is a correct guess!
									correctFlags = correctFlags + 1
								}

							}
						}
					}
					// If al your flags are correct, then you've won
					if (correctFlags === prevState.bombs) {
						//
						// YAY! YOU'VE WON!
						//
						gameState.result = "win"
						//
						// Update the board for the losing state
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

	setGameState(prevGameState => {

		gameState = JSON.parse(JSON.stringify(prevGameState)) // quick & dirty deep copy
		gameState.board[h].squares[w].state = "SEEN"

		if (gameState.board[h].squares[w].contents === "BOMB") {
			//
			// BOOM! YOU HAVE LOST
			//
			gameState.board[h].squares[w].contents = "CRATER"
			gameState.result = "lose"
			//
			// Update the board for the losing state
			for (let h = 0; h < gameState.height; h++) {
				for (let w = 0; w < gameState.width; w++) {

					// Mark where flags were put in the wrong places
					if ((prevGameState.board[h].squares[w].state === "FLAGGED")
						&& (prevGameState.board[h].squares[w].contents !== "BOMB")) {
						gameState.board[h].squares[w].contents = "WRONG"
					}
					// Reveal all the hidden tiles
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

	// if this square is next to a bomb, stop
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
	let tile
	let classes = "square"
	const { w, h } = square.coords
	//
	// Draw a tile on a board square
	//
	if ((square.state === "HIDDEN") || (square.state === "FLAGGED")) {
		if (square.state === "FLAGGED")
			tile = flagTile
		else {
			tile = hiddenTile;
			classes += " clickable"
		}
		return < div className={classes}
			// click to reveal
			onClick={(e) => {
				clickSquare(h, w, gameState, setGameState)
				e.preventDefault()
			}}
			// right-click to place a flag
			onContextMenu={(e) => {
				plantFlag(h, w, gameState, setGameState)
				e.preventDefault()
			}}
			// show a scared face when mouse pressed on an unturned tile
			onMouseDown={(e) => {
				if (e.button === 0) {
					// right click only
					setScaredFace(true)
				}
			}}
			// remove scared face as soon as you lift the mouse
			onMouseUp={(e) => {
				setScaredFace(false)
			}}
		>
			<img alt="" src={tile} />
		</div >
	}
	else if (square.contents === "BOMB")
		tile = bombTile
	else if (square.contents === "WRONG")
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