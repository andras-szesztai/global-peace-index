import React, {Component} from 'react'

import {ChartContainer, Tooltip, SmallTooltip} from './StyledComponents'
import BarChart from './BarChart'

import { select } from 'd3-selection'
import { interpolateNumber } from 'd3-interpolate'
import { scaleLinear } from 'd3-scale'
import { forceSimulation, forceX, forceY, forceCollide, forceManyBody } from 'd3-force'
import { mouse } from 'd3-selection'
import "d3-transition"

import { svgDimensions, appendArea, appendText, calculateAvg, appendLine, moveLine, moveText } from './chartFunctions'

class BeeSwarmPlot extends Component {
  state = {
    firstRender: false,
    tooltipLeft: '',
    tooltipColor: '',
    avgLine: {
      economicClass: '',
      value: ''
    }
  }

  componentDidUpdate(prevProps){

    const { width, year, mouseoverValue, mouseClickValue } = this.props
    const { firstRender } = this.state

    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }

    if(prevProps.year !== year && firstRender){
      this.updateData(prevProps)
    }

    if(mouseClickValue[0] !== prevProps.mouseClickValue[0] || prevProps.mouseClickValue.length !== mouseClickValue.length){
      this.updateMouseover()
    } else if(prevProps.mouseoverValue !== mouseoverValue ) {
      this.updateMouseover()
    }

    if(prevProps.width !== width && firstRender){
      this.updateDims(prevProps)
    }

  }

  initVis(){

    this.svg = select(this.node)

    const { width, height, margin, transition, windowWidth, colorScale, colorArray } = this.props,
          { data, year, mouseClickValue } = this.props,
          { handleMouseover, handleMouseout, handlemouseClick } = this.props,
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin)

    const lowAvg = calculateAvg(data, 'Low income', year)
    const highAvg = calculateAvg(data, 'High income', year)

    let mainRadius, subRadius, strokeWidth, tooltipY, forceCollideValue

    if(windowWidth <= 600){
      mainRadius= 4
      subRadius= 6
      strokeWidth= 2
      tooltipY= 10
      forceCollideValue= 8
    } else if (windowWidth < 1000){
      mainRadius= 6
      subRadius= 9
      strokeWidth= 3
      tooltipY= 20
      forceCollideValue= 12
    } else {
      mainRadius= 8
      subRadius= 11
      strokeWidth= 4
      tooltipY= 30
      forceCollideValue= 14
    }

    this.chartWidth = chartWidth
    this.chartHeight = chartHeight

    appendArea(this.svg, 'chart-area', margin.left, margin.top)

    this.chartArea = this.svg.select('.chart-area')

    appendText(this.chartArea, 'label-text label-text-left', -10, chartHeight-10, 'start', '◄ Lower' )
    appendText(this.chartArea, 'label-text label-text-right', chartWidth - 10, chartHeight-10, 'end', 'Higher ►' )
    appendText(this.chartArea, 'label-text label-text-middle', chartWidth/2, chartHeight-10, 'middle', 'State of Peace' )
    appendText(this.chartArea, 'year-text', 0, 15, 'start', year )

    this.xScale = scaleLinear().domain([3.8, 1]).range([0, chartWidth])

    const tooltip = select(this.div).select('.tooltip')

    appendLine(this.chartArea, 'low-line', this.xScale, lowAvg, chartHeight, colorArray[0])
    appendLine(this.chartArea, 'high-line', this.xScale, highAvg, chartHeight, colorArray[3])
    this.avgLineHover('.low-line', 'Low income', lowAvg)
    this.avgLineHover('.high-line', 'High income', highAvg)

    this.chartArea
          .selectAll('.sub-circle')
          .data(data, d => d.country)
          .enter()
          .append('circle')
          .attr('class', 'sub-circle')
          .attr("r", subRadius)
          .attr('fill', d => colorScale(d.economicClass))
          .attr('stroke', d => colorScale(d.economicClass))
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', d => mouseClickValue.includes(d.country) ? 1 : 0)
          .attr("cx", d => d[year])
          .attr("cy", d => chartHeight/2)

    this.chartArea
          .selectAll('.main-circle')
          .data(data, d => d.country)
          .enter()
          .append('circle')
          .attr('class', 'main-circle')
          .attr("r", mainRadius)
          .attr("stroke-width", strokeWidth)
          .attr("stroke", 'white')
          .attr('stroke-opacity', 0)
          .attr('fill', d => colorScale(d.economicClass))
          .attr("cx", d => d[year])
          .attr("cy", d => chartHeight/2)
              .on('mouseover', d => {
                tooltip.style('display', 'block')
                handleMouseover(d)
              })
              .on('mousemove', d => {
                const mousePos = mouse(this.div)
                const left = this.chartWidth/2 < mousePos[0]
                const tooltipWidth = tooltip._groups[0][0].clientWidth

                tooltip.style('top', mousePos[1] - 30 + 'px')

                left  ? tooltip.style('left', mousePos[0] - tooltipWidth - tooltipY + 'px')
                      : tooltip.style('left', mousePos[0] + tooltipY + 'px')

                const { tooltipLeft, tooltipColor } = this.state
                if(tooltipLeft !== left){
                  this.setState(s => s.tooltipLeft = left)
                }
                if(tooltipColor !== d.economicClass){
                  this.setState(s => s.tooltipColor = d.economicClass)
                }

              })
              .on('mouseout', () => {
                 handleMouseout()
                 tooltip.style('display', 'none')
              })
              .on('click', handlemouseClick)

    this.simulation = forceSimulation(data)
        .force("charge", forceManyBody().strength(-10))
        .force('x', forceX(d => this.xScale(d[year])).strength(1))
        .force('y', forceY(chartHeight/2).strength(.15))
        .force('collide', forceCollide(forceCollideValue))
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
    	}, transition.veryLong * 2);

  }

  updateData(prevProps){

    const { data, year, transition } = this.props

    const lowAvg = calculateAvg(data, 'Low income', year)
    const highAvg = calculateAvg(data, 'High income', year)

    moveLine(this.chartArea, '.low-line', transition.long, this.xScale, lowAvg)
    moveLine(this.chartArea, '.high-line', transition.long, this.xScale, highAvg)
    this.avgLineHover('.low-line', 'Low income', lowAvg)
    this.avgLineHover('.high-line', 'High income', highAvg)

  	this.simulation.force('x', forceX(d => this.xScale(d[year])).strength(1))

  	this.simulation
  			.alphaDecay(0)
  			.alpha(0.05)
  			.restart()

    const difference = prevProps ? Math.abs(prevProps.year - year) : 0
    let textTweenAnimation

    if(difference < 2){
      textTweenAnimation = 0
    } else if (difference < 6){
      textTweenAnimation = transition.short
    } else {
      textTweenAnimation = transition.long
    }

    this.chartArea.select('.year-text')
          .transition('update')
          .duration(textTweenAnimation)
          .tween("text", (d, i,n) => {
            const that = select(n[i]),
                  num = +that.text(),
                  index = interpolateNumber(num, year);

            return function(t) {
                that.text(index(t).toFixed(0));
              };

          });

    this.chartArea.selectAll('.main-circle').data(data, d => d.country)

    clearTimeout(this.init_decay);

    this.init_decay = setTimeout(() => {
        this.simulation.alphaDecay(0.1);
      }, transition.veryLong);

  }

  updateMouseover(){

    const { mouseoverValue, mouseClickValue } = this.props

    this.chartArea
          .selectAll('.sub-circle')
          .attr('stroke-opacity', d => d.country === mouseoverValue || mouseClickValue.includes(d.country) ? 1 : 0)
  }

  updateDims(){

    const { width, height, margin } = this.props,
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin)

    moveText(this.chartArea, '.label-text-right', chartWidth - 10, chartHeight-10)
    moveText(this.chartArea, '.label-text-middle', chartWidth/2, chartHeight-10)

    this.xScale.range([0, chartWidth])

    this.updateData()

  }

  avgLineHover(selection, ecoClass, value){

    const smallTooltip = select(this.tooltip)
    const selected = this.chartArea.select(selection)
    const { margin } = this.props

    selected
      .on('mouseover',  () => {
        this.setState({
            avgLine: {
              economicClass: ecoClass,
              value: value
            }
          })

          selected.attr('stroke-opacity', 1)

          smallTooltip.style('display', 'block')

          const tooltipWidth = smallTooltip._groups[0][0].clientWidth

          smallTooltip
                .style("left", this.xScale(value) + margin.left - tooltipWidth/2 + "px")
                .style("top", "-25px")

        })
      .on('mouseout', () => {
        selected.attr('stroke-opacity', .4)
        smallTooltip.style('display', 'none')
      })

  }

  render(){

    const { tooltipData, mouseoverValue, year, colorScale } = this.props
    const { tooltipLeft, tooltipColor, avgLine } = this.state
    const color = tooltipColor && colorScale(tooltipColor)
    const smallTooltipColor = avgLine.economicClass && colorScale(avgLine.economicClass)

    return(
      <div>
        <ChartContainer ref={div => this.div = div}>
          <svg ref={node => this.node = node}/>
          <Tooltip
              className="tooltip"
              color = {color}
              left = {tooltipLeft}
              >
              <BarChart
                  data = {tooltipData}
                  value = {mouseoverValue}
                  year = {year}
                  width = {300}
                  height = {200}
              />
          </Tooltip>
          <SmallTooltip ref={tooltip => this.tooltip = tooltip}
            color={smallTooltipColor}
            >
            <p>{avgLine.economicClass && avgLine.economicClass} average:</p>
            <span className="score">{avgLine.value && avgLine.value.toFixed(2)}</span>
          </SmallTooltip>
        </ChartContainer>
      </div>
    )

  }

}

BeeSwarmPlot.defaultProps = {

  margin: {
    top: 20,
    right: 10,
    bottom: 20,
    left: 10
  },

  transition: {
    veryLong: 10000,
    long: 1000,
    short: 500
  }

}

export default BeeSwarmPlot
