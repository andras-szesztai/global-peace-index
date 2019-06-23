import React, {Component} from 'react'

import { ChartContainer, Tooltip } from './StyledComponents'
import BarChart from './BarChart'

import { Icon } from 'semantic-ui-react'

import { select } from 'd3-selection'
import { interpolateNumber } from 'd3-interpolate'
import { scaleLinear, scaleSqrt } from 'd3-scale'
import { extent } from 'd3-array'
import { forceSimulation, forceX, forceY, forceCollide, forceManyBody } from 'd3-force'
import { mouse } from 'd3-selection'
import "d3-transition"

import { svgDimensions, appendArea, appendText, calculateAvg, appendLine, moveLine, moveText } from './chartFunctions'

const million = 1000000

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

    const { width, year, mouseoverValue, mouseClickValue, sizedByPopulation, data} = this.props
    const { firstRender } = this.state

    if(!firstRender) {
      this.initVis()
      this.setState(state => state.firstRender = true)
    }

    if(((prevProps.year !== year) || 
      (prevProps.sizedByPopulation !== sizedByPopulation) || 
      (prevProps.data.length !== data.length)) && firstRender ){
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

    const { width, height, margin, transition, colorArray, sizedByPopulation } = this.props,
          { data, year } = this.props,
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin)

    const lowAvg = calculateAvg(data, 'Low income', year, sizedByPopulation)
    const highAvg = calculateAvg(data, 'High income', year, sizedByPopulation)
    
    this.chartWidth = chartWidth
    this.chartHeight = chartHeight

    const { sizeRange } = this.setElements()

    appendArea(this.svg, 'chart-area', margin.left, margin.top)

    this.chartArea = this.svg.select('.chart-area')

    appendText(this.chartArea, 'year-text', 0, chartHeight + 10, 'start', year )

    this.xScale = scaleLinear().domain([3.8, 1]).range([0, chartWidth])
    this.radiusScale = scaleSqrt().range(sizeRange).domain(extent(data, d => d.population/million))
    
    appendText(this.chartArea, 'high-inc-avg-value high-income-avg', this.xScale(highAvg), 0, 'middle', highAvg.toFixed(2), 0, 800 )
    appendText(this.chartArea, 'low-inc-avg-value low-income-avg', this.xScale(lowAvg), 0, 'middle', lowAvg.toFixed(2), 0, 800 )

    appendText(this.chartArea, 'low-inc-average avg-text-low low-income-avg', this.xScale(lowAvg), 15, 'middle', 'Low income average*')
    appendText(this.chartArea, 'high-inc-average avg-text-high high-income-avg', this.xScale(highAvg), 15, 'middle', 'High income average*' )

    appendText(this.chartArea, 'low-inc-average-arrow avg-text-low low-income-avg', this.xScale(lowAvg), 25, 'middle', '▾' )
    appendText(this.chartArea, 'high-inc-average-arrow avg-text-high high-income-avg', this.xScale(highAvg), 25, 'middle', '▾' )

    this.chartArea.selectAll('.high-income-avg').attr('fill', colorArray[3])
    this.chartArea.selectAll('.low-income-avg').attr('fill', colorArray[0])

    this.tooltip = select(this.div).select('.tooltip')

    appendLine(this.chartArea, 'low-line', this.xScale, lowAvg, chartHeight, colorArray[0])
    appendLine(this.chartArea, 'high-line', this.xScale, highAvg, chartHeight, colorArray[3])

    this.avgLineHover('.low-line', 'low-income-avg')
    this.avgLineHover('.high-line', 'high-income-avg')

    this.createRemoveCircles()
    
    this.simulation = forceSimulation(data)
        .force("charge", forceManyBody().strength(-10))
        .force('x', forceX(d => this.xScale(d[year])).strength(1))
        .force('y', forceY(chartHeight/2).strength(.15))
        .force('collide', forceCollide( d => this.radiusScale(d.population/million) + 4))
        .alphaDecay(0)
			  .alpha(.15)
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

    const { data, year, transition, sizedByPopulation } = this.props

    const lowAvg = calculateAvg(data, 'Low income', year, sizedByPopulation)
    const highAvg = calculateAvg(data, 'High income', year, sizedByPopulation)

    const { forceCollideValue, sizeRange } = this.setElements()

    this.radiusScale.range(sizeRange)

    moveLine(this.chartArea, '.low-line', transition.long, this.xScale, lowAvg)
    moveLine(this.chartArea, '.high-line', transition.long, this.xScale, highAvg)

    this.avgLineHover('.low-line', 'low-income-avg')
    this.avgLineHover('.high-line', 'high-income-avg')

    this.simulation
      .force('x', forceX(d => this.xScale(d[year])).strength(1))
      .force('collide',  forceCollide(sizedByPopulation ?  d => this.radiusScale(d.population/million) + 4 : forceCollideValue))

    this.createRemoveCircles()

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

    this.chartArea
          .selectAll('.main-circle')
          .attr('opacity', d => ['Low income', 'High income'].includes(d.economicClass) || mouseClickValue.includes(d.country) ? 1 : .1 )

  }

  setElements(){

    const { windowWidth } = this.props

    let mainRadius, subRadius, tooltipY, forceCollideValue, sizeRange

  if (windowWidth < 1000){
      mainRadius= 6
      subRadius= 9
      tooltipY= 20
      forceCollideValue= 12
      sizeRange = [3, 25]
    } else {
      mainRadius= 8
      subRadius= 11
      tooltipY= 20
      forceCollideValue= 14
      sizeRange = [2, 40]
    }

    return { mainRadius, subRadius, tooltipY, forceCollideValue, sizeRange }

  }

  updateDims(){

    const { width, height, margin } = this.props,
          {chartWidth} = svgDimensions(this.svg, width, height, margin)

    this.xScale.range([0, chartWidth])

    this.updateData()

  }

  avgLineHover(selection, ecoClass){

    const area = this.chartArea

    area.select(selection)
      .on('mouseover',  () => {
        this.setState({
            avgLine: {
              economicClass: ecoClass,
            }
          })

          area.select(selection).attr('stroke-opacity', 1)
          area.select(`.${ecoClass}`).attr('opacity', 1)


        })
      .on('mouseout', () => {
        area.select(selection).attr('stroke-opacity', .4)
        area.select(`.${ecoClass}`).attr('opacity', 0)
      })

  }

  createRemoveCircles(){

    const {data, colorScale, mouseClickValue, year, handleMouseover, handleMouseout, handlemouseClick, sizedByPopulation, transition} = this.props
    const {tooltipY, mainRadius, subRadius } = this.setElements()

    const subCircles = this.chartArea.selectAll('.sub-circle').data(data, d => d.country)
    const mainCircles = this.chartArea.selectAll('.main-circle').data(data, d => d.country)

    subCircles.exit()
      .transition('remove')
      .duration(transition.long)
      .attr("r", 2)  
      .remove()
    
    subCircles.enter()
          .append('circle')
          .attr('class', 'sub-circle')
          .attr("r", d => this.radiusScale(d.population/million) + 2)
          .attr('stroke', d => colorScale(d.economicClass))
          .attr("r", 0)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', d => mouseClickValue.includes(d.country) ? 1 : 0)
          .attr("cx", d => d[year])
          .attr("cy", d => this.chartHeight/2)
            .merge(subCircles)
            .transition('add')
            .duration(transition.long)
            .attr("r", sizedByPopulation ? d => this.radiusScale(d.population/million) + 2 : subRadius)
            

    mainCircles.exit()
      .transition('remove')
      .duration(transition.long)
      .attr("r", 0)
      .remove()

    mainCircles
          .enter()
          .append('circle')
          .attr('class', 'main-circle')
          .attr("r", 0)
          .attr("stroke-width", 4)
          .attr("stroke", 'white')
          .attr('stroke-opacity', 0)
          .attr('fill', d => colorScale(d.economicClass))
          .attr('opacity', d => ['Low income', 'High income'].includes(d.economicClass) ? 1 : .1 )
          .attr("cx", d => d[year])
          .attr("cy", d => this.chartHeight/2)
              .on('mouseover', (d,i,n) => {
                this.tooltip.style('display', 'block')
                handleMouseover(d)
                select(n[i]).attr('opacity', 1)
              })
              .on('mousemove', d => {
                const mousePos = mouse(this.div)
                const left = this.chartWidth/2 < mousePos[0]
                const tooltipWidth = this.tooltip._groups[0][0].clientWidth

                this.tooltip.style('top', mousePos[1] - 30 + 'px')

                left  ? this.tooltip.style('left', mousePos[0] - tooltipWidth - tooltipY + 'px')
                      : this.tooltip.style('left', mousePos[0] + tooltipY + 'px')

                const { tooltipLeft, tooltipColor } = this.state
                if(tooltipLeft !== left){
                  this.setState(s => s.tooltipLeft = left)
                }
                if(tooltipColor !== d.economicClass){
                  this.setState(s => s.tooltipColor = d.economicClass)
                }

              })
              .on('mouseout', (d, i, n) => {
                 handleMouseout(d, i, n)
                 this.tooltip.style('display', 'none')

              })
              .on('click', handlemouseClick)
                .merge(mainCircles)
                .transition('add')
                .duration(transition.long)
                .attr("r", sizedByPopulation ? d => this.radiusScale(d.population/million) : mainRadius)

  }

  render(){

    const { tooltipData, mouseoverValue, year, colorScale, sizedByPopulation, windowWidth } = this.props
    const { tooltipLeft, tooltipColor } = this.state
    const color = tooltipColor && colorScale(tooltipColor)
    const calculationMode = sizedByPopulation ? 'Weighted' : 'Not weighted'
    let tooltipHeight, margin, width, height
    
    if(windowWidth < 1100 && windowWidth > 900) {
      tooltipHeight = '260px'
      margin = {
        top: 0,
        right: 15,
        bottom: 0,
        left: 105
      }
      width = 225
      height= 175
    } else if (windowWidth < 900 ){
      tooltipHeight = '220px'
      margin = {
        top: 0,
        right: 10,
        bottom: 0,
        left: 90
      }
      width = 200
      height= 150
    } else {
      tooltipHeight = '285px'
      margin = {
        top: 0,
        right: 20,
        bottom: 0,
        left: 120
      }
      width = 250
      height= 200
    }

    return(
      <div>
        <ChartContainer ref={div => this.div = div}>
          <svg ref={node => this.node = node}/>
          <p className="label label__icon label__left"><Icon className="label__icon__left" name="caret left" />Lower</p>
          <p className="label label__icon label__right">Higher<Icon className="label__icon__right" name="caret right" /></p>
          <p className="label label__text">State of Peace</p>
          <p className="label label__calculation-text">*{calculationMode} by population</p>
          <Tooltip
              className="tooltip"
              color = {color}
              left = {tooltipLeft}
              height = {tooltipHeight}
              >
              <BarChart
                  data = {tooltipData}
                  value = {mouseoverValue}
                  year = {year}
                  width = {width}
                  height = {height}
                  margin = {margin}
                  windowWidth = {windowWidth}
              />
          </Tooltip>
        </ChartContainer>
      </div>
    )

  }

}

BeeSwarmPlot.defaultProps = {

  margin: {
    top: 50,
    right: 0,
    bottom: 40,
    left: 0
  },

  transition: {
    veryLong: 7500,
    long: 1000,
    short: 300
  }

}

export default BeeSwarmPlot
