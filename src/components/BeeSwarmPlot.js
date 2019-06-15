import React, {Component} from 'react'

import {ChartContainer} from './StyledComponents'

import { select } from 'd3-selection'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force'
import { voronoi } from 'd3-voronoi'
import { extent } from 'd3-array'
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

    this.xScale = scaleLinear().domain([1, 3.8]).range([0, chartWidth])
    this.colorScale = scaleOrdinal().domain(values).range([0, chartWidth])


    const simulation = forceSimulation(data)
        .force('x', forceX(d => this.xScale(d.score)).strength(1))
        .force('y', forceY(chartHeight/2).strength(0.1))
        .force('collide', forceCollide(4))
        .stop()

    for (var i = 0; i < 120; ++i) simulation.tick();

    console.log(data)

    const circles = this.chartArea.selectAll('circle').data(data)

    circles.enter()
      .append('circle')
      .attr("r", 3)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    // const cell = this.chartArea.append('g')
    //     .attr('class', 'cells')
    //   .selectAll('g').data(voronoi()
    //     .extent([0,0], [100, 100])
    //     .x( d => d.x)
    //     .y( d => d.y)
    //   .polygons(data)).enter().append('g').attr('class', (d,i) => i)


    console.log(extent(data, d => d.score))

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
