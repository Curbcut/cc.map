#' map input
#'
#' @importFrom reactR createReactShinyInput
#' @importFrom htmltools htmlDependency tags
#'
#' @export
mapInput <- function(map_ID, default = "", lon, lat, zoom, tileset_prefix) {
  stories <- sprintf("%s_stories", tileset_prefix)
  reactR::createReactShinyInput(
    map_ID,
    "map",
    htmltools::htmlDependency(
      name = "map-input",
      version = "1.0.0",
      src = "www/cc.map.input/map",
      package = "cc.map.input",
      script = "map.js"
    ),
    default,
    list(lon = lon,
         lat = lat,
         zoom = zoom,
         stories = stories),
    htmltools::tags$div
  )
}

#' update map
#'
#' @export
updateMapInput <- function(session, map_ID, configuration = NULL) {
  message <- list(value = map_ID)
  if (!is.null(configuration)) message$configuration <- configuration
  session$sendInputMessage(map_ID, message);
}
