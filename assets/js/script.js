// Allow the Materialize side navbar on mobile view
// Code snippet taken from Materialize documentation
$(document).ready(function() {
    $('.sidenav').sidenav();
});


// Create all 14 slides of the regions carousel & the 11 oversea territories list items by iterating through each object of regions-config.js
for (let region of REGION_CONFIG) {

    // 14 REGION SLIDES
    // Select only regions, and not oversea territories
    if (region.id.includes('region')) {
        // Creation of the slide with data from regions-config.js
        let slide = '';
        slide += '<li class="glide__slide">';
        slide += '<div class="region-card" id="' + region.id + '" style="background-image:linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(' + region.slideBackground + ')">';
        slide += '<h3 class="region-card-name">' + region.name + '</h3>';
        slide += '</div>';
        slide += '</li>';

        // Insert the slide into index.html
        $('.glide__slides').append(slide);

    } else if (region.id.includes('oversea')) {
        // 10 OVERSEA LIST ITEMS
        // Select only oversea territories, and not regions

        // Creation of the list item with data from regions-config.js
        let link = '<li><span id="' + region.id + '" class="oversea-name">' + region.name + '</span></li>';

        // Insert the list item into index.html
        $('#region-overseas > ul').append(link);
    }
}


// Global variables
let map;
let infowindow;
let currentInfowindow;
let bounds;
let service;
var markers = [];
var markerClusterer;
let selectedRegionId;
let selectedArea;
let ccTLD;


// Initiate the map
// Code snippet taken from Google Maps documentation
function initMap() {
    new google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.67, lng: 2.5 },
        zoom: 7
    });
    bounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow();
    currentInfowindow = infowindow;
}


// Display the right region-related content depending on which slide is clicked
$('.region-card, .oversea-name').click(function() {

    // Make the selection invitation <p> disappear
    $('#region-selection-invite').slideUp();

    // Determine which card has been clicked
    selectedRegionId = this.id;

    displayDetails();

    regionSelection();

    // Show the map
    $('#map').fadeIn('slow');

    // Show a "Back" link only when an oversea territory content is displayed and adds margin-top to the map-section so "Back" is displayed properly
    if (selectedRegionId.includes("oversea")) {
        $('#back-to-overseas-list').fadeIn('slow');
        $('#map-section').css('margin-top', '3rem');
    } else {
        $('#back-to-overseas-list').fadeOut('fast');
        $('#map-section').css('margin-top', '0');
    }
});


// Display the region's details after a slide/list item has been clicked
function displayDetails() {
    const regionConfig = REGION_CONFIG.filter(eachRegionConfig => eachRegionConfig.id === selectedRegionId);

    if (regionConfig) {
        const { name: regionName, description: regionDescription, blazon: regionBlazon, ccTLD: regionCode } = regionConfig[0];

        // Record which area is selected, for later filter use
        selectedArea = regionName;
        ccTLD = regionCode;

        // Change the region's name... 
        $('#region-name').fadeOut('fast').queue(function() {
            $('#region-name').text(regionName).fadeIn('slow');
            $(this).dequeue();
        });
        if (selectedRegionId !== 'region-om') { // ... the blazon...
            $('#region-blazon').fadeOut('fast').queue(function() {
                $('#region-blazon').attr('src', regionBlazon).attr('alt', `Blazon of the region ${regionName}`).fadeIn('slow');
                $('#region-overseas').fadeOut('fast');
                $('#map-filters').fadeIn('slow'); // Show the filters associated to the selected region
                $(this).dequeue();

                // Set the width of the New Caledonyan emblem to 50% instead of 80% for any other blazons (too high otherwise)
                if (selectedRegionId == "oversea-nc") {
                    $('#region-blazon').width('50%');
                } else {
                    $('#region-blazon').width('80%');
                }
            });
        } else { // If the selected region is Outre Mer, it hides the blazon img (since Outre Mer is a collection of different territories, it does not have a blazon) and the filters - and shows the different oversea territories listing
            $('#region-blazon').fadeOut('fast');
            $('#region-overseas').fadeIn('slow');
            $('#map-filters').fadeOut('fast');
        } // ... and the description
        $('#region-description').fadeOut('fast').queue(function() {
            $('#region-description').text(regionDescription).fadeIn('slow');
            $(this).dequeue();
        });
    }
}


// Center the map on the selected region with its border highlighted
// Code taken from Google Maps documentation & modified to fit the app
function regionSelection() {
    const regionConfig = REGION_CONFIG.filter(eachRegionConfig => eachRegionConfig.id === selectedRegionId);

    if (regionConfig) {
        const { coordinates: regionCoordinates } = regionConfig[0];

        let selectedRegion = new google.maps.LatLng(regionCoordinates.lat, regionCoordinates.lng);
        map = new google.maps.Map(document.getElementById('map'), {
            center: selectedRegion,
            zoom: regionCoordinates.zoom,
        });

        // Display a blue line surrounding the selected region 
        // Code snippet found on https://ourcodeworld.com/articles/read/830/how-to-highlight-an-area-city-state-or-country-in-google-maps-with-javascript & modified to fit the app
        let boundariesConfig;
        let regionBoundaries;

        let polygon;

        if (selectedRegionId == "region-om") { // Set boundaries on all oversea territories
            boundariesConfig = BOUNDARIES_DATA.filter(eachBoundariesData => eachBoundariesData.id.includes("oversea"));

            for (let { boundaries: regionBoundaries }
                of boundariesConfig) {
                polygon = new google.maps.Polygon({
                    paths: regionBoundaries,
                    strokeColor: "#000091",
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    fillColor: "#000091",
                    fillOpacity: 0.1
                });
                polygon.setMap(map);
            }

        } else { // Set boundaries on the selected region/oversea territory only
            boundariesConfig = BOUNDARIES_DATA.filter(eachBoundariesData => eachBoundariesData.id === selectedRegionId);
            regionBoundaries = boundariesConfig[0].boundaries;

            polygon = new google.maps.Polygon({
                paths: regionBoundaries,
                strokeColor: "#000091",
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: "#000091",
                fillOpacity: 0.1
            });
            polygon.setMap(map);
        }
    }
}

// Reset the bounds of the map & delete the previous markers from the map
$('.map-icons').click(function() {
    bounds = new google.maps.LatLngBounds();
    deleteMarkers();
});


// Switch "keyword" in Google Maps request according to the chosen filter
$('#hotels').click(function() {
    filteredLocations(`hotels in ${selectedArea}`);
});
$('#restaurants').click(function() {
    filteredLocations(`restaurants in ${selectedArea}`);
});
$('#bars').click(function() {
    filteredLocations(`bars in ${selectedArea}`);
});
$('#monuments').click(function() {
    filteredLocations(`touristic landmarks in ${selectedArea}`);
});
$('#activities').click(function() {
    bounds = new google.maps.LatLngBounds();
    deleteMarkers();
    filteredLocations(`attractions in ${selectedArea}`);
});
$('#all').click(function() {
    filteredLocations(`hotels in ${selectedArea}`);
    filteredLocations(`restaurants in ${selectedArea}`);
    filteredLocations(`bars in ${selectedArea}`);
    filteredLocations(`touristic landmarks in ${selectedArea}`);
    filteredLocations(`attractions in ${selectedArea}`);
});


// Show the markers according to the selected filter
// Code taken from Google Maps documentation & modified to fit the app
function filteredLocations(locationType) {
    let request = {
        query: locationType,
        region: ccTLD,
        location: map.getCenter(),
        radius: 50000
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createMarkers(results);
        }
    }
}


// Create the markers at each result's location
// Code taken from Google Maps documentation & modified to fit the app
function createMarkers(places) {
    const markerIcon = {
        url: 'assets/img/icons/marker.png',
        scaledSize: new google.maps.Size(50, 50)
    };
    places.forEach(place => {
        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: markerIcon
        });

        // Add click listener to each marker
        google.maps.event.addListener(marker, 'click', () => {
            let request = {
                placeId: place.place_id,
                fields: ['name', 'geometry', 'rating', 'website']
            };

            // Only fetch the details of a place when the user clicks on a marker, to not hit API rate limits
            service.getDetails(request, (placeResult, status) => {
                showDetails(placeResult, marker, status);
            });
        });

        // Add each marker to the markers array, for clustering & later removing
        markers.push(marker);

        // Adjust the map bounds to include the location of this marker
        bounds.extend(place.geometry.location);
    });

    // Once all the markers have been placed, adjust the bounds of the map to show all the markers within the visible area.
    map.fitBounds(bounds);

    // Allow markers clustering
    markerClusterer = new MarkerClusterer(map, markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
}


// Empty the array of markers and call a new map
// Code taken from Google Maps documentation & modified to fit the app
function deleteMarkers() {
    markers = [];
    regionSelection();
}


// Build an infowindow to display location details above the marker
// Code snippet taken from Google Maps documentation & modified to fit the app
function showDetails(placeResult, marker, status) {
    // Define the structure & content of the infowindow, depending on the result of the request
    let infowindowContent = '';
    infowindowContent += `<div class="infowindow">
    <h5 class="infowindow-title">${placeResult.name}</h5>`;
    let rating;
    if (placeResult.rating) rating = placeResult.rating;
    if (placeResult.rating === undefined) {
        infowindowContent += '<p class="infowindow-rating">There\'s no rating for this place yet. Rate it once you\'ve visited! &#128521</p>';
    } else {
        infowindowContent += `<p class="infowindow-rating">Rating: ${placeResult.rating}/5</p>`;
    }
    if (placeResult.website !== undefined) {
        infowindowContent += `<a class="infowindow-link" href="${placeResult.website}" target="_blank" aria-label="Visit the website of ${placeResult.name}">Visit the website</a>`;
    }
    infowindowContent += '</div>';

    // Build the infowindow
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        let placeInfowindow = new google.maps.InfoWindow();
        placeInfowindow.setContent(infowindowContent);
        placeInfowindow.open(marker.map, marker);
        currentInfowindow.close();
        currentInfowindow = placeInfowindow;

    } else {
        console.log('showDetails failed: ' + status);
    }
}


// When "Back" is clicked, it brings the user back to the oversea territories listing, without having to click on the "Outre Mer" slide & reduce margin-top of #map-section
$('#back-to-overseas-list').click(function() {
    selectedRegionId = 'region-om';
    displayDetails();
    regionSelection();
    $('#back-to-overseas-list').fadeOut('fast');
    $('#map-section').css('margin-top', '0');
});


// Change the text of the "Filters" <p> according to which filter is currently hovered (or clicked on mobile/tablet)
$('#map-filters img').hover(function() {
    $('#filters').text(this.id).css('text-transform', 'capitalize');
}, function() {
    $('#filters').text('Filters');
});


// Check when the users scrolls down, and shows the contact button when the users doesn't have acces anymore to the navbar 
window.onscroll = function() {
    displayButton();
};

function displayButton() {
    let contactButton = $('#contact-modal-icon');

    if (document.body.scrollTop > 55 || document.documentElement.scrollTop > 55) {
        contactButton.fadeIn();
    } else {
        contactButton.fadeOut('fast');
    }
}


// Open up the contact modal when clicking on the "Contact" navbar link or the paper plane icon
let modalOpening = $('.contact-modal-opening');
let overlayAndModal = $('.contact-modal');
$(modalOpening).click(function() {
    $(overlayAndModal).fadeIn();
});


// Close the contact modal when anywhere outside the modal, or the X icon is clicked 
function modalClosing() {
    $(overlayAndModal).fadeOut();
}

$('.contact-modal-closing').click(function() {
    modalClosing();
});