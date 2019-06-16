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

import {ChartContainer, SmallTooltip} from './StyledComponents'

import { svgDimensions, appendArea } from './chartFunctions'

class LineChart extends Component {
  state = {
    firstRender: false,
    voronoi: {
      year: '',
      country: '',
      economicClass: ''
    }
  }

  componentDidUpdate(prevProps, prevState){

    const { firstRender, voronoi } = this.state
    const { valueList } = this.props

    console.log(valueList);

    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }

    if(prevState.voronoi.year !== voronoi.year || prevState.voronoi.country || voronoi.country){
      this.circleHover()
    }

    if(prevProps.valueList.length !== valueList.length  ){
      this.updateData()
    }

  }

  initVis(){

    this.svg = select(this.node)

    const { width, height, margin } = this.props,
          { data, transition } = this.props,
          { chartWidth, chartHeight } = svgDimensions(this.svg, width, height, margin)

    this.parseTime = timeParse('%Y')

    this.chartHeight = chartHeight
    this.chartWidth = chartWidth

    data.forEach(d => d.formattedDate = this.parseTime(d.year))

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

    const { data } = this.props

    data.forEach(d => d.formattedDate = this.parseTime(d.year))

    const nestedData = nest().key(d => d.country).entries(data)

    this.createUpdateLines(nestedData)
    this.createUpdateCircles()
    this.createUpdateVoronoi()


  }

  circleHover(){

    const { voronoi } = this.state
    const { year } = this.props

    this.chartArea.selectAll('.circle')
        .attr('r', d => (voronoi.year === d.year && voronoi.country === d.country) || year === d.year ? 5 : 0)

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
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr('d', d => this.lineGenerator(d.values))
            .merge(lines)
            .transition('in')
            .duration(long)
            .attr('stroke-width', 2)
            .attr('stroke', d => colorScale(d.values[0].economicClass))
            .attr('d', d => this.lineGenerator(d.values))

  }

  createUpdateCircles(){

    const { transition, year, data, colorScale } = this.props,
          { long } = transition,
          circles = this.chartArea.selectAll('.circle').data(data, d => d.country + d.formattedDate),
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
          .attr('fill', d => colorScale(d.economicClass))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('r', 0)
          .attr('cy', d => this.yScale(d.value))
          .attr('cx', d => this.xScale(d.formattedDate))
              .merge(circles)
              .transition('out')
              .duration(long)
              .attr('r', d => year === d.year ? 5 : 0)
              .attr('fill', d => colorScale(d.economicClass))
              .attr('cy', d => this.yScale(d.value))
              .attr('cx', d => this.xScale(d.formattedDate))

  }

  createUpdateVoronoi(){

      const { data, transition, margin } = this.props

      const voronoi = Delaunay.from(data, d => this.xScale(d.formattedDate), d => this.yScale(d.value)).voronoi([0, 0, this.chartWidth, this.chartHeight])

      const voronois =  this.chartArea.selectAll(".voronoi-path").data(data)
      const tooltip = select(this.tooltip)

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
                      year: d.year,
                      country: d.country,
                      economicClass: d.economicClass
                    }
                  });

                  tooltip.select('.country').text(d.country)
                  tooltip.select('.score').text(d.value.toFixed(2))

                  tooltip.style('display', 'block')

                  const tooltipWidth = tooltip._groups[0][0].clientWidth
                  const tooltipHeight = tooltip._groups[0][0].clientHeight

                  tooltip.style("left", this.xScale(d.formattedDate) + margin.left - tooltipWidth/2 + "px")
                        .style("top", this.yScale(d.value) - tooltipHeight + 8 + "px")

            })
            .on("mouseout", () => {
              this.setState({
                    voronoi: {
                      year: '',
                      country: '',
                      economicClass: ''
                    }
                  });

              tooltip.style('display', 'none')
            })
              .merge(voronois)
              .transition('update')
              .duration(transition.long)
              .attr("d", (d, i) => voronoi.renderCell(i))

  }


  render(){

    const { colorScale, year, metric } = this.props
    const { voronoi } = this.state
    const color = colorScale(voronoi.economicClass && voronoi.economicClass)

    return(
          <div>
            <ChartContainer ref={div => this.div = div}>
              <svg ref={node => this.node = node}/>
              <SmallTooltip ref={tooltip => this.tooltip = tooltip}
                color={color}
              >
                <h4 className="country"></h4>
                <p>{metric} ({year}):</p>
                <span className="score"></span>
              </SmallTooltip>
            </ChartContainer>
          </div>
    )

  }

}

LineChart.defaultProps = {

  margin: {
    top: 25,
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
