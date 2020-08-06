
var $element = document.getElementById("weekly_data_per_capita_matrix");

if ($element !== null){
    var wdpcm_ctx = $element.getContext("2d"),
        wdpcm_data, wdpcm_country, wdpcm_jsondata,
        shown_country = 'Italy',
        wdpcm_borderColors;

    wdpcm_data = {
        datasets: []
    }
    var wdpcm_labels = ['deaths', 'confirmed'],
    wdpcm_borderColors = {
        'confirmed': 'rgba(200, 0, 0, 1)',
        'recovered': 'rgba(0, 0, 100, 1)',
        'deaths': 'rgba(0, 0, 255, 1)',
        'active': 'rgba(0, 255, 0, 1)',
    };

    //$.getJSON('data/plot_countries.json', function(data) {
        //data is the JSON string
    //})

    var jsonData = $.ajax({
        url: 'data/weekly_data_per_capita.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
       wdpcm_jsondata = jsonData;
        wdpcm_data = wdpcm_ProcessData(shown_country);


        var wdpcm_options = {
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    title(context) {
                        return wdpcm_labels[context[0].datasetIndex];
                    },
                    /*label(context) {
                        //const v = context.dataset.data[context.dataIndex];
                        return ['x: ' + context.xLabel, 'y: ' + wdpcm_labels[context.yLabel], 'v: ' + parseInt(context.x)];
                    }*/
                }
            },
            scales: {
                x: {
                    ticks: {
                        display: true
                    },
                    gridLines: {
                        display: false
                    }
                },
                y: {
                    offset: true,
                    reverse: false,
                    ticks: {
                        display: true,
                        min: -1,
                        max: 2,
                        /*callback: function(value, index, values) {
                            // for a value (tick) equals to 8
                            return wdpcm_labels[value];
                            // 'junior-dev' will be returned instead and displayed on your chart
                        }*/
                    },
                    gridLines: {
                        display: false
                    }
                }
            }
        };
        wdpcm_analysisChart = new Chart(wdpcm_ctx, {
            type: 'matrix',
            data: wdpcm_data,
            options: wdpcm_options
        });
    })
}

white_orange = chroma.scale(['lightgray', 'orange']);
orange_red = chroma.scale(['orange', 'red']);

colour_middle = {
    'deaths': 6,
     'confirmed': 50
}

function wdpcm_ProcessData(country)
{
    wdpcm_data = {
        datasets: []
    }
    row = 0
    for (const type of ['deaths', 'confirmed']){
        wdpcm_data['datasets'].push({
            label: type,
            data: wdpcm_jsondata[country][type].map(
                function(item) {
                    return {
                        x: item['x'], y: row, v: item['y']}
                    }).sort((a, b) => a.x - b.x),
                    backgroundColor(context) {
                        const value = context.dataset.data[context.dataIndex].v;
                        if(value>colour_middle[type]){
                            return orange_red((value-colour_middle[type])/colour_middle[type]).hex();
                        } else {
                            return white_orange(value/colour_middle[type]).hex();
                        }
                    },
                    width(context) {
                        const a = context.chart.chartArea;
                        if (!a) {
                            return 0;
                        }
                        return (a.right - a.left) / 30 - 2;
                    },
                        /*
                    height(context) {
                        const a = context.chart.chartArea;
                        if (!a) {
                            return 0;
                        }
                        return (a.bottom - a.top) / 1 - 2;
                    }*/

        })
        row++;
    }
    return wdpcm_data;
}

