import { useEffect, useRef } from 'react'

function HandleRadius({ map, configState, layerIds }) {
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	useEffect(() => {
		if (
			!mapRef.current ||
			!configState.heatmap ||
			!configState.heatmap.radius
		) {
			return
		}

		layerIds.layerIds?.forEach((layerId) => {
			mapRef.current.setPaintProperty(
				layerId,
				'heatmap-radius',
				configState.heatmap.radius
			)
		})
	}, [mapRef, configState.heatmap, layerIds])
}

export default HandleRadius
