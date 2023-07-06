#' Create a React Shiny input for a map
#'
#' This function creates a React Shiny input for a map. It generates a map
#' input widget with specified parameters and adds it to the Shiny application.
#'
#' @param map_ID <`character`> A unique identifier for the map input.
#' @param username <`character`> Mapbox username, where the tilesets live.
#' @param token <`character`> Necessary token to access mapbox.
#' @param lon <`numeric`> The longitude value for the initial map center.
#' @param lat <`numeric`> The latitude value for the initial map center.
#' @param zoom <`numeric`> The zoom level for the initial map display.
#' @param tileset_prefix <`numeric`> The prefix for the tileset to be used with the map.
#' This will be used only for the stories tileset.
#'
#' @return A React Shiny input widget for the map.
#'
#' @importFrom reactR createReactShinyInput
#' @importFrom htmltools htmlDependency tags div
#'
#' @export
map_input <- function(map_ID, username, token, lon, lat, zoom, tileset_prefix) {
  stories <- sprintf("%s_stories", tileset_prefix)
  print("pasa algo")
  reactR::createReactShinyInput(
    map_ID,
    "map",
    htmltools::htmlDependency(
      name = "map-inputss",
      version = "1.0.0",
      src = "www/cc.map/map",
      package = "cc.map",
      script = "map.js"
    ),
    "",
    list(
      username = username,
      token = token,
      lon = lon,
      lat = lat,
      zoom = zoom,
      stories = stories
    ),
    htmltools::tags$div
  )
}

#' Update a map in a Shiny application
#'
#' This function updates a map in a Shiny application by sending an input message
#' to the specified map_ID. It includes a configuration object for updating specific
#' aspects of the map.
#'
#' @param session <`session`> The Shiny session object.
#' @param map_ID <`character`> The identifier of the map to be updated.
#' @param configuration A named list object for updating the map, with the following
#' options:
#' - `viewstate`: To update viewstate, configuration must be a named list of
#'  `lat`, `lon`, and `zoom`, as numeric.
#' - `select_id`: A character value to update the selected feature on the map.
#' Selection must be in the viewport for the feature to get updated. Update viewstate first.
#' - `fill_colour`: A tibble with two columns: 'ID_color' and 'fill'. ID_color is
#' the ID of the feature, and fill are hexes of 6 digits. The tibble needs to be converted
#' to `jsonlite::toJSON` before sending as a configuration.
#' - `tileset`: A character value to update the tileset used for rendering the map.
#' Should be used in combination with `fill_colour`.
#'
#' @return None.
#'
#' @export
update_map <- function(session, map_ID, configuration = NULL) {
  message <- list(value = map_ID)
  if (!is.null(configuration)) message$configuration <- configuration
  session$sendInputMessage(map_ID, message)
}
