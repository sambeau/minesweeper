// smiley
import coolSmiley from "./images/cool.png"
import deadSmiley from "./images/dead.png"
import happySmiley from "./images/happy.png"
import scaredSmiley from "./images/scared.png"

import styles from "./smiley.css"
export function links() {
	return [{ rel: "stylesheet", href: styles }];
}

export function Smiley({ mood, resetGame }) {
	let image = happySmiley;
	if (mood === "cool")
		image = coolSmiley
	else if (mood === "dead")
		image = deadSmiley
	else if (mood === "scared")
		image = scaredSmiley
	return (
		<img alt="" src={image} className="smiley" onClick={() => resetGame()} />
	);
}