   const svg = d3.select('.canvas')
          .append('svg')
          .attr('width', width)
          .attr('height', height);

        const graph = svg.append('g')
          .attr('width', graphWidth)
          .attr('height', graphHeight)
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const gXAxis = graph.append('g')
          .attr('transform', `translate(0, ${graphHeight})`);

        const gYAxis = graph.append('g');

        d3.json('sales.json').then(data => {
            const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Amount)])
            .range([graphHeight, 0]);
        const x = d3.scaleBand()
            .domain(data.map(item => item.Period))
            .range([0, 500])
            .paddingInner(0.2)
            .paddingOuter(0.2);
        const rects = graph.selectAll('rect')
            .data(data);
        rects.attr('width', x.bandwidth)
            .attr('class', 'bar-rect')
            .attr('height', d => graphHeight — y(d.Amount))
            .attr('x', d => x(d.Period))
            .attr('y', d => y(d.Amount));
        rects.enter()
            .append('rect')
            .attr('class', 'bar-rect')
            .attr('width', x.bandwidth)
            .attr('height', d => graphHeight — y(d.Amount))
            .attr('x', d => x(d.Period))
            .attr('y', d => y(d.Amount));
        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => `USD ${d / 1000}K`);
        gXAxis.call(xAxis);
        gYAxis.call(yAxis);
        gXAxis.selectAll('text')
            .style('font-size', 14);

        gYAxis.selectAll('text')
            .style('font-size', 14);
            });
