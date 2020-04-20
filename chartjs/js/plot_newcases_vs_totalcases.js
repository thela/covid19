
var $element = document.getElementById("plot_newcases_vs_totalcases"),
    starting_countries = ['Italy', 'Spain', 'Iran', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
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
        newcases_vs_totalcases_borderColors = palette('tol-dv', starting_countries.length).map(function(hex) {
            return '#' + hex;
        })

        for(i=0; i<starting_countries.length; i++){
            country_index = getCountryIndex(starting_countries[i]);
            pnvt_data['datasets'].push(
                {
                    label: countries[country_index],
                    data: newcases_vs_totalcases_data[countries[country_index]],
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