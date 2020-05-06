
var $element = document.getElementById("plot_province_per_regione"),
    shown_regione = 'Lombardia',
    province_per_regione_data, nuovi_malati_per_regione,
    pprr_borderColors;

if ($element !== null){
    var pprr_ctx = $element.getContext("2d"),
            pprr_data, pprr_regioni;

    var jsonData = $.ajax({
        url: 'data/province_per_regione.json',
        dataType: 'json',
    }).done(function(jsonData)
    {
        province_per_regione_data = jsonData;
        pprr_regioni = Object.keys(province_per_regione_data).map(function(item) {
            return item;
        });

        pprr_data = pprr_italiaProcessData(shown_regione);
        var options = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Situazione nelle province'
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
                        labelString: 'New confirmed cases (weekly mean) '
                    }
                }]
            },
        };

        pprr_analysisChart = new Chart(pprr_ctx, {
            type: 'line',
            data: pprr_data,
            options: options
        });

        function pprr_italiaProcessData(regione)
        {
            pprr_data = {
                datasets: []
            }
            province = Object.keys(province_per_regione_data[regione]).map(function(item) {
                        return item;
                    })
            pprr_borderColors = palette('tol-dv', province.length).map(function(hex) {
                    return '#' + hex;
                })
            var i=0;
            for (var provincia in province_per_regione_data[regione]){
                pprr_data['datasets'].push({
                    label: provincia,
                    data: province_per_regione_data[regione][provincia].map(
                        function(item) {
                            return {
                                'x': moment(item['x']), //.toISOString().slice(0,10),
                                'y': item['y']}
                    }).sort((a, b) => a.x - b.x),
                    borderColor: pprr_borderColors[i++],
                    fill: 'false'
                })

            }
            return pprr_data;

        }

    });

}