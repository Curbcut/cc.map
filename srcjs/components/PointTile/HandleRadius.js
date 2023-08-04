import { useEffect, useRef } from 'react'

function HandleRadius({ map, configState, sourceLayers }) {
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	useEffect(() => {
		if (
			!mapRef.current ||
			!configState.heatmap ||
			!configState.heatmap.radius ||
			sourceLayers.vector_layers.length === 0
		) {
			return
		}

		sourceLayers.vector_layers?.forEach((sourceLayer, index) => {
			const layerId = `${sourceLayer.id}-${index}`

			mapRef.current.setPaintProperty(
				layerId,
				'heatmap-radius',
				configState.heatmap.radius
			)
		})
	}, [mapRef, configState.heatmap, sourceLayers.vector_layers])
}

export default HandleRadius
