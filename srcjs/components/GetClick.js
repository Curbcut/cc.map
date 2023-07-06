import { useEffect } from 'react'

function GetClick({ map, click, setClick, setValue, configuration }) {
	const currentMap = map.current

	useEffect(() => {
		const onClick = function (e) {
			var features = currentMap.queryRenderedFeatures(e.point)

			// Never select a feature that is from mapbox. We filter out using the
			// metadata of the layer. If the metadata has a key that starts with
			// 'mapbox:', then we know that the feature is from mapbox.
			var notSimpleFeatures = features.filter((f) => {
				if (f.layer?.metadata) {
					// if the namespace of the metadata is 'mapbox:', then we know that
					// the feature is from mapbox, and we want to filter it out
					const metadataKeys = Object.keys(f.layer.metadata)
					return metadataKeys.every(
						(key) => !key.startsWith('mapbox:')
					)
				}
				if (f.layer.id === 'building') return false // if the layer is mapbox's 'building', then we want to filter it out
				return true // if there are no metadata, then we want to keep the feature
			})

			const ID = notSimpleFeatures[0]?.properties.ID
			const layerName = notSimpleFeatures[0]?.layer['source-layer']
			const mapID = notSimpleFeatures[0]?.id

			// If the user clicks on the same feature, then we want to deselect it
			if (click.ID === ID) {
				return setClick({
					ID: [],
					layerName: [],
				})
			}

			// Otherwise, we want to select the feature
			setClick({
				ID,
				layerName,
			})
		}

		if (currentMap) {
			currentMap.on('click', onClick)
			setValue({
				...click,
				event: 'click',
			})
		}

		return () => {
			if (currentMap) {
				currentMap.off('click', onClick)
			}
		}
		// Dependency array should contain whatever values from
		// the component's scope that are used inside the useEffect
		// In this case, that's map.current
	}, [setClick, click, currentMap])

	// If we want to inject a selection on the map
	useEffect(() => {
		if (!currentMap) return // wait for map to initialize

		setClick({
			ID: configuration.select_id,
		})
	}, [configuration.select_id])

	return null
}

export default GetClick
