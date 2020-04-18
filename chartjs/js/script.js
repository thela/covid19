
//create a drawing context on the canvas
var $element = document.getElementById("italia_analysis");
var italia_analysis_ctx = $element.getContext("2d");

var $element = document.getElementById("roma_analysis");
var roma_analysis_ctx = $element.getContext("2d");

var $element = document.getElementById("plot_newcases_vs_totalcases");
var pnvt_ctx = $element.getContext("2d");

var $element = document.getElementById("plot_newcases_vs_totalcases_regioni");
var pnvtr_ctx = $element.getContext("2d");
//declare variables

var italia_analysisChart;
var roma_analysisChart;

var italia_data = {}, roma_data = {},
    italia_analysis_labels = ['terapia_intensiva', 'ricoverati_con_sintomi', 'isolamento_domiciliare', 'dimessi_guariti', 'deceduti'],
    italia_analysis_borderColor = {
        'terapia_intensiva': 'rgba(100, 0, 0, 1)',
        'ricoverati_con_sintomi': 'rgba(200, 0, 0, 1)',
        'isolamento_domiciliare': 'rgba(255, 0, 0, 1)',
        'dimessi_guariti': 'rgba(0, 0, 100, 1)',
        'deceduti': 'rgba(0, 0, 255, 1)',
    },
    italia_analysis_backgroundColor = {
        'terapia_intensiva': 'rgba(100, 0, 0, .1)',
        'ricoverati_con_sintomi': 'rgba(200, 0, 0, .1)',
        'isolamento_domiciliare': 'rgba(255, 0, 0, .1)',
        'dimessi_guariti': 'rgba(0, 0, 100, .1)',
        'deceduti': 'rgba(0, 0, 255, .1)',
    },
    roma_analysis_labels = ['totale_casi'],
    roma_analysis_borderColor = {
        'totale_casi': 'rgba(0, 0, 255, 1)',
    },
    roma_analysis_backgroundColor = {
        'totale_casi': 'rgba(0, 0, 255, .2)',
    };


//using jQuery ajax method get data from the external file. ( while using react you will do it differently)
var jsonData = $.ajax({
    url: 'data/italia_analysis.json',
    dataType: 'json',
}).done(function(results)
{
    processedData = italia_analysisprocessData(results);

    var presets = window.chartColors;
    italia_data = {
        labels: processedData.x_labels,
        datasets: []
    };

    for(i=0; i<italia_analysis_labels.length; i++){
        italia_data['datasets'].push(
            {
                label: italia_analysis_labels[i],
                data: processedData.data[italia_analysis_labels[i]],
                borderColor: processedData.borderColor[italia_analysis_labels[i]],
                fill: 1,
                backgroundColor: processedData.backgroundColor[italia_analysis_labels[i]],
            }
        )

    }
    var options = {
        maintainAspectRatio: false,
        spanGaps: false,
        elements: {
            line: {
                tension: 0.000001
            }
        },
        title: {
            display: true,
            text: 'Italia'
        },
        scales: {
            xAxes: [{
                display: true,
                type: 'time',
                scaleLabel: {
                    display: true,
                    labelString: 'Giorni'
                },
                time: {
                    parser: 'DD/MM/YYYY HH:mm',
                    tooltipFormat: 'll HH:mm',
                    unit: 'day',
                    unitStepSize: 1,
                    displayFormats: {
                        'day': 'DD/MM/YYYY'
                    }
                }
            }],
            yAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Individui'
                }
            }]
        },
        plugins: {
            filler: {
                propagate: false
            },
            'samples-filler-analyser': {
                target: 'chart-analyser'
            }
        }
    };

    italia_analysisChart = new Chart(italia_analysis_ctx, {
        type: 'line',
        data: italia_data,
        options: options
    });

});

var italia_analysisprocessData = function(jsonData)
{
    var locale = "en-us";

    var x_labels = Object.keys(jsonData).map(function(item) {
        return new Date(item);
    }).sort((a, b) => a - b);

    var dataSet = {},
        isodata = '';
    for(var i=0; i<italia_analysis_labels.length; i++){
        // a data set for each label
        dataSet[italia_analysis_labels[i]] = [];

        for (var j = 0; j < x_labels.length; j++) {
            dataSet[italia_analysis_labels[i]].push(jsonData[x_labels[j].toISOString().slice(0,10)][italia_analysis_labels[i]])
        }
    }

    return {
        labels: italia_analysis_labels,
        x_labels: x_labels,
        data: dataSet,
        borderColor: italia_analysis_borderColor,
        backgroundColor: italia_analysis_backgroundColor
    }
};


var jsonData = $.ajax({
    url: 'data/roma_analysis.json',
    dataType: 'json',
}).done(function(results)
{
    processedData = roma_analysisprocessData(results);

    var presets = window.chartColors;
    roma_data = {
        labels: processedData.x_labels,
        datasets: []
    };

    for(i=0; i<roma_analysis_labels.length; i++){
        roma_data['datasets'].push(
            {
                label: roma_analysis_labels[i],
                data: processedData.data[roma_analysis_labels[i]],
                borderColor: processedData.borderColor[roma_analysis_labels[i]],
                fill: 1,
                backgroundColor: processedData.backgroundColor[roma_analysis_labels[i]],
            }
        )

    }
    var options = {
        maintainAspectRatio: false,
        spanGaps: false,
        elements: {
            line: {
                tension: 0.000001
            }
        },
        title: {
            display: true,
            text: 'Roma'
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
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Individui'
                }
            }]
        },
        plugins: {
            filler: {
                propagate: false
            },
            'samples-filler-analyser': {
                target: 'chart-analyser'
            }
        }
    };

    roma_analysisChart = new Chart(roma_analysis_ctx, {
        type: 'line',
        data: roma_data,
        options: options
    });
});

var roma_analysisprocessData= function(jsonData) {
    var locale = "en-us";

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


var jsonData = $.ajax({
    url: 'data/plot_newcases_vs_totalcases.json',
    dataType: 'json',
}).done(function(jsonData)
{

    var countries = Object.keys(jsonData).map(function(item) {
        return item;
    });
    var borderColors = palette('tol-dv', countries.length).map(function(hex) {
            return '#' + hex;
        })

    data = {
        datasets: []
    };

    for(i=0; i<countries.length; i++){
        data['datasets'].push(
            {
                label: countries[i],
                data: jsonData[countries[i]],
                borderColor: borderColors[i],
                fill: 'false'
            }
        )

    }
    var options = {
        maintainAspectRatio: false,
        spanGaps: false,
        elements: {
            line: {
                tension: 0.000001
            }
        },
        title: {
            display: true,
            text: 'Situazione internazionale'
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

    pnvtr_analysisChart = new Chart(pnvt_ctx, {
        type: 'line',
        data: data,
        options: options
    });
});


var jsonData = $.ajax({
    url: 'data/plot_newcases_vs_totalcases_regioni.json',
    dataType: 'json',
}).done(function(jsonData)
{

    var regioni = Object.keys(jsonData).map(function(item) {
        return item;
    });
    var borderColors = palette('tol-dv', regioni.length).map(function(hex) {
            return '#' + hex;
        })

    data = {
        datasets: [],
    };

    for(i=0; i<regioni.length; i++){
        data['datasets'].push(
            {
                label: regioni[i],
                data: jsonData[regioni[i]],
                borderColor: borderColors[i],
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
        data: data,
        options: options
    });
});
