import { useState, useEffect, useRef, useMemo } from 'react'
import BuildingStyle from './MapTile/BuildingStyle'
import HandleClickStyle from './MapTile/HandleClickStyle'
import FillColour from './MapTile/FillColour'
import LayerJson from './LayerJson'

function MapTile({ map, configState, click, username, token, setClick }) {
	const layerIdsRef = useRef([])
	const mapRef = useRef()
	const [layersLoaded, setLayersLoaded] = useState(false)
	const [clickedPolygonId, setClickedPolygonId] = useState(null)

	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	const tileset = useMemo(() => {
		if (!configState.choropleth) return null
		if (!configState.choropleth.tileset) return null

		return configState.choropleth ? configState.choropleth.tileset : null
	}, [configState.choropleth])
	const pickable = useMemo(() => {
		if (!configState.choropleth) return null
		if (!configState.choropleth.pickable) return null

		return configState.choropleth ? configState.choropleth.pickable : false
	}, [configState.choropleth])
	const select_id = useMemo(() => {
		if (!configState.choropleth) return null
		if (!configState.choropleth.select_id) return null

		return configState.choropleth
			? String(configState.choropleth.select_id)
			: null
	}, [configState.choropleth])

	// When the choropleth is initiated with a select_id, update click
	useEffect(() => {
		if (!select_id) return

		setClick({
			ID: select_id,
		})
	}, [select_id, setClick])

	// Load the sourceLayers depending on configState.tileset
	const [sourceLayers, setSourceLayers] = useState({
		vector_layers: [],
		url: '',
	})
	// Get the source layers in the active tileset
	LayerJson({
		setSourceLayers,
		username,
		tileset: tileset,
		token,
	})

	useEffect(() => {
		// ensure the map object is initialized
		if (!mapRef.current) return null
		if (sourceLayers.vector_layers === []) return null
		if (sourceLayers.vector_layers.length === 0) return null

		// Check if map style is loaded (timeout due to race condition with Stories component)
		if (!mapRef.current.isStyleLoaded()) {
			// If not loaded, wait for 250ms and then re-trigger the function
			const timeoutId = setTimeout(() => {
				setSourceLayers((oldSourceLayers) => {
					// Check if oldSourceLayers is iterable
					if (
						oldSourceLayers &&
						typeof oldSourceLayers[Symbol.iterator] === 'function'
					) {
						return [...oldSourceLayers]
					} else {
						// If it's not iterable, return a default value (like an empty array)
						return sourceLayers
					}
				})
			}, 250)

			// Return cleanup function to clear the timeout
			return () => clearTimeout(timeoutId)
		}

		const layers = mapRef.current.getStyle().layers
		const buildingLayerId = layers.find(
			(layer) => layer.type === 'fill' && layer.id.includes('building')
		).id

		const handleLoad = () => {
			// Keep track of added layers
			const layerIds = []

			// Add the source layers to the map
			sourceLayers.vector_layers?.forEach((sourceLayer, index) => {
				const layerId = `${sourceLayer.id}-${index}`
				layerIds.push(layerId) // add the layer id to our array of added layers
				let hoveredPolygonId = null
				mapRef.current.addSource(layerId, {
					type: 'vector',
					url: sourceLayers.url,
				})

				// Add the layer
				mapRef.current.addLayer(
					{
						id: layerId,
						type: 'fill',
						source: layerId,
						'source-layer': sourceLayer.id,
						minzoom: sourceLayer.minzoom,
						maxzoom: sourceLayer.maxzoom,
						layout: {},
						paint: {
							'fill-outline-color': 'transparent',
							'fill-color': 'transparent',
							'fill-opacity': [
								'case',
								['boolean', ['feature-state', 'hover'], false],
								0.5,
								1,
							],
						},
					},
					buildingLayerId
				)

				// Add the outline
				mapRef.current.addLayer({
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
							layerId.includes('building')
								? 'lightgrey'
								: 'transparent',
						],
						'line-width': [
							'case',
							['boolean', ['feature-state', 'click'], false],
							3, // Change this value to adjust the thickness
							1,
						],
					},
				})

				// If it there is a select_id at init, set the feature state to `click: true`
				if (select_id) {
					const checkFeatures = (attemptsRemaining) => {
						mapRef.current.once('idle', () => {
							const features = mapRef.current.querySourceFeatures(
								layerId,
								{
									sourceLayer: [sourceLayer.id],
								}
							)
							const matchingFeature = features.find(
								(feature) => feature.properties.ID === select_id
							)

							if (matchingFeature) {
								mapRef.current.setFeatureState(
									{
										source: layerId,
										sourceLayer: sourceLayer.id,
										id: matchingFeature.id,
									},
									{ click: true }
								)
								setClickedPolygonId(matchingFeature.id)
							} else if (
								!matchingFeature &&
								attemptsRemaining > 0
							) {
								setTimeout(
									() => checkFeatures(attemptsRemaining - 1),
									250
								)
							}
						})
					}

					checkFeatures(5)
				}

				// Add the layer id to our array of added layers
				layerIdsRef.current = layerIds

				// If the layer is not pickable, then we don't want to add the hover effect
				if (!pickable) return

				// On the layer, set the feature state to `hover: true` when the mouse
				// is over it.
				mapRef.current.on('mousemove', layerId, (e) => {
					if (e.features.length > 0) {
						if (hoveredPolygonId !== null) {
							mapRef.current.setFeatureState(
								{
									source: layerId,
									sourceLayer: sourceLayer.id,
									id: hoveredPolygonId,
								},
								{ hover: false }
							)
						}
						hoveredPolygonId = e.features[0].id
						mapRef.current.setFeatureState(
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
				mapRef.current.on('mouseleave', layerId, () => {
					if (hoveredPolygonId !== null) {
						mapRef.current.setFeatureState(
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
				if (mapRef.current.getLayer(layerId)) {
					mapRef.current.off('mousemove', layerId)
					mapRef.current.off('mouseleave', layerId)
					mapRef.current.removeLayer(layerId + '-outline')
					mapRef.current.removeLayer(layerId)
					mapRef.current.removeSource(layerId)
				}
			})

			// Clear the ref after removing layers
			layerIdsRef.current = []
		}

		removeLayers() // Remove existing layers first
		handleLoad() // Add new layers afterwards

		// set layers loaded state to true
		setLayersLoaded(true)

		// Cleanup function to run when component is unmounted or when dependencies change
		return () => {
			mapRef.current.off('load')
			removeLayers() // Remove existing layers
		}
	}, [sourceLayers, setSourceLayers, pickable, select_id])

	// React hook to manage change of map styling for the fill colour
	FillColour({ configState, sourceLayers, map, layersLoaded })

	// React hook to manage change of map styling for the click style
	HandleClickStyle({
		sourceLayers,
		map,
		click,
		configState,
		clickedPolygonId,
		setClickedPolygonId,
	})

	// React hook to manage change of map styling for the building layer
	BuildingStyle({ sourceLayers, map })
}

export default MapTile
