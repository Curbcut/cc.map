#' Update a map with a choropleth overlay
#'
#' This function updates a map with a choropleth overlay. It generates a
#' configuration list that includes the tileset and fill colour for the choropleth
#' overlay and sends this configuration to the server to update the map.
#'
#' @param session <`shiny::session`> The Shiny session object.
#' @param map_ID <`character`> A unique identifier for the map input.
#' @param tileset <`character`> The tileset to be used for the choropleth overlay.
#' @param fill_colour <`data.frame`> A tibble with two columns: 'ID' and 'fill'. ID is
#' the ID of the feature, and fill are hexes of 6 digits.
#' @param pickable <`logical`> Should there be hovered effect, indicating the layer
#' can be pickable? Defaults to TRUE.
#'
#' @return No return value. The function sends an update message to the Shiny
#' server to update the map.
#'
#' @export
map_choropleth <- function(session, map_ID, tileset, fill_colour, pickable = TRUE) {

  # Create an empty configuration list
  configuration <- list()
  configuration$choropleth <- list()

  # Add the fill colour to the configuration list and transfer it to JSON
  configuration$choropleth$fill_colour <- {
    out <- fill_colour
    names(out)[names(out) == "ID"] <- "ID_color"
    jsonlite::toJSON(out)
  }

  # Add the tileset to the configuration list
  configuration$choropleth$tileset <- tileset

  # Add the pickable to the configuration list
  configuration$choropleth$pickable <- pickable

  # Send the configuration list to the server
  update_map(session = session, map_ID = map_ID, configuration = configuration)
}

#' Update a map's choropleth overlay fill colour
#'
#' This function updates a map's choropleth overlay fill colour. It generates a
#' configuration list that includes the fill colour for the choropleth overlay
#' and sends this configuration to the server to update the map.
#'
#' @param session <`shiny::session`> The Shiny session object.
#' @param map_ID <`character`> A unique identifier for the map input.
#' @param fill_colour <`data.frame`> A tibble with two columns: 'ID' and 'fill'. ID is
#' the ID of the feature, and fill are hexes of 6 digits.
#'
#' @return No return value. The function sends an update message to the Shiny
#' server to update the map.
#'
#' @export
map_choropleth_update_fill_colour <-function(session, map_ID, fill_colour) {

  # Create an empty configuration list
  configuration <- list()
  configuration$choropleth <- list()

  # Add the fill colour to the configuration list and transfer it to JSON
  configuration$choropleth$fill_colour <- {
    out <- fill_colour
    names(out)[names(out) == "ID"] <- "ID_color"
    jsonlite::toJSON(out)
  }

  # Send the configuration list to the server
  update_map(session = session, map_ID = map_ID, configuration = configuration)
}

#' Update a map's selection
#'
#' This function updates a map's selection. It generates a configuration list
#' that includes the selection and a timestamp to ensure changes are recognized
#' each time it's updated. This configuration is sent to the server to update
#' the map.
#'
#' @param session <`shiny::session`> The Shiny session object.
#' @param map_ID <`character`> A unique identifier for the map input.
#' @param select_id <`character`> The selected ID that should be highlighted on
#' the map.
#'
#' @return No return value. The function sends an update message to the Shiny
#' server to update the map.
#'
#' @export
map_choropleth_update_selection <- function(session, map_ID, select_id) {

  # Create an empty configuration list
  configuration <- list()
  configuration$selection <- list()

  # Add the selection with a timestamp, to make sure it gets triggered at every
  # time it's changing.
  configuration$selection$select_id <- select_id
  configuration$selection$timestamp <- Sys.time()

  # Send the configuration list to the server
  update_map(session = session, map_ID = map_ID, configuration = configuration)
}

#' Update a map's selection
#'
#' This function updates a map's selection. It generates a configuration list
#' that includes the selection and a timestamp to ensure changes are recognized
#' each time it's updated. This configuration is sent to the server to update
#' the map.
#'
#' @param session <`shiny::session`> The Shiny session object.
#' @param map_ID <`character`> A unique identifier for the map input.
#'
#' @return No return value. The function sends an update message to the Shiny
#' server to update the map.
#'
#' @export
map_choropleth_remove <- function(session, map_ID) {

  # Create an empty configuration list
  configuration <- list()
  configuration$choropleth <- list()

  # Send a 'remove' character. This will ensure the removal of the choropleth
  # map.
  configuration$choropleth$tileset <- "remove"

  # Send the configuration list to the server
  update_map(session = session, map_ID = map_ID, configuration = configuration)
}
