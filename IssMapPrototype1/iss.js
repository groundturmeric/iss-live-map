var url = 'http://api.open-notify.org/iss-now.json'

const svg = d3.select("div#chart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
    // .style("background-color", "#fff")
    .attr("id", "map-svg")
    .classed("svg-content", true);

//     var title = svg.append("text")
//     .attr("x", function(d) { return ( window.innerWidth/2 - 60); })
//     .attr("y", function(d) { return ( window.innerHeight/12); })
//     // .attr("dy", ".35em")
//     .text("Live ISS position")
//     .style("fill", "azure");

// let projectionScale = 250;

// const projection = d3.geoOrthographic()
// const projection = d3.geoEqualEarth()
const projection = d3.geoConicEquidistant()


    .translate([window.innerWidth / 2, window.innerHeight / 2])
    .rotate([0, 0])
    .scale(150)
    .center([0, 0]);



// create the geo path generator
let geoPathGenerator = d3.geoPath().projection(projection);

var issCircle 
var issCircle2

    // var issCircle = svg
    // .append('circle')



/* 
    ADD TOOLTIP FOR LATER
    The visualization gets too cluttered if we try to add text labels;
    use a tooltip instead
    */
const tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip");

// great a g element to append all of our objects to
// const g = svg.append("g");

// will be used later for grid lines
const graticule = d3.geoGraticule();

// maps use multiple file types. we can store the "type" of each file along with the URL for easy loading!
const files = [
    { "type": "json", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" },
    { "type": "json", "file": url } // dataset of ISS live position
];
let promises = [];

// for each file type, add the corresponding d3 load function to our promises
files.forEach(function (d) {

    promises.push(d3.json(d.file));

});






var interval = 1000




Promise.all(promises).then(function (values) {
    drawMap(values[0])
    drawISS(values[1],promises)
    setInterval(function () {
        // var data = useData.map(function(d){return Math.random()})  
        //  console.log(data[0]);                
        drawISS(values[1],promises);
    }, interval)

})






function drawMap(geo) {
    // setInterval(console.log("time" , 100));
    // setTimeout(updateData(data), 200)
    // our function has two parameters, both of which should be data objects
    console.log('GEO: ', geo)




    // add grid lines
    var lines = svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", geoPathGenerator)
        .style("fill", "none")
        .style("opacity", 0.7)
        ;

    var basemap = svg
    .append("g")
        .selectAll("continent")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        // .attr("country", function (d) { return d.id })
        .attr("fill", "#53868b")
        .style("opacity", 0.8);



    // call zoom so it is "listening" for an event on our SVG


    const sensitivity = 75

    var drag = d3.drag().on('drag', function (event) {
        console.log(event)
        const rotate = projection.rotate()
        const k = sensitivity / projection.scale()

        projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
        ])
        geoPathGenerator = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", geoPathGenerator)


        // askISS(data)
    })


    svg.call(drag);
    // circs.call(drag);

    const zoom = d3.zoom().on('zoom', function (event) {
        console.log(event)
        projection.scale(projectionScale * event.transform.k)
        geoPathGenerator = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", geoPathGenerator)

        // askISS(data)
    })


    // g.call(drag)
    svg.call(zoom)


    // append circle here so it stays over continents
    issCircle = svg
    .append('circle')

    issCircle2 = svg
    .append('circle')


}







function drawISS(data, promises) {
    // setInterval(console.log("time" , 100));
    // setTimeout(updateMap(data), 200)


    async function get_data_from_api(url) {
        // data
        const response = await fetch(url);
        var data = await response.json();
        //  info
        var long = +data.iss_position.longitude
        var lat = +data.iss_position.latitude

        setTimeout(() => get_data_from_api(url), 10000)

        issCircle
        .attr("id", "issCircleRipple")
        .style("stroke-width", 0.5)
        .style("stroke", "white")
        .attr("fill-opacity", 1)
        .attr("fill", "pink")
        .transition()
        .duration(0)
        .attr("opacity", 1)
        .attr("cx", function (d) {
            return projection([+data.iss_position.longitude, +data.iss_position.latitude])[0];
        })
        .attr("cy", function (d) {
            return projection([+data.iss_position.longitude, +data.iss_position.latitude])[1];
        })
        .attr("r",5)


        issCircle2
        .attr("id", "issCircle")
        .style("stroke-width", 3)
        .style("stroke", "azure")
        .attr("fill-opacity", 1)
        .attr("fill", "azure")
        
        .attr("r",5)
        .attr("opacity", 1)
        .attr("cx", function (d) {
            return projection([+data.iss_position.longitude, +data.iss_position.latitude])[0];
        })
        .attr("cy", function (d) {
            return projection([+data.iss_position.longitude, +data.iss_position.latitude])[1];
        }).on('mouseover', function (e, d) {
            d3.select(this)
                .style("stroke", "black");

            tooltip.style("visibility", "visible");
        })
        .on('mousemove', function (e, d) {
            let x = e.offsetX;
            let y = e.offsetY;
                // get_data_from_api(url)

            tooltip.style("left", x + 20 + "px")
                .style("top", y + "px")
                .html(+data.iss_position.longitude + "</br>" + +data.iss_position.latitude);
        })
        .on('mouseout', function () {
            d3.select(this)
                .style("stroke", "gray");

            tooltip.style("visibility", "hidden");
        });   




        // console.log(data)
        //here data is update live but not out
    }

    get_data_from_api(url)
    // console.log(data)




    const sensitivity = 75

    var drag = d3.drag().on('drag', function (event) {
        console.log(event)
        const rotate = projection.rotate()
        const k = sensitivity / projection.scale()

        projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
        ])
        geoPathGenerator = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", geoPathGenerator)


        // askISS(data)
    })


    svg.call(drag);
    // circs.call(drag);

    const zoom = d3.zoom().on('zoom', function (event) {
        console.log(event)
        projection.scale(projectionScale * event.transform.k)
        geoPathGenerator = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", geoPathGenerator)

        // askISS(data)
    })




    // g.call(drag)
    svg.call(zoom)



}









