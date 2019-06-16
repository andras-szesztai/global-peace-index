
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
  chartArea, className, x, y, anchor, text
) => {
  chartArea
      .append('text')
      .attr('class', className)
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', anchor)
      .text(text)
}

const calculateAvg = (
  data, type, year
) => {

  const array = data.filter(d => d.economicClass === type).map(el => el[year])
  const avg = _.sum(array)/array.length

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
            .attr('stroke-width', 1)

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

export { svgDimensions, appendArea, appendText, calculateAvg, appendLine, moveLine }
