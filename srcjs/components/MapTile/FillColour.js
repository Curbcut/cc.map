import { useEffect, useRef, useMemo } from 'react'

function FillColour({ configState, sourceLayers, map, layersLoaded }) {
	const mapRef = useRef()
	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	// Get the fill colour map
	const styleFunction = useMemo(() => {
		if (!configState.choropleth) return null
		if (!configState.choropleth.fill_colour) return null

		return configState.choropleth
			? configState.choropleth.fill_colour
			: null
	}, [configState.choropleth])

	// React hook to manage change of map styling for the fill colour
	useEffect(() => {
		if (
			!mapRef.current ||
			sourceLayers.vector_layers.length === 0 ||
			!layersLoaded || // add the check for whether the layers have been loaded here
			!styleFunction
		)
			return null

		sourceLayers.vector_layers?.forEach((sourceLayer, index) => {
			const layerId = `${sourceLayer.id}-${index}`
			mapRef.current.setPaintProperty(
				layerId,
				'fill-color',
				styleFunction
			)
			mapRef.current.setPaintProperty(
				layerId,
				'fill-outline-color',
				styleFunction
			)
		})
	}, [sourceLayers.vector_layers, styleFunction, layersLoaded])
}

export default FillColour
