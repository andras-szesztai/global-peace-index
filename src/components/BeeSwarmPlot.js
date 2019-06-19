import React, {Component} from 'react'

import { ChartContainer, Tooltip } from './StyledComponents'
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
    appendText(this.chartArea, 'high-inc-avg-value high-income-avg', this.xScale(highAvg), 0, 'middle', highAvg.toFixed(2), 0, 800 )
    appendText(this.chartArea, 'low-inc-avg-value low-income-avg', this.xScale(lowAvg), 0, 'middle', lowAvg.toFixed(2), 0, 800 )

    appendText(this.chartArea, 'low-inc-average avg-text-low low-income-avg', this.xScale(lowAvg), 15, 'middle', 'Low income average' )
    appendText(this.chartArea, 'high-inc-average avg-text-high high-income-avg', this.xScale(highAvg), 15, 'middle', 'High income average' )

    appendText(this.chartArea, 'low-inc-average-arrow avg-text-low low-income-avg', this.xScale(lowAvg), 25, 'middle', '▾' )
    appendText(this.chartArea, 'high-inc-average-arrow avg-text-high high-income-avg', this.xScale(highAvg), 25, 'middle', '▾' )

    const tooltip = select(this.div).select('.tooltip')

    appendLine(this.chartArea, 'low-line', this.xScale, lowAvg, chartHeight, colorArray[0])
    appendLine(this.chartArea, 'high-line', this.xScale, highAvg, chartHeight, colorArray[3])

    this.avgLineHover('.low-line', 'low-income-avg', 'Low income', lowAvg)
    this.avgLineHover('.high-line', 'high-income-avg', 'High income', highAvg)

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
          .attr('opacity', d => ['Low income', 'High income'].includes(d.economicClass) ? 1 : .1 )
          .attr("cx", d => d[year])
          .attr("cy", d => chartHeight/2)
              .on('mouseover', (d,i,n) => {
                tooltip.style('display', 'block')
                handleMouseover(d)
                select(n[i]).transition('highlight').duration(transition.short).attr('opacity', 1)
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
              .on('mouseout', (_, i, n) => {
                 handleMouseout()
                 tooltip.style('display', 'none')
                 select(n[i]).transition('unhighlight').duration(transition.short).attr('opacity', d => ['Low income', 'High income'].includes(d.economicClass) ? 1 : .1 )
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

    this.avgLineHover('.low-line', 'low-income-avg', 'Low income', lowAvg)
    this.avgLineHover('.high-line', 'high-income-avg', 'High income', highAvg)

  	this.simulation.force('x', forceX(d => this.xScale(d[year])).strength(1))

  	this.simulation
  			.alphaDecay(0)
  			.alpha(0.05)
  			.restart()

    this.chartArea.selectAll('.avg-text-low').transition('update').duration(transition.long).attr('x', this.xScale(lowAvg))
    this.chartArea.selectAll('.avg-text-high').transition('update').duration(transition.long).attr('x', this.xScale(highAvg))

    this.chartArea.selectAll('.high-inc-avg-value').transition('update').duration(transition.long).text(highAvg.toFixed(2)).attr('x', this.xScale(highAvg))
    this.chartArea.selectAll('.low-inc-avg-value').transition('update').duration(transition.long).text(lowAvg.toFixed(2)).attr('x', this.xScale(lowAvg))

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

  avgLineHover(selection, ecoClass, colorClass, value){

    const area = this.chartArea
    const { colorScale } = this.props
    const color = colorScale(colorClass)

    area.select(selection)
      .on('mouseover',  () => {
        this.setState({
            avgLine: {
              economicClass: ecoClass,
              value: value
            }
          })

          area.select(selection).attr('stroke-opacity', 1)

          area.selectAll(`.${ecoClass}`).attr('fill', color)
          area.select(`.${ecoClass}`).attr('opacity', 1)



        })
      .on('mouseout', () => {
        area.select(selection).attr('stroke-opacity', .4)
        area.selectAll(`.${ecoClass}`).attr('fill', '#333')
        area.select(`.${ecoClass}`).attr('opacity', 0)

      })

  }

  render(){

    const { tooltipData, mouseoverValue, year, colorScale } = this.props
    const { tooltipLeft, tooltipColor } = this.state
    const color = tooltipColor && colorScale(tooltipColor)

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
    short: 300
  }

}

export default BeeSwarmPlot
