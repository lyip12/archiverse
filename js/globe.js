// Version 0.0.0. Copyright 2017 Mike Bostock.
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.versor = factory());
}(this, (function () {
    'use strict';

    var acos = Math.acos,
        asin = Math.asin,
        atan2 = Math.atan2,
        cos = Math.cos,
        max = Math.max,
        min = Math.min,
        PI = Math.PI,
        sin = Math.sin,
        sqrt = Math.sqrt,
        radians = PI / 180,
        degrees = 180 / PI;

    // Returns the unit quaternion for the given Euler rotation angles [λ, φ, γ].
    function versor(e) {
        var l = e[0] / 2 * radians,
            sl = sin(l),
            cl = cos(l), // λ / 2
            p = e[1] / 2 * radians,
            sp = sin(p),
            cp = cos(p), // φ / 2
            g = e[2] / 2 * radians,
            sg = sin(g),
            cg = cos(g); // γ / 2
        return [
    cl * cp * cg + sl * sp * sg,
    sl * cp * cg - cl * sp * sg,
    cl * sp * cg + sl * cp * sg,
    cl * cp * sg - sl * sp * cg
  ];
    }

    // Returns Cartesian coordinates [x, y, z] given spherical coordinates [λ, φ].
    versor.cartesian = function (e) {
        var l = e[0] * radians,
            p = e[1] * radians,
            cp = cos(p);
        return [cp * cos(l), cp * sin(l), sin(p)];
    };

    // Returns the Euler rotation angles [λ, φ, γ] for the given quaternion.
    versor.rotation = function (q) {
        return [
    atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2])) * degrees,
    asin(max(-1, min(1, 2 * (q[0] * q[2] - q[3] * q[1])))) * degrees,
    atan2(2 * (q[0] * q[3] + q[1] * q[2]), 1 - 2 * (q[2] * q[2] + q[3] * q[3])) * degrees
  ];
    };

    // Returns the quaternion to rotate between two cartesian points on the sphere.
    versor.delta = function (v0, v1) {
        var w = cross(v0, v1),
            l = sqrt(dot(w, w));
        if (!l) return [1, 0, 0, 0];
        var t = acos(max(-1, min(1, dot(v0, v1)))) / 2,
            s = sin(t); // t = θ / 2
        return [cos(t), w[2] / l * s, -w[1] / l * s, w[0] / l * s];
    };

    // Returns the quaternion that represents q0 * q1.
    versor.multiply = function (q0, q1) {
        return [
    q0[0] * q1[0] - q0[1] * q1[1] - q0[2] * q1[2] - q0[3] * q1[3],
    q0[0] * q1[1] + q0[1] * q1[0] + q0[2] * q1[3] - q0[3] * q1[2],
    q0[0] * q1[2] - q0[1] * q1[3] + q0[2] * q1[0] + q0[3] * q1[1],
    q0[0] * q1[3] + q0[1] * q1[2] - q0[2] * q1[1] + q0[3] * q1[0]
  ];
    };

    function cross(v0, v1) {
        return [
    v0[1] * v1[2] - v0[2] * v1[1],
    v0[2] * v1[0] - v0[0] * v1[2],
    v0[0] * v1[1] - v0[1] * v1[0]
  ];
    }

    function dot(v0, v1) {
        return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
    }

    return versor;
})));


var rotationDelay = 3000
var scaleFactor = 0.6
var degPerSec = 6
var angles = {
    x: -20,
    y: 40,
    z: 0
}
var colorWater = '#181236'
var colorLand = '#F19BFE'
var colorGraticule = '#181236'
var colorCountry = '#F6C1BC'


function enter(country) {
    var country = countryList.find(function (c) {
        return c.id === country.id
    })
    current.text(country && country.name || '')
}

function leave(country) {
    current.text('')
}

//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = {
    type: 'Sphere'
}
var projection = d3.geoOrthographic().precision(0.1)
var graticule = d3.geoGraticule10()
var path = d3.geoPath(projection).context(context)
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height
var land, countries
var countryList
var autorotate, now, diff, roation
var currentCountry

//
// Functions
//

function setAngles() {
    var rotation = projection.rotate()
    rotation[0] = angles.y
    rotation[1] = angles.x
    rotation[2] = angles.z
    projection.rotate(rotation)
}

function scale() {
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight
    canvas.attr('width', width).attr('height', height)
    projection
        .scale((scaleFactor * Math.min(width, height)) / 2)
        .translate([width / 2, height / 2])
    render()
}

function startRotation(delay) {
    autorotate.restart(rotate, delay || 0)
}

function stopRotation() {
    autorotate.stop()
}

function dragstarted() {
    v0 = versor.cartesian(projection.invert(d3.mouse(this)))
    r0 = projection.rotate()
    q0 = versor(r0)
    stopRotation()
}

function dragged() {
    var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this)))
    var q1 = versor.multiply(q0, versor.delta(v0, v1))
    var r1 = versor.rotation(q1)
    projection.rotate(r1)
    render()
}

function dragended() {
    startRotation(rotationDelay)
}

function render() {
    context.clearRect(0, 0, width, height)
    fill(water, colorWater)
    stroke(graticule, colorGraticule)
    fill(land, colorLand)
    if (currentCountry) {
        fill(currentCountry, colorCountry)
    }
}

function fill(obj, color) {
    context.beginPath()
    path(obj)
    context.fillStyle = color
    context.fill()
}

function stroke(obj, color) {
    context.beginPath()
    path(obj)
    context.strokeStyle = color
    context.stroke()
}

function rotate(elapsed) {
    now = d3.now()
    diff = now - lastTime
    if (diff < elapsed) {
        rotation = projection.rotate()
        rotation[0] += diff * degPerMs
        projection.rotate(rotation)
        render()
    }
    lastTime = now
}

function loadData(cb) {
    d3.json('https://unpkg.com/world-atlas@1/world/110m.json', function (error, world) {
        if (error) throw error
        d3.tsv('https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-country-names.tsv', function (error, countries) {
            if (error) throw error
            cb(world, countries)
        })
    })
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
    var n = polygon.length
    var p = polygon[n - 1]
    var x = point[0],
        y = point[1]
    var x0 = p[0],
        y0 = p[1]
    var x1, y1
    var inside = false
    for (var i = 0; i < n; ++i) {
        p = polygon[i], x1 = p[0], y1 = p[1]
        if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
        x0 = x1, y0 = y1
    }
    return inside
}

function mousemove() {
    var c = getCountry(this)
    if (!c) {
        if (currentCountry) {
            leave(currentCountry)
            currentCountry = undefined
            render()
        }
        return
    }
    if (c === currentCountry) {
        return
    }
    currentCountry = c
    render()
    enter(c)
}

function getCountry(event) {
    var pos = projection.invert(d3.mouse(event))
    return countries.features.find(function (f) {
        return f.geometry.coordinates.find(function (c1) {
            return polygonContains(c1, pos) || c1.find(function (c2) {
                return polygonContains(c2, pos)
            })
        })
    })
}


//
// Initialization
//

setAngles()

canvas
    .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .on('mousemove', mousemove)

loadData(function (world, cList, airports) {
    land = topojson.feature(world, world.objects.land)
    countries = topojson.feature(world, world.objects.countries)
    countryList = cList

    window.addEventListener('resize', scale)
    scale()
    autorotate = d3.timer(rotate)
})

function drawMarkers() {
    const markers = markerGroup.selectAll('circle')
        .data(locations);
    markers
        .enter()
        .append('circle')
        .merge(markers)
        .attr('cx', d => projection([d.longitude, d.latitude])[0])
        .attr('cy', d => projection([d.longitude, d.latitude])[1])
        .attr('fill', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'steelblue';
        })
        .attr('r', 7);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}








//const width = 960;
//const height = 500;
const config = {
    speed: 0.005,
    verticalTilt: -30,
    horizontalTilt: 0
}
let locations = [];
const svg = d3.select('svg')
    .attr('width', width).attr('height', height);
const markerGroup = svg.append('g');
//const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const apath = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

//drawGlobe();
//drawGraticule();
enableRotation();

function drawGlobe() {
    d3.queue()
        .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
        .defer(d3.json, 'locations.json')
        .await((error, worldData, locationData) => {
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", apath)
                .style("stroke", "#888")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => '#e5e5e5')
                .style("opacity", ".6");
            locations = locationData;
            drawMarkers();
        });
}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", apath)
        .style("fill", "#fff")
        .style("stroke", "#ccc");
}

function enableRotation() {
    d3.timer(function (elapsed) {
        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        svg.selectAll("path").attr("d", apath);
        drawMarkers();
    });
}

function drawMarkers() {
    const markers = markerGroup.selectAll('circle')
        .data(locations);
    markers
        .enter()
        .append('circle')
        .merge(markers)
        .attr("class", "markers")
    .attr('cx', d => projection([d.longitude, d.latitude])[0])
        .attr('cy', d => projection([d.longitude, d.latitude])[1])
        .attr('fill', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'steelblue';
        })
        .attr('r', 7);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}
