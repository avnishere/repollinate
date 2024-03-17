$(document).ready(function() {

    var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
    });

    var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });

    var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    });
    
    // Initialize the map on the 'map' div with a given center and zoom
    var map = L.map('map', {
        center: [56.6218, -3.8670],
        zoom: 7,
        layers: [streetMap] // Default layer
    });

    // Base layers for switching
    var baseMaps = {
        "Street Map": streetMap,
        "Satellite": satelliteMap,
        "Terrain": openTopoMap
    };

    // Add control to the map to switch layers
    L.control.layers(baseMaps, null, {position: 'bottomright'}).addTo(map);

    var customIcon = L.icon({
        iconUrl: 'assets/images/bee.png',
        iconSize: [38, 38],
    });

    var markersCluster = L.markerClusterGroup();

    function createPopupContent(item) {
        let popupContent = `<div class="popup-content"><div class="my-slider">`;
        
        var photos = Array.isArray(item.photos) ? item.photos : [item.photos];
        photos.forEach(photo => {
            popupContent += `<div><img src="${photo}" alt="Project Photo" /></div>`;
        });
    
        popupContent += `</div><div class="popup-text-container"><h3>${item.text}</h3>
                         <div class="funded-area-container">
                             <div class="funded"><p><strong>Funded by:</strong> ${item.funder}</p></div>
                             <div class="area"><p><strong>Area Size:</strong> ${item.area}</p></div>
                         </div><p>${item.description}</p></div></div>`;
    
        return popupContent;
    }

    fetch('assets/projects.json')
        .then(response => response.json())
        .then(data => {
            var selectData = data.map(item => ({ id: item.value, text: item.text }));
            $('#searchableDropdown').select2({
                data: selectData,
                placeholder: "Search...",
                allowClear: true
            }).val(null).trigger('change');

            data.forEach(item => {
                var popupContent = createPopupContent(item);
            
                // Create a marker with a custom icon
                var marker = L.marker([item.lat, item.lng], {
                    icon: customIcon,
                    // Tooltip configuration: always visible with the name of the project
                    title: item.text // This sets the hover tooltip, optional if you want just the always-visible label
                }).bindPopup(popupContent);
            
                // Bind a tooltip to the marker and make it always visible
                marker.bindTooltip(item.text, {
                    permanent: true, // This makes the tooltip always visible
                    direction: 'bottom', // You can specify the direction (top, bottom, left, right)
                    className: 'my-marker-label', // Use this class to style your tooltip if needed
                    offset: [0, 20] // You can add an offset to the tooltip position
                });        
                marker.id = item.value; // Assign the ID to the marker
                markersCluster.addLayer(marker);
            });
            
            map.addLayer(markersCluster);
        });

        function openAndZoomToMarker(selectedMarker) {
            // Ensure all popups are closed before starting to fly
            map.closePopup();
        
            var latLng = selectedMarker.getLatLng();
            // Adjust newLatLng for better popup visibility, if necessary
            var newLatLng = new L.LatLng(latLng.lat + 0.003, latLng.lng);
        
            // Start the flyTo animation
            map.flyTo(newLatLng, 16, { animate: true });
        
            // Once move has ended, open the popup
            map.once('moveend', function() {
                // Introduce a slight delay to ensure the map has completely settled
                setTimeout(function() {
                    selectedMarker.openPopup();
                }, 100); // Adjust delay as needed, 100ms is usually sufficient
            });
        }

    $('#searchableDropdown').on('select2:select', function(e) {
        var selectedId = e.params.data.id;
        var selectedMarker = markersCluster.getLayers().find(marker => marker.id == selectedId);
        if (selectedMarker) {
            openAndZoomToMarker(selectedMarker);
        }
    });

    markersCluster.on('click', function(e) {
        openAndZoomToMarker(e.layer);
    });

    map.on('popupopen', function(e) {
        var observer;
        var attemptSliderInitialization = function() {
            // Ensure the slider is not already initialized
            if (!document.querySelector('.tns-slider')) {
                var sliderContainer = document.querySelector('.my-slider');
                if (sliderContainer && sliderContainer.querySelectorAll('img').length) {
                    // Initialize the slider here
                    tns({
                        container: sliderContainer,
                        items: 1,
                        slideBy: 'page',
                        autoplay: true,
                        autoplayButtonOutput: false,
                        controls: false,
                        nav: false,
                        loop: true,
                        axis: "vertical",
                        speed: 2000,
                    });
    
                    // Disconnect the observer once the slider is initialized to prevent further observation
                    if (observer) {
                        observer.disconnect();
                    }
                }
            }
        };
    
        // Define a MutationObserver to watch for changes in the popup content container
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    attemptSliderInitialization();
                }
            });
        });
    
        // Start observing the popup content container for changes
        var popupContentContainer = e.popup._contentNode;
        observer.observe(popupContentContainer, {
            childList: true, // Observe direct children addition/removal
            subtree: true, // Observe all descendants
            attributes: false,
            characterData: false,
        });
    
        // Attempt to initialize the slider immediately in case the content is already there
        attemptSliderInitialization();
    });    
});    
