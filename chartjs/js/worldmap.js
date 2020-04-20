
var worldmap_config= {};
var worldchart;

fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
    const countries = ChartGeo.topojson.feature(data, data.objects.countries).features;
    worldmap_config= {
        type: 'choropleth',
        data: {
            labels: countries.map((d) => d.properties.name),
            datasets: [{
                label: 'Countries',
                backgroundColor: (context) => {
                    if (context.dataIndex == null) {
                        return null;
                    }
                    const value = context.dataset.data[context.dataIndex];
                    return new Color('steelblue').lightness(value.value * 100).rgbString();
                },
                data: countries.map((d) => ({feature: d, value: Math.random()})),
            }]
        },
        options: {
            showOutline: true,
            showGraticule: true,
            legend: {
                display: false
            },
            scale: {
                projection: 'equalEarth'
            },
            onClick: chartClickEvent
        }
    };

    //create a drawing context on the canvas
    var $element = document.getElementById("world_map");
    var worldmap_ctx = $element.getContext("2d");

    worldchart = new Chart(
        worldmap_ctx,
        worldmap_config
    );
});


function chartClickEvent(event, array){
    //https://stackoverflow.com/questions/46672925/chart-js-onclick-event-with-a-mixed-chart-which-chart-did-i-click
    if(typeof newArr === 'undefined'){
        newArr = array;
    }

    if (worldmap_config === 'undefined' || worldmap_config == null)
    {
      return;
    }
    if (event === 'undefined' || event == null)
    {
      return;
    }
    if (newArr === 'undefined' || newArr == null)
    {
      return;
    }
    if (newArr.length <= 0)
    {
      return;
    }
    var active = worldchart.getElementAtEvent(event);
    toggleCountryData(pnvtr_analysisChart, active[0].feature.properties.name);
}
