
var $element = document.getElementById("weekly_data_per_capita");

if ($element !== null){
    var wdpc_ctx = $element.getContext("2d"),
        wdpc_data, wdpc_country, wdpc_jsondata,
        shown_country = 'Italy',
        wdpc_borderColors;

    wdpc_data = {
        datasets: []
    }
    //var wdpc_labels = ['active', 'deaths', 'recovered', 'confirmed'];//'confirmed',
    var wdpc_labels = ['deaths', 'confirmed'];//'confirmed',
    wdpc_borderColors = {
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
        wdpc_jsondata = jsonData;
        wdpc_data = wdpc_ProcessData(shown_country);

        var options = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Weekly data per capita'
            },
                legend: {
                    position: 'top'
                },
            scales: {
                xAxes: [{
                    display: true,
                    type: 'linear',
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

        wdpc_analysisChart = new Chart(wdpc_ctx, {
            type: 'line',
            data: wdpc_data,
            options: options
        });
    })

}

function wdpc_ProcessData(country)
{
    wdpc_data = {
        datasets: []
    }
    for (const type of wdpc_labels){
        wdpc_data['datasets'].push({
            label: type,
            data: wdpc_jsondata[country][type].map(
                function(item) {
                    return {
                        'x': item['x'], //.toISOString().slice(0,10),
                        'y': item['y']}
            }).sort((a, b) => a.x - b.x),
            borderColor: wdpc_borderColors[type],
            fill: 'false'
        })
    }

    return wdpc_data;
}

