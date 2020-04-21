
var $element = document.getElementById("plot_newcases_vs_totalcases"),
    shown_countries = ['Italy', 'Spain', 'Iran', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
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
        newcases_vs_totalcases_borderColors = palette('tol', 12).map(function(hex) {
            return '#' + hex;
        })

        for(i=0; i<shown_countries.length; i++){
            country_index = getCountryIndex(shown_countries[i]);
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

function getCountryIndexcountry(country) {
    for(country_index=0; country_index<countries.length; country_index++){
        if (countries[country_index] == country){
            return country_index;
        }
    }
}

function countryAlreadyPlotted(chart, country) {
    for(index=0; index<chart.data.datasets.length; index++){
        if (chart.data.datasets[index].label == country){
            return index;
        }
    }
    return null;
}

function getShownCountryIndex(country) {
    for(shown_index=0; shown_index<shown_countries.length; shown_index++){
        if (shown_countries[shown_index] == null){
            // there's a null, I put the country
            return shown_index;
        }
    }
}

function setShownCountryIndex(country) {
    for(shown_index=0; shown_index<shown_countries.length; shown_index++){
        if (shown_countries[shown_index] == null){
            // there's a null, I put the country
            shown_countries[shown_index] = country;
            return shown_index;
        }
    }
    // if we are here, there are no nulls in shown_countries
    // if shown_countries.length is less than 12, I append one
    if (shown_countries.length < 12){
        shown_countries.push(country);
        return shown_countries.length-1;
    } else {
        //TODO remove firstcountry
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

function removeCountryData(chart, country, worldchart_index) {
    // removes country from upper chart
    for(removalIndex=0; removalIndex<chart.data.datasets.length; removalIndex++){
        if (chart.data.datasets[removalIndex].label == country){
            chart.data.datasets.splice(removalIndex, 1);
        }
    }

    // removes country from shown_countries
    for(shown_index=0; shown_index<shown_countries.length; shown_index++){
        if (country == shown_countries[shown_index]){
            shown_countries[shown_index] = null;
            break;
        }
    }
    chart.update();

    // changes colour in world map
    worldchart.data.datasets[0].backgroundColor[worldchart_index] = Color('steelblue').lightness(5 * 100).rgbString();
    worldchart.update();
}

function addCountryData(chart, country, worldchart_index) {
    countryIndex = getCountryIndex(country);
    if (countryAlreadyPlotted(chart, country) == null && countryIndex != null){
        shown_index = setShownCountryIndex(country)
        chart.data.datasets.push(
            {
                label: countries[countryIndex],
                data: newcases_vs_totalcases_data[countries[countryIndex]],
                borderColor: newcases_vs_totalcases_borderColors[shown_index],
                fill: 'false'
            }
        )
        chart.update();

        // changes colour in world map
        worldchart.data.datasets[0].backgroundColor[worldchart_index] = newcases_vs_totalcases_borderColors[shown_index];
        worldchart.update();
    }
}

function toggleCountryData(chart, country, worldchart_index) {
    if (countryAlreadyPlotted(chart, country) == null){
        addCountryData(chart, country, worldchart_index)
    } else {
        removeCountryData(chart, country, worldchart_index)
    }

}