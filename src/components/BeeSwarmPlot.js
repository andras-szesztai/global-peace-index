import React, {Component} from 'react'

import {ChartContainer} from './StyledComponents'

import { select } from 'd3-selection'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { forceSimulation, forceX, forceY, forceCollide, forceManyBody } from 'd3-force'
import { voronoi } from 'd3-voronoi'
import { extent } from 'd3-array'
import { interval } from 'd3-timer'
import "d3-transition"
import _ from 'lodash'

import { svgDimensions, appendArea } from './chartFunctions'

class BeeSwarmPlot extends Component {
  state = {
    firstRender: false
  }

  componentDidUpdate(){

    const { width, height, data } = this.props
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
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin),
          values = _.uniq(data.map(e => e.economicClass))

    appendArea(this.svg, 'chart-area', margin.left, margin.right)

    this.chartArea = this.svg.select('.chart-area')

    this.xScale = scaleLinear().domain([3.8, 1]).range([0, chartWidth])
    this.colorScale = scaleOrdinal().domain(values).range(['#4F345A', '#DEE1E5', '#DEE1E5', '#628C6F'])

    //
    this.simulation = forceSimulation(data)
        .force("charge", forceManyBody().strength(10))
        .force('x', forceX(d => this.xScale(d.score)).strength(.1))
        .force('y', forceY(chartHeight/2).strength(.1))
        .force('collide', forceCollide(12))
        .on("tick", () => {

          this.chartArea.selectAll('circle')
              .transition()
              .duration(10)
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)
              .attr('opacity', 1)

        })

    this.simulation.tick(80)

    const circles = this.chartArea.selectAll('circle').data(data)

    circles.enter()
          .append('circle')
          .attr("r", 8)
          .attr('fill', d => this.colorScale(d.economicClass))

  }

  render(){

    return(
      <div>
        <ChartContainer>
          <svg ref={node => this.node = node}/>
        </ChartContainer>
      </div>
    )

  }

}

BeeSwarmPlot.defaultProps = {

  margin: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },

}

export default BeeSwarmPlot
