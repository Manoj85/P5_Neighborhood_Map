
// Global variables
let map,
    mapOptions,
    markers = [],
    infowindow,
    bounds;
const start_point = {lat: 40.7413549, lng: -73.9980244};  


// Model for the Venue
let venue = function(fs_data, fs_id) {

}

var placeModel = {
    self: this,

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

    }

}

/*
 * Neighborhood Map View Model.
 */
var ViewModel = function() {

    var self = this;
    var venues = ko.observableArray(''),
        selectedVenue = ko.observable(''),
        venueMarkers = [],
        totalVenues = 0,
        searchStr = ko.observable('') // variable used for search/filter functionality
    ;

    const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v2/venues/search?ll=';
    const FOURSQUARE_CLIENT_ID = "&client_id=EGYSP4IIH5HNYQADAGR1EB5VOLKE41UXIQJDTJRJ0RW4QWQY";
    const FOURSQUARE_SECRET = "&client_secret=ZAV2UOVVIBJ5HWV2IZ4CTBP4Z1AFTSL3FKVOEY44VLH1PZZY";
    const FOURSQUARE_VERSION = "&v=20161221&venuePhotos=1";

    // variable used to display Application Title
    self.appTitle = ko.observable("Neighborhood Insights");

    function createMarker(venue) {

        const venue_position = new google.maps.LatLng(venue.location.lat, venue.location.lng);

        var marker = new google.maps.Marker({
            map: map,
            position: venue_position,
            title: venue.name,
            animation: google.maps.Animation.DROP,
            draggable: false
            // icon: defaultIcon,
        });

        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });

    }

    // Get the places details using the FourSquare API
    function getData(start_point) {
        "use strict";
        const FS_URL = FOURSQUARE_BASE_URL + start_point.lat + ',' + start_point.lng + FOURSQUARE_CLIENT_ID + FOURSQUARE_SECRET + FOURSQUARE_VERSION;

        console.log(FS_URL);

        $.ajax({
            type: "GET",
            url: FS_URL,
            dataType: "JSONP",
            cache: false,
            success: function (data) {
                console.log(data.response.venues.length);
                this.venues = data.response.venues;
                //console.log(this.venues);

                this.totalVenues = this.venues.length;
                if (this.totalVenues > 0) {
                    for(let i=0; i < 10; i++) {
                        var venueObj = this.venues[i];
                        // console.log( venueObj );
                        createMarker(venueObj);
                    }
                } else {
                    alert("No venues found for this location!!");
                }
            }
        });
    }

    function getVenues(location) {
        console.log("getVenues");
        console.log(location);

        this.venues = [];

        infowindow = new google.maps.InfoWindow({
            maxWidth: 150,
            content: ""
        });

        map.addListener("click", function(){
            infowindow.close(infowindow);
        });

        // Get Nearby venues from this location
        getData(location);
    }

    getVenues(start_point);
}

function initMap() {
    console.log("initMap");

    const mapErrorMessage = '<h3>Problem retrieving Map Data. Please reload the page to retry!</h3>';

    if(typeof google === 'undefined') {
        console.log("google undefined");
        $("#map-error").html(mapErrorMessage);
        return;
    } else {
        console.log("google defined");
        mapOptions = {
            'center': start_point,
            zoom: 17,
            disableDefaultUI: true
        };

        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        $('#map').height($(window).height());
    }
}

$(function() {
    ko.applyBindings(new ViewModel());
});

