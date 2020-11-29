

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
    const margin = {'top': 20, 'right': 20, 'bottom': 100, 'left': 100};
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    // Setup ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    // Append the svg object to the body of the page
    const svg = d3.select('.worldmap')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const graph = svg.append('g')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    return { graph, x, y, width, graphHeight };
}


function updateWorldmapChart(chartConfig, countries, country_clicked) {
    const path = d3.geoPath(d3.geoNaturalEarth1(), chartConfig.svg)

    chartConfig.graph.selectAll("path")
        .data(countries)
          .enter().append("path")
            .attr("d", path)     //Our new hover effects
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
