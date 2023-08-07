import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

function Stories({ map, configState, username }) {
	const mapRef = useRef()

	useEffect(() => {
		mapRef.current = map.current
	}, [map])

	const [storiesLoaded, setStoriesLoaded] = useState(false)

	useEffect(() => {
		if (!configState.stories || storiesLoaded) return
		let hoveredPolygonId = null

		function addStoryToMap() {
			console.log('trigg')
			const url = `mapbox://${username}.${configState.stories}`

			mapRef.current.addSource(configState.stories, {
				type: 'vector',
				url: url,
			})

			Object.entries(configState.stories_img).forEach(
				([name_id, base64]) => {
					mapRef.current.loadImage(base64, (error, image) => {
						if (error) throw error
						mapRef.current.addImage(name_id, image)
					})
				}
			)

			mapRef.current.addLayer({
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
						'default-image-id',
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

			const layers = mapRef.current.getStyle().layers
			const lastLayer = layers[layers.length - 1].id
			mapRef.current.moveLayer(configState.stories, lastLayer)

			mapRef.current.on('mousemove', configState.stories, (e) => {
				if (e.features.length > 0) {
					if (hoveredPolygonId !== null) {
						mapRef.current.setFeatureState(
							{
								source: configState.stories,
								sourceLayer: configState.stories,
								id: hoveredPolygonId,
							},
							{ hover: false }
						)
					}
					hoveredPolygonId = e.features[0].id
					mapRef.current.setFeatureState(
						{
							source: configState.stories,
							sourceLayer: configState.stories,
							id: hoveredPolygonId,
						},
						{ hover: true }
					)
				}
			})

			mapRef.current.on('mouseleave', configState.stories, () => {
				if (hoveredPolygonId !== null) {
					mapRef.current.setFeatureState(
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
		}

		if (mapRef.current.isStyleLoaded()) {
			setStoriesLoaded(true)
			addStoryToMap()
		} else {
			setStoriesLoaded(true)
			mapRef.current.on('load', addStoryToMap)
		}
	}, [
		mapRef.current,
		configState.stories,
		username,
		configState.tileset_prefix,
		configState.stories_img,
	])

	useEffect(() => {
		if (!mapRef.current || !configState.stories) return

		const popup = new mapboxgl.Popup({
			closeButton: false,
			closeOnClick: false,
		})

		const handleMouseEnter = (e) => {
			mapRef.current.getCanvas().style.cursor = 'pointer'

			const coordinates = e.features[0].geometry.coordinates.slice()
			const preview =
				e.features[0].properties[`preview_${configState.lang}`]

			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
			}

			popup.setLngLat(coordinates).setHTML(preview).addTo(mapRef.current)
		}

		const handleMouseLeave = () => {
			mapRef.current.getCanvas().style.cursor = ''
			popup.remove()
		}

		if (mapRef.current.getLayer(configState.stories)) {
			mapRef.current.on(
				'mouseenter',
				configState.stories,
				handleMouseEnter
			)
			mapRef.current.on(
				'mouseleave',
				configState.stories,
				handleMouseLeave
			)
		} else {
			mapRef.current.on('load', () => {
				mapRef.current.on(
					'mouseenter',
					configState.stories,
					handleMouseEnter
				)
				mapRef.current.on(
					'mouseleave',
					configState.stories,
					handleMouseLeave
				)
			})
		}

		return () => {
			mapRef.current.off(
				'mouseenter',
				configState.stories,
				handleMouseEnter
			)
			mapRef.current.off(
				'mouseleave',
				configState.stories,
				handleMouseLeave
			)
		}
	}, [mapRef.current, configState.stories, configState.lang])
}

export default Stories
