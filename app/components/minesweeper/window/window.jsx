// window
import { Smiley, links as smileyStyles } from "~/components/minesweeper/smiley/smiley"
import { Counter, links as counterStyles } from "~/components/minesweeper/counter/counter"
import ConfettiExplosion from 'react-confetti-explosion';

import styles from "./window.css"
export function links() {
	return [...smileyStyles(), ...counterStyles(), { rel: "stylesheet", href: styles }];
}
const explosion = {
	force: 0.3,
	duration: 3000,
	particleCount: 200,
	width: 1000,
}

//
// Draw the game window around the main board, passing on state to all the graphical bits
//
export function Window({ gameState, timeTaken, resetGame, scaredFace, isExploding, children }) {
	let mood = "happy"
	if (gameState.result === "win") mood = "cool"
	if (gameState.result === "lose") mood = "dead"
	if (scaredFace) mood = "scared" // this takes precedence over all others
	return (
		<div className="window">
			<header>
				<div className="score"><Counter digits={gameState.flagsLeft} /></div>
				<Smiley mood={mood} resetGame={resetGame} />
				<div className="confetti">{isExploding && <ConfettiExplosion {...explosion} />}</div>
				<div className="timer"><Counter className="score" digits={timeTaken} /></div>
			</header >
			<main>{children}</main>
			<footer></footer>
		</div >
	);
}