import styled from 'styled-components'

const Wrapper = styled.div`

    position: relative

    background-color: ${props => props.background || '#fff'};

    grid-row: ${props => props.gridRow};
    grid-column: ${props => props.gridColumn};

    padding: ${props => props.padding || 0}


`

const Tooltip = styled.div`

    position: absolute;
    display: none;
    background: #fff;
    opacity: .9;
    z-index: 20;

    border-radius: 5px;

    border: 1px solid black;

    text-align: center;

    &:after {
      right: 100%;
      left: 100%;
      top: 12%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(136, 183, 213, 0);
      border-right-color: #88b7d5;
      border-left-color: #88b7d5;
      border-width: 15px;
      margin-top: -15px;
      }


    h4 {
      padding-top: 1rem;
    }

    h4,
    p {
      line-height: .3;
    }


`

const ChartContainer = styled.div`

    circle {
      cursor: pointer;
    }

    position: relative

    background-color: ${props => props.background || '#fff'};

`

export { Wrapper, ChartContainer, Tooltip }
