






/*async function downloadData() {
    try {
        let [ddpcData, ddpcaData] = await Promise.all([
            fetch("/covid19/chartjs/data/daily_data_per_capita.json").then((response) => {return response.json()}),
            fetch("/covid19/chartjs/data/daily_data_per_capita_average.json").then((response) => {return response.json()})
        ]);
        return [ddpcData, ddpcaData]
    }
    catch(err) {
        console.log(err);
    };

}*/

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

function setupChart() {
    // Set the dimensions and margins of the graph
    const width = 1000;
    const height = 600;
    const margin = {'top': 20, 'right': 20, 'bottom': 100, 'left': 100};
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    // Setup ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Append the svg object to the body of the page
    const svg = d3.select('.canvas')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    const graph = svg.append('g')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    return { graph, x, y, width, graphHeight };
}


function updateChart(chartConfig, ddpcData, ddpcaData, country1Select) {
    // Remove any previous lines
    country = country1Select.options[country1Select.selectedIndex].value;
    d3.selectAll("g > *").remove();

    // Scale the range of the data
    chartConfig.y = d3.scaleLinear()
        .domain([0, d3.max(ddpcData[country].confirmed, d => d.y)])
        .range([chartConfig.graphHeight, 0]);

    chartConfig.x = d3.scaleBand()
        .domain(ddpcData[country].confirmed.map(item => item.x))
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
        .attr('y', d => chartConfig.y(d.y));

    const xAxis = d3.axisBottom(chartConfig.x)
        .ticks(d3.timeDay.every(1));
    const yAxis = d3.axisLeft(chartConfig.y)
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
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return chartConfig.x(d.x) })
            .y(function(d) { return chartConfig.y(d.y) })
        )

}

function ready([ddpcData, ddpcaData]) {
    const chartConfig = setupChart();
    const country1Select = setupSelections(chartConfig, ddpcData, ddpcaData);
    // Initially render the chart
    updateChart(chartConfig, ddpcData, ddpcaData, country1Select);
}

var promises = [
  d3.json("/covid19/chartjs/data/daily_data_per_capita.json"),
  d3.json("/covid19/chartjs/data/daily_data_per_capita_average.json"),
]


//window.addEventListener("DOMContentLoaded", (event) => {
function load(){
    Promise.all(promises).then(ready)
    // Call start
    /*(async() => {

        const chartConfig = setupChart();

        var [ddpcData, ddpcaData] = await downloadData();
        const country1Select = setupSelections(chartConfig, ddpcData, ddpcaData);
        // Initially render the chart
        updateChart(chartConfig, ddpcData, ddpcaData, country1Select);

    })();*/
};