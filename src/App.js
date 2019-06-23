import React, {Component} from 'react';
import './sass/_main.scss'
import 'semantic-ui-css/semantic.min.css'

import _ from 'lodash'
import { scaleOrdinal } from 'd3-scale'

import YearSlider from './components/Slider'
import {MultipleDropdown, SingleDropDown} from './components/Dropdown'
import RegionFilter from './components/Modal'
import BeeSwarmPlot from './components/BeeSwarmPlot'
import LineChart from './components/LineChart'
import { Wrapper, FlexWrapper, secondaryColor } from './components/StyledComponents'
import { Radio } from 'semantic-ui-react'
import beeSwarmData from './data/beeswarmData.json'
import barchartData from './data/barchartData.json'

const small = 600
const medium = 900
const autoPlayDuration = 12000
const regions = _.uniq(beeSwarmData.map(d => d.region))

const metrics = [
      'Overall Score', 'Safety & Security', 'Militarisation', 'Incarceration Rate', 'Political Instability',
      'Military Expenditure (% GDP)', 'Political Terror Scale', 'Homicide Rate', 'Access to Small Arms', 'UN Peacekeeping Funding'
]

const colorArray = ['#E18F69', '#656662', '#656662', '#6F9CAB']

const allMetrics = _.uniq(barchartData.map(d => d.metric)).filter(d => !['Score', 'Rank'].includes(d))
const filteredBarChartData = barchartData.filter(d => metrics.includes(d.metric))

class App extends Component {
  state = {
      sectionWidth: undefined,
      yearFilter: 2008,
      stoppedYear: undefined,
      mouseoverHighlight: '',
      mouseClickHighlight: ['Iceland', 'Afghanistan'],
      regionArray: regions,
      lineHighlight: '',
      metricsDisplayed: ['Safety & Security', 'Militarisation', 'Incarceration Rate'],
      openClosed: [false,false,false],
      stopAutoplay: false,
      sizedByPopulation: true
  }

  componentDidMount() {
    
    window.addEventListener("resize", this.handleResize);
    this.handleResize()
    
  }

  componentDidUpdate(){
    const { stopAutoplay, stoppedYear, yearFilter} = this.state

    if(stopAutoplay){
      clearTimeout(this.autoPlay);
      if(!stoppedYear){
        this.setState(state => state.stoppedYear = yearFilter)
      }
    } else {
    //  this.autoPlay()
    }
  }

//   autoPlay = () => {
//     const {yearFilter} =this.state
//     setTimeout(() => this.setState(state => {
//       if(yearFilter < 2019){
//         return state.yearFilter = yearFilter + 1
//       } else {
//         return state.yearFilter = 2008
//       }
// }), autoPlayDuration)
//   }


  handleResize = () => {this.setState({sectionWidth: this.section && this.section.clientWidth});}

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

    if(array.length > 0){this.setState(() => ({mouseClickHighlight: array}))}

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

    if(array.length > 0){this.setState(() => ({mouseClickHighlight: array}))}
  }

  handleMetricDropdownChange = (e, d) => {

    const value = d.value
    const number = d.options.filter(el => el.key === value)[0].number

    this.setState(state => state.metricsDisplayed[number] = value)
    this.setState(state => state.openClosed = [false,false,false])

  }

  handleClickOutside = () => {
    const copy = this.state
    if(copy.openClosed.includes(true)){
      this.setState(state => state.openClosed = [false,false,false])
    }
  }

  handleLineClick = (d) => {
    const { lineHighlight } = this.state

    lineHighlight === d.country ? 
    this.setState( s => s.lineHighlight = '') :
    this.setState( s => s.lineHighlight = d.country)

  }

  handleButtonToggle = () => {this.setState(s => s.sizedByPopulation = !s.sizedByPopulation)}

  openDropDown = (i, openClosed) => {this.setState(state => state.openClosed[i] = openClosed[i] === true ? false : true)}

  handleRegionSave = array =>  {this.setState(state => state.regionArray = array)}

  render(){

    const { sectionWidth, yearFilter, mouseClickHighlight, mouseoverHighlight, metricsDisplayed, openClosed, stoppedYear, stopAutoplay, lineHighlight, sizedByPopulation, regionArray } = this.state

    const beeSwarmHeight = this.beeSwarmContainer && this.beeSwarmContainer.clientHeight
    const windowWidth = this.window && this.window.clientWidth
    const lineChartWidth = windowWidth && windowWidth - windowWidth * 0.05
    const colorDomain = _.uniq(beeSwarmData.map(el => el.economicClass))
    const colorScale = scaleOrdinal().domain(colorDomain).range(colorArray)
    const regionFilterButton = regions.length === regionArray.length ? 'grey' : 'red'

    const filteredMetrics = allMetrics.filter(d => !metricsDisplayed.includes(d))
    const filteredBeesWarmData = beeSwarmData.filter(d => regionArray.includes(d.region))

    const tooltipData = filteredBarChartData.filter(d => (d.country === mouseoverHighlight || d.country === 'All') && d.year === yearFilter)
    const lineChartData = barchartData.filter( d => ( mouseClickHighlight.includes(d.country) && metricsDisplayed.includes(d.metric)))

    const dropdownOptions = (num) => filteredMetrics.map(el => {return { key: el, text: el, value: el, number: num}})
    const showYAxis = [true, false, false]
    const lineChartMargins = [{top: 25, right: 70, bottom: 25, left: 15},
                              {top: 25, right: 60, bottom: 25, left: 10},
                              {top: 25, right: 75, bottom: 25, left: 10}]
                 
    let mainYearFilter = stoppedYear ? stoppedYear : yearFilter
                              
    const lineCharts = metricsDisplayed.map( (el, i) => {
      return <Wrapper key={i}>
              <h4 className="dropdown-metric" onClick={() => this.openDropDown(i, openClosed)}>{el}</h4>
              <SingleDropDown
                options={dropdownOptions(i)}
                onChange = {this.handleMetricDropdownChange}
                open={openClosed[i]}
                onClick={() => this.openDropDown(i, openClosed)}
              />
              <LineChart
                height={250}
                showYAxis={showYAxis[i]}
                width={windowWidth > 600 ? lineChartWidth/3 : lineChartWidth}
                data={lineChartData.filter(d => d.metric === el)}
                colorScale={colorScale}
                metric = {el}
                margin={lineChartMargins[i]}
                valueList = {mouseClickHighlight}
                year = {mainYearFilter}
                highlighted = {lineHighlight}
                handleClick={this.handleLineClick}
              />
            </Wrapper>
    })

    return (
      <div className="App" ref={window => this.window = window} onClick={this.handleClickOutside}>

          <section className="intro">
            <Wrapper
              gridRow={1}
            >
            <h1>Global</h1>
            <h1>peace</h1>
            <h1 className="gap"><span className="low">g</span><span className="middle">a</span><span className="high">p</span></h1>
            </Wrapper>
            <Wrapper
              gridColumn={3}
            >
              <p>Global Peace Index (GPI) measures the relative position of nations' and regions' peacefulness. It ranks 163 independent states and territories (99.7 per cent of the world’s population) according to their levels of peacefulness.</p>
              <p>The GPI is a report produced by the Institute for Economics and Peace (IEP) and developed in consultation with an international panel of peace experts from peace institutes and think tanks with data collected and collated by the Economist Intelligence Unit.</p>
              <p>To find out more, you can download the latest <a href="http://visionofhumanity.org/app/uploads/2019/06/GPI-2019web003.pdf"  target="_blank" >Global Peace Index Report from 2019</a> or watch its <a href="https://www.csis.org/events/global-peace-index-2019-launch"  target="_blank" > official launch</a>.</p>
            </Wrapper>
            <Wrapper
              gridColumn={5}
            >
              <p>The following visualization attempts to demonstrate changes that took place in the Global Peace Gap - the difference in peacefulness between countries belonging to the <span className="legend__low">Low income</span> group and those in the <span className="legend__high">High income</span> group -, around the globe between 2008 and 2019.</p>
            </Wrapper>
              <Wrapper
                gridRow={2}
                gridColumn={5}
              >
                <FlexWrapper
                  justify="space-between"
                  direction='column'
                  align="flex-start"
                  >
                  <RegionFilter
                    handleSave={this.handleRegionSave}
                    filterButtonColor = {regionFilterButton}
                  />
                  <br></br>
                  <br></br>
                  <Radio fitted defaultChecked onChange={this.handleButtonToggle} toggle label={sizedByPopulation ? 'Dots sized by population' : 'Dots sized equally'} />
                </FlexWrapper>
              </Wrapper>
            
          </section>

          <section className="beeswarm-plot">
            <Wrapper
              gridColumn={1}
              gridRow={2}
              padding={'30px'}
              >
                <YearSlider
                  valueLabelDisplay="auto"
                  max={2019}
                  min={2008}
                  value={mainYearFilter}
                  onChange={(_, value)=> 
                  {this.setState(state => stopAutoplay ? state.stoppedYear = +value : state.yearFilter = +value)
                  if(!stopAutoplay){this.setState(state => state.stopAutoplay = true)}
                  }}
                  color = {secondaryColor}
                />
            </Wrapper>
            <Wrapper
              gridRow={windowWidth > small ? 2 : 3}
              gridColumn={windowWidth > small ? 2 : 1}
              padding={'18px 50px 18px 25px'}
            >
              <MultipleDropdown
                values = {mouseClickHighlight.length > 0 ? mouseClickHighlight.map(el => el.toLowerCase()) : mouseClickHighlight}
                onChange = {this.handleDropdownChange}
              />
            </Wrapper>
            <Wrapper
              gridColumn={windowWidth > small ? 'span 2' : 1}
              gridRow={1}
              >
                <BeeSwarmPlot
                  width={sectionWidth}
                  height={beeSwarmHeight}
                  data={filteredBeesWarmData}
                  tooltipData = {tooltipData}
                  sizedByPopulation = {sizedByPopulation}
                  year={mainYearFilter}
                  handleMouseover = {this.handleCircleMouseover}
                  handleMouseout = {this.handleCircleMouseout}
                  mouseoverValue = {mouseoverHighlight}
                  handlemouseClick = {this.handleCircleClick}
                  mouseClickValue = {mouseClickHighlight}
                  windowWidth = {windowWidth}
                  colorScale={colorScale}
                  colorArray={colorArray}
              />
            </Wrapper>
          </section>

          <section className="line-charts">
            {/* {lineCharts} */}
          </section>

          <section className="credits">
            <FlexWrapper className="credits__text" justify={'start'}>Designed and built by: Andras Szesztai</FlexWrapper>
            <FlexWrapper className="credits__text" justify={'center'}>#dataforacause</FlexWrapper>
            <FlexWrapper className="credits__text" justify={'flex-end'}>Data source: Institute for Economics and Peace: Global Peace Index; World Bank</FlexWrapper>
          </section>

          <section  className="beeswarm-plot background"
                    ref={section => this.section = section}
          >
              <Wrapper
                ref={beeSwarmContainer => this.beeSwarmContainer = beeSwarmContainer}
                gridColumn={sectionWidth > small ? 'span 2' : 1}
                gridRow={1}
              />
          </section>
          <section  className="line-charts background">
              <Wrapper
                ref={lineChartContainer => this.lineChartContainer = lineChartContainer}
              />
          </section>

      </div>
    );
  }

}

export default App;
