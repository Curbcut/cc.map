import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

function Stories({ map, configuration, username }) {
	const currentMap = map.current

	useEffect(() => {
		if (!currentMap) return
		if (!configuration.stories) return

		const url = `mapbox://${username}.${configuration.stories}`

		let hoveredPolygonId = null

		currentMap.addSource(configuration.stories, {
			type: 'vector',
			url: url,
		})

		// add layer
		currentMap.addLayer({
			id: configuration.stories,
			type: 'symbol',
			source: configuration.stories,
			'source-layer': configuration.stories,
			minzoom: 13,
			maxzoom: 22,
			layout: {
				'icon-image': 'urban_life', // reference the image added to the mapbox style
			},
			paint: {
				'icon-opacity': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					1,
					0.75,
				],
			},
		})

		// On the layer, set the feature state to `hover: true` when the mouse
		// is over it.
		currentMap.on('mousemove', configuration.stories, (e) => {
			if (e.features.length > 0) {
				if (hoveredPolygonId !== null) {
					currentMap.setFeatureState(
						{
							source: configuration.stories,
							sourceLayer: configuration.stories,
							id: hoveredPolygonId,
						},
						{ hover: false }
					)
				}
				hoveredPolygonId = e.features[0].id
				currentMap.setFeatureState(
					{
						source: configuration.stories,
						sourceLayer: configuration.stories,
						id: hoveredPolygonId,
					},
					{ hover: true }
				)
			}
		})

		// When the mouse leaves the layer, update the feature state of the
		// previously hovered feature.
		currentMap.on('mouseleave', configuration.stories, () => {
			if (hoveredPolygonId !== null) {
				currentMap.setFeatureState(
					{
						source: configuration.stories,
						sourceLayer: configuration.stories,
						id: hoveredPolygonId,
					},
					{ hover: false }
				)
			}
			hoveredPolygonId = null
		})

		// Create a popup, but don't add it to the map yet.
		const popup = new mapboxgl.Popup({
			closeButton: false,
			closeOnClick: false,
		})

		currentMap.on('mouseenter', configuration.stories, (e) => {
			// Change the cursor style as a UI indicator.
			currentMap.getCanvas().style.cursor = 'pointer'

			// Copy coordinates array.
			const coordinates = e.features[0].geometry.coordinates.slice()
			const preview = e.features[0].properties.preview

			// Ensure that if the map is zoomed out such that multiple
			// copies of the feature are visible, the popup appears
			// over the copy being pointed to.
			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
			}

			// Populate the popup and set its coordinates
			// based on the feature found.
			popup.setLngLat(coordinates).setHTML(preview).addTo(currentMap)
		})

		currentMap.on('mouseleave', configuration.stories, () => {
			currentMap.getCanvas().style.cursor = ''
			popup.remove()
		})
	}, [currentMap, configuration.stories])
}

export default Stories
