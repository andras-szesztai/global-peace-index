import React, {Component} from 'react';
import './sass/_main.scss'
import 'semantic-ui-css/semantic.min.css'

import _ from 'lodash'
import { scaleOrdinal } from 'd3-scale'

import YearSlider from './components/Slider'
import {MultipleDropdown, SingleDropDown} from './components/Dropdown'
import BeeSwarmPlot from './components/BeeSwarmPlot'
import LineChart from './components/LineChart'
import { Wrapper } from './components/StyledComponents'

import beeSwarmData from './data/beeswarmData.json'
import barchartData from './data/barchartData.json'

const small = 600
const medium = 900

const metrics = [
      'Overall Score', 'Safety & Security', 'Militarisation', 'Incarceration Rate', 'Political Instability',
      'Military Expenditure (% GDP)', 'Political Terror Scale', 'Homicide Rate', 'Access to Small Arms', 'UN Peacekeeping Funding'
  ]

const allMetrics = _.uniq(barchartData.map(d => d.metric)).filter(d => !['Score', 'Rank'].includes(d))
const filteredBarChartData = barchartData.filter(d => metrics.includes(d.metric))

class App extends Component {
  state = {
      sectionWidth: undefined,
      yearFilter: 2012,
      mouseoverHighlight: '',
      mouseClickHighlight: ['Iceland', 'Afghanistan'],
      metricsDisplayed: ['Safety & Security', 'Militarisation', 'Incarceration Rate']
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize()
  }

  handleResize = () => {
    this.setState({
      sectionWidth: this.section && this.section.clientWidth
    });
  }

  handleCircleClick = d => {

    let copy = {...this.state}
    let array = copy.mouseClickHighlight

    if(!array.includes(d.country) && array.length < 3){
      array = [...array, d.country]
    } else if (array.includes(d.country)){
      array = array.filter(el => d.country !== el)
    } else if (array.length === 3){
      array.shift()
      array = [...array, d.country]
    }

    this.setState(() => ({mouseClickHighlight: array}))
  }

  handleCircleMouseover = d => {this.setState(state => state.mouseoverHighlight = d.country)}

  handleCircleMouseout = () => {this.setState(state => state.mouseoverHighlight = '')}

  handleDropdownChange = (e, d) => {

    let copy = {...this.state}
    let array = copy.mouseClickHighlight
    let newArray = d.value.map(el => _.capitalize(el))

    if(array.length < 3){
      array = newArray
    } else if (array.length === 3 && newArray.length > 3){
      array.shift()
      newArray.shift()
      array = newArray
    } else if (array.length > newArray.length){
      array = newArray
    }

    this.setState(() => ({mouseClickHighlight: array}))
  }

  handleMetricDropdownChange = (e, d) => {

    const value = d.value
    const number = d.options.filter(el => el.key === value)[0].number

    this.setState(state => state.metricsDisplayed[number] = value)

  }

  render(){

    const { sectionWidth, yearFilter, mouseoverHighlight, mouseClickHighlight, metricsDisplayed } = this.state

    const beeSwarmHeight = this.beeSwarmContainer && this.beeSwarmContainer.clientHeight
    const windowWidth = this.window && this.window.clientWidth
    const lineChartHeight = this.lineChartContainer && this.lineChartContainer.clientHeight
    const colorDomain = _.uniq(beeSwarmData.map(el => el.economicClass))
    const colorScale = scaleOrdinal().domain(colorDomain).range(['#4F345A', '#DEE1E5', '#DEE1E5', '#628C6F'])

    const filteredMetrics = allMetrics.filter(d => !metricsDisplayed.includes(d))

    const tooltipData = filteredBarChartData.filter(d => (d.country === mouseoverHighlight || d.country === 'All') && d.year === yearFilter)
    const lineChartData = barchartData.filter( d => ( mouseClickHighlight.includes(d.country) && metricsDisplayed.includes(d.metric)))

    const dropdownOptions = (num) => filteredMetrics.map(el => {return { key: el, text: el, value: el, number: num}})

    return (
      <div className="App" ref={window => this.window = window}>

          <section className="intro" ref={section => this.section = section}>
            <Wrapper background="steelblue"/>
            <Wrapper background="lime"/>
          </section>

          <section className="beeswarm-plot">
            <Wrapper
              gridColumn={1}
              padding="30px"
              >
                <YearSlider
                  valueLabelDisplay="auto"
                  max={2019}
                  min={2008}
                  defaultValue={yearFilter}
                  onChange={(event, value)=> this.setState(state => state.yearFilter = +value)}
                />
            </Wrapper>
            <Wrapper
              padding="20px"
              gridRow={sectionWidth > small ? 1 : 3}
              gridColumn={sectionWidth > small ? 2 : 1}
            >
              <MultipleDropdown
                values = {mouseClickHighlight.length > 0 ? mouseClickHighlight.map(el => el.toLowerCase()) : mouseClickHighlight}
                onChange = {this.handleDropdownChange}
              />
            </Wrapper>
            <Wrapper
              gridColumn={sectionWidth > small ? 'span 2' : 1}
              gridRow={2}
              >
              <BeeSwarmPlot
                width={sectionWidth}
                height={beeSwarmHeight}
                data={beeSwarmData}
                tooltipData = {tooltipData}
                year={yearFilter}
                handleMouseover = {this.handleCircleMouseover}
                handleMouseout = {this.handleCircleMouseout}
                mouseoverValue = {mouseoverHighlight}
                handlemouseClick = {this.handleCircleClick}
                mouseClickValue = {mouseClickHighlight}
                windowWidth = {windowWidth}
                colorScale={colorScale}
              />
            </Wrapper>
          </section>

          <section className="line-charts">
            <Wrapper>
              <h4 className="dropdown-metric">{metricsDisplayed[0]}</h4>
              <SingleDropDown
                options={dropdownOptions(0)}
                onChange = {this.handleMetricDropdownChange}
              />
              <LineChart
                height={lineChartHeight}
                width={sectionWidth/3}
                data={lineChartData.filter(d => d.metric === metricsDisplayed[0])}
                colorScale={colorScale}

                year = {yearFilter}
              />
            </Wrapper>

            <Wrapper>
              <h4 className="dropdown-metric">{metricsDisplayed[1]}</h4>
              <SingleDropDown
                options={dropdownOptions(1)}
                onChange = {this.handleMetricDropdownChange}
              />

            </Wrapper>

            <Wrapper>
              <h4 className="dropdown-metric">{metricsDisplayed[2]}</h4>
              <SingleDropDown
                options={dropdownOptions(2)}
                onChange = {this.handleMetricDropdownChange}
              />

            </Wrapper>
          </section>

          <section className="credits">
            <Wrapper background="steelblue"/>
            <Wrapper background="Firebrick"/>
            <Wrapper background="lime"/>
            <Wrapper background="Teal"/>
          </section>

          <div className="background-div">
            <section
              className="beeswarm-plot"
              ref={section => this.section = section} >
              <Wrapper
                ref={beeSwarmContainer => this.beeSwarmContainer = beeSwarmContainer}
                background="red"
                gridColumn={sectionWidth > small ? 'span 2' : 1}
                gridRow={2}
              />
            </section>
            <section className="line-charts">
              <Wrapper
                ref={lineChartContainer => this.lineChartContainer = lineChartContainer}
              />
            </section>
          </div>

      </div>
    );
  }

}

export default App;
