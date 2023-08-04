import { useState, useEffect, useRef } from 'react'

function BuildingStyle({ sourceLayers, map }) {
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	// Add zoom as a state
	const [zoom, setZoom] = useState(0)

	useEffect(() => {
		if (!mapRef.current) return // wait for map to initialize

		const handleMove = () => {
			const zoom = mapRef.current.getZoom().toFixed(2)

			setZoom(zoom)
		}

		mapRef.current.on('moveend', handleMove)

		return () => {
			mapRef.current.off('moveend', handleMove)
		}
	}, [setZoom]) // empty dependency array as this effect only needs to be setup once

	// React hook to manage building layer
	useEffect(() => {
		// If there are no layers, do nothing
		if (sourceLayers.vector_layers.length === 0) return null

		const layers = mapRef.current.getStyle().layers
		const buildingLayer = layers.find(
			(layer) => layer.type === 'fill' && layer.id === 'building'
		)

		// Check if building layer exists
		if (!buildingLayer) return null

		const buildingLayerId = buildingLayer.id

		// Check if a source layer containing 'building' is within its zoom range
		const visibleBuildingSourceLayer = sourceLayers.vector_layers.find(
			(layer) =>
				layer.id.includes('building') &&
				zoom >= layer.minzoom &&
				zoom <= layer.maxzoom
		)

		// If such a layer exists, set the visibility of the buildingLayer to 'none', otherwise 'visible'
		if (visibleBuildingSourceLayer) {
			mapRef.current.setLayoutProperty(
				buildingLayerId,
				'visibility',
				'none'
			)
		} else {
			mapRef.current.setLayoutProperty(
				buildingLayerId,
				'visibility',
				'visible'
			)
		}
	}, [sourceLayers.vector_layers, zoom])
}
export default BuildingStyle
