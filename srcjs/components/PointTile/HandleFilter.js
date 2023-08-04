import { useEffect, useRef } from 'react'

function HandleFilter({ map, configState, sourceLayers }) {
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	useEffect(() => {
		if (
			!mapRef.current ||
			!configState.heatmap ||
			!configState.heatmap.filter ||
			sourceLayers.vector_layers.length === 0
		) {
			return
		}

		sourceLayers.vector_layers?.forEach((sourceLayer, index) => {
			const layerId = `${sourceLayer.id}-${index}`

			mapRef.current.setFilter(layerId, configState.heatmap.filter)
			mapRef.current.setFilter(
				layerId + '-point',
				configState.heatmap.filter
			)
		})
	}, [map, configState.heatmap, sourceLayers.vector_layers])
}

export default HandleFilter
