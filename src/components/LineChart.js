import React, {Component} from 'react'

import { select } from 'd3-selection'
import { nest } from 'd3-collection'
import { extent } from 'd3-array'
import { format } from 'd3-format'
import { timeParse } from 'd3-time-format'
import { axisLeft, axisBottom } from 'd3-axis'
import { line, curveMonotoneX } from 'd3-shape'
import { scaleLinear, scaleTime } from 'd3-scale'
import { Delaunay } from "d3-delaunay";
import "d3-transition"
import _ from 'lodash'

import {ChartContainer} from './StyledComponents'

import { svgDimensions, appendArea } from './chartFunctions'

class LineChart extends Component {
  state = {
    firstRender: false,
    voronoi: {
      voronoiYear: '',
      voronoiCountry: ''
    }
  }

  componentDidUpdate(prevProps){

    const { firstRender } = this.state

    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }
    console.log(this.state);
  }

  initVis(){

    this.svg = select(this.node)

    const { width, height, margin } = this.props,
          { data, transition } = this.props,
          { chartWidth, chartHeight } = svgDimensions(this.svg, width, height, margin),
          parseTime = timeParse('%Y')

    this.chartHeight = chartHeight
    this.chartWidth = chartWidth

    data.forEach(d => {
      d.formattedDate = parseTime(d.year)
    })

    const nestedData = nest().key(d => d.country).entries(data)

    appendArea(this.svg, 'chart-area', margin.left, margin.top)
    appendArea(this.svg, 'yAxis-area', margin.left, margin.top)
    appendArea(this.svg, 'xAxis-area', margin.left, margin.top + chartHeight)

    this.chartArea = this.svg.select('.chart-area')

    const yAxis = this.svg.select('.yAxis-area')
    const xAxis = this.svg.select('.xAxis-area')

    this.yScale = scaleLinear().domain([0, 5]).range([chartHeight, 0])
    this.xScale = scaleTime().domain(extent(data, d => d.formattedDate)).range([0, chartWidth])

    xAxis
        .transition('update')
        .duration(transition.long)
        .call(
          axisBottom(this.xScale)
            .tickSizeOuter(0)
            .tickSizeInner(5)
            .tickValues(this.xScale.domain()))

    xAxis.selectAll(".tick line").remove()

    yAxis
        .transition('update')
        .duration(transition.long)
        .call(
          axisLeft(this.yScale)
            .tickSizeOuter(0)
            .tickSizeInner(5)
            .tickValues([0,1,2,3,4,5])
            .tickFormat(format('d')))

    yAxis.selectAll(".domain").remove()
    yAxis.selectAll(".tick line").attr('transform', 'translate(1, 0)')

    this.lineGenerator = line().x(d => this.xScale(d.formattedDate)).y(d => this.yScale(d.value)).curve(curveMonotoneX)

    this.createUpdateLines(nestedData)
    this.createUpdateCircles()
    this.createUpdateVoronoi()

  }

  updateData(){


  }

  createUpdateLines(data){

    const { transition, colorScale } = this.props,
          { long } = transition,
          lines = this.chartArea.selectAll('.line').data(data, d => d.key)

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

  createUpdateCircles(){

    const { transition, year, data } = this.props,
          { long } = transition,
          circles = this.chartArea.selectAll('.circle').data(data, d => d.country),
          date = data.filter(d => d.year === year)[0].formattedDate

    if(!this.chartArea.select('.year-line')._groups[0][0]){
      this.chartArea
                .append('line')
                .attr('class', `year-line`)
                .attr('x1', this.xScale(date))
                .attr('x2', this.xScale(date))
                .attr('y1', this.yScale(0))
                .attr('y2', this.yScale(5))
                .style('stroke', '#333')
                .attr('stroke-dasharray', '5, 2')
                .attr('stroke-width', 1)
    } else {
      this.chartArea.select('.year-line')
              .transition('update')
              .duration(long)
              .attr('x1', this.xScale(date))
              .attr('x2', this.xScale(date))
    }

    circles.exit()
          .transition('out')
          .duration(long)
          .attr('r', 0)
          .remove()

    circles.enter()
          .append('circle')
          .attr('class', d => `circle`)
          .attr('fill', "#333")
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('r', 0)
          .attr('cy', d => this.yScale(d.value))
          .attr('cx', d => this.xScale(d.formattedDate))
              .merge(circles)
              .transition('out')
              .duration(long)
              .attr('r', d => year === d.year ? 5 : 0)
              // .attr('fill', d => colorScale(d.economicClass))
              .attr('cy', d => this.yScale(d.value))
              .attr('cx', d => this.xScale(d.formattedDate))

  }

  createUpdateVoronoi(){

      const { data, transition } = this.props

      const voronoi = Delaunay.from(data, d => this.xScale(d.formattedDate), d => this.yScale(d.value)).voronoi([0, 0, this.chartWidth, this.chartHeight])

      const voronois =  this.chartArea.selectAll(".voronoi-path").data(data)

      voronois.exit().remove()

      voronois.enter()
            .append("path")
            // .attr('stroke', '#333')
            .attr("fill", 'none')
            .attr('class', d => `voronoi-path`)
            .attr("pointer-events", "all")
            .attr("d", (d, i) => voronoi.renderCell(i))
            .on('mouseover', d => {
              this.setState({
                    voronoi: {
                      voronoiYear: d.year,
                      voronoiCountry: d.country
                    }
                  });
            })
            .on("mouseout", () => {

            })

              .merge(voronois)
              .transition('update')
              .duration(transition.long)
              .attr("d", (d, i) => voronoi.renderCell(i))

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
    right: 25,
    bottom: 25,
    left: 15
  },
  transition: {
    long: 1000,
    short: 300
  }

}

export default LineChart
