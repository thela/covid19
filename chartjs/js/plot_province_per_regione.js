
var $element = document.getElementById("plot_province_per_regione"),
    shown_regione = 'Lombardia',
    province_per_regione_data,
    pprr_borderColors;

if ($element !== null){
    var pprr_ctx = $element.getContext("2d"),
            pprr_data, pprr_regioni;

    var options = {
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Situazione nelle province'
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
                type: 'logarithmic',
                scaleLabel: {
                    display: true,
                    labelString: 'casi confermati'
                }
            }]
        },
    };
    pprr_analysisChart = new Chart(pprr_ctx, {
        type: 'line',
        data: pprr_data,
        options: options
    });

    $.getJSON('data/province_per_regione.json', function(data) {
        //data is the JSON string
        province_per_regione_data = data;
        pprr_regioni = Object.keys(province_per_regione_data).map(function(item) {
            return item;
        });

        pprr_data = pprr_italiaProcessData(shown_regione, province_per_regione_data);
        pprr_analysisChart.data = pprr_data;
        pprr_analysisChart.update();


    })

    function pprr_italiaProcessData(regione, data)
    {
        pprr_data = {
            datasets: []
        }
        province = Object.keys(data[regione]).map(function(item) {
                    return item;
                })
        pprr_borderColors = palette('tol-dv', province.length).map(function(hex) {
                return '#' + hex;
            })
        var i=0;
        for (var provincia in data[regione]){
            pprr_data['datasets'].push({
                label: provincia,
                data: data[regione][provincia].map(
                    function(item) {
                        return {
                            'x': moment(item['x']), //.toISOString().slice(0,10),
                            'y': item['y']}
                }).sort((a, b) => a.x - b.x),
                borderColor: pprr_borderColors[i++],
                fill: 'false'
            })

        }
        return pprr_data;
    }
}

var $element = document.getElementById("nuovi_malati_per_regione"),
    nuovi_malati_per_regione;

if ($element !== null){
    var nmpr_ctx = $element.getContext("2d"),
            nmpr_data, nmpr_regioni;

    var options = {
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Nuovi contagi nelle province'
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
                type: 'linear',
                scaleLabel: {
                    display: true,
                    labelString: 'Nuovi Casi Giornalieri'
                }
            }]
        },

        plugins: {
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
                    mode: 'xy',
                }
            }
        }

    };
    nmpr_analysisChart = new Chart(nmpr_ctx, {
        type: 'line',
        data: nmpr_data,
        options: options,
    });

    $.getJSON('data/nuovi_malati_per_regione.json', function(data) {
        nuovi_malati_per_regione = data;
        nmpr_regioni = Object.keys(nuovi_malati_per_regione).map(function(item) {
            return item;
        });

        nmpr_data = nmpr_italiaProcessData(shown_regione, nuovi_malati_per_regione);
        nmpr_analysisChart.data = nmpr_data;
        nmpr_analysisChart.update();

    })

    function nmpr_italiaProcessData(regione, data)
    {
        nmpr_data = {
            datasets: []
        }
        province = Object.keys(data[regione]).map(function(item) {
                    return item;
                })
        nmpr_borderColors = palette('tol-dv', province.length).map(function(hex) {
                return '#' + hex;
            })
        var i=0;
        for (var provincia in data[regione]){
            nmpr_data['datasets'].push({
                label: provincia,
                data: data[regione][provincia].map(
                    function(item) {
                        return {
                            'x': moment(item['x']),//.toISOString().slice(0,10), //.toISOString().slice(0,10),
                            'y': item['y']}
                }).sort((a, b) => a.x - b.x),
                borderColor: nmpr_borderColors[i++],
                fill: 'false',
                lineTension: 0
            })
    
        }
        return nmpr_data;
    }
}
