
var $element = document.getElementById("plot_regioni"),
    regioni_data,
    r_borderColors, r_regioni,
    type_to_plot = ['terapia_intensiva', 'ricoverati_con_sintomi', 'isolamento_domiciliare', 'dimessi_guariti', 'deceduti' ],
    color_per_type = {
        'ricoverati_con_sintomi': '#ff7f7f',
        'terapia_intensiva': '#ff3232',
        'totale_ospedalizzati': 'A',
        'isolamento_domiciliare': '#ffc059',
        'totale_positivi': 'A',
        'variazione_totale_positivi': 'A',
        'nuovi_positivi': 'A',
        'dimessi_guariti': '#7fe9ff',
        'deceduti': '#0094b2',
        'casi_da_sospetto_diagnostico': 'A',
        'casi_da_screening': 'A',
        'totale_casi': 'A',
        'tamponi': 'B',
        'casi_testati': 'A',
    }, axis_per_type = {
        'ricoverati_con_sintomi': 'A',
        'terapia_intensiva': 'A',
        'totale_ospedalizzati': 'A',
        'isolamento_domiciliare': 'A',
        'totale_positivi': 'A',
        'variazione_totale_positivi': 'A',
        'nuovi_positivi': 'A',
        'dimessi_guariti': 'A',
        'deceduti': 'A',
        'casi_da_sospetto_diagnostico': 'A',
        'casi_da_screening': 'A',
        'totale_casi': 'A',
        'tamponi': 'B',
        'casi_testati': 'A',
    }, chart_per_type = {
        'ricoverati_con_sintomi': 'line',
        'terapia_intensiva': 'line',
        'totale_ospedalizzati': 'line',
        'isolamento_domiciliare': 'line',
        'totale_positivi': 'line',
        'variazione_totale_positivi': 'line',
        'nuovi_positivi': 'line',
        'dimessi_guariti': 'line',
        'deceduti': 'line',
        'casi_da_sospetto_diagnostico': 'line',
        'casi_da_screening': 'line',
        'totale_casi': 'line',
        'tamponi': 'line',
        'casi_testati': 'line',
    };

if ($element !== null){
    var r_ctx = $element.getContext("2d");

    var options = {
        maintainAspectRatio: false,
        spanGaps: false,
        title: {
            display: true,
        },
            legend: {
                position: 'top'
            },
        scales: {
            xAxes: [{
                display: true,
                type: 'time',
                scaleLabel: {
                    display: true,
                    labelString: 'Giorni'
                },
            }],
            yAxes: [{
                id: 'A',
                type: 'linear',
                stacked: true,
                scaleLabel: {
                    display: true,
                }
            },
            /*{
                id: 'B',
                type: 'logarithmic',
                scaleLabel: {
                    display: true,
                }
            }*/
            ]
        },

        plugins: {
            filler: {
                propagate: false
            },
            'samples-filler-analyser': {
                target: 'chart-analyser'
            },
            zoom: {
                // Container for pan options
                pan: {
                    // Boolean to enable panning
                    enabled: true,

                    // Panning directions. Remove the appropriate direction to disable
                    // Eg. 'y' would only allow panning in the y direction
                    mode: 'x'
                },

                // Container for zoom options
                zoom: {
                    // Boolean to enable zooming
                    enabled: true,

                    // Zooming directions. Remove the appropriate direction to disable
                    // Eg. 'y' would only allow zooming in the y direction
                    mode: 'x',
                }
            }
        }
    };
    r_analysisChart = new Chart(r_ctx, {
        type: 'line',
        data: {},
        options: options
    });

    $.getJSON('data/data_regione.json', function(data) {
        //data is the JSON string
        regioni_data = data;
        r_regioni = Object.keys(regioni_data).map(function(item) {
            return item;
        });

        r_analysisChart.data = r_italiaProcessData(shown_regione, regioni_data);
        r_analysisChart.options.title.text = shown_regione;
        r_analysisChart.update();

    })

    function r_italiaProcessData(regione, data)
    {
        var r_data = {
            datasets: []
        }
        number_type = Object.keys(data[regione]).map(function(item) {
                    return item;
                })

        var i=0;
        for (var type_index in type_to_plot){
            number_type = type_to_plot[type_index]
            r_data['datasets'].push({
                label: number_type,
                data: data[regione][number_type].map(
                    function(item)   {
                        return {
                            'x': moment(item['x']), //.toISOString().slice(0,10),
                            'y': item['y']}
                }).sort((a, b) => a.x - b.x),
                borderColor: color_per_type[number_type],
                fill: 'false',
                yAxisID: axis_per_type[number_type],
                type: chart_per_type[number_type]
            })

        }
        return r_data;
    }
}
