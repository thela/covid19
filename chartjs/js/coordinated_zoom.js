
var leftEnd;
var rightEnd;

var charts = [
    r_analysisChart,
    t_analysisChart,
    nmpr_analysisChart
];


function getMaxMin(data, y_min, y_max){

    for(x_y of data){
        if( parseInt(x_y['x'].format('x'))>=leftEnd && parseInt(x_y['x'].format('x'))<=rightEnd ){
            x_y_int = parseInt(x_y['y']);

            if(x_y_int < y_min){
                y_min = x_y_int;
            }
            if(x_y_int > y_max){
                y_max = x_y_int;
            }
        }
    }
    return {y_min: y_min, y_max: y_max}
}


function updateChart() {
    Chart.helpers.each(charts, function (instance) {
        //instance.options.scales.xAxes[0].time.min = leftEnd;
        //instance.options.scales.xAxes[0].time.max = rightEnd;
        instance.options.scales.xAxes[0].ticks.min = leftEnd;
        instance.options.scales.xAxes[0].ticks.max = rightEnd;

        for( yAxis of instance.options.scales.yAxes){
            if( yAxis.stacked) {
                // if the axis is stacked, the y_max should consider all shown curves
                var cumulative_dataset = {}
                for(dataset of instance.data.datasets){
                    if(!dataset._meta[Object.keys(dataset._meta)].hidden && (dataset.yAxisID == yAxis.id || !dataset.yAxisID)){
                        // proceeds only if the dataset is not hidden, and it is on the right yAxis (or if there's only one)
                        for(x_y of dataset.data){
                            x_y_ms = x_y['x'].format('x')
                            if( x_y_ms in cumulative_dataset){
                                cumulative_dataset[ x_y_ms ] += parseInt(x_y['y']);
                            } else {
                                cumulative_dataset[ x_y_ms ] = parseInt(x_y['y']);
                            }
                        }
                    }
                }
                var cumulative_array = [];

                for(x_y in cumulative_dataset){
                    cumulative_array.push({
                        'x': moment(x_y, 'x'),
                        'y': cumulative_dataset[x_y]
                    })
                }
                var values = getMaxMin(cumulative_array, null, null);
                var y_min = values.y_min;
                var y_max = values.y_max;
            } else {
                var y_min = null, y_max = null;
                for(dataset of instance.data.datasets){
                    if(!dataset._meta[Object.keys(dataset._meta)].hidden && (dataset.yAxisID == yAxis.id || !dataset.yAxisID)){
                        // proceeds only if the dataset is not hidden, and it is on the right yAxis (or if there's only one)
                        var values = getMaxMin(dataset.data, y_min, y_max);
                        y_min = values.y_min;
                        y_max = values.y_max;

                        /*for(x_y of dataset.data){
                            if( parseInt(x_y['x'].format('x'))>=leftEnd && parseInt(x_y['x'].format('x'))<=rightEnd ){
                                x_y_int = parseInt(x_y['y']);

                                if(x_y_int < y_min){
                                    y_min = x_y_int;
                                }
                                if(x_y_int > y_max){
                                    y_max = x_y_int;
                                }
                            }
                        }*/
                    }
                }
            }

            yAxis.ticks.min = y_min;
            yAxis.ticks.max = y_max;
        }

        instance.update();
    });
}

function setZoomWidth(days){
    leftEnd = moment().subtract(days, 'days');
    rightEnd = moment.now();
    updateChart();
}

function resetZoomWidth(){
    leftEnd = moment("20200224", "YYYYMMDD");
    rightEnd = moment.now();
    updateChart();
}

for (const chart of charts) {
    chart.options.plugins.zoom = {
        pan: {
            enabled: true,
            mode: 'x',
            onPan: function() {
                //console.log("PAN");
                leftEnd = chart.getDatasetMeta(1).dataset._scale.chart.scales['x-axis-0']._table[0].time;
                rightEnd = chart.getDatasetMeta(1).dataset._scale.chart.scales['x-axis-0']._table[1].time;

                updateChart();
            }
        },
        zoom: {
            enabled: true,
            mode: 'x',
            onZoom: function() {
                leftEnd = chart.getDatasetMeta(0).dataset._scale.chart.scales['x-axis-0']._table[0].time;
                rightEnd = chart.getDatasetMeta(0).dataset._scale.chart.scales['x-axis-0']._table[1].time;


                updateChart();
            }
        }
    }
    chart.options.animation = {
        duration: 0
    }
}