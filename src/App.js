import React, {Component} from 'react';
import './sass/_main.scss'
import 'semantic-ui-css/semantic.min.css'


import YearSlider from './components/Slider'
import BeeSwarmPlot from './components/BeeSwarmPlot'
import { Wrapper } from './components/StyledComponents'

import beeSwarmData from './data/beeswarmData.json'
import test from './data/test.json'

const small = 600
const medium = 900

class App extends Component {
  state = {
      sectionWidth: undefined,
      yearFilter: 2019
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


  render(){

    const { sectionWidth, yearFilter } = this.state

    const beeSwarmHeight = this.beeSwarmContainer && this.beeSwarmContainer.clientHeight
    const lineChartHeight = this.lineChartContainer && this.lineChartContainer.clientHeight

    const filteredBeeSwarmData = beeSwarmData.filter(d => d.year === yearFilter)

    return (
      <div className="App">

          <section className="intro" ref={section => this.section = section}>
            <Wrapper background="steelblue"/>
            <Wrapper background="lime"/>
          </section>

          <section className="beeswarm-plot">
            <Wrapper
              gridColumn={1}
              padding="10px"
              >
                <YearSlider
                  valueLabelDisplay="auto"
                  max={2019}
                  min={2008}
                  defaultValue={2019}
                  onChange={(event, value)=> this.setState(state => state.yearFilter = +value)}
                />
            </Wrapper>
            <Wrapper background="Teal"
              gridRow={sectionWidth > small ? 1 : 3}
              gridColumn={sectionWidth > small ? 2 : 1}
              />
            <Wrapper
              gridColumn={sectionWidth > small ? 'span 2' : 1}
              gridRow={2}
              >
              <BeeSwarmPlot
                width={sectionWidth}
                height={beeSwarmHeight}
                data={test}
                year={yearFilter}
              />
            </Wrapper>
          </section>

          <section className="line-charts">
            <Wrapper
                background="Burlywood"
            />
            <Wrapper background="Lightseagreen"/>
            <Wrapper background="Blueviolet"/>
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
