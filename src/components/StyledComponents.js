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
    box-shadow: 0px 1px 5px 1px rgba(51, 51, 51, 0.2);

    border: 1px solid black;

    text-align: center;

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
