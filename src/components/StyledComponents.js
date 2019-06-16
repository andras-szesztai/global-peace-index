import styled from 'styled-components'

const Wrapper = styled.div`

    background-color: ${props => props.background || '#fff'};

    grid-row: ${props => props.gridRow};
    grid-column: ${props => props.gridColumn};
    
`

const SmallTooltip = styled.div`
    position: absolute;
    display: none;
    color: #fff;
    z-index: 20;

    border-radius: 3px;
    padding: .6rem 1rem;

    background: ${props => props.color};

    text-align: center;
    white-space: nowrap;
    pointer-events: none;

    &:after {
      top: 100%;
    	left: 50%;
    	border: solid transparent;
    	content: " ";
    	height: 0;
    	width: 0;
    	position: absolute;
    	pointer-events: none;
    	border-color: rgba(136, 183, 213, 0);
    	border-top-color: ${props => props.color}
    	border-width: 10px;
    	margin-left: -10px;
    }

    p,
    h4 {
      line-height: .7;
      margin-bottom: 1rem !important;
      padding: 0 !important;
    }

    .score {
      font-size: 1.2rem;
      font-weight: 700;
    }

`

const Tooltip = styled.div`

    position: absolute;
    display: none;
    background: #fff;
    opacity: .9;
    z-index: 20;

    border-radius: 5px;
    white-space: nowrap;
    pointer-events: none;

    border: 1px solid black;
    border-style: solid;
    border-width: 1px;
    border-color: ${props => props.color};

    text-align: center;

    &:after {

      right: ${props => props.left ? '' : '100%'};
      left:  ${props => props.left ? '100%' : ''};
      top: 12%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(136, 183, 213, 0);
      border-right-color: ${props => props.left ? '' : props.color};
      border-left-color: ${props => props.left ? props.color : ''};
      border-width: 15px;
      margin-top: -15px;
      }


    h4 {
      padding-top: 1rem;
      color: ${props => props.color};
    }

    span {
      font-weight: 700;
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

export { Wrapper, ChartContainer, Tooltip, SmallTooltip }
