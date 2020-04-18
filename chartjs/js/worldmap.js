fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
      const countries = ChartGeo.topojson.feature(data, data.objects.countries).features;

  const chart = new Chart(document.getElementById("canvas").getContext("2d"), {
    type: 'choropleth',
    data: {
      labels: countries.map((d) => d.properties.name),
      datasets: [{
        label: 'Countries',
        backgroundColor: (context) => {
          if (context.dataIndex == null) {
                return null;
          }
          const value = context.dataset.data[context.dataIndex];
          return new Color('steelblue').lightness(value.value * 100).rgbString();
        },
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
      }
    }
  });
});