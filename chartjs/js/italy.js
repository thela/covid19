var shown_regioni = []
var italy_config= {}, worldchart, worldchart_backgroundColor= [],
    $element = document.getElementById("italy_map"), italymap_ctx;

if ($element !== null){
    italymap_ctx = $element.getContext("2d");
    fetch('https://raw.githubusercontent.com/deldersveld/topojson/master/countries/italy/italy-regions.json').then((r) => r.json()).then((data) => {
        //const regioni = ChartGeo.topojson.feature(data, data.objects.countries).features;

        const regioni = ChartGeo.topojson.feature(data,data.objects.ITA_adm1).features;



        var shown;
        //worldchart_backgroundColor
        for(country_index=0; country_index<regioni.length; country_index++){
            shown = null;
            for(shown_index=0; shown_index<shown_regioni.length; shown_index++){
                if (regioni[country_index].properties.name == shown_regioni[shown_index]){
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
        italy_config= {
            type: 'choropleth',
            data: {
                labels: regioni.map((d) => d.properties.NAME_1),
                datasets: [{
                    label: 'regioni',
                    backgroundColor: worldchart_backgroundColor,
                    data: regioni.map((d) => ({feature: d, value: Math.random()})),
                }]
            },
            options: {
                showOutline: false,
                showGraticule: false,
                legend: {
                    display: false
                },
                scale: {
                    projection: 'equalEarth'
                },
                onClick: chartClickEvent
            },
        };

        italychart = new Chart(
            italymap_ctx,
            italy_config
        );
    });
}


function chartClickEvent(event, array){
    //https://stackoverflow.com/questions/46672925/chart-js-onclick-event-with-a-mixed-chart-which-chart-did-i-click
    if(typeof newArr === 'undefined'){
        newArr = array;
    }

    if (italy_config === 'undefined' || italy_config == null)
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
    var active = italychart.getElementAtEvent(event);
    console.log(active[0].feature.properties.NAME_1);
    toggleCountryData(pnvtr_analysisChart, active[0].feature.properties.NAME_1, active[0]._index);
}
