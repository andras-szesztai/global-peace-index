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

  componentDidUpdate(prevProps){

    const { width, height, data, year, mouseoverValue } = this.props
    const { firstRender } = this.state


    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }

    if(prevProps.year !== year){
      this.updateData()
    }

    if(prevProps.mouseoverValue !== mouseoverValue ) {
      this.updateMouseover()
    }



  }

  initVis(){

    this.svg = select(this.node)

    const { width, height, margin, transition } = this.props,
          { data, year } = this.props,
          { handleMouseover, handleMouseout, handlemouseClick } = this.props,
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin),
          values = _.uniq(data.map(e => e.economicClass))

    appendArea(this.svg, 'chart-area', margin.left, margin.right)

    this.chartArea = this.svg.select('.chart-area')

    this.xScale = scaleLinear().domain([3.8, 1]).range([0, chartWidth])
    this.colorScale = scaleOrdinal().domain(values).range(['#4F345A', '#DEE1E5', '#DEE1E5', '#628C6F'])

    this.chartArea
          .selectAll('.sub-circle')
          .data(data, d => d.country)
          .enter()
          .append('circle')
          .attr('class', 'sub-circle')
          .attr("r", 11)
          .attr('fill', d => this.colorScale(d.economicClass))
          .attr('stroke', d => this.colorScale(d.economicClass))
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .attr("cx", d => d[year])
          .attr("cy", d => chartHeight/2)

    this.chartArea
          .selectAll('.main-circle')
          .data(data, d => d.country)
          .enter()
          .append('circle')
          .attr('class', 'main-circle')
          .attr("r", 8)
          .attr('fill', d => this.colorScale(d.economicClass))
          .attr("cx", d => d[year])
          .attr("cy", d => chartHeight/2)
              .on('mouseover', handleMouseover)
              .on('mouseout', handleMouseout)
              .on('click', handlemouseClick)


    this.simulation = forceSimulation(data)
        .force("charge", forceManyBody().strength(10))
        .force('x', forceX(d => this.xScale(d[year])).strength(.1))
        .force('y', forceY(chartHeight/2).strength(.1))
        .force('collide', forceCollide(14))
        .alphaDecay(0)
			  .alpha(.1)
        .on("tick", () => {

          this.chartArea.selectAll('.main-circle')
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)

          this.chartArea.selectAll('.sub-circle')
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)

        })

    this.simulation.tick(120)

    this.init_decay = setTimeout(() => {
    		this.simulation.alphaDecay(0.1);
    	}, transition.veryLong);


  }

  updateData(){

    const { data, year, transition } = this.props

  	this.simulation.force('x', forceX(d => this.xScale(d[year])).strength(.1))

  	this.simulation
  			.alphaDecay(0)
  			.alpha(0.05)
  			.restart()

    this.chartArea.selectAll('.main-circle').data(data, d => d.country)

    clearTimeout(this.init_decay);

    this.init_decay = setTimeout(() => {
        this.simulation.alphaDecay(0.1);
      }, 10000);

  }

  updateMouseover(){

    const { mouseoverValue } = this.props

    this.chartArea
          .selectAll('.sub-circle')
          .attr('stroke-opacity', d => d.country === mouseoverValue ? 1 : 0)
  }

  render(){

    return(
      <div>
        <ChartContainer>
          <svg ref={node => this.node = node}/>
          <div className="tooltip">
            
          </div>
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

  transition: {
    veryLong: 8000
  }

}

export default BeeSwarmPlot
