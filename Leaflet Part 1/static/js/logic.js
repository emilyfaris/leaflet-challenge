const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

// Creating a map object
let myMap = L.map("map", {
    center: [0,0],
    zoom: 2
});

// Adding a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Function to determine marker radius from earthquake magnitude
function chooseRadius(magnitude) {
    return 100000 * (magnitude - 4)
};

// Function to determine marker color from earthquake depth
function chooseColor(depth) {
    if (depth < 10) return "#faf0a9";
    else if (depth < 30) return "#f7cf64";
    else if (depth < 50) return "#fbaa32";
    else if (depth < 70) return "#ff8220";
    else if (depth < 90) return "#ff5142";
    else return "#ff0066";
}

// Fetching data and creating circle markers from earthquake data
d3.json(url).then((data) => {
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circle(latlng, {
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.75,
                radius: chooseRadius(feature.properties.mag),
                stroke: false
            });
        },
        // Binding a popup to each feature
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`<h2>${feature.properties.place}</h2><hr><h3>Magnitude: ${feature.properties.mag}<br>Date: ${new Date(feature.properties.time)}</h3>`);
        }
    }).addTo(myMap);
});

// Adding a legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 30, 50, 70, 90],
        labels = [];

    // Set the background color of the legend to light beige
    div.style.backgroundColor = '#f5f5dc';  // light beige
    div.style.padding = '6px';
    div.style.border = '1px solid rgba(0,0,0,0.2)';
    div.style.borderRadius = '5px';
    div.innerHTML += '<h4>Depth (km)</h4>';

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i] + 1) + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.75;"></i> ' +
            '<span style="line-height: 18px;">' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') + '</span>';
    }

    return div;
};

legend.addTo(myMap);

