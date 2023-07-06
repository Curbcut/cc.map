import React, { useEffect } from 'react'
import { debounce } from 'lodash'

function NavData({ map, setValue }) {
	useEffect(() => {
		if (!map.current) return // wait for map to initialize

		// No need for `debounce` if we use `moveend` event
		const handleMove = () => {
			// debounce(() => {
			const lon = map.current.getCenter().lng.toFixed(4)
			const lat = map.current.getCenter().lat.toFixed(4)
			const zoom = map.current.getZoom().toFixed(2)

			// Do the asme set value but also add naming
			setValue({
				longitude: lon,
				latitude: lat,
				zoom: zoom,
				event: 'viewstate',
			})
			// }, 250) // delay in ms between events
		}

		// https://davidwalsh.name/javascript-debounce-function
		// debounce function to limit calls to setValue to once every x ms
		map.current.on('moveend', handleMove)

		// clean up function to remove event listener when component unmounts
		// https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
		return () => {
			// clean up
			map.current.off('moveend', handleMove)
		}
	}, [map.current])
}

export default NavData
