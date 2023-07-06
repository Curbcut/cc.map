library(shiny)

 devtools::load_all()


# Event functions ---------------------------------------------------------

get_map_event <- function(map_id, event_type, values, session = shiny::getDefaultReactiveDomain()) {
  if (!is.na(session$input[[map_id]]["event"])) {
    if (session$input[[map_id]]["event"] == event_type) {
      return(session$input[[map_id]][values])
    }
  }
}

get_map_viewstate <- function(map_id, session = shiny::getDefaultReactiveDomain()) {
  get_map_event(map_id = map_id, event_type = "viewstate",
                values = c("lon", "lat", "zoom"), session = session)
}
get_map_click <- function(map_id, session = shiny::getDefaultReactiveDomain()) {
  get_map_event(map_id = map_id, event_type = "click",
                values = c("ID", "sourceLayer"), session = session)
}


# Fill data ---------------------------------------------------------------

fill_colour <- qs::qread("data_colour.qs")
names(fill_colour)[1] <- "ID_color"


# UI / server -------------------------------------------------------------


ui <- fluidPage(
  theme = bslib::bs_theme(version = "4"),
  titlePanel("reactR mapbox-gl"),
  actionButton("button", "new tileset + color"),
  actionButton("button2", "just change color"),
  actionButton("button3", "add a selection"),
  actionButton("button4", "change viewstate"),
  mapInput("map", lon = -73.5, lat = 45.5, zoom = 9, tileset_prefix = "mtl")

)

server <- function(input, output, session) {
  shiny::observeEvent(get_map_viewstate("map"), {
    print(get_map_viewstate("map"))
  }, ignoreNULL = TRUE)


  shiny::observeEvent(get_map_click("map"), {
      print(get_map_click("map"))
  }, ignoreNULL = TRUE)

  observeEvent(input$button, {
    updateMapInput(session = session,
                   map_ID = "map",
                   configuration = list(tileset = "mtl_CMA_CT",
                                        fill_colour = jsonlite::toJSON(fill_colour)))
  })

  observeEvent(input$button2, {
    fl_c <- fill_colour
    fl_c$fill <- "#123456"

    updateMapInput(session = session,
                   map_ID = "map",
                   configuration = list(fill_colour = jsonlite::toJSON(fl_c)))
  })

  observeEvent(input$button3, {
    updateMapInput(session = session,
                   map_ID = "map",
                   configuration = list(select_id = sample(fill_colour$ID_color[120:500], 1)))
  })

  observeEvent(input$button4, {
    updateMapInput(session = session,
                   map_ID = "map",
                   configuration = list(lon = -73.5172,
                                        lat = 45.5613,
                                        zoom = 15))
  })
}

shinyApp(ui, server)

