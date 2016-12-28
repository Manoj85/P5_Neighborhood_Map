
// Global variables
let map,
    mapOptions,
    infowindow,
    bounds;
const start_point = {lat: 40.7413549, lng: -73.9980244}; 
const number_of_markers_to_display = 10;

// Model for the Venue
let Venue = function(fs_data, fs_id) {
    this.venueID = fs_data.id;
    this.venueName = ko.observable(fs_data.name);
    this.venueAddress = fs_data.location.formattedAddress;
    this.marker = {};
    this.lat = fs_data.location.lat;
    this.lng = fs_data.location.lng;
    this.venueFsUrl = "https://foursquare.com/v/" + this.venueID;
    this.visible = ko.observable(true);
    // this.venueCategoryName = fs_data.categories[0].name;
    // this.venueCategoryShortName = fs_data.categories[0].shortName;
}

/*
 * Neighborhood Map View Model.
 */
let ViewModel = function() {

    const self = this;
    let venue_marker_info_content = '';

    const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v2/venues/search?ll=';
    const FOURSQUARE_CLIENT_ID = "&client_id=EGYSP4IIH5HNYQADAGR1EB5VOLKE41UXIQJDTJRJ0RW4QWQY";
    const FOURSQUARE_SECRET = "&client_secret=ZAV2UOVVIBJ5HWV2IZ4CTBP4Z1AFTSL3FKVOEY44VLH1PZZY";
    const FOURSQUARE_VERSION = "&v=20161221&venuePhotos=1";

    // variable used to display Application Title
    self.venues = ko.observableArray([]);
    self.filteredVenue = ko.observable('');
    self.totalVenues = 0;

    /*
     * Name: getRandomArbitrary
     * Details: Generates 10 random numbers (or indexes, in this case)
     */
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    } 

    /*
     * Name: createInfoWindowContent
     * Details: Generates the content for each venue's infoWindow
     */
    function createInfoWindowContent(venue) {
        venue_marker_info_content = `
            <section id="v-info-box">
                <div class="v-name">${venue.venueName()}</div>
                <div class="v-address">${venue.venueAddress}</div>
                <div class="v-url"><a href="${venue.venueFsUrl}">${venue.venueFsUrl}</a></div>
            </section>
        `;
    }

    function doFilterVenues(venue) {
        const venueFilterTxt = filteredVenue().toLowerCase();

        self.venues().forEach(function (vitem) {
            const vname = vitem.venueName();
            if ( vname.toLowerCase().search(venueFilterTxt) === -1 ){
                vitem.visible(false);
                vitem.marker.setVisible(false);
            } else {
                infowindow.close(map, vitem.marker);
                vitem.visible(true);
                vitem.marker.setVisible(true);
            }
        });
    }

    function createMarker(venue) {
        const venue_position = new google.maps.LatLng(venue.lat, venue.lng);
        let marker = new google.maps.Marker({
            map: map,
            position: venue_position,
            title: venue.name,
            animation: google.maps.Animation.DROP,
            draggable: false
            // icon: defaultIcon,
        });
        
        google.maps.event.addListener(marker, 'click', function() {
            createInfoWindowContent(venue);
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
        $.ajax({
            type: "GET",
            url: FS_URL,
            dataType: "JSONP",
            cache: false,
            success: function (data) {
                self.totalVenues = data.response.venues.length;
                if (self.totalVenues > 0) {

                    getRandomArbitrary(0, self.totalVenues)

                    for(let i = 0; i < number_of_markers_to_display; i++) {
                        const index = getRandomArbitrary(0, self.totalVenues);
                        const item = data.response.venues[index];
                        self.venues.push( new Venue(item) );
                    }
                    self.venues().forEach(function(vitem) {
                        createMarker(vitem);
                    });
                } else {
                    alert("No venues found for this location!!");
                }
            }
        });
    }

    function getVenues(location) {
        infowindow = new google.maps.InfoWindow();
        // Get Nearby venues from this location
        getData(location);
    }

    // Call doFilterVenues whenever the venueFiltered changes
    self.filteredVenue.subscribe(doFilterVenues);

    // Trigger this function on clicking a venue from the venue list
    self.showVenue = function(venue) {
        google.maps.event.trigger(venue.marker, "click");
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
    }
}

$(function() {
    ko.applyBindings(new ViewModel());
});

