


function ready([world_data, ddpcData, ddpcaData]) {
    var countries = topojson.feature(world_data, world_data.objects.countries).features;
    const chartConfig = setupWorldmapChart();

    updateWorldmapChart(chartConfig, countries, country_clicked);

    const DdpcConfig = setupDdpc();
    function country_clicked(d){
        updateDdpc(DdpcConfig, ddpcData, ddpcaData, d.properties.name);
    }
    // Initially render the chart
    updateDdpc(DdpcConfig, ddpcData, ddpcaData, 'Italy');
}

var promises = [
  d3.json('https://unpkg.com/world-atlas/countries-50m.json'),
  d3.json("/covid19/chartjs/data/daily_data_per_capita.json"),
  d3.json("/covid19/chartjs/data/daily_data_per_capita_average.json"),
]

function load(){
    Promise.all(promises).then(ready)

};