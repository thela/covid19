
var countryColour = d3.scaleLinear().domain([1,50])
  .range(["lightgreen", "red"])

var tooltip_div = d3.select("body").append("div")
     .attr("class", "tooltip-worldmap")
     .style("opacity", 0);


function setupSelections(chartConfig, ddpcData, ddpcaData) {
    const country1Select = document.getElementById("country1");

    const addChangeListener = (element) => {
      element.addEventListener("change", (event) => {
        updateChart(chartConfig, ddpcData, ddpcaData, country1Select);
      });
    };

    addChangeListener(country1Select);
    return country1Select;
};

function setupWorldmapChart() {
    // Set the dimensions and margins of the graph
    const width = 1000;
    const height = 500;
    const margin = {'top': 20, 'right': 20, 'bottom': 20, 'left': 20};
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    // Setup ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    // Append the svg object to the body of the page
    /*const svg = d3.select('.worldmap')
      .append('svg')
      .attr('width', width)
      .attr('height', height);*/

    const svg_container = d3.select('.worldmap').classed("svg-container", true)
        .append("div")
    const svg = svg_container
        // Container class to make it responsive.
        .append("svg")
        // Responsive SVG needs these 2 attributes and no width and height attr.
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        // Class to make it responsive.
        .classed("svg-content-responsive", true)

    const graph = svg.append('g')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let zoom = d3.zoom()
       .scaleExtent([1, 5])
       .translateExtent([[-500, -300], [1500, 1000]])
       .on('zoom', (event, d) => {
           svg.attr('transform', event.transform)
       });

    svg_container.call(zoom);
    return { graph, x, y, width, graphHeight };
}


function updateWorldmapChart(chartConfig, countries, country_status, country_clicked) {
    const path = d3.geoPath(d3.geoNaturalEarth1(), chartConfig.svg)

    chartConfig.graph.selectAll("path")
        .data(countries)
          .enter().append("path")
            .attr("d", path)
        .attr("fill", function(d){
            if(country_status.hasOwnProperty(d.properties.name)){
                return countryColour(country_status[d.properties.name])
            } else {
                return d3.rgb("silver");
                } })    //Our new hover effects
        .on('mouseover', function (event, d) {
            tooltip_div.transition()
               .duration(50)
               .style("opacity", 1).style("top", (event.pageY) + "px")
                       .style("left", (     event.pageX + 10) + "px")
            tooltip_div.html(d.properties.name); })
        .on('click', function (event, d) {
            country_clicked(d)
        })
        .on('mouseout', function (event, d) {      //Makes the new div disappear:
          tooltip_div.transition()
               .duration('50')
               .style("opacity", 0);
        });
}

function ready_worldmap(world_data, country_status, country_clicked) {
    var countries = topojson.feature(world_data, world_data.objects.countries).features;
    const chartConfig = setupWorldmapChart();

    updateWorldmapChart(chartConfig, countries, country_status, country_clicked);

    return chartConfig;
}

var promises_worldmap = [
    d3.json('https://unpkg.com/world-atlas/countries-50m.json'),
    d3.json("/covid19/data/country_status_per_capita_average.json"),
]