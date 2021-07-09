// Allow the Materialize side navbar on mobile view
// Code snippet taken from Materialize documentation
$(document).ready(function() {
    $('.sidenav').sidenav();
});


// Create all 14 slides of the regions carousel by iterating through each object of regions-config.js
for (let region of REGION_CONFIG) {

    //Creation of the slide with data from regions-config.js
    let slide = '';
    slide += '<li class="glide__slide">';
    slide += '<div class="region-card" id="' + region.id + '" style="background-image:linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(' + region.slideBackground + ')">';
    slide += '<h3 class="region-card-name">' + region.name + '</h3>';
    slide += '</div>';
    slide += '</li>';

    //Insert the slide into index.html
    $('.glide__slides').append(slide);
};


//Display the right region-related content depending on which slide is clicked
$('.region-card').click(function() {

    //Make the selection invitation <p> disappear
    $('#region-selection-invite').slideUp();

    //Determine which card has been clicked
    let whichRegion = this.id;

    //Based on which card has been clicked...
    for (let { name: regionName, description: regionDescription, id: regionId }
        of REGION_CONFIG) {
        if (whichRegion == regionId) {
            // Changes the region's name & description and...
            $('#region-name').fadeOut('fast').queue(function() {
                $('#region-name').text(regionName).fadeIn('slow');
                $(this).dequeue();
            });
            $('#region-description').fadeOut('fast').queue(function() {
                $('#region-description').text(regionDescription).fadeIn('slow');
                $(this).dequeue();
            });
        }
    }

    // Shows the map, centered on the selected region & display its border 
    // Code taken from Google Maps documentation & modified to fit the app
    $('#map').fadeIn('slow');
    $('#map-filters').fadeIn('slow');

    let map;
    let service;
    let infowindow;

    function initMap() {
        for (let { name: regionName, id: regionId, coordinates: regionCoordinates, boundaries: regionBoundaries }
            of REGION_CONFIG) {
            if (whichRegion == regionId) {
                let selectedRegion = new google.maps.LatLng(regionCoordinates.lat, regionCoordinates.lng);
                infowindow = new google.maps.InfoWindow();
                map = new google.maps.Map(document.getElementById('map'), {
                    center: selectedRegion,
                    zoom: regionCoordinates.zoom,
                });
                // Display a blue line surrounding the selected region 
                // Code snippet found on https://ourcodeworld.com/articles/read/830/how-to-highlight-an-area-city-state-or-country-in-google-maps-with-javascript & modified to fit the app
                var polygon = new google.maps.Polygon({
                    paths: regionBoundaries,
                    strokeColor: "#001e96",
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    fillColor: "#001e96",
                    fillOpacity: 0.1
                });
                polygon.setMap(map);
            }
        }
    }
    initMap()
})


// Change the text of the "Filters" <p> according to which filter is currently hovered
$('#map-filters img').hover(function() {
    $('#map-section p').text(this.id).css('text-transform', 'capitalize');
}, function() {
    $('#map-section p').text('Filters');
});


// Create the markers for the map
// Code snippet taken from Google Maps documentation
function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
    });
    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(place.name || "");
        infowindow.open(map);
    });
}


// let request = {
//     query: regionName,
//     fields: ["name", "geometry"],
// };
// service = new google.maps.places.PlacesService(map);
// service.findPlaceFromQuery(request, (results, status) => {
//     if (status === google.maps.places.PlacesServiceStatus.OK && results) {
//         map.setCenter(results[0].geometry.location);
// }
// });