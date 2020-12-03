const width = 1000;
const height = 600;
const margin = {'top': 20, 'right': 20, 'bottom': 100, 'left': 100};
const graphWidth = width - margin.left - margin.right;
const graphHeight = height - margin.top - margin.bottom;
const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const gXAxis = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const gYAxis = graph.append('g');

function fetchData(url) {
return fetch(url).then((response) => {
if (response.status != 200) {
throw new Error(`Unexpected response status: ${response.status}`);
} else {
return response.json();
}
});
}
function downloadData() {
const primaryDataUrl = "https://coronavirus-tracker-api.herokuapp.com/all";
const backupDataUrl = "https://gentle-peak-51697.herokuapp.com/all";
return fetchData(primaryDataUrl).catch((error) => {
console.log(error);
console.warn(`Fetching data from primary API (${primaryDataUrl}) failed so attempting to use backup API (${backupDataUrl}).`);
return fetchData(backupDataUrl).catch((error) => {
console.log(error);
console.error(`Fetching data failed.`);
});
});
}


var x, y;

country = "Italy"

d3.json('/covid19/data/daily_data_per_capita.json').then(data => {
    // se carica prima l'altro file, x e y non se le trova. Fare in modo che considera tutte le x e soprattutto tutte le y
    y = d3.scaleLinear()
        .domain([0, d3.max(data[country].confirmed, d => d.y)])
        .range([graphHeight, 0]);

    x = d3.scaleBand()
        .domain(data[country].confirmed.map(item => item.x))
        .range([0, 500])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    const rects = graph.selectAll('rect')
        .data(data[country].confirmed);
    rects.attr('width', x.bandwidth)
        .attr('class', 'bar-rect')
        .attr('height', d => graphHeight - y(d.y))
        .attr('x', d => x(d.x))
        .attr('y', d => y(d.y));
    rects.enter()
        .append('rect')
        .attr('class', 'bar-rect')
        .attr('width', x.bandwidth)
        .attr('height', d => graphHeight - y(d.y))
        .attr('x', d => x(d.x))
        .attr('y', d => y(d.y));

    /*const line = graph.selectAll('path')
        .data(data[country].confirmed);
    line.enter()
        .append("path")
        .datum(data[country].confirmed)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.x) })
            .y(function(d) { return y(d.y) })
        )*/

    const xAxis = d3.axisBottom(x)
        .ticks(d3.timeDay.every(1));
    const yAxis = d3.axisLeft(y)
        .ticks(5);

    gXAxis.call(xAxis);
    gYAxis.call(yAxis);
    gXAxis.selectAll('text')
        .style('font-size', 14);

    gYAxis.selectAll('text')
        .style('font-size', 14);
});


d3.json('/covid19/data/daily_data_per_capita_average.json').then(data => {
    /*const y = d3.scaleLinear()
        .domain([0, d3.max(data[country].confirmed, d => d.y)])
        .range([graphHeight, 0]);

    const x = d3.scaleBand()
        .domain(data[country].confirmed.map(item => item.x))
        .range([0, 500])
        .paddingInner(0.2)
        .paddingOuter(0.2);*/

    const line = graph.selectAll('path')
        .data(data[country].confirmed);
    line.enter()
        .append("path")
        .datum(data[country].confirmed)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.x) })
            .y(function(d) { return y(d.y) })
        )

})