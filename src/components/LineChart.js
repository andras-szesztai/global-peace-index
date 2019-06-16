import React, {Component} from 'react'

import { select } from 'd3-selection'
import { axisLeft } from 'd3-axis'
import { scaleLinear, scaleBand } from 'd3-scale'
import "d3-transition"

import {ChartContainer} from './StyledComponents'

import { svgDimensions, appendArea } from './chartFunctions'

class LineChart extends Component {
  state = {
    firstRender: false,
  }

  componentDidUpdate(prevProps){


  }

  initVis(){

    this.svg = select(this.node)

    const { width, height, margin, } = this.props,
          { data } = this.props,
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin)

    appendArea(this.svg, 'chart-area', margin.left, margin.top)
    appendArea(this.svg, 'yAxis-area', margin.left, margin.top)

    this.chartArea = this.svg.select('.chart-area')
    this.yAxis = this.svg.select('.yAxis-area')

    this.yScale = scaleLinear().domain([0, 5]).range([chartHeight, 0])

  }

  updateData(){


  }

  render(){

    const { year, value } = this.props
    const { overallScore } = this.state

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
    top: 0,
    right: 10,
    bottom: 0,
    left: 145
  }

}

export default LineChart
