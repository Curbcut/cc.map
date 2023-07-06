import { useState, useEffect, useRef, useMemo } from 'react'
import LayerJson from './LayerJson'
import { jsonToColorMap, createStyleFunction } from '../mapUtils'

function MapTile({ map, configuration, click, pickable = 'true' }) {
	const [sourceLayers, setSourceLayers] = useState(null)
	const layerIdsRef = useRef([])
	const clickedPolygonIdRef = useRef(null)

	const currentMap = map.current
	const username = 'curbcut'
	const token =
		'pk.eyJ1IjoiY3VyYmN1dCIsImEiOiJjbGprYnVwOTQwaDAzM2xwaWdjbTB6bzdlIn0.Ks1cOI6v2i8jiIjk38s_kg'

	// Get the source layers in the active tileset
	LayerJson({
		setSourceLayers,
		username,
		configuration,
		token,
	})

	const colorMap = useMemo(
		() => jsonToColorMap(configuration.fill_colour),
		[configuration.fill_colour]
	)
	const styleFunction = useMemo(
		() => createStyleFunction(colorMap),
		[colorMap]
	)

	useEffect(() => {
		// ensure the map object is initialized
		if (!currentMap || !currentMap.isStyleLoaded()) return

		const handleLoad = () => {
			// Get the layer id that's for the buildings, so we can place our layers underneath it.
			const layers = currentMap.getStyle().layers
			const labelLayerId = layers.find(
				(layer) =>
					layer.type === 'fill' && layer.id.includes('building')
				// (layer) => layer.type === 'line' && layer.id.includes('road')
			).id
			const url = `mapbox://${username}.${configuration.tileset}`

			// Keep track of added layers
			const layerIds = []

			// Add the source layers to the map
			sourceLayers?.forEach((sourceLayer, index) => {
				const layerId = `${sourceLayer.id}-${index}`
				layerIds.push(layerId) // add the layer id to our array of added layers
				let hoveredPolygonId = null
				currentMap.addSource(layerId, {
					type: 'vector',
					url: url,
				})

				// Add the layer
				currentMap.addLayer(
					{
						id: layerId,
						type: 'fill',
						source: layerId,
						'source-layer': sourceLayer.id,
						minzoom: sourceLayer.minzoom,
						maxzoom: sourceLayer.maxzoom,
						layout: {},
						paint: {
							'fill-outline-color': styleFunction,
							'fill-color': styleFunction,
							'fill-opacity': [
								'case',
								['boolean', ['feature-state', 'hover'], false],
								0.5,
								1,
							],
						},
					},
					labelLayerId
				)

				// Add the outline
				currentMap.addLayer({
					id: layerId + '-outline',
					type: 'line',
					source: layerId,
					'source-layer': sourceLayer.id,
					minzoom: sourceLayer.minzoom,
					maxzoom: sourceLayer.maxzoom,
					layout: {},
					paint: {
						'line-color': [
							'case',
							['boolean', ['feature-state', 'click'], false],
							'#000000',
							'transparent',
						],
						'line-width': [
							'case',
							['boolean', ['feature-state', 'click'], false],
							3, // Change this value to adjust the thickness
							1,
						],
					},
				})

				// Add the layer id to our array of added layers
				layerIdsRef.current = layerIds

				// If the layer is not pickable, then we don't want to add the hover effect
				if (!pickable) return

				// On the layer, set the feature state to `hover: true` when the mouse
				// is over it.
				currentMap.on('mousemove', layerId, (e) => {
					if (e.features.length > 0) {
						if (hoveredPolygonId !== null) {
							currentMap.setFeatureState(
								{
									source: layerId,
									sourceLayer: sourceLayer.id,
									id: hoveredPolygonId,
								},
								{ hover: false }
							)
						}
						hoveredPolygonId = e.features[0].id
						currentMap.setFeatureState(
							{
								source: layerId,
								sourceLayer: sourceLayer.id,
								id: hoveredPolygonId,
							},
							{ hover: true }
						)
					}
				})

				// When the mouse leaves the layer, update the feature state of the
				// previously hovered feature.
				currentMap.on('mouseleave', layerId, () => {
					if (hoveredPolygonId !== null) {
						currentMap.setFeatureState(
							{
								source: layerId,
								sourceLayer: sourceLayer.id,
								id: hoveredPolygonId,
							},
							{ hover: false }
						)
					}
					hoveredPolygonId = null
				})
			})
		}

		// This function will clean up (remove) layers added from previous runs of this effect
		const removeLayers = () => {
			layerIdsRef.current.forEach((layerId) => {
				if (currentMap.getLayer(layerId)) {
					currentMap.off('mousemove', layerId)
					currentMap.off('mouseleave', layerId)
					currentMap.removeLayer(layerId + '-outline')
					currentMap.removeLayer(layerId)
					currentMap.removeSource(layerId)
				}
			})

			// Clear the ref after removing layers
			layerIdsRef.current = []
		}

		removeLayers() // Remove existing layers first
		handleLoad() // Add new layers afterwards

		// Cleanup function to run when component is unmounted or when dependencies change
		return () => {
			currentMap.off('load')
			removeLayers() // Remove existing layers
		}
	}, [currentMap, sourceLayers, pickable])

	// Update the 'click' state of the polygon that was clicked to true for styling purposes
	useEffect(() => {
		// ensure the map object is initialized
		if (
			!currentMap ||
			!currentMap.isStyleLoaded() ||
			!sourceLayers ||
			!pickable
		)
			return null

		// Reset the 'click' state of the previously clicked polygon
		if (clickedPolygonIdRef.current !== null) {
			sourceLayers.forEach((sourceLayer, index) => {
				const layerId = `${sourceLayer.id}-${index}`
				currentMap.setFeatureState(
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

		sourceLayers?.forEach((sourceLayer, index) => {
			const layerId = `${sourceLayer.id}-${index}`
			const features = currentMap.querySourceFeatures(layerId, {
				sourceLayer: [sourceLayer.id],
			})
			const matchingFeature = features.find(
				(feature) => feature.properties.ID === click.ID
			)

			if (matchingFeature) {
				clickedPolygonIdRef.current = matchingFeature.id
				currentMap.setFeatureState(
					{
						source: layerId,
						sourceLayer: sourceLayer.id,
						id: clickedPolygonIdRef.current,
					},
					{ click: true }
				)
			}
		})
	}, [currentMap, click, sourceLayers, pickable])

	useEffect(() => {
		if (!configuration.fill_colour) return
		sourceLayers?.forEach((sourceLayer, index) => {
			const layerId = `${sourceLayer.id}-${index}`
			currentMap.setPaintProperty(layerId, 'fill-color', styleFunction)
			currentMap.setPaintProperty(
				layerId,
				'fill-outline-color',
				styleFunction
			)
		})
	}, configuration.fill_colour)
}

export default MapTile
