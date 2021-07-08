// Allow the Materialize side navbar on mobile view
$(document).ready(function() {
    $('.sidenav').sidenav();
});

// Creating all 14 slides of the regions carousel by iterating through each object of regions-config.js
for (let region of REGION_CONFIG) {

    //Creation of the slide with data from regions-config.js
    let slide = '';
    slide += '<li class="glide__slide">';
    slide += '<div class="region-card" id="' + region.id + '" style="background-image:linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(' + region.slideBackground + ')">';
    slide += '<h3 class="region-card-name">' + region.name + '</h3>';
    slide += '</div>';
    slide += '</li>';

    //Inserting the slide into index.html
    $('.glide__slides').append(slide);
};

//Displaying the right region-related content depending on which slide is clicked
$('.region-card').click(function() {

    //Make the selection invitation <p> disappearing
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
    // Shows the map and center it on the selected region
    $('#map').fadeIn('slow');

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
                let request = {
                    query: regionName,
                    fields: ["name", "geometry"],
                };
                service = new google.maps.places.PlacesService(map);
                service.findPlaceFromQuery(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        for (let i = 0; i < results.length; i++) {
                            createMarker(results[i]);
                        };
                        map.setCenter(results[0].geometry.location);
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
                });
            }
        }
    }

    initMap()
})