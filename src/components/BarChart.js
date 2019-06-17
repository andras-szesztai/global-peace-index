import React, {Component} from 'react'

import { select } from 'd3-selection'
import { axisLeft } from 'd3-axis'
import { scaleLinear, scaleBand } from 'd3-scale'
import { easeCubic } from 'd3-ease'
import "d3-transition"

import { svgDimensions, appendArea } from './chartFunctions'

class BarChart extends Component {
  state = {
    firstRender: false,
    overallScore: ''
  }

  componentDidUpdate(prevProps){

    const { data, value } = this.props
    const { firstRender } = this.state

    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }

    if(prevProps.value !== value) {
      this.updateData()
      const overallScore = data.filter(d => d.country !== 'All' && d.metric === 'Overall Score')
      overallScore.length === 1 ? this.setState(state => state.overallScore = overallScore[0].value) : this.setState(state => state.overallScore = '')
    }

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

    this.xScale = scaleLinear().domain([0, 5]).range([0, chartWidth])
    this.yScale =scaleBand().domain(data.map(d => d.metric)).range([0, chartHeight]).padding(0.25)

    this.yAxis
      .transition("y-axis-in")
      .duration(1000)
      .call(
        axisLeft(this.yScale)
          .ticks(3)
          .tickSizeOuter(0)
          .tickSizeInner(1)
      );

    this.yAxis.selectAll(".tick line").remove();
    this.yAxis.selectAll(".domain").remove();

  }

  updateData(){

    const { data, transition } = this.props

    const mainRects = this.chartArea.selectAll('.main-rect').data(data.filter(d => d.country !== 'All'), d => d.metric),
          avgRects = this.chartArea.selectAll('.avg-rect').data(data.filter(d => d.country === 'All'), d => d.metric)

    mainRects.enter()
        .append('rect')
        .attr('class', 'main-rect')
        .attr('x', this.xScale(0))
        .attr('y', d => this.yScale(d.metric))
        .attr('width', d => this.xScale(d.value))
        .attr('height', this.yScale.bandwidth())
        .attr('fill', d => d.value > d.avg ? 'red' : 'steelblue')
          .merge(mainRects)
          .transition('update')
          .ease(easeCubic)
          .duration(transition.long)
          .attr('width', d => this.xScale(d.value))
          .attr('fill', d => d.value > d.avg ? 'red' : 'steelblue')

      avgRects.enter()
          .append('rect')
          .attr('class', 'avg-rect')
          .attr('x', d => this.xScale(d.value))
          .attr('y', d => this.yScale(d.metric))
          .attr('width', 2)
          .attr('height', this.yScale.bandwidth())
          .attr('fill', '#333')

  }

  render(){

    const { year, value } = this.props
    const { overallScore } = this.state

    return(
          <div>
            <h4>{value}</h4>
            <p>Overall score in {year}: <span>{overallScore && +overallScore.toFixed(2)}</span></p>
            <svg ref={node => this.node = node}/>
          </div>
    )

  }

}

BarChart.defaultProps = {

  margin: {
    top: 0,
    right: 10,
    bottom: 5,
    left: 145
  },
  transition: {
    long: 1000
  }

}

export default BarChart
