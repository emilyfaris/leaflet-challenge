// Base maps
const satellite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Creating a map object with base layers
let myMap = L.map('map', {
    center: [0, 0],
    zoom: 2,
    layers: [satellite, grayscale, outdoors]
});

const baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Load tectonic plates data
const tectonicPlatesURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
let tectonicPlates = new L.LayerGroup();

d3.json(tectonicPlatesURL).then(function(plateData) {
    L.geoJSON(plateData, {
        color: '#99ff66',
        // color: "#5EDD1E",
        weight: 2
    }).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap);
});

// Functions from part 1
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

// Earthquake data layer from part 1
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

let earthquakes = new L.LayerGroup();

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

// Legend from part 1
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 30, 50, 70, 90],
        labels = [];

    div.style.backgroundColor = '#f5f5dc';  
    div.style.padding = '6px';
    div.style.border = '1px solid rgba(0,0,0,0.2)';
    div.style.borderRadius = '5px';
    div.innerHTML += '<h4>Depth (km)</h4>';

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i] + 1) + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.75;"></i> ' +
            '<span style="line-height: 18px;">' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') + '</span>';
    }

    return div;
};

legend.addTo(myMap);

// Layer control
const overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

L.control.layers(baseMaps, overlayMaps).addTo(myMap);
