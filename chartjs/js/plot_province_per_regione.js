
var $element = document.getElementById("plot_province_per_regione"),
    shown_regione = 'Lombardia',
    province_per_regione_data,
    pprr_borderColors;

if ($element !== null){
    var pprr_ctx = $element.getContext("2d"),
            pprr_data, pprr_regioni;

    var jsonData = $.ajax({
        url: 'data/province_per_regione.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        province_per_regione_data = pprr_processData(jsonData);

        pprr_regioni = Object.keys(jsonData).map(function(item) {
            return item;
        });
        pprr_borderColors = palette('tol-dv', regioni.length).map(function(hex) {
                return '#' + hex;
            })
        pprr_data = {
            datasets: []
        }
        province = Object.keys(province_per_regione_data[shown_regione]).map(function(item) {
                    return item;
                })
        var i=0;
        for (var provincia in province_per_regione_data[shown_regione]){
            pprr_data['datasets'].push({
                label: provincia,
                data: province_per_regione_data[shown_regione][provincia],
                borderColor: pprr_borderColors[i++],
                fill: 'false'
            })

        }
        var options = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Situazione nelle province'
            },
            scales: {
                xAxes: [{
                    display: true,
                    type: 'time',
                    time: {
                        parser: 'DD/MM/YYYY HH:mm',
                        tooltipFormat: 'll HH:mm',
                        unit: 'day',
                        unitStepSize: 1,
                        displayFormats: {
                            'day': 'DD/MM/YYYY'
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Giorni'
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

        pprr_analysisChart = new Chart(pprr_ctx, {
            type: 'line',
            data: pprr_data,
            options: options
        });
    });


    var pprr_processData = function(jsonData) {
        var locale = "en-us";


        pprr_regioni = Object.keys(jsonData).map(function(item) {
            return item;
        });
        pprr_borderColors = palette('tol-dv', regioni.length).map(function(hex) {
                return '#' + hex;
            })
        var return_data = {

        }
        province = Object.keys(province_per_regione_data[shown_regione]).map(function(item) {
                    return item;
                })
        for (var regione_index=0; regione_index < prr_regioni.length; regione_index++)){
            return_data[pprr_regioni[regione_index]] = {}
            var i=0;
            for (var provincia in province_per_regione_data[pprr_regioni[regione_index]]){

                return_data[pprr_regioni[regione_index]][provincia] = province_per_regione_data[shown_regione][provincia];

            }


        var x_labels = Object.keys(jsonData).map(function(item) {
            return new Date(item);
        }).sort((a, b) => a - b);

        var dataSet = {},
            isodata = '';
        for(var i=0; i<roma_analysis_labels.length; i++){
            // a data set for each label
            dataSet[roma_analysis_labels[i]] = [];

            for (var j = 0; j < x_labels.length; j++) {
                dataSet[roma_analysis_labels[i]].push(jsonData[x_labels[j].toISOString().slice(0,10)][roma_analysis_labels[i]])
            }
        }

        return {
            labels: roma_analysis_labels,
            x_labels: x_labels,
            data: dataSet,
            borderColor: roma_analysis_borderColor,
            backgroundColor: roma_analysis_backgroundColor
        }
    };

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
                data: province_per_regione_data[regioni[regioneIndex]],
                borderColor: pprr_borderColors[shown_index],
                fill: 'false'
            }
        )
        chart.update();

        // changes colour in world map
        italychart.data.datasets[0].backgroundColor[italychart_index] = pprr_borderColors[shown_index];
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