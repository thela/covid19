
var worldmap_config= {}, worldchart, worldchart_backgroundColor= [],
    $element = document.getElementById("world_map"), worldmap_ctx;

if ($element !== null){
    worldmap_ctx = $element.getContext("2d");
    fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
        const countries = ChartGeo.topojson.feature(data, data.objects.countries).features;

        var shown;
        //worldchart_backgroundColor
        for(country_index=0; country_index<countries.length; country_index++){
            shown = null;
            for(shown_index=0; shown_index<shown_countries.length; shown_index++){
                if (countries[country_index].properties.name == shown_countries[shown_index]){
                    shown = shown_index;
                    break;
                }
            }
            if( shown === null) {
                //TODO colour depending on actual ill number
                worldchart_backgroundColor.push(
                    Color('steelblue').lightness(5 * 100).rgbString()
                )
            } else {
                worldchart_backgroundColor.push(
                    newcases_vs_totalcases_borderColors[shown]
                )
            }
        }
        worldmap_config= {
            type: 'choropleth',
            data: {
                labels: countries.map((d) => d.properties.name),
                datasets: [{
                    label: 'Countries',
                    backgroundColor: worldchart_backgroundColor,
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

        worldchart = new Chart(
            worldmap_ctx,
            worldmap_config
        );
    });
}


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
    toggleCountryData(pnvtr_analysisChart, active[0].feature.properties.name, active[0]._index);
}
