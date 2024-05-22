// Initialize the map and set its view to a default location and zoom level
var myLatLng = [38.3460, -0.4907];
var map = L.map('map').setView(myLatLng, 7);

// Add the OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize the routing control
var control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim(),
    createMarker: function(i, waypoint, n) {
        // Customize markers for origin and destination
        var marker = L.marker(waypoint.latLng, {
            draggable: true,
        });
        return marker;
    }
}).addTo(map);

// Function to calculate or modify the route
function calcRoute() {
    var from = document.getElementById("from").value;
    var to = document.getElementById("to").value;

    var geocodeUrl = "https://nominatim.openstreetmap.org/search?format=json&q=";

    // Geocode the 'from' address
    $.getJSON(geocodeUrl + from, function (fromData) {
        if (fromData.length > 0) {
            var fromLatLng = L.latLng(fromData[0].lat, fromData[0].lon);

            // Geocode the 'to' address
            $.getJSON(geocodeUrl + to, function (toData) {
                if (toData.length > 0) {
                    var toLatLng = L.latLng(toData[0].lat, toData[0].lon);

                    // Update the routing control with new waypoints
                    control.setWaypoints([fromLatLng, toLatLng]);

                    // Optionally, fit the map to the route
                    map.fitBounds([
                        fromLatLng,
                        toLatLng
                    ]);

                    // Calculate and display the route details
                    control.on('routesfound', function (e) {
                        var routes = e.routes;
                        var summary = routes[0].summary;

                        const output = document.querySelector('#output');
                        output.innerHTML = "<div class='alert-info'>From: " + from + ".<br />To: " + to + ".<br /> Driving distance <i class='fas fa-road'></i> : " + (summary.totalDistance / 1000).toFixed(2) + " km.<br />Duration <i class='fas fa-hourglass-start'></i> : " + (summary.totalTime / 3600).toFixed(2) + " hours.</div>";

                        // Save route to database
                        saveRouteToDatabase(from, to, control.getWaypoints(), (summary.totalDistance / 1000).toFixed(2), (summary.totalTime / 3600).toFixed(2));
                    });
                } else {
                    alert("Destination not found");
                }
            });
        } else {
            alert("Origin not found");
        }
    });
}

// Function to delete the route
function deleteRoute() {
    control.setWaypoints([]);
    document.getElementById('output').innerHTML = '';

    // Delete route from database
    deleteRouteFromDatabase();
    console.log('Route deleted from the database');
}

// Function to save the route to the database
function saveRouteToDatabase(from, to, waypoints, distance, duration) {
    // Convert waypoints to a format suitable for storage
    var waypointsJSON = JSON.stringify(waypoints.map(function(waypoint) {
        return { lat: waypoint.latLng.lat, lng: waypoint.latLng.lng };
    }));

    $.ajax({
        type: "POST",
        url: "/saveRoute",
        contentType: "application/json",
        data: JSON.stringify({
            origin: from,
            destination: to,
            waypoints: waypointsJSON,
            distance: distance,
            duration: duration
        }),
        success: function(response) {
            console.log('Route saved:', response);
        },
        error: function(error) {
            console.error('Error saving route:', error);
        }
    });
}

// Function to delete the route from the database
function deleteRouteFromDatabase() {
    // Implement code to delete the route from the database
    // For demonstration purposes, this function is left empty
}

// Create autocomplete objects for all inputs using a simple implementation or a library for address autocomplete
var fromInput = document.getElementById("from");
var toInput = document.getElementById("to");

function setupAutocomplete(input) {
    input.addEventListener("input", function () {
        // Simple autocomplete implementation
        var geocodeUrl = "https://nominatim.openstreetmap.org/search?format=json&q=" + input.value;
        $.getJSON(geocodeUrl, function (data) {
            // You can enhance this with a proper autocomplete dropdown
        });
    });
}

setupAutocomplete(fromInput);
setupAutocomplete(toInput);
