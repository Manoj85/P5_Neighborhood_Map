
// Global variables
let map,
    placeInfoWindow;


// This function will be called on successful load of Google Maps API
function mapApiLoadSuccess() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13
    });
}

// Function called when there is an error in loading google maps
function mapApiLoadError() {
    "use strict";
    console.log("Map Load Error! Please refresh the page.")
}

var ViewModel = function () {
    "use strict";

    // Setting the Application Title
    this.appTitle = ko.observable("Neighborhood Insights");

};

// Activating Knockout.js
ko.applyBindings(new ViewModel());