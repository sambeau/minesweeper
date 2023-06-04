//timer.js

import { useEffect } from 'react'
//
// A 1s timer that will only run once in dev mode
//
export function useTimer(doOnTick, dependencies) {
	useEffect(() => {
		let intervalID;
		if (intervalID === undefined) {
			intervalID = setInterval(() => {
				doOnTick()
			}, 1000)
		}
		return (() => { clearInterval(intervalID) })

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies) // Don't add doOnTick here or it will update every tick
}