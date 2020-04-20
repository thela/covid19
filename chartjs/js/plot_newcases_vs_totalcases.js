
var $element = document.getElementById("plot_newcases_vs_totalcases"),
    newcases_vs_totalcases_data,
    newcases_vs_totalcases_borderColors;

if ($element !== null){
    var pnvt_ctx = $element.getContext("2d"),
            pnvt_data = {
            datasets: []
        },
        countries;

    var jsonData = $.ajax({
        url: 'data/plot_newcases_vs_totalcases.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        newcases_vs_totalcases_data = jsonData;
        countries = Object.keys(newcases_vs_totalcases_data).map(function(item) {
            return item;
        });
        newcases_vs_totalcases_borderColors = palette('tol-dv', countries.length).map(function(hex) {
            return '#' + hex;
        })

        for(i=0; i<countries.length; i++){
            pnvt_data['datasets'].push(
                {
                    label: countries[i],
                    data: newcases_vs_totalcases_data[countries[i]],
                    borderColor: newcases_vs_totalcases_borderColors[i],
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

function countryAlreadyPlotted(chart, country) {
    for(index=0; index<chart.data.datasets.length; index++){
        if (chart.data.datasets[index].label == country){
            return index;
        }
    }
    return null;
}

function getCountryIndex(country) {
    for(index=0; index<countries.length; index++){
        if (countries[index] == country){
            return index;
        }
    }
    return null;
}

function removeCountryData(chart, country) {
    for(removalIndex=0; removalIndex<chart.data.datasets.length; removalIndex++){
        if (chart.data.datasets[removalIndex].label == country){
            chart.data.datasets.splice(removalIndex, 1);
        }
    }
    chart.update();
}

function addCountryData(chart, country) {
    countryIndex = getCountryIndex(country);
    if (countryAlreadyPlotted(chart, country) == null && countryIndex != null){
        countryIndex = getCountryIndex(country);
        chart.data.datasets.push(
            {
                label: countries[countryIndex],
                data: newcases_vs_totalcases_data[countries[countryIndex]],
                borderColor: newcases_vs_totalcases_borderColors[countryIndex],
                fill: 'false'
            }
        )
        chart.update();
    }
}

function toggleCountryData(chart, country) {
    if (countryAlreadyPlotted(chart, country) == null){
        addCountryData(chart, country)
    } else {
        removeCountryData(chart, country)
    }

}