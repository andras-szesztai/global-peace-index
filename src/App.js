import React, {Component} from 'react';
import styled from 'styled-components'
import './sass/_main.scss'
import 'semantic-ui-css/semantic.min.css'

import BeeSwarmPlot from './components/BeeSwarmPlot'
import { Wrapper } from './components/StyledComponents'

import beeSwarmData from './data/beeswarmData.json'

const small = 600
const medium = 900

class App extends Component {
  state = {
      sectionWidth: undefined
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

    const { sectionWidth } = this.state

    const beeSwarmHeight = this.beeSwarmContainer && this.beeSwarmContainer.clientHeight
    const lineChartHeight = this.lineChartContainer && this.lineChartContainer.clientHeight

    const filteredBeeSwarmData = beeSwarmData.filter(d => d.year === 2019)

    return (
      <div className="App">

          <section className="intro" ref={section => this.section = section}>
            <Wrapper background="steelblue"/>
            <Wrapper background="lime"/>
          </section>

          <section className="beeswarm-plot">
            <Wrapper background="Teal"/>
            <Wrapper
              gridRow={sectionWidth > small ? 1 : 3}
              background="Firebrick"/>
            <Wrapper
              gridColumn={sectionWidth > small ? 'span 2' : 1}
              gridRow={2}
              >
              <BeeSwarmPlot
                width={sectionWidth}
                height={beeSwarmHeight}
                data={filteredBeeSwarmData}
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
