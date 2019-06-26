import React, {Component} from 'react'

import { select } from 'd3-selection'
import { axisLeft } from 'd3-axis'
import { scaleLinear, scaleBand } from 'd3-scale'
import { easeCubic } from 'd3-ease'
import "d3-transition"
import _ from 'lodash'

import { svgDimensions, appendArea } from './chartFunctions'

class BarChart extends Component {
  state = {
    firstRender: false,
    overallScore: ''
  }

  componentDidUpdate(prevProps){

    const { value, width, transition, year, sizedByPopulation } = this.props
    const { firstRender } = this.state

    console.log(sizedByPopulation)

    if(!firstRender) {
      this.initVis()
      this.updateAvgBars(0)
      this.setState(state => state.firstRender = true)
    }

    if (prevProps.year !== year){
      this.updateMainBars(0)
      this.updateAvgBars(0)
    } else if (
      prevProps.sizedByPopulation !== sizedByPopulation
    ){
      this.updateAvgBars()
    } else if (
      prevProps.value !== value
    ){
      this.updateMainBars(transition.long)
    }

    if(prevProps.width !== width){
      this.updateDimensions()
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
    this.yScale =scaleBand().domain(data.filter(d => d.metric !== 'Overall Score').map(d => d.metric)).range([0, chartHeight]).padding(0.25)
    
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

  updateMainBars(duration){

    const { data, value } = this.props

    const mainRects = this.chartArea.selectAll('.main-rect').data(data.filter(d => d.country === value && d.metric !== 'Overall Score'), d => d.metric)

    mainRects.enter()
        .append('rect')
        .attr('class', 'main-rect')
        .attr('x', this.xScale(0))
        .attr('y', d => this.yScale(d.metric))
        .attr('width', d => this.xScale(d.value))
        .attr('height', this.yScale.bandwidth())
        //.attr('fill', d => d.value > d.avg ? '#666' : '#ccc')
        .attr('fill', '#666')
          .merge(mainRects)
          .transition('update')
          .ease(easeCubic)
          .duration(duration)
          .attr('width', d => this.xScale(d.value))
          .attr('fill', '#666')
          .attr('x', this.xScale(0))
          .attr('y', d => this.yScale(d.metric))
          .attr('width', d => this.xScale(d.value))
          .attr('height', this.yScale.bandwidth())

    this.chartArea.selectAll('.avg-rect').raise()
    this.chartArea.selectAll('.avg-text').raise()
  }

  updateAvgBars(){

    const { sizedByPopulation, data} = this.props

    let calculatedData 

    const metricMap = _.uniq(data.map(d => d.metric))

    if(!sizedByPopulation){

      const countriesNum = _.uniq(data.map(d => d.country)).length

      const unWeightedSum = metricMap.map(el => {
        const sum = _.sumBy(data.filter(d => d.metric === el), 'value')/countriesNum  
        return { metric: el, value: sum }
      })

      calculatedData = unWeightedSum

    } else {

      const popSum = _.sumBy(data.filter(d => d.metric === 'Access to Small Arms'), 'population')

      const weightedData = data.map(d => {
        return { country: d.country, metric: d.metric, value: d.population * d.value }
      })
  
      const weightedSum = metricMap.map(el => {
        const sum = _.sumBy(weightedData.filter(d => d.metric === el), 'value')/popSum  
        return { metric: el, value: sum }
      })

      calculatedData = weightedSum

    }

    console.log(calculatedData)

    const avgRects = this.chartArea.selectAll('.avg-rect').data(calculatedData.filter(d  => d.metric !== 'Overall Score'), d => d.metric)
    const avgText = this.chartArea.selectAll('.avg-text').data(calculatedData.filter(d  => d.metric !== 'Overall Score'), d => d.metric)

    avgRects.enter()  
      .append('rect')
      .attr('class', 'avg-rect')
      .attr('x', d => this.xScale(d.value))
      .attr('y', d => this.yScale(d.metric))
      .attr('width', 2)
      .attr('height', this.yScale.bandwidth())
      .attr('fill', '#333')
        .merge(avgRects)
        .attr('x', d => this.xScale(d.value))
        .attr('y', d => this.yScale(d.metric))
        .attr('width', 2)
        .attr('height', this.yScale.bandwidth())
    
    avgText.enter()
      .append('text')
      .attr('class', 'avg-text')
      .attr('x', d => this.xScale(d.value))
      .attr('y', d => this.yScale(d.metric) + this.yScale.bandwidth())
      .attr('dy', -3.5)
      .attr('dx', 5)
      .text(d => d.value.toFixed(1))
        .merge(avgText)
        .attr('x', d => this.xScale(d.value))
        .attr('y', d => this.yScale(d.metric) + this.yScale.bandwidth())
        .text(d => d.value.toFixed(1))

    this.chartArea.selectAll('.avg-rect').raise()
    this.chartArea.selectAll('.avg-text').raise()
      
  }

  updateDimensions(){

    const { width, height, margin, } = this.props,
          {chartWidth, chartHeight} = svgDimensions(this.svg, width, height, margin)

    appendArea(this.svg, 'chart-area', margin.left, margin.top)
    appendArea(this.svg, 'yAxis-area', margin.left, margin.top)

    this.chartArea.attr('transform', `translate(${margin.left}, ${margin.top})`)
    this.yAxis.attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.xScale.range([0, chartWidth])
    this.yScale.range([0, chartHeight])

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

    this.updateMainBars()
    this.updateAvgBars(0)

  }

  render(){

    const { year, value, array } = this.props
    const { overallScore } = this.state
    const hintMessage = array.includes(value) ? 'remove from' : 'add to'

    return(
          <div>
            <h4 className="tooltip__title">{value}</h4>
            <p className="tooltip__value">Overall score in {year}: <span>{overallScore && +overallScore.toFixed(2)}</span></p>
            <svg ref={node => this.node = node}/>
            <p className="tooltip__hint">The <span className="bar">┃</span> represents the overall average*</p>
            <p className="tooltip__hint"><span>Click</span> to {hintMessage} selection!</p>
          </div>
    )

  }

}

BarChart.defaultProps = {

  margin: {
    top: 0,
    right: 20,
    bottom: 0,
    left: 120
  },
  transition: {
    long: 1000
  }

}

export default BarChart
