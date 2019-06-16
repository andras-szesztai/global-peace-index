

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

export { svgDimensions, appendArea, appendText }
