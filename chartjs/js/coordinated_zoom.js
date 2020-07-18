
var leftEnd;
var rightEnd;

var charts = [
    r_analysisChart,
    t_analysisChart,
    nmpr_analysisChart
];


function updateChart() {
    Chart.helpers.each(charts, function (instance) {
        //instance.options.scales.xAxes[0].time.min = leftEnd;
        //instance.options.scales.xAxes[0].time.max = rightEnd;
        instance.options.scales.xAxes[0].ticks.min = leftEnd;
        instance.options.scales.xAxes[0].ticks.max = rightEnd;
        instance.update();
    });
}

function setZoomWidth(days){
    leftEnd = moment().subtract(days, 'days');
    rightEnd = moment.now();
    updateChart()
}

function resetZoomWidth(){
    leftEnd = moment("20200224", "YYYYMMDD");
    rightEnd = moment.now();
    updateChart()
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