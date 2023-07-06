import { reactShinyInput } from 'reactR'
import mapboxgl from 'mapbox-gl'
import React, { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import NavData from './components/NavData.js'
import MapTile from './components/MapTile.js'
import GetClick from './components/GetClick.js'
import Stories from './components/Stories.js'

function Map({ configuration, value, setValue }) {
	const [token, setToken] = useState(configuration.token)
	mapboxgl.accessToken = token
	const [username, setUsername] = useState(configuration.username)

	const mapContainer = useRef(null)
	const map = useRef(null)
	const [click, setClick] = useState({
		ID: [],
		layerName: [],
		mapID: [],
	})

	useEffect(() => {
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: 'mapbox://styles/curbcut/cljkciic3002h01qveq5z1wrp',
			center: [configuration.longitude, configuration.latitude],
			zoom: configuration.zoom,
		})

		// Once on the app, the map does not take the whole space of the div
		// This is a workaround to resize the map and make it fit the div
		const resizeObserver = new ResizeObserver(() => {
			map.current.resize()
		})

		resizeObserver.observe(mapContainer.current)

		return () => {
			map.current.remove()
			resizeObserver.disconnect()
		}
	}, [])

	// Update the map center and zoom when the configuration changes
	useEffect(() => {
		if (!map.current) return
		if (
			!configuration.longitude ||
			!configuration.latitude ||
			!configuration.zoom
		)
			return

		// Update map center and zoom
		map.current.setCenter([configuration.longitude, configuration.latitude])
		map.current.setZoom(configuration.zoom)
	}, [configuration.longitude, configuration.latitude, configuration.zoom])

	// Add/update the source layers to the map
	MapTile({ map, configuration, click, token, username })

	// Update the coordinates to the shiny input
	NavData({ map, setValue })

	// Save the ID of the clicked tileset to the `click` state
	GetClick({ map, click, setClick, setValue, configuration })

	// Add stories icons to the map
	Stories({ map, configuration })

	return (
		<div
			ref={mapContainer}
			className='map-container'
			style={{ height: '100%', width: '100%' }}
		/>
	)
}

reactShinyInput('.map', 'cc.map.map', Map)
