
var worldmap_config= {}, worldchart, worldchart_backgroundColor= [],
    $element = document.getElementById("world_map"), worldmap_ctx;

if ($element !== null){
    worldmap_ctx = $element.getContext("2d");
    fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
        const countries = ChartGeo.topojson.feature(data, data.objects.countries).features;

        var shown;
        //worldchart_backgroundColor
        for(country_index=0; country_index<countries.length; country_index++){
            shown = null;
            for(shown_index=0; shown_index<shown_countries.length; shown_index++){
                if (countries[country_index].properties.name == shown_countries[shown_index]){
                    shown = shown_index;
                    break;
                }
            }
            if( shown === null) {
                //TODO colour depending on actual ill number
                worldchart_backgroundColor.push(
                    Color('steelblue').lightness(5 * 100).rgbString()
                )
            } else {
                worldchart_backgroundColor.push(
                    newcases_vs_totalcases_borderColors[shown]
                )
            }
        }
        worldmap_config= {
            type: 'choropleth',
            data: {
                labels: countries.map((d) => d.properties.name),
                datasets: [{
                    label: 'Countries',
                    backgroundColor: worldchart_backgroundColor,
                    data: countries.map((d) => ({feature: d, value: Math.random()})),
                }]
            },
            options: {
                showOutline: true,
                showGraticule: true,
                legend: {
                    display: false
                },
                scale: {
                    projection: 'equalEarth'
                },
                onClick: chartClickEvent
            },
            plugins: {
                zoom: {
                    // Container for pan options
                    pan: {
                        // Boolean to enable panning
                        enabled: true,

                        // Panning directions. Remove the appropriate direction to disable
                        // Eg. 'y' would only allow panning in the y direction
                        // A function that is called as the user is panning and returns the
                        // available directions can also be used:
                        //   mode: function({ chart }) {
                        //     return 'xy';
                        //   },
                        mode: 'xy',

                        rangeMin: {
                            // Format of min pan range depends on scale type
                            x: null,
                            y: null
                        },
                        rangeMax: {
                            // Format of max pan range depends on scale type
                            x: null,
                            y: null
                        },

                        // On category scale, factor of pan velocity
                        speed: 20,

                        // Minimal pan distance required before actually applying pan
                        threshold: 10,

                        // Function called while the user is panning
                        onPan: function({chart}) { console.log(`I'm panning!!!`); },
                        // Function called once panning is completed
                        onPanComplete: function({chart}) { console.log(`I was panned!!!`); }
                    },

                    // Container for zoom options
                    zoom: {
                        // Boolean to enable zooming
                        enabled: true,

                        // Enable drag-to-zoom behavior
                        drag: true,

                        // Drag-to-zoom effect can be customized
                        // drag: {
                        // 	 borderColor: 'rgba(225,225,225,0.3)'
                        // 	 borderWidth: 5,
                        // 	 backgroundColor: 'rgb(225,225,225)',
                        // 	 animationDuration: 0
                        // },

                        // Zooming directions. Remove the appropriate direction to disable
                        // Eg. 'y' would only allow zooming in the y direction
                        // A function that is called as the user is zooming and returns the
                        // available directions can also be used:
                        //   mode: function({ chart }) {
                        //     return 'xy';
                        //   },
                        mode: 'xy',

                        rangeMin: {
                            // Format of min zoom range depends on scale type
                            x: null,
                            y: null
                        },
                        rangeMax: {
                            // Format of max zoom range depends on scale type
                            x: null,
                            y: null
                        },

                        // Speed of zoom via mouse wheel
                        // (percentage of zoom on a wheel event)
                        speed: 0.1,

                        // On category scale, minimal zoom level before actually applying zoom
                        sensitivity: 3,

                        // Function called while the user is zooming
                        onZoom: function({chart}) { console.log(`I'm zooming!!!`); },
                        // Function called once zooming is completed
                        onZoomComplete: function({chart}) { console.log(`I was zoomed!!!`); }
                    }
                }
            }
        };

        worldchart = new Chart(
            worldmap_ctx,
            worldmap_config
        );
    });
}


function chartClickEvent(event, array){
    //https://stackoverflow.com/questions/46672925/chart-js-onclick-event-with-a-mixed-chart-which-chart-did-i-click
    if(typeof newArr === 'undefined'){
        newArr = array;
    }

    if (worldmap_config === 'undefined' || worldmap_config == null)
    {
      return;
    }
    if (event === 'undefined' || event == null)
    {
      return;
    }
    if (newArr === 'undefined' || newArr == null)
    {
      return;
    }
    if (newArr.length <= 0)
    {
      return;
    }
    var active = worldchart.getElementAtEvent(event);
    toggleCountryData(pnvtr_analysisChart, active[0].feature.properties.name, active[0]._index);
}
