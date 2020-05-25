
var $element = document.getElementById("plot_country"),
    shown_countries = ['Italy', 'Spain', 'Singapore', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
    pc_data,
    pc_borderColors;

if ($element !== null){
    var pc_ctx = $element.getContext("2d"),
            pc_data, pc_countries;

    pc_data = {
        datasets: []
    }
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
    pc_analysisChart = new Chart(pc_ctx, {
        type: 'line',
        data: pc_data,
        options: options
    });

    $.getJSON('data/plot_countries.json', function(data) {
        //data is the JSON string
        pc_countries = Object.keys(province_per_regione_data).map(function(item) {
            return item;
        });

        pc_data = pc_italiaProcessData(shown_countries, data);
        pc_analysisChart.data = pc_data;
        pc_analysisChart.update();


    })

    function pc_italiaProcessData(countries, data)
    {
        pc_data = {
            datasets: []
        }
        province = Object.keys(data[regione]).map(function(item) {
                    return item;
                })
        pc_borderColors = palette('tol-dv', province.length).map(function(hex) {
                return '#' + hex;
            })
        var i=0;
        for (var country in countries){
            for (var type in ['confirmed', 'deaths', 'recovered']){
                pc_data['datasets'].push({
                    label: country,
                    data: data[country][type].map(
                        function(item) {
                            return {
                                'x': moment(item['x']), //.toISOString().slice(0,10),
                                'y': item['y']}
                    }).sort((a, b) => a.x - b.x),
                    borderColor: pc_borderColors[i++],
                    fill: 'false'
                })

            }
        }
        return pc_data;
    }
}