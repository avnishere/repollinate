$(document).ready(function() {
    var map = L.map('map').setView([56.6218, -3.8670], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 18,
    }).addTo(map);

    var customIcon = L.icon({
        iconUrl: 'assets/images/bee.png',
        iconSize: [38, 38],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
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
                    offset: [-3, -58] // You can add an offset to the tooltip position
                });        
                marker.id = item.value; // Assign the ID to the marker
                markersCluster.addLayer(marker);
            });
            
            map.addLayer(markersCluster);
        });

    function openAndZoomToMarker(selectedMarker) {
        var latLng = selectedMarker.getLatLng();
        var newLatLng = new L.LatLng(latLng.lat + 0.003, latLng.lng);
        
        // Fly to the new location
        map.flyTo(newLatLng, 16, { animate: true });
    
        // Use once to ensure the event handler is removed after execution
        map.once('moveend', function() {
            selectedMarker.openPopup();
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
        setTimeout(function() {
            if (document.querySelector('.tns-slider')) return; // Avoid reinitializing sliders
            
            var sliderContainers = document.querySelectorAll('.my-slider');
            sliderContainers.forEach(sliderContainer => {
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
            });
        }, 100); // Short delay to ensure the content is fully loaded
    });
});
