var $element = document.getElementById("plot_newcases_vs_totalcases");
if ($element !== null){
    var pnvt_ctx = $element.getContext("2d");
    var pnvt_data = {
        datasets: []
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


        for(i=0; i<countries.length; i++){
            pnvt_data['datasets'].push(
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
            data: pnvt_data,
            options: options
        });
    });

}
