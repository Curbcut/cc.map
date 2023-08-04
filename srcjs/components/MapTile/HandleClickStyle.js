// Update the 'click' state of the polygon that was clicked to true for styling purposes
import { useEffect, useRef } from 'react'

function HandleClickStyle({ sourceLayers, map, click, configState }) {
	// mapRef for reference to the map object
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	// clickedPolygonIdRef for reference to the ID of the polygon that was clicked
	const clickedPolygonIdRef = useRef(null)

	// React hook to manage click style
	useEffect(() => {
		// ensure the map object is initialized
		if (
			!mapRef.current ||
			!mapRef.current.isStyleLoaded() ||
			!configState.choropleth ||
			sourceLayers.vector_layers.length === 0 ||
			!configState.choropleth.pickable
		)
			return null

		// Reset the 'click' state of the previously clicked polygon
		if (clickedPolygonIdRef.current !== null) {
			sourceLayers.vector_layers.forEach((sourceLayer, index) => {
				const layerId = `${sourceLayer.id}-${index}`
				mapRef.current.setFeatureState(
					{
						source: layerId,
						sourceLayer: sourceLayer.id,
						id: clickedPolygonIdRef.current,
					},
					{ click: false }
				)
			})
		}

		if (!click.ID) return

		sourceLayers.vector_layers?.forEach((sourceLayer, index) => {
			const layerId = `${sourceLayer.id}-${index}`
			const features = mapRef.current.querySourceFeatures(layerId, {
				sourceLayer: [sourceLayer.id],
			})
			const matchingFeature = features.find(
				(feature) => feature.properties.ID === click.ID
			)

			if (matchingFeature) {
				clickedPolygonIdRef.current = matchingFeature.id
				mapRef.current.setFeatureState(
					{
						source: layerId,
						sourceLayer: sourceLayer.id,
						id: clickedPolygonIdRef.current,
					},
					{ click: true }
				)
			}
		})
	}, [click, sourceLayers.vector_layers, configState.choropleth])
}

export default HandleClickStyle
