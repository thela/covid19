
var $element = document.getElementById("plot_newcases_vs_totalcases_regioni"),
    shown_regioni = ['Lombardia', 'Lazio', 'Veneto', 'Toscana', 'Emilia-Romagna', 'Calabria', 'Umbria', 'Marche', 'Piemonte'],
    newcases_vs_totalcases_regioni_data,
    newcases_vs_totalcases_regioni_borderColors;


function getRegioneIndex(regione) {
    for(index=0; index<pnvtr_regioni.length; index++){
        if (pnvtr_regioni[index] == regione){
            return index;
        }
    }
    return null;
}

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

        pnvtr_regioni = Object.keys(jsonData).map(function(item) {
            return item;
        });
        newcases_vs_totalcases_regioni_borderColors = palette('tol-dv', pnvtr_regioni.length).map(function(hex) {
                return '#' + hex;
            })
        for(i=0; i<shown_regioni.length; i++){
            regione_index = getRegioneIndex(shown_regioni[i]);
            pnvtr_data['datasets'].push(
                {
                    label: pnvtr_regioni[regione_index],
                    data: newcases_vs_totalcases_regioni_data[pnvtr_regioni[regione_index]],
                    borderColor: newcases_vs_totalcases_regioni_borderColors[i],
                    fill: 'false'
                }
            )
        }

        var options = {
            maintainAspectRatio: false,
            elements: {
                line: {
                    tension: 0.000001
                },

                point:{
                    radius: 0
                }
            },
            title: {
                display: true,
                text: 'Regioni italiane'
            },
            legend: {
                position: 'right'
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

    function pnvtr_italiaProcessData(regioni)
    {
        datasets = []
        for(i=0; i<regioni.length; i++){
            regione_index = getRegioneIndex(regioni[i]);
            datasets.push(
                {
                    label: pnvtr_regioni[regione_index],
                    data: newcases_vs_totalcases_regioni_data[pnvtr_regioni[regione_index]],
                    borderColor: newcases_vs_totalcases_regioni_borderColors[i],
                    fill: 'false',
                    lineTension: 0,
                }
            )
        }
        return datasets

    }
}