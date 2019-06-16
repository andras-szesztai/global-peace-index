import React, {Component} from 'react'

import { select } from 'd3-selection'
import { nest } from 'd3-collection'
import { extent } from 'd3-array'
import { timeParse } from 'd3-time-format'
import { axisLeft, axisBottom } from 'd3-axis'
import { line, curveMonotoneX } from 'd3-shape'
import { scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale'
import "d3-transition"
import _ from 'lodash'

import {ChartContainer} from './StyledComponents'

import { svgDimensions, appendArea } from './chartFunctions'

class LineChart extends Component {
  state = {
    firstRender: false,
  }

  componentDidUpdate(prevProps){

    const { firstRender } = this.state

    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }
  }

  initVis(){

    this.svg = select(this.node)

    const { width, height, margin } = this.props,
          { data } = this.props,
          { chartWidth, chartHeight } = svgDimensions(this.svg, width, height, margin),
          parseTime = timeParse('%Y')

    data.forEach(d => {
      d.formattedDate = parseTime(d.year)
    })

    const nestedData = nest().key(d => d.country).entries(data)

    appendArea(this.svg, 'chart-area', margin.left, margin.top)
    appendArea(this.svg, 'yAxis-area', margin.left, margin.top)
    appendArea(this.svg, 'xAxis-area', margin.left, margin.top + chartHeight)

    this.chartArea = this.svg.select('.chart-area')
    this.yAxis = this.svg.select('.yAxis-area')
    this.xAxis = this.svg.select('.xAxis-area')

    this.yScale = scaleLinear().domain([0, 5]).range([chartHeight, 0])
    this.xScale = scaleTime().domain(extent(data, d => d.formattedDate)).range([0, chartWidth])

    this.lineGenerator = line().x(d => this.xScale(d.formattedDate)).y(d => this.yScale(d.value)).curve(curveMonotoneX)

    this.createUpdateLines(nestedData)

  }

  updateData(){


  }

  createUpdateLines(data){

    const { transition, colorScale } = this.props,
          { long } = transition,
          lines = this.chartArea.selectAll('.line').data(data, d => d.key)

    console.log(colorScale.domain());
    console.log(colorScale.range());

    lines.exit()
        .transition('out')
        .duration(long)
        .attr('stroke-width', 0)
        .remove()

    lines.enter()
          .append('path')
          .attr('class', d => `line`)
          .attr('fill', 'none')
          .attr('stroke', d => colorScale(d.values[0].economicClass))
          .attr('stroke-width', 0)
          .attr('d', d => this.lineGenerator(d.values))
            .merge(lines)
            .transition('in')
            .duration(long)
            .attr('stroke-width', 2)
            .attr('stroke', d => colorScale(d.values[0].economicClass))
            .attr('d', d => this.lineGenerator(d.values))

  }


  render(){

    return(
          <div>
            <ChartContainer ref={div => this.div = div}>
              <svg ref={node => this.node = node}/>
            </ChartContainer>
          </div>
    )

  }

}

LineChart.defaultProps = {

  margin: {
    top: 10,
    right: 20,
    bottom: 20,
    left: 20
  },
  transition: {
    long: 1000,
    short: 300
  }

}

export default LineChart
