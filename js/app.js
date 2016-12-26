
// Global variables
let map,
    mapOptions,
    infowindow,
    bounds;
const start_point = {lat: 40.7413549, lng: -73.9980244};  

// Model for the Venue
let Venue = function(fs_data, fs_id) {
    this.venueID = fs_data.id;
    this.venueName = fs_data.name;
    this.venueAddress = fs_data.location.formattedAddress;
    this.marker = {};
    this.lat = fs_data.location.lat;
    this.lng = fs_data.location.lng;
    this.venueFsUrl = "https://foursquare.com/v/" + this.venueID;
    // this.venueCategoryName = fs_data.categories[0].name;
    // this.venueCategoryShortName = fs_data.categories[0].shortName;
}

var placeModel = {
    self: this,

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
    }   

}

/*
 * Neighborhood Map View Model.
 */
var ViewModel = function() {

    var self = this;
    var venues = ko.observableArray(),
        selectedVenue = ko.observable(''),
        venueMarkers = [],
        totalVenues = 0,
        searchStr = ko.observable('') // variable used for search/filter functionality
        venue_marker_info_content = ''
    ;

    const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v2/venues/search?ll=';
    const FOURSQUARE_CLIENT_ID = "&client_id=EGYSP4IIH5HNYQADAGR1EB5VOLKE41UXIQJDTJRJ0RW4QWQY";
    const FOURSQUARE_SECRET = "&client_secret=ZAV2UOVVIBJ5HWV2IZ4CTBP4Z1AFTSL3FKVOEY44VLH1PZZY";
    const FOURSQUARE_VERSION = "&v=20161221&venuePhotos=1";

    // variable used to display Application Title
    self.appTitle = ko.observable("Neighborhood Insights");

    function setMarkerInfoContent(venue) {

    }

    function createMarker(venue) {

        console.log('createMarker');

        const venue_position = new google.maps.LatLng(venue.lat, venue.lng);
        
        var marker = new google.maps.Marker({
            map: map,
            position: venue_position,
            title: venue.name,
            animation: google.maps.Animation.DROP,
            draggable: false
            // icon: defaultIcon,
        });

        
        google.maps.event.addListener(marker, 'click', function() {
            venue_marker_info_content = '<div id="v-info-box">'
                                        + '<div class="v-name">'
                                        +  venue.venueName
                                        + '</div>'
                                        + '<div class="v-address">'
                                        +  venue.venueAddress
                                        + '</div>'
                                        + '<div class="v-url">'
                                        + '<a href="' + venue.venueFsUrl + '">' + venue.venueFsUrl + '</a>'
                                        + '</div>'


            ;

            infowindow.setContent(venue_marker_info_content);
            infowindow.open(map, marker);
        });

        marker.setMap(map);

        bounds = new google.maps.LatLngBounds();
        bounds.extend(marker.position);

        //map.fitBounds(bounds);

        venue.marker = marker;

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
                this.totalVenues = data.response.venues.length;

                if (this.totalVenues > 0) {
                    for(let i = 0; i < 10; i++) {
                        var item = data.response.venues[i];
                        venues.push( new Venue(item) );
                    }
                    venues().forEach(function(vitem) {
                        createMarker(vitem);
                    });
                } else {
                    alert("No venues found for this location!!");
                }
            }
        });
    }

    function getVenues(location) {
        console.log("getVenues");
        console.log(location);
        infowindow = new google.maps.InfoWindow();

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
            zoom: 16,
            disableDefaultUI: true
        };

        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        $('#map').height($(window).height());
/*
        infowindow = new google.maps.InfoWindow({
            maxWidth: 150,
            content: ""
        });
*/
    }
}

$(function() {
    ko.applyBindings(new ViewModel());
});

