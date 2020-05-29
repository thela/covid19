var shown_regioni = ['Lombardia']
var italy_config= {}, worldchart, italy_backgroundColor= [],
    $element = document.getElementById("italy_map"), italymap_ctx, regioni;

if ($element !== null){
    italymap_ctx = $element.getContext("2d");
    fetch('https://raw.githubusercontent.com/deldersveld/topojson/master/countries/italy/italy-regions.json').then((r) => r.json()).then((data) => {
        //const regioni = ChartGeo.topojson.feature(data, data.objects.countries).features;

        regioni = ChartGeo.topojson.feature(data,data.objects.ITA_adm1).features;

        var shown;
        //italy_backgroundColor
        for(regione_index=0; regione_index<regioni.length; regione_index++){
            shown = null;
            for(shown_index=0; shown_index<shown_regioni.length; shown_index++){
                if (regioni[regione_index].properties.NAME_1 == shown_regioni[shown_index]){
                    shown = shown_index;
                    break;
                }
            }
            if( shown === null) {
                //TODO colour depending on actual ill number
                italy_backgroundColor.push(
                    Color('steelblue').lightness(5 * 100).rgbString()
                )
            } else {
                try {
                    italy_backgroundColor.push(
                        newcases_vs_totalcases_regioni_borderColors[shown]
                    )
                } catch(e) {
                    italy_backgroundColor.push(
                        Color('steelblue').rgbString()
                    )
                }
            }
        }
        italy_config= {
            type: 'choropleth',
            data: {
                labels: regioni.map((d) => d.properties.NAME_1),
                datasets: [{
                    label: 'regioni',
                    backgroundColor: italy_backgroundColor,
                    data: regioni.map((d) => ({feature: d, value: Math.random()})),
                outline: regioni,
                }],
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
      return 'italy_config undefined';
    }
    if (event === 'undefined' || event == null)
    {
      return 'event undefined';
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
    //console.log(active[0].feature.properties.NAME_1);

    if (active.length >0) {
        var regione_label = active[0].feature.properties.NAME_1;
        if(active[0].feature.properties.NAME_1==='Sicily'){
            regione_label = 'Sicilia'
        } else if(active[0].feature.properties.NAME_1==='Apulia'){
            regione_label = 'Puglia'
        } else if(active[0].feature.properties.NAME_1==='Friuli-Venezia Giulia'){
            regione_label = 'Friuli Venezia Giulia'
        } else if(active[0].feature.properties.NAME_1==='Trentino-Alto Adige'){
           regione_label = 'Trentino Alto Adige'
       }
       //console.log(regione_label);
       toggleRegioniData(regione_label, active[0]._index);
   }
}


function getRegioneIndex(regione) {
    for(regione_index=0; regione_index<pnvtr_regioni.length; regione_index++){
        if (pnvtr_regioni[regione_index] == regione){
            return regione_index;
        }
    }
}

function regioneAlreadyPlotted(chart, regione) {
    for(index=0; index<chart.data.datasets.length; index++){
        if (chart.data.datasets[index].label == regione){
            return index;
        }
    }
    return null;
}

function getShownRegioneIndex(regione) {
    for(shown_index=0; shown_index<shown_regioni.length; shown_index++){
        if (shown_regioni[shown_index] == null){
            // there's a null, I put the regione
            return shown_index;
        }
    }
}

function setShownRegioneIndex(regione) {
    for(shown_index=0; shown_index<shown_regioni.length; shown_index++){
        if (shown_regioni[shown_index] == null){
            // there's a null, I put the regione
            shown_regioni[shown_index] = regione;
            return shown_index;
        }
    }
    // if we are here, there are no nulls in shown_regioni
    // if shown_regioni.length is less than 12, I append one
    if (shown_regioni.length < 12){
        shown_regioni.push(regione);
        return shown_regioni.length-1;
    } else {
        //TODO remove firstregione
    }
    return null;
}


function removeRegioniData(chart, regione, italychart_index) {
    // removes regione from upper chart
    for(removalIndex=0; removalIndex<chart.data.datasets.length; removalIndex++){
        if (chart.data.datasets[removalIndex].label == regione){
            chart.data.datasets.splice(removalIndex, 1);
        }
    }

    // removes regione from shown_regioni
    for(shown_index=0; shown_index<shown_regioni.length; shown_index++){
        if (regione == shown_regioni[shown_index]){
            shown_regioni[shown_index] = null;
            break;
        }
    }
    chart.update();

}

function addRegioniData(chart, regione, italychart_index) {
    if (regioneAlreadyPlotted(chart, regione) == null && regioneIndex != null){
        shown_index = setShownRegioneIndex(regione)
        chart.data.datasets.push(
            {
                label: regioni[regioneIndex],
                data: newcases_vs_totalcases_regioni_data[regioni[regioneIndex]],
                borderColor: newcases_vs_totalcases_regioni_borderColors[shown_index],
                fill: 'false'
            }
        )
        chart.update();
    }
}

function toggleRegioniData(regione, italychart_index) {
    //regioneIndex = getRegioneIndex(regione);

    try{
        pnvtr_analysisChart.data.datasets = pnvtr_italiaProcessData([regione])
        pnvtr_analysisChart.update()
    } catch(e){}

    try{
        pprr_analysisChart.data = pprr_italiaProcessData(regione, province_per_regione_data);
        pprr_analysisChart.update();
    } catch(e){}

    try{
        nmpr_analysisChart.data = nmpr_italiaProcessData(regione, nuovi_malati_per_regione);
        nmpr_analysisChart.update();
    } catch(e){}

    shown_regioni = [regione]

    var shown;
    var colour;
    for(regione_index=0; regione_index<regioni.length; regione_index++){
        shown = null;
        colour = Color('steelblue').lightness(5 * 100).rgbString();
        for(shown_index=0; shown_index<shown_regioni.length; shown_index++){
            if (regioni[regione_index].properties.NAME_1 == shown_regioni[shown_index]){
                try {
                    colour = newcases_vs_totalcases_regioni_borderColors[shown]
                    colour = Color('steelblue').rgbString()
                } catch(e) {
                    colour = Color('steelblue').rgbString()
                }

                shown = regione_index;
                break;
            }
        }
        italychart.data.datasets[0].backgroundColor[regione_index] = colour;
    }
    /*
    try{
        if (regioneAlreadyPlotted(pnvtr_analysisChart, regione) == null){
            //addRegioniData(pnvtr_analysisChart, regione, italychart_index)
            // changes colour in world map
            italychart.data.datasets[0].backgroundColor[italychart_index] = newcases_vs_totalcases_regioni_borderColors[shown_index];

        } else {
            //removeRegioniData(pnvtr_analysisChart, regione, italychart_index)

            // changes colour in world map
            italychart.data.datasets[0].backgroundColor[italychart_index] = Color('steelblue').lightness(5 * 100).rgbString();

        }
    } catch(e){}*/
    italychart.update();
}