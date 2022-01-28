const width = 960;
const height = 500;
const config = {
    speed: 0.3,
    verticalTilt: -20,
    horizontalTilt: 0
}
let locations = [];
const svg = d3.select('#globe')
    .append("svg")
    .attr('width', width)
    .attr('height', height);

svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", height / 2)
    .style("fill", "var(--primary)");

const markerGroup = svg.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

drawGlobe();

function drawGlobe() {
    d3.queue()
        .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
        .defer(d3.csv, 'files/archi.csv')
        .await((error, worldData, locationData) => {

            locationData.forEach(function (d) {
                d.lat = d.latitude;
                d.long = d.longitude;

                if (d.latitude.includes("N")) {
                    d.latitude = +(d.latitude.replace("N", "")) || 0;
                } else {
                    d.latitude = 360 - +(d.latitude.replace("S", "")) || 0;
                };

                if (d.longitude.includes("E")) {
                    d.longitude = +(d.longitude.replace("E", "")) || 0;
                } else {
                    d.longitude = 360 - +(d.longitude.replace("W", "")) || 0;
                }
            })

            drawGraticule();

            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .style("stroke", "var(--secondary)")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => 'var(--secondary)')

            svg.call(d3.zoom().on('zoom', zoomed));

            locations = locationData;
            drawMarkers();

            projection.rotate([0, config.verticalTilt, config.horizontalTilt]);
            svg.selectAll("path").attr("d", path);
            drawMarkers();

        });

}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "var(--secondary)");
}

function zoomed() {
    var transform = d3.event.transform;
    projection.rotate([transform.x * config.speed, config.verticalTilt, config.horizontalTilt]);
    svg.selectAll("path").attr("d", path);
    drawMarkers();
};



svg.call(d3.zoom().on('zoom', zoomed));

function drawMarkers() {
    const markers = markerGroup.selectAll('circle')
        .data(locations);
    markers
        .enter()
        .append('circle')
        .merge(markers)
        .attr('cx', d => projection([d.longitude, d.latitude])[0])
        .attr('cy', d => projection([d.longitude, d.latitude])[1])
        .attr("class", "markers")
        .attr('stroke', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'white';
        })
        .attr('fill', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'white';
        })
        .attr('r', 3)
        .on("mouseover", function (d) {
            d3.select(this).transition().attr("r", 10);
            document.getElementById("tooltip").innerHTML = "<h4>" + Capitalize(d.name.replace(/_/g, ' ')) + "</h4><p>" + d.designer + "</p><p>" + d.lat + ", " + d.long + "</p>";
            document.getElementById("tooltip").style.display = "block";
            document.getElementById("tooltip").style.left = d3.event.clientX + 25 + "px";
            document.getElementById("tooltip").style.top = d3.event.clientY - 50 + "px";

        })
        .on("mouseout", function (d) {
            d3.select(this).transition().attr("r", 3);
            document.getElementById("tooltip").style.display = "none";
        })

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}

function Capitalize(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}
