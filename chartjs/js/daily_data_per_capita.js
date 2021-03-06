
var $element = document.getElementById("daily_data_per_capita");

if ($element !== null){
    var ddpc_ctx = $element.getContext("2d"),
        ddpc_data, ddpc_country, ddpc_jsondata,
        shown_country = 'Italy',
        ddpc_borderColors;

    ddpc_data = {
        datasets: []
    }
    //var ddpc_labels = ['active', 'deaths', 'recovered', 'confirmed'];//'confirmed',
    var ddpc_labels = ['deaths', 'confirmed'];//'confirmed',
    ddpc_borderColors = {
        'confirmed': 'rgba(200, 0, 0, 1)',
        'recovered': 'rgba(0, 0, 100, 1)',
        'deaths': 'rgba(0, 0, 255, 1)',
        'active': 'rgba(0, 255, 0, 1)',
    };
    ddpc_backgroundColors = {
        'confirmed': 'rgba(200, 0, 0, .5)',
        'recovered': 'rgba(0, 0, 100, .5)',
        'deaths': 'rgba(0, 0, 255, .5)',
        'active': 'rgba(0, 255, 0, .5)',
    };

    //$.getJSON('/covid19/data/plot_countries.json', function(data) {
        //data is the JSON string
    //})

    var jsonData = $.ajax({
        url: '/covid19/data/daily_data_per_capita.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        ddpc_jsondata = jsonData;
        ddpc_data = ddpc_ProcessData(shown_country);

        var options = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Weekly cases per 100k population'
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
                        labelString: 'Week'
                    },
                }],
                yAxes: [{
                    type: 'linear',// 'logarithmic',
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Test Y'
                    }
                }]
            },
        };

        ddpc_analysisChart = new Chart(ddpc_ctx, {
            type: 'line',
            data: ddpc_data,
            options: options
        });
    })

}

function ddpc_ProcessData(country)
{
    ddpc_data = {
        datasets: []
    }
    for (const type of ddpc_labels){
        ddpc_data['datasets'].push({
            label: type,
            data: ddpc_jsondata[country][type].map(
                function(item) {
                    return {
                        'x': item['x'], //.toISOString().slice(0,10),
                        'y': item['y']}
            }).sort((a, b) => a.x - b.x),
            borderColor: ddpc_borderColors[type],
            backgroundColor : ddpc_backgroundColors[type],
            fill: 'false'
        })
    }

    return ddpc_data;
}

