
// Global variables
let map,
    alllocations = [],
    markers = [],
    infowindow,
    bounds;

// Set the initial point for the map
const start_point = {lat: 40.7413549, lng: -73.9980244};

// Create Map Options
const mapOptions = {
    "center": start_point,
    "zoom": 12,
    "disableDefaultUI": true
}

const mapErrorMessage = '<h3>Problem retrieving Map Data. Please reload the page to retry!</h3>'

// This function will be called on successful load of Google Maps API
var initMap = function() {


    if(typeof google === 'undefined') {
        $("#map-error").html(mapErrorMessage);
        return;
    } else {
        map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // Close infowindow when clicked elsewhere on the map
        map.addListener("click", function(){
            infowindow.close(infowindow);
        });
    }

    // Define InfoWindow
    infowindow = new google.maps.InfoWindow({
        maxWidth: 150,
        content: ""
    });

    // Define bounds
    bounds = new google.maps.LatLngBounds();

    // Initialize ViewModel
    viewModel.init();
}


// Model for the location
var locationModel = {
    self: this,

    FOURSQUARE_BASE_URL: 'https://api.foursquare.com/v2/venues/search?ll=',
    FOURSQUARE_CLIENT_ID: "&client_id=EGYSP4IIH5HNYQADAGR1EB5VOLKE41UXIQJDTJRJ0RW4QWQY",
    FOURSQUARE_SECRET: "&client_secret=ZAV2UOVVIBJ5HWV2IZ4CTBP4Z1AFTSL3FKVOEY44VLH1PZZY",
    FOURSQUARE_VERSION: "&v=20161221",

    all_locations: [
        {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
        {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
        {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
        {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
        {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
        {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
    ],

    setBoundaries: function() {
        "use strict";
        if (markers && markers.length > 0) {
            const numMarkers = markers.length;
            // Extend the boundaries of the map for each marker and display the marker
            for (let i = 0; i < numMarkers; i++) {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
            }
            map.fitBounds(bounds);
        }
    },

    // Creates a new marker icon with provided color.
    setMarkerIcon: function(color) {
        "use strict";
        const markerIcon = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ color +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerIcon;
    },

    //creates a marker for each location.
    initMarkers: function () {
        "use strict";

        // Style the markers a bit. This will be our listing marker icon.
        const defaultIcon = this.setMarkerIcon('0091ff');

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        const highlightedIcon = this.setMarkerIcon('FFFF24');


        if (this.all_locations && this.all_locations.length > 0) {
            // Get the count of number of locations
            const numLocations = this.all_locations.length;

            for (var i = 0; i < numLocations; i++) {
                let locationObj = this.all_locations[i];
                const position = locationObj.location;
                const title = locationObj.title;

                // Create a marker per location, and put into markers array.
                let marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    animation: google.maps.Animation.DROP,
                    draggable: false,
                    icon: defaultIcon,
                    id: i
                });

                markers.push(marker);

                // Create an onclick event to open the large infowindow at each marker.
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
                // Two event listeners - one for mouseover, one for mouseout,
                // to change the colors back and forth.
                marker.addListener('mouseover', function() {
                    this.setIcon(highlightedIcon);
                });
                marker.addListener('mouseout', function() {
                    this.setIcon(defaultIcon);
                });

                locationObj.marker = marker;
            }

            this.setBoundaries();
        }

    },

    getData: function () {
        "use strict";
        if (this.all_locations && this.all_locations.length > 0) {
            const numLocations = this.all_locations.length;

            for (var i = 0; i < numLocations; i++) {
                let locationObj = this.all_locations[i];
                const position = locationObj.location;
                const title = locationObj.title;


                const FS_URL = this.FOURSQUARE_BASE_URL + position.lat + ',' + position.lng + this.FOURSQUARE_CLIENT_ID + this.FOURSQUARE_SECRET + this.FOURSQUARE_VERSION;

                console.log(FS_URL);

                $.get({
                    type: "GET",
                    url: FS_URL,
                    dataType: "JSONP",
                    cache: false,
                    success: function (data) {
                        console.log(data);
                    }
                });

            }
        }

    },

    init: function() {
        "use strict";
        this.initMarkers();
        this.getData();
    }

}

var viewModel = {

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
        ko.applyBindings(viewModel);
    }


};

