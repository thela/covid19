
var $element = document.getElementById("tamponi"),
    shown_regione = 'Lombardia',
    tamponi_data,
    t_borderColors, r_regioni,
    t_type_to_plot = ['tamponi'], //'percentuale_positivi'], //nuovi_casi
    t_color_per_type = {
        'tamponi': '#7fe9ff',
        'percentuale_positivi': '#ff3232',
    }, t_axis_per_type = {
        'tamponi': 'A',
        'percentuale_positivi': 'B',
        'nuovi_casi': 'A',
    }, t_chart_per_type = {
        'tamponi': 'bar',
        'percentuale_positivi': 'line',
        'nuovi_casi': 'line',
    };

if ($element !== null){
    var t_ctx = $element.getContext("2d");

    var options = {
        maintainAspectRatio: false,
        spanGaps: false,
        title: {
            display: true,
            text: 'Tamponi'
        },
            legend: {
                position: 'top'
            },
        scales: {
            xAxes: [{
                display: true,
                //type: 'time',
                scaleLabel: {
                    display: true,
                    labelString: 'Giorni'
                },
            }],
            yAxes: [{
                id: 'A',
                type: 'linear',
                scaleLabel: {
                    display: true,
                    },
                },
                {
                    id: 'B',
                    type: 'linear',
                    ticks: {
                        min: 0,
                        max: 1
                    },
                    scaleLabel: {
                        display: true,
                    }
                }
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
    t_analysisChart = new Chart(t_ctx, {
        type: 'bar',
        data: {},
        options: options
    });
    $.getJSON('data/data_tamponi.json', function(data) {
        //data is the JSON string
        tamponi_data = data;
        r_regioni = Object.keys(tamponi_data).map(function(item) {
            return item;
        });

        t_analysisChart.data = t_ProcessData(shown_regione, tamponi_data);
        t_analysisChart.options.title.text = shown_regione;
        t_analysisChart.update();

    })

    function t_ProcessData(regione, data)
    {
        var t_data = {
            datasets: []
        }
        number_type = Object.keys(data[regione]).map(function(item) {
                    return item;
                })

        var i=0;
        for (var type_index in t_type_to_plot){
            number_type = t_type_to_plot[type_index]
            t_data['datasets'].push({
                label: number_type,
                /*data: data[regione][number_type].map(
                    function(item)   {
                        return {
                            'x': moment(item['x']), //.toISOString().slice(0,10),
                            'y': item['y']}
                }).sort((a, b) => a.x - b.x),*/
                data: data[regione][number_type].map(
                    function(item)   {
                        return item['y']
                }),
                //borderColor: t_color_per_type[number_type],
                backgroundColor: data[regione][number_type].map(function(item)   {
                        return t_color_per_type[number_type]}),
                //fill: 'false',
                yAxisID: t_axis_per_type[number_type],
                //type: t_chart_per_type[number_type],

            })

        }
        return t_data;
    }
}
