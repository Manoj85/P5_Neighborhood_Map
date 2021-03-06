
// Global variables
let map,
    mapOptions,
    infowindow,
    bounds,
    vm;
const start_point = {lat: 40.7413549, lng: -73.9980244}; 
const number_of_markers_to_display = 10;

// Model for the Venue
let Venue = function(fs_data) {
    this.venueID = fs_data.id;
    this.venueName = ko.observable(fs_data.name);
    this.venueAddress = fs_data.location.formattedAddress;
    this.marker = null;
    this.lat = fs_data.location.lat;
    this.lng = fs_data.location.lng;
    this.venueFsUrl = 'https://foursquare.com/v/' + this.venueID;
    this.visible = ko.observable(true);
    // this.venueCategoryName = fs_data.categories[0].name;
    // this.venueCategoryShortName = fs_data.categories[0].shortName;
};

/*
 * Neighborhood Map View Model.
 */
let ViewModel = function() {

    let self = this;
    let venue_marker_info_content = '';

    const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v2/venues/search?ll=';
    const FOURSQUARE_CLIENT_ID = '&client_id=EGYSP4IIH5HNYQADAGR1EB5VOLKE41UXIQJDTJRJ0RW4QWQY';
    const FOURSQUARE_SECRET = '&client_secret=ZAV2UOVVIBJ5HWV2IZ4CTBP4Z1AFTSL3FKVOEY44VLH1PZZY';
    const FOURSQUARE_VERSION = '&v=20161221&venuePhotos=1';

    self.venues = ko.observableArray([]);
    self.venueFilterTxt = ko.observable('');
    self.totalVenues = 0;
    self.apiErrorMessage = ko.observable();
    self.mapErrorMessage = ko.observable();

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
                <div class="v-url"><a href="${venue.venueFsUrl}" target="_blank">${venue.venueFsUrl}</a></div>
            </section>
        `;
    }

    /*
     * Name: setAnimateMarker
     * Details: Animates the marker on the map
     */
    function setAnimateMarker(vmarker) {
        'use strict';

        // Check if the selected marker has animation already
        if (vmarker.getAnimation() === null) {
            self.venues().forEach(function(venue) {
                venue.marker.setAnimation(null);
            });
            vmarker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    /*
     * Name: showVenueInfo
     * Details: Takes care of opening info windows and bouncing markers
     */
    self.showVenueInfo = function(venue) {
        'use strict';
        setAnimateMarker(venue.marker);
        createInfoWindowContent(venue);
        infowindow.setContent(venue_marker_info_content);
        infowindow.open(map, venue.marker);
    };

    self.filteredVenuesList = ko.computed(function(){
        const filter = self.venueFilterTxt().toLowerCase();

        if (!filter || filter.trim() === '') {
            // Return the original array;
            return ko.utils.arrayFilter(self.venues(), function(item) {
                item.visible(true);
                item.marker && item.marker.setVisible(true);
                return true;
            });
        } else {
            return ko.utils.arrayFilter(self.venues(), function(item) {
                if (item.venueName().toLowerCase().indexOf(filter) >= 0) {
                    item.marker.setVisible(true);
                    return true;
                } else {
                    item.visible(false);
                    item.marker.setVisible(false);
                    return false;
                }
            });
        }
    }, this);

    /*
     * Name: createMarker
     * Details: Create marker for each of the venues
     */
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

        marker.setMap(map);
        bounds.extend(marker.position);
        map.fitBounds(bounds);
        venue.marker = marker;

        google.maps.event.addListener(venue.marker, 'click', function () {
            self.showVenueInfo(venue);
        });
    }

    // Get the places details using the FourSquare API
    function getData(start_point) {
        'use strict';
        const FS_URL = FOURSQUARE_BASE_URL + start_point.lat + ',' + start_point.lng + FOURSQUARE_CLIENT_ID + FOURSQUARE_SECRET + FOURSQUARE_VERSION;
        const FS_ERROR_MESSAGE = `<h3>Problem retrieving FourSquare API Data. Please reload the page to retry!</h3>`;

        $.ajax({
            type: 'GET',
            url: FS_URL,
            dataType: 'JSONP',
            cache: false,
            success: function (data) {
                // self.apiErrorMessage = ko.observable('');
                document.getElementById('api-error').style.display = 'none';
                document.getElementById('api-error').innerHTML = '';

                self.totalVenues = data.response.venues.length;
                if (self.totalVenues > 0) {
                    let randomIndexArr = [];
                    for (let i = 0, count = 0; i < count, count < number_of_markers_to_display; i++) {
                        let index;
                        do {
                            index = getRandomArbitrary(0, self.totalVenues);
                        }
                        while(randomIndexArr.indexOf(index) !== -1) {
                            randomIndexArr.push(index);
                            count++;
                        }
                    }

                    const randomIndexArrLength = randomIndexArr.length;
                    for (let j = 0; randomIndexArrLength > 0, j < randomIndexArrLength; j++) {
                        let index = randomIndexArr[j];
                        const item = data.response.venues[index];
                        self.venues.push( new Venue(item) );
                    }

                    self.venues().forEach(function(vitem) {
                        createMarker(vitem);
                    });

                } else {
                    alert('No venues found for this location!!');
                }
            },
            error: function(data) {
                console.log('error');
                // self.apiErrorMessage = ko.observable(FS_ERROR_MESSAGE);
                document.getElementById('api-error').style.display = 'block';
                document.getElementById('api-error').innerHTML = FS_ERROR_MESSAGE;
            }
        });
    }

    function getVenues(location) {
        infowindow = new google.maps.InfoWindow();
        bounds = new google.maps.LatLngBounds();

        setMapCenter(location);

        // Get Nearby venues from this location
        getData(location);
    }

    function setMapCenter(location) {
        'use strict';
        const startLocation = new google.maps.LatLng(location.lat, location.lng);
        map.setCenter(startLocation);
        map.fitBounds(bounds);
    }

    getVenues(start_point);
}

function googleError() {
    const MAP_ERROR_MESSAGE = `<h3>Problem retrieving Map Data. Please reload the page to retry!</h3>`;
    // vm.mapErrorMessage(MAP_ERROR_MESSAGE);
    document.getElementById('map-error').style.display = 'block';
    document.getElementById('map-error').innerHTML = MAP_ERROR_MESSAGE;
}

function initMap() {
    console.log('initMap');
    mapOptions = {
        zoom: 16,
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $('#map').height($(window).height());

    google.maps.event.addDomListener(window, 'resize', function() {
        const center_point = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center_point);
        map.fitBounds(bounds);
    });

    document.getElementById('map-error').style.display = 'none';
    document.getElementById('map-error').innerHTML = '';

    vm = new ViewModel();
    ko.applyBindings(vm);
}



