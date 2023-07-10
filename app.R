# library(cc.map)
library(shiny)

# Fill data ---------------------------------------------------------------

fill_colour <- qs::qread(system.file("data_colour.qs", package = "cc.map"))


# UI / server -------------------------------------------------------------

map_js_UI <- function(id) {
  shiny::tagList(
    actionButton(shiny::NS(id, "button"), "new tileset + color"),
    actionButton(shiny::NS(id, "button2"), "just change color"),
    actionButton(shiny::NS(id, "button3"), "add a selection"),
    actionButton(shiny::NS(id, "button4"), "change viewstate"),
    cc.map::map_input(
      shiny::NS(id, "map"),
      username = "curbcut",
      token = 'pk.eyJ1IjoiY3VyYmN1dCIsImEiOiJjbGprYnVwOTQwaDAzM2xwaWdjbTB6bzdlIn0.Ks1cOI6v2i8jiIjk38s_kg',
      longitude = -73.5,
      latitude = 45.5,
      zoom = 9,
      tileset_prefix = "mtl",
      stories = "mtl_stories")
  )
}

map_js_server <- function(id) {

  shiny::moduleServer(id, function(input, output, session) {

    # Observe change in viewstate. ignore NULL as it gets triggered everytime an
    # output is sent from the map to shiny
    shiny::observeEvent(get_map_viewstate("map"), {
      print(get_map_viewstate("map"))
    }, ignoreNULL = TRUE)

    # Observe click
    shiny::observeEvent(get_map_click("map"), {
      print(get_map_click("map"))
    }, ignoreNULL = TRUE)

    # Add a tileset to the map with fill colours
    observeEvent(input$button, {
      update_map(session = session,
                 map_ID = "map",
                 configuration = list(tileset = "mtl_CMA_auto_zoom",
                                      fill_colour = fill_colour))
    })

    # Just update fill colours
    observeEvent(input$button2, {
      fl_c <- fill_colour
      fl_c$fill <- "#123456"

      update_map(session = session,
                 map_ID = "map",
                 configuration = list(fill_colour = fl_c))
    })

    # Select a random census tract ID (click on first button first to get a CT tileset)
    observeEvent(input$button3, {
      update_map(session = session,
                 map_ID = "map",
                 configuration = list(select_id = sample(fill_colour$ID_color[120:500], 1)))
    })

    # Update the viewstate
    observeEvent(input$button4, {
      update_map(session = session,
                 map_ID = "map",
                 configuration = list(longitude = -73.5172,
                                      latitude = 45.5613,
                                      zoom = 15))
    })
  })
}


ui <- fluidPage(
  theme = bslib::bs_theme(version = "4"),
  titlePanel("reactR mapbox-gl"),
  map_js_UI(id = "test_module")
)

server <- function(input, output, session) {

  map_js_server(id = "test_module")

}

shinyApp(ui, server)

