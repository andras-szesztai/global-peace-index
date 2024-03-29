
import _ from 'lodash'

const svgDimensions = (
  svg, width, height, margin
) => {

  svg.attr("width", width).attr("height", height)

  const chartWidth = width - margin.left - margin.right,
        chartHeight = height - margin.top - margin.bottom

  return { chartHeight, chartWidth }
}

const appendArea = (
  area, className, left, top
) => {
  area.append('g').attr('class', className).attr('transform', `translate(${left}, ${top})`)
}

const appendText = (
  chartArea, className, x, y, anchor, text, opacity = 1, weight = 300
) => {
  chartArea
      .append('text')
      .attr('class', className)
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', anchor)
      .attr('opacity', opacity)
      .attr('font-weight', weight)
      .text(text)
}

const moveText = (
  chartArea, selection, x, y
) => {
  chartArea.select(selection).attr('x', x).attr('y', y)
}

const calculateAvg = (
  data, type, year, sizedByPopulation
) => {

  let avg 
  const filteredData =  [2008,2009,2010].includes(year) ? data.filter(d => d.country !== 'South Sudan') : data

  if(sizedByPopulation){
    const array = filteredData.filter(d => d.economicClass === type).map(el => el[year] * el.population)
    const population = filteredData.filter(d => d.economicClass === type).map(el => el.population)
    avg = _.sum(array)/_.sum(population)
  } else {
    const array = filteredData.filter(d => d.economicClass === type).map(el => el[year])
    avg = _.sum(array)/array.length
  }

  return avg
}



const appendLine = (
  chartArea, className, xScale, lowAvg, chartHeight, color
) => {
  chartArea
            .append('line')
            .attr('class', className)
            .attr('x1', xScale(lowAvg))
            .attr('x2', xScale(lowAvg))
            .attr('y1', 30)
            .attr('y2', chartHeight - 30)
            .style('stroke', color)
            .attr('stroke-width', 2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr('stroke-opacity', .4)

}

const moveLine = (
  chartArea, selection, duration, xScale, num
) => {

  chartArea.select(selection)
          .transition('update')
          .duration(duration)
          .attr('x1', xScale(num))
          .attr('x2', xScale(num))

}

export { svgDimensions, appendArea, appendText, moveText, calculateAvg, appendLine, moveLine }
