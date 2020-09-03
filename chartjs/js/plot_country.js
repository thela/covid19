
var $element = document.getElementById("plot_country");

if ($element !== null){
    var pc_ctx = $element.getContext("2d"),
        pc_data, pc_country, pc_jsondata,
        shown_country = 'Italy',
        pc_borderColors;

    pc_data = {
        datasets: []
    }
    var pc_labels = [ 'deaths', 'active', 'recovered'];//'confirmed',
    pc_borderColors = {
        'confirmed': 'rgba(200, 0, 0, 1)',
        'recovered': 'rgba(0, 0, 100, 1)',
        'deaths': 'rgba(0, 0, 255, 1)',
        'active': 'rgba(0, 255, 0, 1)',
    };

    //$.getJSON('data/plot_countries.json', function(data) {
        //data is the JSON string
    //})

    var jsonData = $.ajax({
        url: 'data/plot_countries.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        pc_jsondata = jsonData;
        pc_data = pc_ProcessData(shown_country);

        var options = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Test Title'
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
                        labelString: 'Test Time'
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

        pc_analysisChart = new Chart(pc_ctx, {
            type: 'line',
            data: pc_data,
            options: options
        });
    })


}

function pc_ProcessData(country)
{
    pc_data = {
        datasets: []
    }
    for (const type of pc_labels){
        pc_data['datasets'].push({
            label: type,
            data: pc_jsondata[country][type].map(
                function(item) {
                    return {
                        'x': moment(item['x']), //.toISOString().slice(0,10),
                        'y': item['y']}
            }).sort((a, b) => a.x - b.x),
            borderColor: pc_borderColors[type],
            fill: 'false'
        })

    }

    return pc_data;
}

