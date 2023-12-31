% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/events.R
\name{get_map_event}
\alias{get_map_event}
\title{Retrieve Event Information from a Map}
\usage{
get_map_event(
  map_id,
  event_type,
  values,
  session = shiny::getDefaultReactiveDomain()
)
}
\arguments{
\item{map_id}{<\code{character}> The identifier for the map object in the Shiny application.}

\item{event_type}{<\code{character}>The type of event to retrieve information for.}

\item{values}{<\verb{character vector}> A vector of values to be retrieved from the
specified event.}

\item{session}{<\code{session}> The Shiny session object. Defaults to the current reactive
domain.}
}
\value{
The specified values for the event if it exists and is of the
specified event type, NULL otherwise.
}
\description{
This function retrieves the specified event information of a Shiny map object.
The type of event is specified with \code{event_type} and the values to be
retrieved are defined in \code{values}.
}
\examples{
\dontrun{
get_map_event(
  map_id = "map", event_type = "viewstate",
  values = c("lon", "lat", "zoom")
)
}
}
