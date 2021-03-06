
var tooltip_ddpc_div = d3.select("body").append("div")
     .attr("class", "tooltip-ddpc")
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

function setupDdpc() {
    // Set the dimensions and margins of the graph
    const width = 600;
    const height = 400;
    const margin = {'top': 20, 'right': 20, 'bottom': 20, 'left': 50};
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    // Setup ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Append the svg object to the body of the page
    /*const svg = d3.select('.daily_data_per_capita')
      .append('svg')
      .attr('width', width)
      .attr('height', height);*/

    const svg = d3.select('.daily_data_per_capita')
        .append("div")
        // Container class to make it responsive.
        .classed("svg-container", true)
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

    return { graph, x, y, width, graphHeight };
}


function updateDdpc(chartConfig, ddpcData, ddpcaData, country) {
    // Remove any previous lines
    chartConfig.graph.selectAll("g > *").remove();

    // Scale the range of the data
    chartConfig.y = d3.scaleLinear()
        .domain([0, d3.max(ddpcData[country].confirmed, d => d.y)])
        .range([chartConfig.graphHeight, 0]);

    chartConfig.x = d3.scaleBand()
        .domain(ddpcData[country].confirmed.map(item => Date.parse(item.x)))
        .range([0, 500])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    const rects = chartConfig.graph.selectAll('rect')
        .data(ddpcData[country].confirmed);
    rects.attr('width', chartConfig.x.bandwidth)
        .attr('class', 'bar-rect')
        .attr('height', d => chartConfig.graphHeight - y(d.y))
        .attr('x', d => chartConfig.x(d.x))
        .attr('y', d => chartConfig.y(d.y));
    rects.enter()
        .append('rect')
        .attr('class', 'bar-rect')
        .attr('width', chartConfig.x.bandwidth)
        .attr('height', d => chartConfig.graphHeight - chartConfig.y(d.y))
        .attr('x', d => chartConfig.x(d.x))
        .attr('y', d => chartConfig.y(d.y))
        .on('mouseover', function (event, d) {
            tooltip_ddpc_div.transition()
               .duration(50)
               .style("opacity", 1).style("top", (event.pageY) + "px")
                       .style("left", (     event.pageX + 10) + "px")
            tooltip_ddpc_div.html(d.x + ' ' + d.y); })
        .on('mouseout', function (event, d) {      //Makes the new div disappear:
          tooltip_ddpc_div.transition()
               .duration('50')
               .style("opacity", 0);
        });

    const xAxis = d3.axisBottom(chartConfig.x)
        .ticks(d3.timeMonth, 1)
        .tickFormat(d3.timeFormat('%b'));

        //.ticks(d3.timeDay.every(1));
    const yAxis = d3.axisLeft(chartConfig.y)

        .tickFormat(d => `${d}`)
        .ticks(5);

    const gXAxis = chartConfig.graph.append('g')
        .attr('transform', `translate(0, ${chartConfig.graphHeight})`);

    const gYAxis = chartConfig.graph.append('g');

    gXAxis.call(xAxis);
    gYAxis.call(yAxis);
    gXAxis.selectAll('text')
        .style('font-size', 14);

    gYAxis.selectAll('text')
        .style('font-size', 14);

    const line = chartConfig.graph.selectAll('path')
        .data(ddpcaData[country].confirmed);
    line.enter()
        .append("path")
        .datum(ddpcaData[country].confirmed)
        .attr("fill", "none")
        .attr("stroke", "#ab1111")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return chartConfig.x(d.x) })
            .y(function(d) { return chartConfig.y(d.y) })
        )
        .on('mouseover', function (event, d) {
            tooltip_ddpc_div.transition()
               .duration(50)
               .style("opacity", 1).style("top", (event.pageY) + "px")
                       .style("left", (     event.pageX + 10) + "px")
            tooltip_ddpc_div.html(d.y); })
        .on('mouseout', function (event, d) {      //Makes the new div disappear:
          tooltip_ddpc_div.transition()
               .duration('50')
               .style("opacity", 0);
        });

}

function ready_ddpc(ddpcData, ddpcaData) {
    const DdpcConfig = setupDdpc();
    // Initially render the chart
    updateDdpc(DdpcConfig, ddpcData, ddpcaData, 'Italy');

    return DdpcConfig;
}

var promises_ddpc = [
  d3.json("/covid19/data/daily_data_per_capita.json"),
  d3.json("/covid19/data/daily_data_per_capita_average.json"),
]