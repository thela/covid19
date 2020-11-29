

function ready([world_data]) {
    var countries = topojson.feature(world_data, world_data.objects.countries).features;
    const chartConfig = setupWorldmapChart();

    updateChart(chartConfig, countries);

}

var promises = [
  d3.json('https://unpkg.com/world-atlas/countries-50m.json'),
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