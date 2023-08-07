import { useState, useEffect, useRef, useMemo } from 'react'
import BuildingStyle from './MapTile/BuildingStyle'
import HandleClickStyle from './MapTile/HandleClickStyle'
import FillColour from './MapTile/FillColour'
import LayerJson from './LayerJson'
import SelectId from './MapTile/SelectId'

function MapTile({ map, configState, click, username, token, setClick }) {
	const mapRef = useRef()
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

	// Keep current loaded layer IDs
	const [layerIds, setLayerIds] = useState({ layerIds: [], allLoaded: false })

	useEffect(() => {
		// ensure the map object is initialized
		if (!sourceLayers.vector_layers?.length) return

		const handleLoad = () => {
			const layers = mapRef.current.getStyle().layers
			// As the building layer is sometimes invisible, the pitch outline layer is the
			// next one closer to use to put our choropleth layers under.
			const buildingLayerId = layers.find(
				(layer) =>
					layer.type === 'line' && layer.id.includes('pitch-outline')
			).id

			// Add the source layers to the map
			sourceLayers.vector_layers?.forEach((sourceLayer) => {
				const layerId = sourceLayer.id
				setLayerIds((prevLayerIds) => ({
					layerIds: [...prevLayerIds.layerIds, layerId],
					allLoaded: false,
				}))
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
						'source-layer': layerId,
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
					'source-layer': layerId,
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
									sourceLayer: layerId,
									id: hoveredPolygonId,
								},
								{ hover: false }
							)
						}
						hoveredPolygonId = e.features[0].id
						mapRef.current.setFeatureState(
							{
								source: layerId,
								sourceLayer: layerId,
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
								sourceLayer: layerId,
								id: hoveredPolygonId,
							},
							{ hover: false }
						)
					}
					hoveredPolygonId = null
				})

				// Add final to the layers added
				setLayerIds((prevState) => ({
					...prevState,
					layerIds: [...prevState.layerIds, layerId], // add the layer id
					allLoaded: true,
				}))
			})
		}

		// This function will clean up (remove) layers added from previous runs of this effect
		const removeLayers = () => {
			const currentLayerIds = [...layerIds.layerIds] // Make a shallow copy

			currentLayerIds.forEach((layerId) => {
				if (mapRef.current.getLayer(layerId)) {
					mapRef.current.off('mousemove', layerId)
					mapRef.current.off('mouseleave', layerId)
					mapRef.current.removeLayer(layerId + '-outline')
					mapRef.current.removeLayer(layerId)
					mapRef.current.removeSource(layerId)
				}
			})

			// Clear the ref after removing layers
			setLayerIds({ layerIds: [], allLoaded: false })
		}

		removeLayers() // Remove existing layers first

		// Add new layers afterwards
		if (mapRef.current.isStyleLoaded()) {
			handleLoad()
		} else {
			mapRef.current.on('load', handleLoad)
		}

		// // Cleanup function to run when component is unmounted or when dependencies change
		return () => {
			mapRef.current.off('load')
			removeLayers() // Remove existing layers
		}
	}, [sourceLayers, pickable, select_id])

	// Deal with polygons selected at init
	SelectId({ map, select_id, layerIds, setClickedPolygonId })

	// React hook to manage change of map styling for the fill colour
	FillColour({ configState, map, layerIds })

	// React hook to manage change of map styling for the click style
	HandleClickStyle({
		layerIds,
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
