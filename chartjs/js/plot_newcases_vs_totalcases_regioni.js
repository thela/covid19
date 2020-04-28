
var $element = document.getElementById("plot_newcases_vs_totalcases_regioni"),
    shown_regioni,
    newcases_vs_totalcases_regioni_data,
    newcases_vs_totalcases_regioni_borderColors;

if ($element !== null){
    var pnvtr_ctx = $element.getContext("2d"),
            pnvtr_data = {
            datasets: []
        }, regioni;

    var jsonData = $.ajax({
        url: 'data/plot_newcases_vs_totalcases_regioni.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        newcases_vs_totalcases_regioni_data = jsonData;

        regioni = Object.keys(jsonData).map(function(item) {
            return item;
        });
        newcases_vs_totalcases_regioni_borderColors = palette('tol-dv', regioni.length).map(function(hex) {
                return '#' + hex;
            })
        shown_regioni = ['Lombardia', 'Lazio', 'Veneto', 'Toscana', 'Emilia-Romagna', 'Calabria', 'Umbria', 'Marche', 'Piemonte']
        for(i=0; i<shown_regioni.length; i++){
            regione_index = getRegioneIndex(shown_regioni[i]);
            pnvtr_data['datasets'].push(
                {
                    label: regioni[regione_index],
                    data: newcases_vs_totalcases_regioni_data[regioni[regione_index]],
                    borderColor: newcases_vs_totalcases_regioni_borderColors[i],
                    fill: 'false'
                }
            )
        }

        var options = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Regioni italiane'
            },
            scales: {
                xAxes: [{
                    display: true,
                    type: 'logarithmic',
                    ticks: {
                        min: 100,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Total confirmed cases'
                    }
                }],
                yAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'New confirmed cases (weekly mean) '
                    }
                }]
            },
        };

        pnvtr_analysisChart = new Chart(pnvtr_ctx, {
            type: 'line',
            data: pnvtr_data,
            options: options
        });
    });

}


function getRegioneIndex(regione) {
    for(regione_index=0; regione_index<regioni.length; regione_index++){
        if (regioni[regione_index] == regione){
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

function getRegioniIndex(regione) {

    for(index=0; index<regioni.length; index++){
        if (regioni[index] == regione){
            return index;
        }
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

    // changes colour in world map
    italychart.data.datasets[0].backgroundColor[italychart_index] = Color('steelblue').lightness(5 * 100).rgbString();
    italychart.update();
}

function addRegioniData(chart, regione, italychart_index) {
    regioneIndex = getRegioniIndex(regione);
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

        // changes colour in world map
        italychart.data.datasets[0].backgroundColor[italychart_index] = newcases_vs_totalcases_regioni_borderColors[shown_index];
        italychart.update();
    }
}

function toggleRegioniData(chart, regione, italychart_index) {
    if (regioneAlreadyPlotted(chart, regione) == null){
        addRegioniData(chart, regione, italychart_index)
    } else {
        removeRegioniData(chart, regione, italychart_index)
    }

}