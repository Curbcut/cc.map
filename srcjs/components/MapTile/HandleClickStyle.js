// Update the 'click' state of the polygon that was clicked to true for styling purposes
import { useEffect, useRef } from 'react'

function HandleClickStyle({
	sourceLayers,
	map,
	click,
	configState,
	clickedPolygonId,
	setClickedPolygonId,
}) {
	// mapRef for reference to the map object
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

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
		if (clickedPolygonId !== null) {
			sourceLayers.vector_layers.forEach((sourceLayer, index) => {
				const layerId = `${sourceLayer.id}-${index}`
				mapRef.current.setFeatureState(
					{
						source: layerId,
						sourceLayer: sourceLayer.id,
						id: clickedPolygonId,
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
				setClickedPolygonId(matchingFeature.id)
				mapRef.current.setFeatureState(
					{
						source: layerId,
						sourceLayer: sourceLayer.id,
						id: matchingFeature.id,
					},
					{ click: true }
				)
			}
		})
	}, [click, sourceLayers.vector_layers, configState.choropleth])
}

export default HandleClickStyle
