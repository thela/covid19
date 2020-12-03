
var $element = document.getElementById("daily_data_per_capita_average");

if ($element !== null){
    var ddpca_ctx = $element.getContext("2d"),
        ddpca_data, ddpca_country, ddpca_jsondata,
        shown_country = 'Italy',
        ddpca_borderColors;

    ddpca_data = {
        datasets: []
    }
    //var ddpca_labels = ['active', 'deaths', 'recovered', 'confirmed'];//'confirmed',
    var ddpca_labels = ['deaths', 'confirmed'];//'confirmed',
    ddpca_borderColors = {
        'confirmed': 'rgba(200, 0, 0, 1)',
        'recovered': 'rgba(0, 0, 100, 1)',
        'deaths': 'rgba(0, 0, 255, 1)',
        'active': 'rgba(0, 255, 0, 1)',
    };

    //$.getJSON('/covid19/data/plot_countries.json', function(data) {
        //data is the JSON string
    //})

    var jsonData = $.ajax({
        url: '/covid19/data/daily_data_per_capita_average.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        ddpca_jsondata = jsonData;
        ddpca_data = ddpca_ProcessData(shown_country);

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

        ddpca_analysisChart = new Chart(ddpca_ctx, {
            type: 'line',
            data: ddpca_data,
            options: options
        });
    })

}

function ddpca_ProcessData(country)
{
    ddpca_data = {
        datasets: []
    }
    for (const type of ddpca_labels){
        ddpca_data['datasets'].push({
            label: type,
            data: ddpca_jsondata[country][type].map(
                function(item) {
                    return {
                        'x': item['x'], //.toISOString().slice(0,10),
                        'y': item['y']}
            }).sort((a, b) => a.x - b.x),
            borderColor: ddpca_borderColors[type],
            fill: 'false'
        })
    }

    return ddpca_data;
}

