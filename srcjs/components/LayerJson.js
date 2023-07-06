import { useEffect } from 'react'

function LayerJson({ setSourceLayers, username, configuration, token }) {
	useEffect(() => {
		if (!configuration.tileset) return null

		const layerUrl = `https://api.mapbox.com/v4/${username}.${configuration.tileset}.json?secure&access_token=${token}`
		fetch(layerUrl)
			.then((response) => response.json())
			.then((srcLayers) => {
				setSourceLayers(srcLayers?.vector_layers)
			})
			.catch((error) => console.error('Error:', error))
	}, [username, configuration.tileset, token, setSourceLayers])

	return null
}

export default LayerJson
