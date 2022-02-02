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

const line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

var pointer,
    tooltip = document.getElementById("tooltip");

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
                .enter()
                .append("path")
                .attr("class", "segment")
                .attr("d", path)
                .style("stroke", "var(--accent)")
                .style("stroke-width", "0.5px")
                .style("fill", (d, i) => 'url(#img1)')

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
        .style("stroke", "var(--accent)")
        .style("opacity", 0.3);
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

    pointer = svg.append('path')
        .datum(0)
        .attr("class", "pointer")
        .style("fill", "none")
        .style("stroke-width", 2)
        .style("stroke", "white");

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
            tooltip.innerHTML = "<h4>" + Capitalize(d.name.replace(/_/g, ' ')) + "</h4><p>" + d.designer + "</p><p>" + d.lat + ", " + d.long + "</p>";
            tooltip.style.display = "block";

            if (window.innerWidth / 2 - d3.event.clientX < 0) { // if hovering on the right side
                tooltip.style.left = (window.innerWidth - 50 - tooltip.clientWidth) + "px";

                pointer.datum([
                        {
                            x: this.cx.baseVal.value,
                            y: this.cy.baseVal.value
                    },
                        {
                            x: this.cx.baseVal.value + 30,
                            y: this.cy.baseVal.value + 70
                    },
                        {
                            x: width,
                            y: this.cy.baseVal.value + 70
                    },
              ])
                    .attr('d', line);

            } else {
                tooltip.style.left = "50px";

                pointer.datum([
                        {
                            x: this.cx.baseVal.value,
                            y: this.cy.baseVal.value
                    },
                        {
                            x: this.cx.baseVal.value - 30,
                            y: this.cy.baseVal.value + 70
                    },
                        {
                            x: 0,
                            y: this.cy.baseVal.value + 70
                    },
              ])
                    .attr('d', line);
            }

            tooltip.style.top = d3.event.clientY + 50 + "px";

        })
        .on("mouseout", function (d) {
            d3.selectAll(".pointer").datum(0)
                .attr('d', line)
            d3.select(this).transition().attr("r", 3);
            tooltip.style.display = "none";
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
