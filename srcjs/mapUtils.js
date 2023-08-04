export const jsonToColorMap = (json) => {
	// Return null if json is undefined
	if (!json) return null
	if (json === undefined) return null

	const colorMap = {}

	// Ensure json is an array
	json = Array.isArray(json) ? json : [json]

	// Create color map
	json.forEach(({ ID_color, fill }) => (colorMap[ID_color] = fill))

	return colorMap
}

export const createStyleFunction = (colorMap) => {
	if (!colorMap) return null
	const defaultColor = 'transparent' // fallback color

	// If there is no colorMap, then return the default color
	if (!colorMap) return defaultColor

	const styleFunction = [
		'match',
		['get', 'ID_color'],
		...Object.entries(colorMap).reduce(
			(acc, [key, value]) => acc.concat(key, value),
			[]
		),
		defaultColor,
	]
	return styleFunction
}

export const createModifiedStyleFunction = (
	colorMap,
	clickID,
	selectionColor
) => {
	// Copy colorMap to not mutate the original
	const newColorMap = { ...colorMap }

	// Remove the color associated with clickID
	delete newColorMap[clickID]

	// Use selectionColor for clickID
	newColorMap[clickID] = selectionColor

	const defaultColor = 'transparent' // fallback color
	const styleFunction = [
		'match',
		['get', 'ID_color'],
		...Object.entries(newColorMap).reduce(
			(acc, [key, value]) => acc.concat(key, value),
			[]
		),
		defaultColor,
	]
	return styleFunction
}
