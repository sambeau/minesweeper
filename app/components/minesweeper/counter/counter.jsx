// counter

import d0Image from "./images/0.png"
import d1Image from "./images/1.png"
import d2Image from "./images/2.png"
import d3Image from "./images/3.png"
import d4Image from "./images/4.png"
import d5Image from "./images/5.png"
import d6Image from "./images/6.png"
import d7Image from "./images/7.png"
import d8Image from "./images/8.png"
import d9Image from "./images/9.png"

import ddashImage from "./images/dash.png"
import dspaceImage from "./images/space.png"

import styles from "./counter.css"
export function links() {
	return [{ rel: "stylesheet", href: styles }];
}
const dImages = [
	d0Image,
	d1Image,
	d2Image,
	d3Image,
	d4Image,
	d5Image,
	d6Image,
	d7Image,
	d8Image,
	d9Image,
	ddashImage,
]

function digitImages(digitString) {

	const charToImage = ((c) => {
		if (c == " ") return dspaceImage;
		if ("0123456789".includes(c)) return dImages[parseInt(c)];
		return ddashImage;
	})

	// add some spaces for small numbers take only the last 3 chars
	digitString = ("  " + digitString).slice(-3);

	const HundredsImage = charToImage(digitString.charAt(0))
	const TensImage = charToImage(digitString.charAt(1))
	const UnitsImage = charToImage(digitString.charAt(2))

	return [HundredsImage, TensImage, UnitsImage]
}

export function Counter({ digits }) { // string

	const [HundredsImage, TensImage, UnitsImage] = digitImages(digits);

	return (
		<div className="counter">
			<img alt="" src={HundredsImage} className="digit" />
			<img alt="" src={TensImage} className="digit" />
			<img alt="" src={UnitsImage} className="digit" />
		</div>
	);
}