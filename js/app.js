
// Global variables
let map,
    placeInfoWindow,
    map_styles = [],
    alllocations = [],
    markers = [];

const start_place = {lat: 40.7413549, lng: -73.9980244};


var initMapStyles = function() {
    "use strict";
    map_styles = [{
        featureType: 'water',
        stylers: [{
            color: '#04a7d8'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#ffffff'
        }, {
            weight: 6
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#efe9e4'
        }, {
            lightness: -40
        }]
    }, {
        featureType: 'transit.station',
        stylers: [{
            weight: 9
        }, {
            hue: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
            visibility: 'on'
        }, {
            color: '#f0e4d3'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
            color: '#efe9e4'
        }, {
            lightness: -25
        }]
    }];
}

// This function will be called on successful load of Google Maps API
var initMap = function() {

    // Apply styles array to use with the map.
    initMapStyles();

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: start_place,
        zoom: 12,
        // styles: map_styles,
        mapTypeControl: false
    });
    ViewModel.init();
}





function initMapMarkers() {
    "use strict";

    var largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    const defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    const highlightedIcon = makeMarkerIcon('FFFF24');

    // Get the count of number of locations
    const numLocations = locations.length;

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < numLocations; i++) {
        // Get the position from the location array.
        const locationObj = locations[i];
        const position = locationObj.location;
        const title = locationObj.title;

        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            // populateInfoWindow(this, largeInfowindow);
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }

    // Initialize the drawing manager.
    /*
     var drawingManager = new google.maps.drawing.DrawingManager({
         drawingMode: google.maps.drawing.OverlayType.POLYGON,
         drawingControl: true,
         drawingControlOptions: {
             position: google.maps.ControlPosition.TOP_LEFT,
             drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
             ]
         }
     });
     */

    displayMarkers();
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}

// This function will loop through the markers array and display them all.
function displayMarkers() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// Function called when there is an error in loading google maps
function mapApiLoadError() {
    "use strict";
    console.log("Map Load Error! Please refresh the page.")
}

var locationModel = {
    self: this,

    all_locations: [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
        {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
        {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
    ],

    init: function() {
        "use strict";
        // These are the real estate listings that will be shown to the user.
        // Normally we'd have these in a database instead.

    }

}

var ViewModel = {

    self: this,

    // variable used to display Application Title
    appTitle: ko.observable("Neighborhood Insights"),

    locations: ko.observableArray(),
    currentLocation: ko.observable(),

    // variable used for search/filter functionality
    searchStr: ko.observable(''),

    // Get the locations details from the locationModel
    numLocations: locationModel.all_locations.length,

    getLocations: function () {
        for (var i = 0; i < this.numLocations; i++) {
            this.locations.push(locationModel.all_locations[i]);
        }
    },

    init: function () {
        "use strict";
        locationModel.init();
        this.getLocations();

        // Activating Knockout.js
        ko.applyBindings(ViewModel);
    }
};

