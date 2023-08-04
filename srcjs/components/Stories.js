import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

function Stories({ map, configState, username }) {
	const currentMap = map.current
	const timeoutId = useRef(null)
	const [triggerRerender, setTriggerRerender] = useState(false)

	useEffect(() => {
		if (!currentMap || !configState.stories) return
		if (!currentMap.isStyleLoaded()) {
			timeoutId.current = setTimeout(() => {
				// Force a re-render to trigger useEffect again
				setTriggerRerender((prev) => !prev)
			}, 250)
			return
		}

		const url = `mapbox://${username}.${configState.stories}`
		let hoveredPolygonId = null

		currentMap.addSource(configState.stories, {
			type: 'vector',
			url: url,
		})

		// Load all images and add them to the map
		Object.entries(configState.stories_img).forEach(([name_id, base64]) => {
			currentMap.loadImage(base64, (error, image) => {
				if (error) throw error
				currentMap.addImage(name_id, image)
			})
		})

		// add layer
		currentMap.addLayer({
			id: configState.stories,
			type: 'symbol',
			source: configState.stories,
			'source-layer': configState.stories,
			minzoom: 13,
			maxzoom: 22,
			layout: {
				'icon-image': [
					'match',
					['get', 'name_id'],
					...Object.keys(configState.stories_img).flatMap(
						(name_id) => [name_id, name_id]
					),
					'default-image-id', // fallback image
				],
				'icon-size': 0.75,
			},
			paint: {
				'icon-opacity': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					1,
					0.8,
				],
			},
		})

		// Move the layer to the top
		const layers = currentMap.getStyle().layers
		const lastLayer = layers[layers.length - 1].id
		currentMap.moveLayer(configState.stories, lastLayer)

		// On the layer, set the feature state to `hover: true` when the mouse
		// is over it.
		currentMap.on('mousemove', configState.stories, (e) => {
			if (e.features.length > 0) {
				if (hoveredPolygonId !== null) {
					currentMap.setFeatureState(
						{
							source: configState.stories,
							sourceLayer: configState.stories,
							id: hoveredPolygonId,
						},
						{ hover: false }
					)
				}
				hoveredPolygonId = e.features[0].id
				currentMap.setFeatureState(
					{
						source: configState.stories,
						sourceLayer: configState.stories,
						id: hoveredPolygonId,
					},
					{ hover: true }
				)
			}
		})

		// When the mouse leaves the layer, update the feature state of the
		// previously hovered feature.
		currentMap.on('mouseleave', configState.stories, () => {
			if (hoveredPolygonId !== null) {
				currentMap.setFeatureState(
					{
						source: configState.stories,
						sourceLayer: configState.stories,
						id: hoveredPolygonId,
					},
					{ hover: false }
				)
			}
			hoveredPolygonId = null
		})

		// Cleanup function
		return () => {
			if (timeoutId.current) clearTimeout(timeoutId.current)
		}
	}, [
		currentMap,
		configState.stories,
		username,
		triggerRerender,
		configState.tileset_prefix,
		configState.stories_img,
	])

	// Add popup on hover for all stories. For that, wait for the stories layer
	// to be added to the map, then add the popup.
	const [storiesLayerAdded, setStoriesLayerAdded] = useState(false)
	const [retryCount, setRetryCount] = useState(0)

	useEffect(() => {
		if (
			!currentMap ||
			!configState.stories ||
			storiesLayerAdded ||
			retryCount >= 5
		)
			return

		const layer = currentMap.getLayer(configState.stories)

		if (!layer) {
			setTimeout(() => {
				setRetryCount(retryCount + 1)
			}, 500)
			return
		}

		setStoriesLayerAdded(true)
	}, [currentMap, configState.stories, storiesLayerAdded, retryCount])

	useEffect(() => {
		if (!currentMap || !configState.stories) return
		if (!storiesLayerAdded) return

		const popup = new mapboxgl.Popup({
			closeButton: false,
			closeOnClick: false,
		})

		const handleMouseEnter = (e) => {
			currentMap.getCanvas().style.cursor = 'pointer'

			const coordinates = e.features[0].geometry.coordinates.slice()
			const preview =
				e.features[0].properties[`preview_${configState.lang}`]

			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
			}

			popup.setLngLat(coordinates).setHTML(preview).addTo(currentMap)
		}

		const handleMouseLeave = () => {
			currentMap.getCanvas().style.cursor = ''
			popup.remove()
		}

		currentMap.on('mouseenter', configState.stories, handleMouseEnter)
		currentMap.on('mouseleave', configState.stories, handleMouseLeave)

		return () => {
			currentMap.off('mouseenter', configState.stories, handleMouseEnter)
			currentMap.off('mouseleave', configState.stories, handleMouseLeave)
		}
	}, [currentMap, configState.stories, configState.lang, storiesLayerAdded])
}

export default Stories
